-- ============================================================
-- HARPIA — Paleta por site (escolher-modelo v2)
-- A tela "escolher-modelo" deixa o cliente escolher uma das 19 paletas
-- nomeadas (ou criar a sua). sites.palette_index (0/1/2 por nicho) não
-- comporta isso. Guardamos a paleta escolhida por site.
--   palette       jsonb  -> { name, group, colors: [sp,ss,sa,sb,sf,st,sm] } | null (= default do template)
--   palette_name  text   -> nome legível p/ UI ("Teal", "Personalizada", "Original")
-- Idempotente.
-- ============================================================

ALTER TABLE sites ADD COLUMN IF NOT EXISTS palette      jsonb;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS palette_name text;

COMMENT ON COLUMN sites.palette      IS 'Paleta escolhida: { name, group, colors:[sp,ss,sa,sb,sf,st,sm] }. NULL = usa o default do template.';
COMMENT ON COLUMN sites.palette_name IS 'Nome legível da paleta escolhida (UI). Ex.: Teal, Personalizada, Original.';
