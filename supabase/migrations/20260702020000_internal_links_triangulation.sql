-- ============================================================
-- Triangulação de links internos — enriquecimento do grafo.
-- ⚠️ ESCRITA NA NOITE DE 2026-07-02, AINDA NÃO APLICADA (gate do
-- Cássio de manhã). O código em lib/seo/triangulation.ts funciona
-- sem estas colunas; elas adicionam observabilidade ao grafo:
--   kind     — papel do link (hub|spoke|triangle|cluster|related|contextual)
--   context  — trecho do parágrafo onde a âncora foi injetada
--   rendered — true quando a âncora existe de fato no HTML do artigo
-- ============================================================

ALTER TABLE internal_links
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS context text,
  ADD COLUMN IF NOT EXISTS rendered boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN internal_links.kind IS
  'Papel do link no grafo: hub|spoke|triangle|cluster|related|contextual|auto';
COMMENT ON COLUMN internal_links.context IS
  'Trecho do texto ao redor da âncora injetada (auditoria/undo)';
COMMENT ON COLUMN internal_links.rendered IS
  'true = âncora presente no HTML publicado; false = só metadado do grafo';

CREATE INDEX IF NOT EXISTS idx_internal_links_site_kind
  ON internal_links (site_id, kind);
