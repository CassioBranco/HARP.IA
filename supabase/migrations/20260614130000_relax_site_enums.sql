-- ============================================================
-- HARPIA — Solta os CHECK legados de sites.preset / niche / template
-- Motivo: o onboarding v2 usa a taxonomia setor→profissão (tabela
-- niche_taxonomy), que produz valores fora dos enums antigos. Além disso
-- o grid de modelos inclui 'tech', que não estava no CHECK de template.
-- Resultado do bug: INSERT em sites violava o CHECK e o site nunca era
-- criado (a partir da tela de escolha de modelo o fluxo travava).
--
-- A validação real agora mora na aplicação (resolvePreset) e na taxonomia,
-- não nesses enums rígidos. Soltamos os constraints (idempotente).
-- Não há perda de dados: DROP CONSTRAINT só remove a validação.
-- ============================================================

ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_preset_check;
ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_niche_check;
ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_template_check;

COMMENT ON COLUMN sites.preset   IS 'Preset legado de conteúdo/paleta (texto livre; validado na app por resolvePreset).';
COMMENT ON COLUMN sites.niche    IS 'Nicho do negócio (texto livre; taxonomia em niche_taxonomy é a fonte de verdade).';
COMMENT ON COLUMN sites.template IS 'Layout visual escolhido (clean, bold, profissional, portfolio, acolhedor, conversao, magazine, academia, tech, jovem).';
