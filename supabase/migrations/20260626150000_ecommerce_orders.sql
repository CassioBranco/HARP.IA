-- ============================================================
-- ANCOREO — E-commerce Fase E2: pedidos (orders + order_items)
-- ============================================================
-- O comprador é ANÔNIMO: o pedido é criado server-side via admin client
-- (a partir do carrinho), com tenant_id derivado do site. A RLS aqui serve
-- pro DONO ver/gerir os pedidos no painel; inserts vêm do admin (service_role).
-- Preço é sempre o do banco (snapshot em order_items), nunca o que o cliente
-- mandar — defesa contra adulteração de preço no checkout.
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id        UUID NOT NULL REFERENCES sites(id)   ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','paid','failed','canceled','refunded')),
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  total_cents    INTEGER NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'BRL',
  customer_name  TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  provider       TEXT,            -- 'mercadopago'
  provider_ref   TEXT,            -- id da preference / pagamento no provedor
  payment_method TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_site_idx     ON orders (site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx   ON orders (status);
CREATE INDEX IF NOT EXISTS orders_provider_idx ON orders (provider_ref);

CREATE TABLE IF NOT EXISTS order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id)  ON DELETE CASCADE,
  order_id         UUID NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id)          ON DELETE SET NULL,
  name_snapshot    TEXT NOT NULL,        -- nome no momento da compra
  unit_price_cents INTEGER NOT NULL,     -- preço unitário no momento da compra
  quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total_cents INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON orders;
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = auth_tenant_id())
  WITH CHECK (tenant_id = auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON order_items;
CREATE POLICY tenant_isolation ON order_items
  USING (tenant_id = auth_tenant_id())
  WITH CHECK (tenant_id = auth_tenant_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON orders      TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO authenticated, service_role;
