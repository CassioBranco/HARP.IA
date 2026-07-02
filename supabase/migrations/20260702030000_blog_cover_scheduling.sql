-- ============================================================
-- Blog: imagem de capa + agendamento de publicação.
-- ⚠️ ESCRITA NA NOITE DE 2026-07-02, AINDA NÃO APLICADA (gate do
-- Cássio de manhã). A UI correspondente segue como "em breve" até
-- esta migration ser aplicada:
--   cover_image  — URL da capa do artigo (Storage ou externa)
--   scheduled_at — quando publicar automaticamente (job futuro lê
--                  posts com status='review' e scheduled_at <= now())
-- ============================================================

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

COMMENT ON COLUMN blog_posts.cover_image IS
  'URL da imagem de capa do artigo (aparece na lista do blog e no og:image)';
COMMENT ON COLUMN blog_posts.scheduled_at IS
  'Publicação agendada: job varre status=review com scheduled_at <= now()';

CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled
  ON blog_posts (scheduled_at)
  WHERE scheduled_at IS NOT NULL AND status <> 'published';
