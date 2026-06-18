-- Onboarding tela 7 — adiciona o modo "tenho" (cliente já possui domínio próprio
-- e vai apontar o DNS pra cá). Antes só existia 'proprio' (a gente compra) e
-- 'subdominio' (grátis em harpia.site).
ALTER TABLE onboarding_profiles
  DROP CONSTRAINT IF EXISTS onboarding_profiles_dominio_modo_check;
ALTER TABLE onboarding_profiles
  ADD CONSTRAINT onboarding_profiles_dominio_modo_check
  CHECK (dominio_modo = ANY (ARRAY['proprio'::text, 'subdominio'::text, 'tenho'::text]));
