-- ANCOREO — Tira o "depoimento fictício" dos prompts do agente onboarding.
--
-- Problema: a camada agent=onboarding manda a IA produzir 3 depoimentos
-- ("testimonials exatamente 3 (realistas)"), enquanto a REGRA DE FATOS de
-- /api/generate/site manda o array vir vazio. System prompt e user prompt se
-- contradizendo é sorteio: às vezes sai depoimento falso assinado por uma
-- pessoa que não existe, no site de um negócio real. Depoimento inventado é
-- risco jurídico do CLIENTE (CDC art. 37, publicidade enganosa), não só ruído
-- de qualidade.
--
-- ATENÇÃO ao escrever alvos de replace() aqui: o texto vivo no banco NÃO é
-- igual ao do arquivo de seed 20260610130000. O banco tem uma versão
-- condensada, com \r\n. Os alvos abaixo foram lidos do banco, não do seed.
--
-- Migration aplicada não se edita (é histórico) — por isso esta faz UPDATE
-- sobre o estado atual, no mesmo padrão da 20260626120000 (rebrand).
-- Idempotente: depois da 1ª vez não há mais o texto antigo pra trocar.

-- 1. Camada agent=onboarding: "exatamente 3 (realistas)" vira proibição.
UPDATE prompt_templates
SET content = replace(
  content,
  'testimonials exatamente 3 (realistas)',
  'testimonials SEMPRE array vazio [] (É PROIBIDO inventar depoimento de cliente, mesmo "realista" — quem cadastra os reais é o dono, no editor)'
)
WHERE content LIKE '%testimonials exatamente 3 (realistas)%';

-- 2. Regra global 7: nomeia depoimento junto do resto que não se inventa.
UPDATE prompt_templates
SET content = replace(
  content,
  'Nunca crie números, credenciais ou casos falsos.',
  'Nunca crie números, credenciais, depoimentos ou casos falsos.'
)
WHERE content LIKE '%Nunca crie números, credenciais ou casos falsos.%';

-- 3. Camada setor=educacao: some com o empurrãozinho pra escrever depoimento.
--    A frase pedia "depoimentos com resultado concreto" — resultado concreto de
--    aluno que a IA não conhece só sai de um jeito: inventado.
UPDATE prompt_templates
SET content = replace(
  content,
  ' Depoimentos com resultado concreto.',
  ''
)
WHERE content LIKE '% Depoimentos com resultado concreto.%';
