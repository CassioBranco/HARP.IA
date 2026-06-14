-- ============================================================
-- HARPIA — Fix recursão infinita de RLS (42P17)
-- Problema: a policy users_same_tenant ON users fazia
--   USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))
-- Ler users reaplica a própria policy de users -> recursão infinita.
-- Como todas as policies tenant_isolation também fazem SELECT FROM users,
-- qualquer leitura autenticada quebrava com 500 / 42P17.
--
-- Solução (padrão documentado do Supabase): trocar a subquery direta por
-- uma função SECURITY DEFINER que lê users SEM reaplicar RLS, quebrando o ciclo.
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ============================================================

-- 1) Helper SECURITY DEFINER: tenant_id do usuário logado, sem RLS recursivo.
CREATE OR REPLACE FUNCTION public.auth_tenant_id()
  RETURNS uuid
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.auth_tenant_id() TO authenticated, anon;

-- 2) Recria as policies usando a função (DROP IF EXISTS -> CREATE = idempotente).

-- tenants: o usuário vê só o próprio tenant
DROP POLICY IF EXISTS tenant_self ON tenants;
CREATE POLICY tenant_self ON tenants
  USING (id = public.auth_tenant_id());

-- users: vê usuários do mesmo tenant (sem recursão — função é SECURITY DEFINER)
DROP POLICY IF EXISTS users_same_tenant ON users;
CREATE POLICY users_same_tenant ON users
  USING (tenant_id = public.auth_tenant_id());

-- Tabelas com tenant_id: isolamento padrão
DROP POLICY IF EXISTS tenant_isolation ON sites;
CREATE POLICY tenant_isolation ON sites
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON pages;
CREATE POLICY tenant_isolation ON pages
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON sections;
CREATE POLICY tenant_isolation ON sections
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON images;
CREATE POLICY tenant_isolation ON images
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON blog_posts;
CREATE POLICY tenant_isolation ON blog_posts
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON internal_links;
CREATE POLICY tenant_isolation ON internal_links
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON onboarding_profiles;
CREATE POLICY tenant_isolation ON onboarding_profiles
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON ia_generations;
CREATE POLICY tenant_isolation ON ia_generations
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON subscriptions;
CREATE POLICY tenant_isolation ON subscriptions
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON tenant_usage;
CREATE POLICY tenant_isolation ON tenant_usage
  USING (tenant_id = public.auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON knowledge_vault;
CREATE POLICY tenant_isolation ON knowledge_vault
  USING (tenant_id = public.auth_tenant_id());
