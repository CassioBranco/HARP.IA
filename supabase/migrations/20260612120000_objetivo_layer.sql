-- ============================================================
-- HARPIA — Camada OBJETIVO + correção de permissões
-- Modelo de 2 eixos: Objetivo (estrutura) × Nicho (conteúdo)
-- Espelha a tela 1 do onboarding ("O que você quer construir?").
-- ============================================================

-- 1. Nova coluna `objetivo` na tabela de prompts
ALTER TABLE prompt_templates ADD COLUMN IF NOT EXISTS objetivo TEXT;

-- 2. Amplia o CHECK de scope para incluir 'objetivo'
ALTER TABLE prompt_templates DROP CONSTRAINT IF EXISTS prompt_templates_scope_check;
ALTER TABLE prompt_templates ADD CONSTRAINT prompt_templates_scope_check
  CHECK (scope IN ('global','agent','objetivo','niche'));

-- 3. Permissão: prompt_templates é config de SISTEMA, lida só via service_role.
--    Corrige o erro 42501 (permission denied) e mantém a tabela invisível ao cliente.
GRANT SELECT, INSERT, UPDATE, DELETE ON prompt_templates TO service_role;
REVOKE ALL ON prompt_templates FROM anon, authenticated;

-- 4. Coluna `objetivo` no perfil de onboarding (eixo capturado na tela 1)
ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS objetivo TEXT;

-- 5. Seed das 4 camadas de OBJETIVO (idempotente: limpa antes de inserir)
DELETE FROM prompt_templates WHERE scope = 'objetivo';

INSERT INTO prompt_templates (scope, agent, objetivo, niche, version, content) VALUES

('objetivo', 'onboarding', 'servico_agendamento', NULL, 1, $PROMPT$
OBJETIVO: Serviço / Agendamento — o site existe para captar clientes e marcar atendimentos.

Schema JSON-LD base: LocalBusiness (o nicho pode especializar para Dentist, LegalService, etc.).
Intent dominante: transacional. O CTA domina a página, visível acima do fold.
CTA base: verbo de posse de agendamento/orçamento ("Quero Agendar", "Quero Orçamento"). Telefone/WhatsApp no hero.
Seções obrigatórias, nesta ordem: Hero (com CTA acima do fold) → Sobre → Serviços → Diferenciais → Avaliações → FAQ → CTA final.
Prioridade de conteúdo: prova de competência local + facilidade de contato. Mencionar cidade-base e raio de atuação.
$PROMPT$),

('objetivo', 'onboarding', 'institucional', NULL, 1, $PROMPT$
OBJETIVO: Institucional / Corporativo — o site existe para passar credibilidade e apresentar a empresa.

Schema JSON-LD base: Organization (ou Corporation, se aplicável).
Intent dominante: navegacional/comercial. Autoridade e confiança acima de conversão imediata.
CTA base: "Falar com Especialista", "Conhecer Soluções". Contato consultivo, nunca venda agressiva.
Seções obrigatórias: Hero institucional → Sobre (história + números concretos) → Missão e Valores (concretos, sem clichê) → Equipe/Liderança → Áreas de atuação → Contato.
Prioridade de conteúdo: solidez, tempo de mercado, clientes/casos atendidos. Linguagem corporativa sem jargão vazio.
$PROMPT$),

('objetivo', 'onboarding', 'portfolio', NULL, 1, $PROMPT$
OBJETIVO: Portfólio / Criativo — o site existe para apresentar trabalhos com imagem e vídeo.

Schema JSON-LD base: ProfessionalService + CreativeWork (um por projeto destacado).
Intent dominante: comercial. O trabalho visual é a prova; o texto dá contexto e SEO.
CTA base: "Ver Trabalhos", "Quero um Orçamento", "Quero Conversar sobre meu Projeto".
Seções obrigatórias: Hero visual → Galeria/Portfólio (cada projeto com título + 1-2 linhas de contexto) → Sobre o profissional/estúdio → Processo de trabalho → Depoimentos → CTA.
Prioridade de conteúdo: como a IA não enxerga as imagens do cliente, descreva em palavras o resultado/transformação de cada projeto e gere alt text e legenda ricos para SEO de imagem.
$PROMPT$),

('objetivo', 'onboarding', 'loja', NULL, 1, $PROMPT$
OBJETIVO: Loja / Vendas — o site existe para vender com catálogo (vitrine de produtos).

Schema JSON-LD base: Store + ItemList; cada produto = Product (name, description; price/offers apenas se informado).
ESCOPO ATUAL: catálogo/vitrine SEM checkout, carrinho ou pagamento online. A conversão é por contato (WhatsApp, telefone, formulário) ou visita à loja física.
NÃO usar "compre online", "adicione ao carrinho" ou "pagamento no site". O CTA leva ao contato/WhatsApp.
CTA base: "Ver Catálogo", "Pedir pelo WhatsApp", "Consultar Disponibilidade".
Seções obrigatórias: Hero → Catálogo/Produtos (categorias + itens com nome, descrição curta, faixa de preço se houver) → Sobre a loja → Formas de contato/entrega → FAQ → CTA.
Prioridade de conteúdo: descrição de produto rica em keyword + cidade (SEO local de "onde comprar X em [cidade]"). Mencionar bairro/região e formas de retirada/entrega.
$PROMPT$);
