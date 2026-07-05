-- ============================================================
-- ANCOREO — NV4: Triangulação de backlinks ENTRE clientes (Parcerias)
-- ============================================================
-- ⚠️ MIGRATION ESCRITA, **NÃO APLICADA** — gate do Cássio.
-- NÃO rodar `apply_migration`/`execute_sql`. Só versionamento local.
-- ============================================================
--
-- Sistema NOVO e distinto da triangulação intra-site (lib/seo/triangulation.ts).
-- Aqui tenants DIFERENTES trocam backlinks em ANÉIS DE 3 (A→B→C→A), com
-- direção ÚNICA (nunca A↔B recíproco) pra não sabotar o SEO no Google.
--
-- Decisão de modelagem (SEGURANÇA): TODO tenant_id é DENORMALIZADO em toda
-- tabela. As policies de RLS comparam colunas locais com auth_tenant_id()
-- SEM JOIN em `sites` — porque `sites` é RLS-protegido por tenant e um JOIN
-- ali bloquearia a leitura legítima cross-tenant de um anel (onde o tenant
-- logado é membro mas não dono das outras 2 pontas). Denormalizar mantém a
-- policy simples, auditável e correta.
--
-- Múltiplas policies permissivas na mesma tabela são OR (o Postgres soma).
-- MODELO DE ESCRITA: `partner_optin` é o único que authenticated escreve via
-- RLS (é a própria linha do dono). `partner_rings`, `partner_requests` e
-- `partner_ring_links` são SELECT-only pra authenticated; toda escrita passa
-- pelas rotas /api/partners/* com service_role, DEPOIS da rota autorizar o
-- ator. Isso conserta o aceite (o destinatário não é o `from`) e impede um
-- membro de forjar o aceite dos outros. `anon` nunca escreve nada.
-- ============================================================

-- ── 1. partner_optin — um site entra no programa de parcerias ────────────
CREATE TABLE IF NOT EXISTS partner_optin (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL,
  site_id    UUID NOT NULL UNIQUE REFERENCES sites(id) ON DELETE CASCADE,
  enabled    BOOLEAN NOT NULL DEFAULT true,
  segment    TEXT,
  -- keywords precomputadas (posts + onboarding) pro matching de afinidade
  keywords   TEXT[] NOT NULL DEFAULT '{}',
  blurb      TEXT,                       -- descrição curta mostrada a parceiros
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_optin_tenant_idx  ON partner_optin (tenant_id);
CREATE INDEX IF NOT EXISTS partner_optin_enabled_idx ON partner_optin (enabled) WHERE enabled = true;

ALTER TABLE partner_optin ENABLE ROW LEVEL SECURITY;

-- Dono: controle total do PRÓPRIO opt-in.
DROP POLICY IF EXISTS partner_optin_own ON partner_optin;
CREATE POLICY partner_optin_own ON partner_optin
  FOR ALL
  USING (tenant_id = public.auth_tenant_id())
  WITH CHECK (tenant_id = public.auth_tenant_id());

-- Descoberta: o diretório de parceiros é descobrível DE PROPÓSITO (é opt-in).
-- Só SELECT, e só linhas habilitadas. É o que permite o matching cross-tenant.
DROP POLICY IF EXISTS partner_optin_discover ON partner_optin;
CREATE POLICY partner_optin_discover ON partner_optin
  FOR SELECT
  USING (enabled = true);

REVOKE ALL ON partner_optin FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON partner_optin TO authenticated;
GRANT ALL ON partner_optin TO service_role;


-- ── 2. partner_rings — o anel de 3 (A→B→C→A) ────────────────────────────
CREATE TABLE IF NOT EXISTS partner_rings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status     TEXT NOT NULL DEFAULT 'forming'
             CHECK (status IN ('forming','active','dissolved')),
  site_a     UUID NOT NULL,
  tenant_a   UUID NOT NULL,
  site_b     UUID NOT NULL,
  tenant_b   UUID NOT NULL,
  site_c     UUID NOT NULL,
  tenant_c   UUID NOT NULL,
  -- o iniciador (A) já cria com a_accepted=true; B e C aceitam depois
  a_accepted BOOLEAN NOT NULL DEFAULT false,
  b_accepted BOOLEAN NOT NULL DEFAULT false,
  c_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS partner_rings_a_idx ON partner_rings (tenant_a);
CREATE INDEX IF NOT EXISTS partner_rings_b_idx ON partner_rings (tenant_b);
CREATE INDEX IF NOT EXISTS partner_rings_c_idx ON partner_rings (tenant_c);

ALTER TABLE partner_rings ENABLE ROW LEVEL SECURITY;

-- Qualquer uma das 3 pontas é membro e LÊ o anel. Escrita (criar, marcar
-- aceite, dissolver) NÃO é liberada pra authenticated: passa pelas rotas
-- /api/partners/* via service_role, DEPOIS que a rota autoriza o ator. Isso
-- impede um membro de forjar o a_accepted/c_accepted dos outros direto na
-- tabela (o que dispararia injeção de backlinks sem consentimento deles).
DROP POLICY IF EXISTS partner_rings_member ON partner_rings;
CREATE POLICY partner_rings_member ON partner_rings
  FOR SELECT
  USING (
    tenant_a = public.auth_tenant_id()
    OR tenant_b = public.auth_tenant_id()
    OR tenant_c = public.auth_tenant_id()
  );

REVOKE ALL ON partner_rings FROM anon;
GRANT SELECT ON partner_rings TO authenticated;
GRANT ALL ON partner_rings TO service_role;


-- ── 3. partner_requests — convite pra formar/entrar num anel ─────────────
CREATE TABLE IF NOT EXISTS partner_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_id        UUID REFERENCES partner_rings(id) ON DELETE CASCADE,
  from_tenant_id UUID NOT NULL,
  from_site_id   UUID NOT NULL,
  to_tenant_id   UUID NOT NULL,
  to_site_id     UUID NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','accepted','declined','cancelled','expired')),
  message        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS partner_requests_to_idx   ON partner_requests (to_tenant_id, status);
CREATE INDEX IF NOT EXISTS partner_requests_from_idx ON partner_requests (from_tenant_id, status);
CREATE INDEX IF NOT EXISTS partner_requests_ring_idx ON partner_requests (ring_id);

ALTER TABLE partner_requests ENABLE ROW LEVEL SECURITY;

-- Remetente E destinatário LÊEM o convite (pra ver no painel). A criação e a
-- resposta passam pela rota via service_role, que autoriza: só o remetente
-- cria (from=ele), só o destinatário responde (to=ele).
-- Por que SELECT-only e não FOR ALL com WITH CHECK: quem aceita é o
-- DESTINATÁRIO (to), não o from — uma policy de escrita com WITH CHECK
-- from=self BLOQUEARIA o aceite legítimo. Mover a escrita pra rota conserta
-- isso e ainda impede forja.
DROP POLICY IF EXISTS partner_requests_party ON partner_requests;
CREATE POLICY partner_requests_party ON partner_requests
  FOR SELECT
  USING (
    from_tenant_id = public.auth_tenant_id()
    OR to_tenant_id = public.auth_tenant_id()
  );

REVOKE ALL ON partner_requests FROM anon;
GRANT SELECT ON partner_requests TO authenticated;
GRANT ALL ON partner_requests TO service_role;


-- ── 4. partner_ring_links — os backlinks injetados quando o anel fecha ───
CREATE TABLE IF NOT EXISTS partner_ring_links (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_id        UUID REFERENCES partner_rings(id) ON DELETE CASCADE,
  from_tenant_id UUID NOT NULL,
  from_site_id   UUID NOT NULL,
  to_tenant_id   UUID NOT NULL,
  to_site_id     UUID NOT NULL,
  post_id        UUID,
  anchor_text    TEXT,
  status         TEXT NOT NULL DEFAULT 'planned'
                 CHECK (status IN ('planned','rendered','removed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_ring_links_ring_idx ON partner_ring_links (ring_id);
CREATE INDEX IF NOT EXISTS partner_ring_links_from_idx ON partner_ring_links (from_tenant_id);
CREATE INDEX IF NOT EXISTS partner_ring_links_to_idx   ON partner_ring_links (to_tenant_id);

ALTER TABLE partner_ring_links ENABLE ROW LEVEL SECURITY;

-- As 2 pontas do link (quem dá e quem recebe) LÊEM o registro (auditoria no
-- painel). Escrita só via service_role (injectRingBacklinks), depois de
-- revalidar anel active + 3 aceites — authenticated nunca escreve aqui.
DROP POLICY IF EXISTS partner_ring_links_party ON partner_ring_links;
CREATE POLICY partner_ring_links_party ON partner_ring_links
  FOR SELECT
  USING (
    from_tenant_id = public.auth_tenant_id()
    OR to_tenant_id = public.auth_tenant_id()
  );

REVOKE ALL ON partner_ring_links FROM anon;
GRANT SELECT ON partner_ring_links TO authenticated;
GRANT ALL ON partner_ring_links TO service_role;


COMMENT ON TABLE partner_optin IS
  'NV4: sites que entraram no programa de Parcerias (opt-in). partner_optin_discover deixa o diretório descobrível cross-tenant DE PROPÓSITO (só enabled). tenant_id denormalizado pra RLS sem JOIN em sites.';
COMMENT ON TABLE partner_rings IS
  'NV4: anel de 3 tenants (A→B→C→A, direção única, nunca recíproco). Vira active quando os 3 *_accepted são true. tenant_a/b/c denormalizados pra RLS de membro.';
COMMENT ON TABLE partner_requests IS
  'NV4: convite pra formar/entrar num anel. Aceite/recusa SÓ pelo to_tenant_id, enforçado na rota (não na RLS).';
COMMENT ON TABLE partner_ring_links IS
  'NV4: backlinks contextuais injetados nos 3 blogs quando o anel fica active. Insert via service_role, só após validar anel active + 3 aceites.';
