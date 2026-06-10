-- Campos de geolocalização e cidade para imagens
ALTER TABLE images
  ADD COLUMN IF NOT EXISTS gps_lat  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS gps_lng  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS city     TEXT;

-- Hint de seção (opcional — para organizar imagens por seção)
ALTER TABLE images
  ADD COLUMN IF NOT EXISTS section_hint TEXT;

-- Blog posts: slug e section_type constraint
ALTER TABLE sections
  ADD CONSTRAINT IF NOT EXISTS sections_page_section_unique
  UNIQUE (page_id, section_type);
