-- ============================================================
-- Blog: FAQ estruturada + updated_at (dateModified do Article).
-- ⚠️ ESCRITA EM 2026-07-03, AINDA NÃO APLICADA (gate do Cássio).
-- Idempotente: pode rodar em banco novo ou já migrado.
--   schema_faq — já existe no schema inicial; o IF NOT EXISTS aqui
--                é cinto de segurança pra ambientes parciais. É o
--                campo estruturado do bloco "Perguntas frequentes"
--                do editor (JSONB: [{question, answer}]).
--   updated_at — alimenta o dateModified do JSON-LD Article no
--                render público (sinal de frescor pra SEO/GEO).
--                Trigger mantém sozinho a cada UPDATE.
-- O código tolera as colunas ausentes (select('*') + retry no save).
-- ============================================================

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS schema_faq jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN blog_posts.schema_faq IS
  'FAQ estruturada do artigo: [{"question","answer"}] — vira acordeão no público + FAQPage JSON-LD (AEO/GEO)';
COMMENT ON COLUMN blog_posts.updated_at IS
  'Última edição (trigger) — dateModified do JSON-LD Article no render público';

-- Trigger: updated_at acompanha qualquer UPDATE sem depender do app
CREATE OR REPLACE FUNCTION set_blog_posts_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_blog_posts_updated_at();
