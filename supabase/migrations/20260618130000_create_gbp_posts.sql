-- Posts do Google Perfil de Empresa (GBP). Nível 2: a IA escreve o rascunho,
-- o cliente copia e cola no perfil dele (sem API do Google). Mesmo padrão
-- human-in-the-loop do blog.
CREATE TABLE IF NOT EXISTS gbp_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  post_type   TEXT NOT NULL DEFAULT 'novidade'
              CHECK (post_type IN ('novidade','oferta','evento')),
  content     TEXT NOT NULL,            -- resumo do post (até ~1500 chars no Google)
  cta_label   TEXT,                     -- ex.: "Agendar", "Saiba mais", "Ligar"
  cta_url     TEXT,                     -- destino do botão (site/WhatsApp/telefone)
  extra       JSONB,                    -- campos de oferta/evento (datas, cupom)
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','used')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gbp_posts_site_idx ON gbp_posts (site_id, created_at DESC);

ALTER TABLE gbp_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON gbp_posts;
CREATE POLICY tenant_isolation ON gbp_posts
  USING (tenant_id = auth_tenant_id())
  WITH CHECK (tenant_id = auth_tenant_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON gbp_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gbp_posts TO service_role;
