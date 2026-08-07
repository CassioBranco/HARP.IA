-- ============================================================
-- GBP: registrar QUANDO o post foi de fato publicado no perfil.
--
-- Por que existe: a coluna `status` já previa 'used', mas nenhuma
-- linha de código escrevia esse valor. Campo morto. Consequência:
-- `gbpCadence()` media dias desde a GERAÇÃO do rascunho e mostrava
-- ao cliente "Você postou no Google hoje" quando ele não tinha
-- postado nada. Sem uma data de publicação real não existe métrica
-- de GBP, não existe lembrete e não existe cadência honesta.
--
-- `status` fica por compatibilidade, mas a verdade passa a ser
-- published_at: preenchido = publicado, NULL = ainda rascunho.
-- ============================================================

ALTER TABLE gbp_posts
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

COMMENT ON COLUMN gbp_posts.published_at IS
  'Quando o dono confirmou que colou este post no Perfil de Empresa. NULL = ainda rascunho. Fonte única da cadência de GBP.';

-- Cadência e lembretes consultam sempre "o último publicado deste site".
CREATE INDEX IF NOT EXISTS gbp_posts_published_idx
  ON gbp_posts (site_id, published_at DESC)
  WHERE published_at IS NOT NULL;

-- Coerência: os dois campos não podem discordar.
ALTER TABLE gbp_posts DROP CONSTRAINT IF EXISTS gbp_posts_status_published_coerentes;
ALTER TABLE gbp_posts ADD CONSTRAINT gbp_posts_status_published_coerentes
  CHECK ((status = 'used') = (published_at IS NOT NULL));
