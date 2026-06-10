-- ============================================================
-- HARPIA — Adiciona campos template, niche e font_pair em sites
-- Separa nicho (schema/conteúdo) de layout visual (template)
-- ============================================================

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS niche TEXT CHECK (niche IN (
    'clinica','odontologia','fisioterapia','veterinaria',
    'advocacia','contabilidade','psicologia',
    'imobiliaria','restaurante','salao','escola',
    'servicos','institucional','landing'
  )),
  ADD COLUMN IF NOT EXISTS template TEXT CHECK (template IN (
    'clean','bold','profissional','portfolio',
    'acolhedor','conversao','magazine','academia','jovem'
  )) DEFAULT 'clean',
  ADD COLUMN IF NOT EXISTS font_pair TEXT CHECK (font_pair IN (
    'classico','elegante','moderno','acolhedor','arrojado','jovem'
  )) DEFAULT 'classico';

-- Migra preset → niche para registros existentes (preset era o nicho)
UPDATE sites SET niche = preset WHERE niche IS NULL AND preset IS NOT NULL;

COMMENT ON COLUMN sites.niche    IS 'Nicho do negócio — dirige schema JSON-LD, CTA e regras de conteúdo';
COMMENT ON COLUMN sites.template IS 'Layout visual escolhido pelo cliente — independente do nicho';
COMMENT ON COLUMN sites.font_pair IS 'Par tipográfico: classico=PlusJakarta+Inter, elegante=Playfair+Lato, moderno=Sora+DM Sans, acolhedor=Merriweather+Nunito, arrojado=Bebas+Inter, jovem=SpaceGrotesk+Outfit';
