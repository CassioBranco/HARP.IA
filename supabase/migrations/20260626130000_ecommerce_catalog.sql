-- ============================================================
-- ANCOREO — E-commerce Fase E1: catálogo (produtos, coleções, imagens)
-- ============================================================
-- Multi-tenant igual ao resto: tenant_id + RLS via auth_tenant_id() (mesmo
-- padrão de gbp_posts). GRANTs explícitos pra authenticated/service_role —
-- as ALTER DEFAULT PRIVILEGES de 20260614140000 já cobririam, mas explicitar
-- evita repetir a saga "permission denied for table".
--
-- Leitura PÚBLICA da vitrine (visitante anônimo) NÃO depende de policy aqui:
-- as páginas públicas leem via service_role (admin client) filtrando
-- status='published'. Por isso não há policy de anon SELECT — o painel/dono
-- usa a RLS tenant_isolation normal.
--
-- E1 = 1 SKU por produto (sem variantes; variantes entram na E2).
-- ============================================================

-- ── Coleções (categorias da loja) ──────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id     UUID NOT NULL REFERENCES sites(id)   ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  position    INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, slug)
);
CREATE INDEX IF NOT EXISTS collections_site_idx ON collections (site_id, position);

-- ── Produtos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id)     ON DELETE CASCADE,
  site_id       UUID NOT NULL REFERENCES sites(id)       ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id)          ON DELETE SET NULL,
  slug          TEXT NOT NULL,                 -- vira /produto/[slug]
  name          TEXT NOT NULL,
  short_answer  TEXT,                          -- 1ª frase "resposta-primeiro" (AEO)
  description   TEXT,                          -- corpo denso em fatos (gerado por IA)
  specs         JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {peso, dimensões, material, ...}
  faq           JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{question, answer}] → FAQPage
  price_cents   INTEGER NOT NULL DEFAULT 0,    -- centavos (evita float)
  currency      TEXT NOT NULL DEFAULT 'BRL',
  availability  TEXT NOT NULL DEFAULT 'in_stock'
                CHECK (availability IN ('in_stock','out_of_stock','preorder')),
  condition     TEXT NOT NULL DEFAULT 'new'
                CHECK (condition IN ('new','used','refurbished')),
  sku           TEXT,
  gtin          TEXT,                          -- EAN/UPC — sinal forte p/ Google/IA
  brand         TEXT,
  category      TEXT,
  rating_avg    NUMERIC(2,1),                  -- null na E1; reviews entram na E3
  rating_count  INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','published')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, slug)
);
CREATE INDEX IF NOT EXISTS products_site_status_idx ON products (site_id, status);
CREATE INDEX IF NOT EXISTS products_collection_idx  ON products (collection_id);

-- ── Imagens de produto (reusa o pipeline WebP da S5 no app) ─
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id)   ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',   -- obrigatório por convenção (AEO + a11y)
  position    INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images (product_id, position);

-- ── RLS: isolamento por tenant (painel/dono) ───────────────
ALTER TABLE collections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON collections;
CREATE POLICY tenant_isolation ON collections
  USING (tenant_id = auth_tenant_id())
  WITH CHECK (tenant_id = auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON products;
CREATE POLICY tenant_isolation ON products
  USING (tenant_id = auth_tenant_id())
  WITH CHECK (tenant_id = auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON product_images;
CREATE POLICY tenant_isolation ON product_images
  USING (tenant_id = auth_tenant_id())
  WITH CHECK (tenant_id = auth_tenant_id());

-- ── GRANTs (RLS continua filtrando as linhas) ──────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON collections    TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON products       TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_images TO authenticated, service_role;
