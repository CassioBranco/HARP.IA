-- ============================================================
-- ANCOREO — Captura de leads: contatos deixados no LeadCaptureBar
-- ============================================================
-- O visitante do site do cliente deixa nome + e-mail e/ou telefone numa
-- FAIXA INLINE discreta no fim da página (sem popup/modal — sem risco de
-- "intrusive interstitial" do Google). O dono vê e trabalha os leads
-- no painel (/leads).
--
-- Segurança (mesmo padrão de booking_requests/orders/analytics_events):
--  • O visitante é ANÔNIMO. O insert acontece SÓ server-side, via
--    /api/leads com service_role, depois de validar site_id +
--    leads_enabled + campos obrigatórios. NÃO existe policy de INSERT
--    pra anon — insert anônimo direto pelo client-side é negado.
--  • A RLS aqui serve pro DONO (authenticated) ler/gerenciar os leads
--    do próprio tenant no painel (/leads).
-- ============================================================

-- Toggle no site: o dono liga/desliga a faixa de captura no /editor.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS leads_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id    UUID NOT NULL REFERENCES sites(id)   ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT,                    -- e-mail e/ou telefone: pelo menos um
  phone      TEXT,                    -- só dígitos (WhatsApp/telefone)
  interest   TEXT,                    -- interesse opcional (livre ou da lista de serviços)
  source     TEXT,                    -- origem: path da página onde o lead foi deixado
  status     TEXT NOT NULL DEFAULT 'new'
             CHECK (status IN ('new','contacted','converted','discarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS leads_site_idx   ON leads (site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Dono vê/gerencia só os leads do próprio tenant.
DROP POLICY IF EXISTS tenant_isolation ON leads;
CREATE POLICY tenant_isolation ON leads
  USING (tenant_id = public.auth_tenant_id())
  WITH CHECK (tenant_id = public.auth_tenant_id());

-- anon NÃO insere direto (o caminho público é a API /api/leads, service_role).
REVOKE ALL ON leads FROM anon;
GRANT SELECT, UPDATE, DELETE ON leads TO authenticated;
GRANT ALL ON leads TO service_role;

COMMENT ON TABLE leads IS
  'Leads capturados pelo LeadCaptureBar (faixa inline) dos sites publicados. Insert só via /api/leads (service_role); dono gerencia via RLS tenant_isolation.';
