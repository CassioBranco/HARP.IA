# CLAUDE.md — Projeto HARPIA
> Documento fundacional do projeto. Leia inteiro antes de qualquer ação.
> **Nome oficial do projeto:** HARPIA
> Última atualização: 2026-06-19
> Owner do produto: Anderson Dove (Anderson Marques) — Sorocaba/SP
> Operador técnico (decisões operacionais + orquestração de agentes de dev): Cássio Branco
> Modelo de execução: Cássio decide e orquestra agentes (Claude Code + Cursor); Dove decide pontos-chave de produto e visão.

> ## ⭐ NORTH STAR (FOCO IMUTÁVEL — ler `NORTH-STAR.md` na raiz)
> **Fazer o site de cada assinante ser a resposta que o Google e as LLMs entregam quando o cliente potencial busca algo relacionado ao negócio do assinante.**
> Quando alguém busca "onde trocar pneu perto de mim" no Google, ou pergunta pro ChatGPT "melhor borracharia em Sorocaba", o site do assinante tem que estar lá — cercando a intenção, antes do concorrente. Tríade inegociável: **SEO** (Search Engine Optimization — busca tradicional Google) + **GEO** (Generative Engine Optimization — citação em IAs generativas: ChatGPT, Gemini, Perplexity) + **AEO** (Answer Engine Optimization — resposta direta/snippet/voz). Busca local (cidade-base + raio de atuação) é feature transversal do SEO local. 100% orgânico, sempre.
> **Filtro de toda feature:** "Isso ajuda o site do assinante a aparecer quando o cliente dele busca no Google ou numa LLM?" Se a resposta é não, a feature não entra.

---

## 1. VISÃO DO PRODUTO

### O que é
Uma plataforma SaaS brasileira de construção de sites com IA embutida, focada em pequenos e médios negócios locais. O cliente entra, responde um onboarding de 6 passos, escolhe um preset do seu nicho, e a IA gera automaticamente todos os textos otimizados para SEO/GEO/AEO. O cliente só ajusta cores, imagens e detalhes. Site publicado em minutos, já ranqueável.

### Diferencial central
Não é um site builder genérico. É o único builder brasileiro com:
- Textos gerados com o **Método CPF** (Conhecimento → Posicionamento → Faturamento) de Anderson Dove
- **GEO (Generative Engine Optimization)**: conteúdo citável pelos motores generativos (ChatGPT, Gemini, Perplexity) + autoridade de marca
- **SEO local nativo** por cidade-base + raio de atuação (verificador de sinais geográficos)
- **FAQ automático** com schema FAQPage em todo conteúdo de blog
- **Score de citabilidade por IA** (GEO/AEO score visível ao cliente)
- Tudo isso sem tráfego pago — 100% posicionamento orgânico

### Sobre o Método CPF
O Método CPF é uma estrutura de comunicação aplicável a **qualquer profissional ou negócio local brasileiro** — independente da área de atuação. A sigla foi escolhida pela memorabilidade no Brasil (Cadastro de Pessoa Física).

**Mapeamento operacional (vale pra qualquer nicho):**
| Etapa | Seções do site | Função |
|-------|----------------|--------|
| **C — Conhecimento** | Hero + Sobre | Quem é o negócio, o que faz, há quanto tempo |
| **P — Posicionamento** | Diferenciais + Avaliações + FAQ | Por que escolher, prova social, destrava objeção |
| **F — Faturamento** | Serviços + CTA + Contato | O que oferece, quanto custa, como contratar |

O vocabulário muda por nicho. A estrutura CPF não muda.

### Para quem
Pequenos e médios negócios locais brasileiros que dependem de indicação e não têm verba para tráfego pago. Clínicas, escritórios, restaurantes, salões, imobiliárias, escolas, prestadores de serviço.

### Search Intent — toda página e artigo declaram um

Cada página de site e cada artigo de blog gerado pela plataforma é classificado em **um dos 4 intents** clássicos de busca. A estrutura, CTA, schema, keywords e tom se adaptam ao intent.

| Intent | O que o usuário quer | Característica do conteúdo | Exemplo de keyword |
|--------|---------------------|---------------------------|---------------------|
| **Informacional** | Aprender, entender, descobrir | How-to, FAQ longa, listicle, definição, glossário. CTA suave. | "como escolher um dentista" |
| **Comercial** | Pesquisar antes de decidir | Comparativo, reviews, top X, benefícios, prova social forte. CTA médio. | "melhor dentista em sorocaba" |
| **Transacional** | Agir, contratar, agendar, reservar | CTA dominante (verbo de posse), urgência, prova social, formulário no fold | "agendar dentista sorocaba" |
| **Navegacional** | Chegar num site/negócio específico | Branded keywords, autoridade do negócio, info institucional | "clínica dr. carlos sorocaba" |

Regras universais (detalhadas no Bloco 0):
- Cada página/artigo declara **1 intent dominante** (pode ter secundário)
- Estrutura HTML, CTAs e schema mudam por intent
- Keyword research e tom de voz se adaptam

### Tipo de site gerado — escopo ATUAL
O HARPIA é um **serviço de criação de sites cujo foco principal é o melhor SEO/GEO/AEO do mercado mundial** (ver `NORTH-STAR.md`). No escopo atual, a plataforma gera **landing pages, sites institucionais e catálogos** (listagem de serviços ou produtos para exibição). Por ora não tem checkout, carrinho, pagamento online integrado, gestão de estoque ou frete — a conversão é por **contato** (WhatsApp, telefone, formulário, agendamento, visita presencial).

**E-commerce é uma feature FUTURA possível — não descartada, apenas fora do MVP atual.** Não tratar e-commerce como proibido; tratar como evolução no horizonte. A arquitetura é mantida aberta a isso (abstração de `Product`, `PaymentProvider` planejado). O que não muda nunca é o foco em SEO/GEO/AEO.

Quando alguma referência do mercado (Shopify, etc.) for citada na arquitetura, é **apenas como inspiração de UX do painel administrativo** — nunca como modelo de features de loja.

### Funil de aquisição
Palestras presenciais gratuitas do Anderson Dove → demo ao vivo da plataforma → conversão no palco.

---

## 2. STACK TÉCNICO (DECISÕES FECHADAS — NÃO ALTERAR SEM JUSTIFICATIVA)

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 14 (App Router) | SSR nativo para SEO, React Server Components, rotas de API |
| Banco de dados | Supabase (PostgreSQL) | Multi-tenant com RLS nativo, auth integrado, realtime |
| IA | Claude API (claude-sonnet-4-20250514) | Qualidade de geração de texto em PT-BR, streaming via SSE |
| Imagens | Sharp | Conversão WebP automática, resize, otimização |
| Pagamentos | Stripe | Assinatura recorrente, trial 14 dias, webhooks |
| Deploy | Vercel | Zero config Next.js, preview branches, Edge Functions |
| CSS | Tailwind CSS + shadcn/ui | Tokens via config, componentes como código-fonte |
| Componentes | Storybook | Documentação e isolamento — proteção contra alteração por IA |
| Orquestração IA | LangGraph | Grafos de estado cíclicos, streaming de estado, checkpointing |

### ⚠️ STACK REAL IMPLEMENTADO (atualizado 2026-06-21) — LEIA ANTES DOS ADRs
Os ADRs abaixo descreviam a INTENÇÃO inicial. O que o **código realmente faz hoje** (decisão: manter simples pro MVP/beta — ver decisão 2026-06-21 no log):

| Área | ADR original | Realidade no código | Por quê |
|------|--------------|---------------------|---------|
| Orquestração IA | LangGraph | **Chamada direta à Claude API** (sem grafo/estado/reflexão) | Geração é single-shot; grafo é overkill pro MVP |
| Geração longa | Fila Inngest (assíncrona) | **SSE síncrono** com `maxDuration` alto + Fluid Compute | Mais simples; fila fica p/ escala |
| Provider IA | Vercel AI SDK (abstração) | **`@anthropic-ai/sdk` direto** | Sem necessidade de trocar provider no MVP |
| Hospedagem dos sites | Cloudflare Pages | **Servido do próprio Next.js (Vercel)** via rota `/[domain]` | Um só runtime; migra p/ Cloudflare se o custo/escala exigir |
| Imagens | Cloudflare R2 | **Supabase Storage** (+ Sharp WebP) | Já está no Supabase; R2 fica p/ escala |
| Componentes | Storybook | **Não usado ainda** | Backlog |

Regra: **se o código divergir do ADR, o código manda** — e este bloco deve ser atualizado. Não tomar decisão baseada nos ADRs originais sem conferir aqui.

### ADRs — Decisões que não reabrir (INTENÇÃO inicial — ver bloco "STACK REAL" acima)
- **LangGraph sobre CrewAI/AutoGen**: suporte a loops de reflexão controlados, streaming nativo, integração com pgvector
- **Prompts no banco (não no código)**: `prompt_templates` editável via painel admin sem deploy
- **Multi-tenant via RLS**: cada cliente é um tenant isolado via `tenant_id` + políticas RLS do Supabase
- **Sharp para imagens**: conversão WebP no pipeline de publicação, não no frontend

---

## 3. PLANOS E REGRAS DE NEGÓCIO

| Plano | Preço | Features |
|-------|-------|----------|
| Starter | R$97/mês | 1 site, 1 usuário, blog (4 posts/mês IA — 1/semana), GBP básico, sem e-commerce |
| Pro | R$197/mês | 3 sites, 3 usuários, blog (20 posts/mês IA), GBP completo, score SEO/GEO/AEO, multilíngue |
| Agency | R$297/mês | Sites ilimitados, blog ilimitado (fair use), white-label, painel de clientes, API access, suporte prioritário |

- **Trial:** 7 dias gratuitos com acesso ao plano **Pro completo**. Cartão solicitado no **Day 6** (não no signup) — reduz fricção no momento da palestra. Sem cartão até Day 7, conta entra em modo leitura por 30 dias.
- **Cancelamento:** downgrade no fim do período, dados preservados por 30 dias
- **Onboarding bloqueante:** o site só é gerado após o onboarding estar ≥ 70% completo

### Quotas de geração por IA

Filosofia: **fair use abundante + soft caps**. O cliente nunca encara "limite de IA" — quota natural é o tempo dele, não nosso custo. Hard caps existem apenas como proteção anti-abuso técnico (bot/scraping), nunca atingem cliente real.

| Recurso | Starter | Pro | Agency |
|---------|---------|-----|--------|
| Sites | 1 | 3 | ilimitado |
| Blog posts/mês | 4 | 20 | ilimitado (fair use) |
| GBP posts/mês | 30 | ilimitado | ilimitado |
| Auditorias/mês | 1 | 4 (semanal opcional) | semanal automática |
| Multilíngue | ❌ | ✅ (5/mês) | ✅ ilimitado |
| Hard cap diário (anti-abuso) | 5 | 15 | 50 |

- **Soft cap:** ao se aproximar do limite mensal, banner sugere upgrade. Não bloqueia geração no Pro/Agency — apenas avisa.
- **Hard cap mensal:** bloqueia no Starter (gera upgrade natural). Pro/Agency não têm cap mensal nos recursos marcados como ilimitados.
- **Hard cap diário:** sempre ativo, defende contra bot/scraping. Não atinge cliente real.

---

## 4. BANCO DE DADOS — 17 TABELAS

### Schema completo (DDL pronto para Supabase)

```sql
-- MULTI-TENANT BASE
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT CHECK (plan IN ('starter','pro','agency')) DEFAULT 'starter',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','editor')) DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SITES E CONTEÚDO
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  domain TEXT UNIQUE,
  preset TEXT CHECK (preset IN ('clinica','imobiliaria','servicos','institucional','restaurante','salao','escola','landing')),
  palette_index INT DEFAULT 0, -- 0, 1 ou 2 (3 paletas por preset)
  status TEXT CHECK (status IN ('draft','published','archived')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  schema_type TEXT, -- LocalBusiness, HealthcareBusiness, Restaurant, etc.
  intent TEXT CHECK (intent IN ('informacional','comercial','transacional','navegacional')) DEFAULT 'transacional', -- intent dominante
  intent_secondary TEXT CHECK (intent_secondary IN ('informacional','comercial','transacional','navegacional')), -- opcional
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, slug)
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- hero, about, services, faq, cta, testimonials
  content JSONB, -- textos gerados pela IA
  order_index INT DEFAULT 0,
  locked BOOLEAN DEFAULT false -- se true, IA não sobrescreve
);

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  original_url TEXT,
  webp_url TEXT,
  alt_text TEXT, -- gerado pela IA
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT, -- HTML gerado pela IA
  meta_description TEXT,
  schema_faq JSONB, -- FAQPage schema
  intent TEXT CHECK (intent IN ('informacional','comercial','transacional','navegacional')) DEFAULT 'informacional', -- intent dominante
  intent_secondary TEXT CHECK (intent_secondary IN ('informacional','comercial','transacional','navegacional')), -- opcional
  status TEXT CHECK (status IN ('draft','review','published')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, slug)
);

-- ONBOARDING
CREATE TABLE onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  -- Step 1: Identidade + área de atuação
  business_name TEXT,
  niche TEXT,
  city TEXT,            -- cidade-base (centro do raio de atuação)
  state TEXT,
  service_radius_km INT,  -- raio de atuação em km a partir da cidade-base (define a área servida)
  coverage_areas TEXT[],  -- cidades/bairros cobertos dentro do raio (nomeados p/ SEO local; deriva do raio ou informado)
  -- Step 2: Serviços
  services JSONB, -- [{name, description, price_range}]
  differentials TEXT, -- voz do cliente
  -- Step 3: Público
  target_audience TEXT,
  pain_points TEXT,
  -- Step 4: Autoridade
  credentials TEXT[], -- CRM, CRO, certificações
  years_experience INT,
  cases TEXT,
  -- Step 5: SEO
  keywords_primary TEXT[],
  keywords_secondary TEXT[],
  tone TEXT,
  -- Step 6: GBP
  gbp_connected BOOLEAN DEFAULT false,
  gbp_place_id TEXT,
  gbp_data JSONB,
  -- Score
  completeness_score INT DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- IA
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT CHECK (scope IN ('global','agent','niche')) NOT NULL,
  agent TEXT, -- 'onboarding','blog','gbp','audit','multilang' (null se global)
  niche TEXT, -- 'clinica','imobiliaria', etc (null se não for niche)
  version INT DEFAULT 1,
  content TEXT NOT NULL, -- o prompt em si
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ia_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  site_id UUID REFERENCES sites(id),
  agent TEXT NOT NULL,
  prompt_snapshot TEXT, -- prompt usado (snapshot, não referência)
  input_data JSONB,
  output_data JSONB,
  tokens_used INT,
  duration_ms INT,
  status TEXT CHECK (status IN ('pending','running','done','failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SCORE SEO/GEO/AEO
CREATE TABLE score_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT UNIQUE NOT NULL,
  description TEXT,
  weight NUMERIC DEFAULT 1.0,
  scope TEXT CHECK (scope IN ('site','page','blog')),
  is_active BOOLEAN DEFAULT true
);

-- ASSINATURAS
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- QUOTAS E USO
CREATE TABLE plan_quotas (
  plan TEXT NOT NULL CHECK (plan IN ('starter','pro','agency')),
  resource TEXT NOT NULL CHECK (resource IN ('blog_post','gbp_post','site_generation','audit_run','translation')),
  monthly_limit INT, -- NULL = ilimitado (fair use)
  hard_cap_daily INT, -- proteção anti-abuso (bot/scraping)
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (plan, resource)
);

CREATE TABLE tenant_usage (
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  period_start DATE NOT NULL, -- sempre dia 1 do mês
  resource TEXT NOT NULL,
  count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tenant_id, period_start, resource)
);

-- AUDITORIA
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GRAFO DE LINKS INTERNOS (anti-página-órfã — ver docs/AEO-ARCHITECTURE-RULES.md Regra 7)
CREATE TABLE internal_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  site_id     UUID REFERENCES sites(id) ON DELETE CASCADE,
  -- origem do link (página ou artigo que contém o link)
  source_type TEXT CHECK (source_type IN ('page','blog_post')) NOT NULL,
  source_id   UUID NOT NULL,
  -- destino do link (página ou artigo apontado)
  target_type TEXT CHECK (target_type IN ('page','blog_post')) NOT NULL,
  target_id   UUID NOT NULL,
  anchor_text TEXT, -- texto âncora usado no link
  auto_created BOOLEAN DEFAULT false, -- true se gerado pela plataforma, false se manual
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id)
);
-- Regra de integridade semântica: nenhum target pode ter < 2 links apontando pra ele
-- (validado na publicação pelo seo-validator, não por constraint — pra permitir rascunho)
CREATE INDEX ON internal_links (target_type, target_id); -- contagem rápida de links recebidos
CREATE INDEX ON internal_links (site_id);

-- COFRE DE CONHECIMENTO (RAG)
CREATE TABLE knowledge_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- pgvector
  source TEXT, -- 'onboarding','manual','gbp_review'
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON knowledge_vault USING hnsw (embedding vector_cosine_ops);
```

### RLS Policies (padrão para todas as tabelas com tenant_id)
```sql
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON sites
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
-- Repetir para: pages, sections, images, blog_posts, onboarding_profiles,
-- ia_generations, subscriptions, knowledge_vault, tenant_usage, internal_links
```

---

## 5. OS 5 AGENTES DE IA

Todos os agentes usam a arquitetura GraphState do LangGraph. O estado compartilhado contém: `client_profile`, `site_id`, `generated_content`, `score`, `human_review_required`, `iteration_count`.

| Agente | Trigger | Responsabilidade | Guardrail |
|--------|---------|-----------------|-----------|
| **Onboarding** | Finalização do Step 6 | Gera site completo: hero, sobre, serviços, FAQ, CTA, meta | Nunca publica sem aprovação humana |
| **Blog** | Solicitação de post + keywords | Gera artigo 800-1200 palavras com FAQPage schema | Review antes de publicar (plano Starter) |
| **GBP** | Conexão GBP ou solicitação | Sugere posts, respostas a avaliações, descrição otimizada | Aprovação obrigatória antes de postar |
| **Auditoria** | Mensal automático ou manual | Score SEO/GEO/AEO por página, lista de correções | Apenas leitura — nunca altera conteúdo |
| **Multilíngue** | Plano Pro+ | Traduz e adapta site para EN/ES mantendo SEO local | Review obrigatório de tradução |

### Guardrails Asimov — 3 Níveis
- **Nível 1 (Pré-execução):** valida `client_profile.completeness_score >= 70` antes de qualquer geração
- **Nível 2 (In-flight):** se `confidence < 0.75` em qualquer seção → flag `human_review_required = true`
- **Nível 3 (Pós-execução):** log obrigatório em `ia_generations` + `audit_logs` para toda geração

### Human-in-the-Loop obrigatório em:
1. Primeira publicação de qualquer site
2. Posts no GBP do cliente
3. Respostas a avaliações negativas (< 3 estrelas)
4. Qualquer geração com `confidence < 0.75`
5. Alterações em metadados de SEO após publicação
6. Traduções multilíngue

---

## 6. ARQUITETURA DE PROMPTS — 3 CAMADAS

Os prompts vivem na tabela `prompt_templates`, editáveis via painel admin sem deploy.

### Como monta em runtime
```
prompt_final = camada_global + camada_agente + camada_nicho + client_profile_serializado
```

### Camada 1 — Global (scope='global')
Regras que valem para toda geração:
- Keyword principal nos primeiros 100 caracteres
- Cidade mencionada no mínimo 2x por seção de 200+ palavras
- Zero em-dashes, zero gerundismo, zero "no mundo atual", zero "jornada"
- CTA sempre com verbo de posse ("Quero Agendar" — nunca "Clique aqui")
- **Cada bloco H2 autossuficiente: primeira frase após H2 = resposta direta, citável isolada** (AEO — ver AEO-ARCHITECTURE-RULES.md Regra 3)
- **FAQ com ≥6 perguntas + schema FAQPage** em todo blog e na home (Regra 4)
- Nunca inventar dados — usar `[NÃO INFORMADO]` se campo ausente

> **Regras de arquitetura SEO/GEO/AEO completas em `docs/AEO-ARCHITECTURE-RULES.md`** (8 regras): robots.txt libera bots de IA, JSON-LD > llms.txt, H2 autossuficiente, FAQ≥6, site legível por agente, marca-ruído, anti-página-órfã (≥2 links internos), KPI = citabilidade.

### Camada 2 — Agente (scope='agent')
Cada agente tem regras específicas. Exemplo do Agente Blog:
- Estrutura: H1 → intro direta → H2s → FAQ → CTA → credencial
- H1: keyword + cidade, máx 60 chars
- FAQ: 5-8 perguntas, respostas de 2-4 linhas
- Schema JSON-LD: Article + FAQPage sempre
- Tamanho: 800-1.200 palavras

### Camada 3 — Nicho (scope='niche')
Cada preset tem regras próprias. Exemplos:

**Clínica:**
- CTA principal: "Agendar consulta" (não WhatsApp direto)
- Schema type: HealthcareBusiness > Dentist / Physiotherapist
- Credencial CRM/CRO/CRP obrigatória no bloco de autoridade
- Tom: profissional e acolhedor, nunca técnico em excesso

**Imobiliária:**
- CTA: "Ver imóveis disponíveis" ou "Agendar visita"
- Schema type: RealEstateAgent
- Bairros: sempre 3-5 bairros de atuação
- CRECI obrigatório no footer

**Restaurante:**
- Schema type: Restaurant + menu estruturado
- CTA: "Ver cardápio" ou "Fazer reserva"
- Horários de funcionamento em destaque
- Foto do prato principal como hero

---

## 7. OS 14 PRESETS (TEMPLATES)

> **Fonte de verdade completa:** `docs/NICHOS.md` — schemas, CTAs, seções, restrições de conteúdo e keywords padrão de cada nicho.
> ⚠️ Antes de gerar texto para qualquer nicho regulado, consultar OBRIGATORIAMENTE as restrições em `docs/NICHOS.md`.

### Grupo 1 — Profissões Reguladas (dependem fortemente de SEO — tráfego pago restrito)

| Preset | Schema | CTA Principal | Conselho | Restrição |
|--------|--------|--------------|----------|-----------|
| `advocacia` | LegalService | Agendar consulta | OAB | 🔴 Forte — não prometer resultado, não citar valores |
| `contabilidade` | AccountingService | Solicitar proposta | CFC | 🟡 Moderada — conteúdo técnico/informativo |
| `psicologia` | MentalHealthBusiness | Agendar sessão | CFP | 🔴 Forte — sem preço como apelo, sem prometer resultado |

### Grupo 2 — Saúde

| Preset | Schema | CTA Principal | Conselho | Restrição |
|--------|--------|--------------|----------|-----------|
| `clinica` | HealthcareBusiness | Agendar consulta | CFM | 🔴 Forte — sem garantir resultado, CRM+RQE obrigatório |
| `odontologia` | Dentist | Agendar avaliação | CFO | 🔴 Forte — CRO obrigatório |
| `fisioterapia` | HealthcareBusiness | Agendar avaliação | COFFITO | 🟡 Moderada |
| `veterinaria` | VeterinaryCare | Agendar consulta | CFMV | 🟡 Moderada — preço de consulta permitido desde 2025 |

### Grupo 3 — Outros Nichos

| Preset | Schema | CTA Principal | Seções Obrigatórias |
|--------|--------|--------------|-------------------|
| `imobiliaria` | RealEstateAgent | Ver imóveis / Agendar visita | Hero, Sobre, Imóveis, FAQ, CTA |
| `restaurante` | Restaurant | Ver cardápio | Hero, Cardápio, Ambiente, Horários, Reserva |
| `salao` | BeautySalon | Agendar horário | Hero, Serviços, Profissionais, Portfólio, CTA |
| `escola` | EducationalOrganization | Conhecer cursos | Hero, Cursos, Metodologia, Depoimentos, CTA |
| `servicos` | LocalBusiness | Solicitar orçamento | Hero, Serviços, Diferenciais, Avaliações, CTA |
| `institucional` | Organization | Falar com especialista | Hero, Sobre, Missão/Valores, Equipe, Contato |
| `landing` | WebPage | Personalizado | Hero, Problema, Solução, Prova social, CTA |

Cada preset tem 3 paletas de cores via CSS variables:
```css
:root {
  --color-primary: /* paleta 0, 1 ou 2 por nicho */;
  --color-secondary: ;
  --color-accent: ;
  --color-background: ;
  --color-text: ;
}
```

---

## 8. DESIGN SYSTEM

### Stack
- **shadcn/ui + Tailwind CSS**: componentes como código-fonte, tokens via `tailwind.config.ts`
- **Storybook**: documentação e isolamento de componentes
- **Design Atômico**: Átomos → Moléculas → Organismos → Templates → Pages

### REGRA CRÍTICA DE COMPONENTES — INEGOCIÁVEL

```
NUNCA modifique arquivos em components/atoms/ ou components/molecules/
NUNCA altere tokens em tailwind.config.ts sem instrução explícita
SEMPRE use componentes existentes do Storybook antes de criar novos
Novos componentes SEMPRE começam em components/draft/ antes de serem promovidos
```

- **Átomos e Moléculas**: protegidos — só Anderson ou Cássio alteram manualmente
- **Organismos, Templates, Pages**: Claude Code pode operar aqui
- **A IA não toca em componentes marcados como estáveis no Storybook**

---

## 9. ONBOARDING WIZARD — 25 VARIÁVEIS EM 6 STEPS

| Step | Campos | Variáveis nos prompts |
|------|--------|----------------------|
| 1 - Identidade + área | business_name, niche, city (base), state, service_radius_km, coverage_areas[] | `{business_name}`, `{city}`, `{niche}`, `{service_radius_km}`, `{coverage_areas}` |
| 2 - Serviços | services[], differentials | `{services}`, `{differentials}` |
| 3 - Público | target_audience, pain_points | `{target_audience}`, `{pain_points}` |
| 4 - Autoridade | credentials[], years_experience, cases | `{credentials}`, `{authority_block}` |
| 5 - SEO | keywords_primary[], keywords_secondary[], tone, intent_default_blog, intent_pages{} | `{kw_primary}`, `{kw_secondary}`, `{tone}`, `{intent_default_blog}`, `{intent_pages}` |
| 6 - GBP | gbp_connected, gbp_place_id | `{gbp_data}` (autofill via API) |

**Sobre intent (Step 5):**
- `intent_default_blog`: intent padrão pra novos artigos do blog (`informacional`, `comercial`, `transacional`, `navegacional`). Default: `informacional`. Cliente pode alterar por artigo.
- `intent_pages`: mapping JSON de intent por página do site. Exemplo: `{"home": "transacional", "sobre": "navegacional", "servicos": "comercial", "contato": "transacional"}`. Cliente pode aceitar default da plataforma ou ajustar.

- Score visual por campo (barras de completude visíveis ao cliente)
- Autossalvo por step
- GBP como atalho — se conectado, preenche automaticamente Step 1 e Step 2 parcialmente
- **Bloqueante:** geração só inicia com `completeness_score >= 70`

---

## 10. ESTRUTURA DE PASTAS DO PROJETO

```
/
├── CLAUDE.md                    # Este arquivo — lido automaticamente
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Login, signup, reset
│   ├── (dashboard)/             # Área logada
│   │   ├── onboarding/          # 6-step wizard
│   │   ├── sites/               # Gerenciamento de sites
│   │   ├── editor/              # Editor inline
│   │   ├── blog/                # Gestão de posts
│   │   └── settings/            # Plano, faturamento
│   └── [domain]/                # Sites publicados (dynamic route)
├── components/
│   ├── atoms/                   # PROTEGIDO — não editar
│   ├── molecules/               # PROTEGIDO — não editar
│   ├── organisms/               # Editável com cuidado
│   ├── templates/               # Editável
│   └── draft/                   # Novos componentes em desenvolvimento
├── lib/
│   ├── supabase/                # Client, server, middleware
│   ├── claude/                  # Claude API client + streaming
│   ├── agents/                  # LangGraph agents
│   ├── prompts/                 # Loader de prompt_templates
│   └── sharp/                   # Pipeline de imagens
├── .storybook/                  # Configuração Storybook
└── supabase/
    ├── migrations/              # DDL versionado
    └── seed.sql                 # Dados iniciais (nichos, presets, rules)
```

---

## 11. PADRÕES DE CÓDIGO

### Supabase client
```typescript
// Server component ou route handler
import { createServerClient } from '@/lib/supabase/server'
const supabase = createServerClient()

// Client component
import { createBrowserClient } from '@/lib/supabase/client'
const supabase = createBrowserClient()
```

### Claude API — sempre streaming via SSE
```typescript
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic()

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  system: buildSystemPrompt(scope, agent, niche), // monta as 3 camadas
  messages: [{ role: 'user', content: buildUserPrompt(clientProfile) }]
})
```

### Prompts — sempre carregar do banco
```typescript
// lib/prompts/loader.ts
export async function buildSystemPrompt(
  scope: 'global' | 'agent' | 'niche',
  agent?: string,
  niche?: string
): Promise<string> {
  // Busca as 3 camadas ativas e concatena
  // NUNCA hardcodar prompts no código
}
```

### Rotas de API
```
POST /api/generate/site       — gera site completo (Agente Onboarding)
POST /api/generate/blog       — gera post de blog
POST /api/generate/gbp        — gera post GBP
GET  /api/score/[site_id]     — calcula score SEO/GEO/AEO
POST /api/images/process      — processa imagem com Sharp
```

### Convenções de naming
- Componentes: PascalCase (`HeroSection.tsx`)
- Hooks: camelCase com `use` (`useOnboarding.ts`)
- Tipos: sufixo `Type` ou `Interface` (`ClientProfileType`)
- Constantes: UPPER_SNAKE (`MAX_BLOG_POSTS_STARTER`)

---

## 12. ROADMAP DE SPRINTS

### Fase A — Orquestramento (Claude.ai) — STATUS: ~90% CONCLUÍDA
- ✅ Produto, features, roadmap
- ✅ Stack técnico e ADRs (35)
- ✅ North Star definido (`NORTH-STAR.md` — foco SEO/GEO/AEO imutável)
- ✅ 8 regras de arquitetura AEO (`docs/AEO-ARCHITECTURE-RULES.md`) + `seo-rules/ai-bots.yaml`
- ✅ Onboarding wizard (25 variáveis, 6 steps)
- ✅ Schema do banco (17 tabelas + DDL + RLS, inclui `internal_links`)
- ✅ Arquitetura de agentes e guardrails (PRD + SDD)
- ✅ Prompts v1 — Bloco 0 (Global) escrito (endurecido com H2 autossuficiente + FAQ≥6)
- ✅ Time de agentes de dev montado (3 agentes + 8 skills + 3 commands + 6 cursor rules)
- ✅ ARCHITECTURE.md (mapa navegável — `docs/ARCHITECTURE.md`)
- ⬜ Prompts v1 — Blocos 1-5 (por agente) **← PRÓXIMO PASSO (aguarda aprovação final do Bloco 0)**
- ⬜ Prompts v1 — Blocos 6-13 (por nicho)
- ⬜ Design system — paletas por nicho, tokens CSS

### Fase B — Design (Claude Artifacts + Lovable)
- ⬜ B1 — Protótipo onboarding wizard (6 steps interativos)
- ⬜ B2 — Protótipo 8 templates (HTML/CSS por nicho)
- ⬜ B3 — Painel admin (editor inline, gestão de blog, configurações)

### Fase C — Backend (Claude Code / Cursor)
- ⬜ S1 — Infraestrutura base (Next.js + Supabase + Auth + Deploy Vercel)
- ⬜ S2 — Onboarding wizard funcional (6 steps, autossalvo, GBP OAuth)
- ⬜ S3 — 8 templates em Tailwind (componentes Next.js, sistema de paleta). **Regra 5: Server Components, conteúdo no HTML inicial, CWV > 90**
- ⬜ S4 — Motor de IA (Agente Onboarding + streaming SSE)
- ⬜ S5 — Pipeline de publicação: Sharp WebP + **Schema JSON-LD (Regra 2)** + Sitemap + **robots.txt com bots de IA de `seo-rules/ai-bots.yaml` (Regra 1)** + **grafo `internal_links` / anti-página-órfã (Regra 7)** + gate do seo-validator
- ⬜ S6 — Agente de Blog. **H2 autossuficiente (Regra 3) + FAQ≥6 FAQPage (Regra 4)**
- ⬜ S7 — Integração GBP (OAuth + Agente GBP). **NAP consistente (Regra 6)**
- ⬜ S8 — Score SEO/GEO/AEO + Agente Auditoria. **KPI = citabilidade (Regra 8, ⚠️ confirmar c/ Dove)**
- ⬜ S9 — Stripe (assinaturas + trial)
- ⬜ S10 — Painel admin (prompt_templates editável)
- ⬜ S11-S18 — Features Pro, Agency, multilíngue, white-label

---

## 13. DECISÕES REGISTRADAS (LOG — NÃO REABRIR)

| Data | Decisão | Motivo |
|------|---------|--------|
| Mai/2026 | LangGraph sobre CrewAI | Loops de reflexão controlados, streaming nativo |
| Mai/2026 | Prompts no banco (prompt_templates) | Editável sem deploy, histórico de versões |
| Mai/2026 | Multi-tenant via RLS Supabase | Isolamento nativo, sem lógica de tenant no código |
| Mai/2026 | Storybook como proteção de componentes | Impede IA de modificar componentes-matriz |
| Mai/2026 | Design Atômico com IA restrita a Organismos+ | Átomos/Moléculas só alterados manualmente |
| Mai/2026 | Score de completude ≥ 70% bloqueante | Garante qualidade mínima dos dados de onboarding |
| Mai/2026 | Sharp no pipeline servidor (não frontend) | Performance + WebP automático |
| Mai/2026 | Trial 7 dias com Pro completo + cartão no Day 6 | Reduz fricção na palestra, mantém qualificação |
| Mai/2026 | Chave Anthropic única da plataforma (BYO descartado) | Público B2B local não opera API key — fricção fatal no funil |
| Mai/2026 | Quotas fair-use com soft caps (Starter 4/Pro 20/Agency ∞) | Cliente nunca encara "limite de IA" — quota natural é o tempo dele |
| Mai/2026 | Codinome interno "Projeto HARPIA" (substituiu "Evergreen"), nome comercial a definir | Permite trabalhar sem travar na marca; HARPIA reflete predador de topo, visão aguçada, brasilidade — encaixa com dominância em busca local |
| Mai/2026 | UX cocktail: Shopify (estrutura) + Ghost (editor) + Beehiiv (métricas) + Cal.com (settings) + Stripe (billing) | Cada parte segue o gold standard do mercado pro público leigo — descartado WordPress como referência única |
| Mai/2026 | Sites publicados no Cloudflare Pages, app admin no Vercel | Escala global rápida com custo controlado; Vercel cobraria ~$2k/mês com 100 sites onde Cloudflare cobra $20 |
| Mai/2026 | Storage de imagens no Cloudflare R2 + pipeline Sharp + Claude Vision pra alt text | Zero egress fee, escala barato; pipeline universal: WebP + recorte + SEO automático no upload |
| Mai/2026 | Email transacional via Resend | Setup em 10 min, free até 3k/mês, templates React Email |
| Mai/2026 | Fila assíncrona via Inngest | Não-opcional pra geração de site (dura 30-60s, request HTTP timeoutaria) |
| Mai/2026 | Observabilidade: Sentry (erros) + PostHog (comportamento) + Vercel/Cloudflare Analytics | Tudo free pra começar; setup em 30 min |
| Mai/2026 | Abstração de provider via Vercel AI SDK | Não engessar no Claude; trocar provider vira mudar 1 linha de config |
| Mai/2026 | Editor de blog com 3 modos: manual / com revisão / automático | Cobre desde escritor independente até cliente que delega tudo |
| Mai/2026 | Domínio do cliente: híbrido — "compra pra mim (+R$8/mês)" default no Starter / "já tenho" pra Pro+Agency | Starter não opera DNS; absorver complexidade na plataforma pra não perder conversão |
| Mai/2026 | Roteamento de modelos por agente — Sonnet pra geração criativa, Haiku pra análise/score | Otimiza custo sem comprometer qualidade do texto SEO que é o produto |
| Mai/2026 (rev. Jun/2026) | **Escopo atual: landing pages, institucionais, catálogos** — e-commerce (checkout/carrinho) é feature FUTURA possível, fora do MVP atual (não um "nunca", um "ainda não") | Foco principal é o melhor SEO/GEO/AEO do mundo. MVP atende negócios locais que convertem por contato. Arquitetura mantida aberta a e-commerce futuro. Shopify = inspiração de UX do painel, não features de loja. |
| Mai/2026 | Política de inadimplência: 14d retries + 30d modo leitura + 60d pausa + arquiva (90d total) | Preserva dados/domínio do cliente, dá múltiplas chances de retomada, respeita LGPD com cold storage |
| Mai/2026 | MVP A inclui blog + GBP + score + admin completo (não apenas onboarding+site) | Blog é filosofia nuclear do produto; sem ele o HARPIA não cumpre a promessa de SEO orgânico |
| Mai/2026 | Modelo de execução: agentes de dev (Claude Code + Cursor) orquestrados, não dev humano tradicional | Reduz prazo de MVP de 16-24 semanas pra 10-13 semanas; exige preparação de skills, templates de prompt e conventions |
| Mai/2026 | Admins dia 1: Anderson Dove (owner/produto) + Cássio (dev/arquitetura). 2 super_admins. Role `support` fica pra depois | Time enxuto pra MVP |
| Mai/2026 | Stripe Brasil agora + abstração `PaymentProvider` pra Paypal/internacional na fase B | Foco no Brasil sem fechar porta pra expansão futura |
| Mai/2026 | Beta com 2-5 clientes novos (não existentes), duração curta (1-2 semanas), seleção postergada | Validar com público real do produto antes de abrir geral |
| Mai/2026 | Estrutura de conteúdo classificada por **search intent** (informacional/comercial/transacional/navegacional) tanto em páginas do site quanto em artigos do blog | Cada conteúdo declara intent dominante que dirige estrutura, CTA, schema, keywords e tom. Sem intent declarado, conteúdo vira genérico e perde ranking. |
| Jun/2026 | **North Star imutável: SEO/GEO/AEO** — o site do assinante aparece quando o cliente busca no Google e nas LLMs. Filtro de toda feature. | Único diferencial defensável vs site builders genéricos. Documento `NORTH-STAR.md`. |
| Jun/2026 | **8 regras de arquitetura AEO** (webinar 2026) viram mandato — `docs/AEO-ARCHITECTURE-RULES.md` | Pesquisa de mercado validada que muda decisões de arquitetura, não só de conteúdo |
| Jun/2026 | **robots.txt de todo site nasce liberando bots de IA** (GPTBot, Google-Extended, ClaudeBot, PerplexityBot, etc.) — config em `seo-rules/ai-bots.yaml` | Site bloqueado pra bot de IA não existe pra ~51% das buscas (as que passam por LLM). Não é opcional. |
| Jun/2026 | **JSON-LD é o protocolo principal com IAs, não llms.txt** — priorizar schema + HTML semântico + canonical + sitemap; llms.txt é baixa prioridade | Evidência do webinar: llms.txt tem menos impacto que o mercado divulga. Não desperdiçar engenharia nele. |
| Jun/2026 | **Anti-página-órfã: toda página recebe ≥2 links internos** — nova tabela `internal_links` (grafo), validação na publicação. **Entra no MVP.** | Cluster órfão é penalização semântica. Diferencial barato que concorrente não faz. (decisão Cássio) |
| Jun/2026 | **KPI muda de "rankear pra clicar" para "ser citado pela IA"** (CTR em AI Overview é ~1%) — score e Agente Auditoria reportam citabilidade + autoridade de marca | ⚠️ Direção registrada; CONFIRMAR com Dove antes de virar promessa oficial do pitch (decisão comercial dele) |
| Jun/2026 | **Hospedagem dimensionada pra escalar grande**: Cloudflare (sites dos clientes) + **Cloudflare for SaaS** (domínios próprios + SSL automático, 100 hostnames grátis depois $0,10/mês cada) + R2 (imagens) + Supabase (banco) + Vercel (painel) | Cloudflare é o melhor do mundo pra multi-tenant em escala: banda ilimitada, maior rede de borda, custo recompensa a escala. Cloudflare for SaaS é feito pra hospedar milhares de domínios de clientes. (pesquisa validada Jun/2026) |
| Jun/2026 | **Beta roda no FREE TIER da stack final, NÃO em plataforma separada** — construir uma vez na arquitetura definitiva (Cloudflare+Supabase+Vercel grátis), teto de 10 clientes; ao validar, só faz UPGRADE de plano (não migra plataforma) | Portar entre plataformas = retrabalho/risco. Free tier aguenta 10 clientes folgado (Cloudflare 100 hostnames grátis, Supabase 50k MAU). (decisão Cássio) |
| Jun/2026 | **Maior custo variável do produto = Claude API** (geração de texto), ~R$1–3 por cliente/mês — pequeno perto da mensalidade (R$97–297) | Margem SaaS saudável (70–85%). Monitorar custo de API conforme escala (motivo das quotas + observabilidade). Infra é quase grátis no início; custo cresce junto com a receita (cobrança por uso) |

---

## 14. CONTEXTO DO CRIADOR

**Anderson Dove** — especialista em posicionamento orgânico digital, 15 anos de experiência, Sorocaba/SP. Metodologia própria (Método CPF) validada em clientes reais. Fatura com tráfego 100% orgânico. Não vende tráfego pago. Nunca.

**Colaborador dev:** Cássio

**Tom de comunicação:** direto, sem rodeios, sem gerundismo, sem em-dash, sem "estratégico" ou "transformador". CTA com verbo de posse.

---

## 15. INSTRUÇÕES PARA O CLAUDE CODE

1. **Leia este arquivo inteiro antes de qualquer ação**
2. **Não altere** `components/atoms/`, `components/molecules/` ou `tailwind.config.ts` sem instrução explícita
3. **Sempre carregue prompts do banco** — nunca hardcode strings de prompt no código
4. **Toda geração de IA passa por** `ia_generations` + `audit_logs`
5. **Antes de criar um componente novo**, verifique se existe algo equivalente no Storybook
6. **Novos componentes** começam em `components/draft/`
7. **Human-in-the-Loop é obrigatório** para publicação, GBP e respostas a avaliações
8. **Pergunte antes de apagar** qualquer arquivo, tabela ou campo — não tem undo no banco
9. **Siga o roadmap de sprints** — não pule etapas
10. **Quando criar migration**, sempre versionar em `supabase/migrations/` com timestamp
11. **Nunca exponha a chave Anthropic ao browser** — toda chamada à Claude API passa pelo servidor (route handler) com SSE proxy
12. **Verifique quotas antes de gerar** — bloqueie se `tenant_usage.count >= plan_quotas.monthly_limit` e respeite o `hard_cap_daily`

---

*Fim do CLAUDE.md. Atualizar sempre que uma decisão nova for tomada ou um sprint for concluído.*
