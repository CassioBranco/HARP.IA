-- ============================================================
-- HARPIA — Regra de negócio: 1 site por assinatura
-- Sites extras só com acréscimo na assinatura (add-on).
-- Base = 1 site. Cada add-on de billing incrementa `sites_allowed`.
-- Enforce no NÍVEL DO BANCO (trigger) pra nenhum caminho de código
-- conseguir burlar (action nova, página de templates antiga, etc.).
-- Idempotente.
-- ============================================================

-- 1. Quantos sites o tenant pode ter (sobe com add-ons de assinatura)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS sites_allowed INT NOT NULL DEFAULT 1;

-- 2. Trigger: bloqueia INSERT de site acima do permitido
CREATE OR REPLACE FUNCTION enforce_site_limit()
RETURNS TRIGGER AS $$
DECLARE
  allowed       INT;
  current_count INT;
BEGIN
  SELECT sites_allowed INTO allowed FROM tenants WHERE id = NEW.tenant_id;
  SELECT count(*) INTO current_count FROM sites WHERE tenant_id = NEW.tenant_id;

  IF current_count >= COALESCE(allowed, 1) THEN
    RAISE EXCEPTION
      'site_limit_reached: tenant % já tem % site(s); limite da assinatura é %',
      NEW.tenant_id, current_count, COALESCE(allowed, 1)
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_site_limit ON sites;
CREATE TRIGGER trg_enforce_site_limit
  BEFORE INSERT ON sites
  FOR EACH ROW
  EXECUTE FUNCTION enforce_site_limit();
