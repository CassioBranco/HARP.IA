-- ============================================================
-- HARPIA — Concede os GRANTs de papel que faltavam no schema public
-- ============================================================
-- Causa-raiz de toda a saga "permission denied for table users" / "Perfil
-- não encontrado": as tabelas de `public` nunca receberam os privilégios
-- de tabela para os papéis service_role / authenticated / anon. Sem GRANT:
--   - service_role (admin client) → 403 42501 ao provisionar tenant/users
--   - authenticated → SELECT em users volta vazio → tenant_id nulo
--     → createSiteWithModel devolvia tenant_not_found
--
-- GRANT é privilégio de TABELA. A RLS (policies tenant_isolation +
-- auth_tenant_id) continua filtrando QUAIS linhas cada papel enxerga.
-- Conceder DML ao authenticated é seguro: a RLS restringe ao próprio tenant.
-- Idempotente: GRANT/ALTER DEFAULT PRIVILEGES podem rodar de novo sem erro.
-- ============================================================

-- Acesso ao schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- service_role: acesso total (ignora RLS; é o admin client / jobs)
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- authenticated: DML nas tabelas (linhas filtradas pela RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- anon: só leitura (RLS ainda decide o que aparece; em geral nada de privado)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Tabelas/sequences criadas DEPOIS herdam os mesmos privilégios
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
