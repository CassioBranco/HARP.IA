-- ============================================================
-- GBP: dar uma DATA a cada post do mês.
--
-- Por que existe: até agora a IA escrevia um post avulso, quando o
-- cliente lembrava de pedir. Quem não lembra não posta, e o perfil
-- morre — foi o que a cadência mostrou. O item 5.3 do MVP troca o
-- avulso pelo mês inteiro preparado de uma vez: quatro posts, um por
-- semana, cada um com o dia em que deve ir ao ar.
--
-- scheduled_for é DATE (não timestamptz) de propósito: é um dia do
-- calendário do dono, não um instante. "Terça que vem" não muda de
-- dia porque o servidor está em UTC.
--
-- NULL continua válido e significa post avulso, gerado fora do
-- calendário. Os posts que já existem ficam assim, e é o certo:
-- inventar data pra eles seria fabricar histórico.
-- ============================================================

ALTER TABLE gbp_posts
  ADD COLUMN IF NOT EXISTS scheduled_for DATE;

COMMENT ON COLUMN gbp_posts.scheduled_for IS
  'Dia em que este post deve ir ao ar no perfil. NULL = post avulso, sem data. Não é publicação automática: quem publica é o dono.';

-- A tela do calendário sempre pergunta "o que está agendado para este
-- site, em ordem de data".
CREATE INDEX IF NOT EXISTS gbp_posts_scheduled_idx
  ON gbp_posts (site_id, scheduled_for)
  WHERE scheduled_for IS NOT NULL;
