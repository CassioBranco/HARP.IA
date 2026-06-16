-- ============================================================
-- HARPIA — niche_taxonomy: leitura pública (catálogo de segmentos)
-- A tabela é catálogo de referência (56 segmentos), sem dado de tenant.
-- Estava com RLS habilitada e ZERO policy → o autocomplete de segmento
-- do onboarding (/api/onboarding/segments, sessão do usuário) voltava vazio.
-- Liberar SELECT pra anon/authenticated desbloqueia a busca.
-- Idempotente.
-- ============================================================

DROP POLICY IF EXISTS niche_taxonomy_read ON niche_taxonomy;
CREATE POLICY niche_taxonomy_read ON niche_taxonomy
  FOR SELECT TO anon, authenticated
  USING (true);
