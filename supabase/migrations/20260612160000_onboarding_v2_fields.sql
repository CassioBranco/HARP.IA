-- ============================================================
-- HARPIA — Onboarding v2: campos novos do perfil
-- Suporta o protótipo de 7 telas (Objetivo, Porte, Segmento,
-- Área, GPE, Conhecimento E-E-A-T, Domínio + logo/paleta).
-- Reaproveita colunas já existentes para não duplicar fonte de verdade:
--   goal      -> objetivo (já fiado na geração de IA)
--   segmento  -> profissao + setor (ligados à niche_taxonomy)
--   raio_km   -> service_radius_km
--   regioes   -> coverage_areas[]
-- Idempotente.
-- ============================================================

-- 1. Porte da empresa (Tela 4) — controla a pergunta de área
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS porte TEXT
  CHECK (porte IN ('mei_autonomo','micro_pequena','media','grande'));

-- 2. Tipo de área de atuação (Tela 4) — adapta raio_km / regioes / nacional
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS area_tipo TEXT
  CHECK (area_tipo IN ('local','regional','nacional'));

-- 3. Segmento custom (Tela 3) — quando o usuário escolhe "Outro"
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS segmento_custom TEXT;

-- 4. Google Perfil de Empresa (Tela 5) — modo de vínculo + link
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS gpe_modo TEXT
  CHECK (gpe_modo IN ('vincular','criar','sem'));
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS gpe_link TEXT;

-- 5. Conhecimento E-E-A-T (Tela 6) — lista de perguntas/respostas guiadas
--    Formato: [{ "pergunta": "...", "resposta": "..." }, ...]
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS conhecimento JSONB DEFAULT '[]'::jsonb;

-- 6. Identidade visual (tela-logo.html) — logo, favicon e paleta extraída
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS favicon_url TEXT;
--    paleta: { "primary": "#...", "accent": "#...", "bg": "#...", ... }
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS paleta JSONB;

-- 7. Endereço do site (Tela 7) — domínio próprio vs subdomínio grátis
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS dominio_modo TEXT
  CHECK (dominio_modo IN ('proprio','subdominio'));
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS dominio TEXT;
