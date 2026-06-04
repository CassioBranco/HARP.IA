# ARCHITECTURE.md — Projeto HARPIA
> Mapa de arquitetura navegável. Compila o North Star, as 35 ADRs (CLAUDE.md §13) e as 8 regras AEO (`AEO-ARCHITECTURE-RULES.md`) numa visão única.
> Público: Cássio + agentes de dev (Claude Code / Cursor). Ler depois de `NORTH-STAR.md` e antes de qualquer sprint da Fase C.
> Última atualização: 2026-06-02

---

## ÍNDICE

1. [Princípio que governa a arquitetura](#1-princípio-que-governa-a-arquitetura)
2. [Visão em camadas](#2-visão-em-camadas)
3. [Mapa de serviços](#3-mapa-de-serviços)
4. [Modelo de dados — 17 tabelas](#4-modelo-de-dados--17-tabelas)
5. [Fluxo de dados — geração de site](#5-fluxo-de-dados--geração-de-site)
6. [Os 5 agentes de IA do produto](#6-os-5-agentes-de-ia-do-produto)
7. [Arquitetura de prompts — 3 camadas](#7-arquitetura-de-prompts--3-camadas)
8. [O pipeline AEO de publicação](#8-o-pipeline-aeo-de-publicação)
9. [Multi-tenant e segurança](#9-multi-tenant-e-segurança)
10. [Ciclo de vida do cliente](#10-ciclo-de-vida-do-cliente)
11. [Mapa de sprints → arquitetura](#11-mapa-de-sprints--arquitetura)
12. [Time de agentes de dev](#12-time-de-agentes-de-dev)

---

## 1. PRINCÍPIO QUE GOVERNA A ARQUITETURA

Toda decisão deste documento serve a uma frase (`NORTH-STAR.md`):

> **O site do assinante é a resposta que o Google e as LLMs entregam quando o cliente potencial busca o que o assinante vende.**

A tríade técnica que materializa isso: **SEO** (Search Engine Optimization — busca tradicional Google) + **GEO** (Generative Engine Optimization — citação em IAs generativas: ChatGPT, Gemini, Perplexity) + **AEO** (Answer Engine Optimization — resposta direta/snippet/voz). Busca local (cidade-base + raio de atuação) é feature transversal do SEO local. As 8 regras de `AEO-ARCHITECTURE-RULES.md` são o como. Onde este documento descreve um componente, ele aponta qual regra aquele componente cumpre.

**Filtro de qualquer componente novo:** "isso ajuda o site do assinante a aparecer quando o cliente dele busca?" Se não, não entra.

---

## 2. VISÃO EM CAMADAS

```
┌─────────────────────────────────────────────────────────────────────┐
│  CAMADA 0 — EDGE / ENTREGA                                           │
│  Cloudflare Pages (sites publicados dos clientes)  ·  Cloudflare WAF │
│  Sites estáticos/SSR rápidos, legíveis por agente de IA (Regra 5)    │
└─────────────────────────────────────────────────────────────────────┘
            ▲ publica                                  ▲ serve
┌─────────────────────────────────────────────────────────────────────┐
│  CAMADA 1 — APLICAÇÃO (Vercel)                                       │
│  Next.js 14 App Router                                               │
│  ├── (auth)        login / signup / reset                           │
│  ├── (dashboard)   onboarding · sites · editor · blog · settings    │
│  ├── [domain]      render dos sites publicados (SSR)                 │
│  └── api/          route handlers (proxy IA, webhooks, score)        │
│  Middleware: auth gate + correlation id                             │
└─────────────────────────────────────────────────────────────────────┘
            ▲                                            ▲
┌──────────────────────────────┐   ┌──────────────────────────────────┐
│  CAMADA 2 — ORQUESTRAÇÃO IA  │   │  CAMADA 3 — SERVIÇOS             │
│  Inngest (fila assíncrona)   │   │  Stripe · Resend · Google APIs   │
│  LangGraph (grafos de agente)│   │  Cloudflare R2 (imagens)         │
│  Vercel AI SDK → Claude API  │   │  Sentry · PostHog                │
│  Sonnet (criar) Haiku(analisa)│  │                                  │
└──────────────────────────────┘   └──────────────────────────────────┘
            ▲                                            ▲
┌─────────────────────────────────────────────────────────────────────┐
│  CAMADA 4 — DADOS (Supabase / PostgreSQL)                           │
│  17 tabelas · RLS multi-tenant · pgvector (knowledge_vault)         │
│  Auth · Storage metadata · prompt_templates (prompts vivem aqui)    │
└─────────────────────────────────────────────────────────────────────┘
```

**Por que app e sites em hosts diferentes:** o app admin (Vercel) é dinâmico e de baixo volume; os sites publicados (Cloudflare Pages) são alto volume e precisam de escala global barata. Vercel cobraria ~$2k/mês com 100 sites onde Cloudflare cobra ~$20 (ADR Mai/2026).

---

## 3. MAPA DE SERVIÇOS

| Serviço | Papel | Camada | ADR |
|---------|-------|--------|-----|
| **Next.js 14 (Vercel)** | App admin + render dos sites + API | 1 | SSR nativo p/ SEO |
| **Cloudflare Pages** | Hospeda sites publicados | 0 | Escala global barata |
| **Cloudflare R2** | Storage de imagens (WebP) | 3 | Zero egress fee |
| **Cloudflare WAF** | Proteção de borda + rate limit | 0 | Segurança |
| **Supabase** | PostgreSQL + Auth + RLS + pgvector | 4 | Multi-tenant nativo |
| **Claude API** | Geração de texto (via Vercel AI SDK) | 2 | Qualidade PT-BR |
| **LangGraph** | Orquestra os agentes (estado, loops, checkpoint) | 2 | Loops de reflexão |
| **Inngest** | Fila p/ geração longa (30-60s) | 2 | Evita timeout HTTP |
| **Sharp** | Pipeline WebP server-side | 2 | Conversão automática |
| **Stripe** | Assinaturas, trial, webhooks | 3 | Billing recorrente |
| **Resend** | Email transacional | 3 | Setup rápido |
| **Google APIs** | GBP (OAuth) + Search Console | 3 | GEO + dados reais |
| **Sentry** | Erros | 3 | Observabilidade |
| **PostHog** | Comportamento / funil | 3 | Produto |

---

## 4. MODELO DE DADOS — 17 TABELAS

Detalhe completo (DDL + RLS) em `CLAUDE.md §4`. Visão por domínio:

```
MULTI-TENANT BASE
  tenants ──┬── users
            │
SITES E CONTEÚDO
  sites ──┬── pages ──── sections
          ├── images
          ├── blog_posts
          └── internal_links   ← grafo anti-página-órfã (Regra 7)

ONBOARDING
  onboarding_profiles   (25 variáveis, 6 steps)

IA
  prompt_templates  (prompts vivem aqui, NÃO no código)
  ia_generations    (todo output rastreado: snapshot, tokens, duração)

RAG
  knowledge_vault   (pgvector 1536, HNSW — memória do cliente)

SCORE / QUOTAS / BILLING
  score_rules · plan_quotas · tenant_usage · subscriptions

AUDITORIA
  audit_logs
```

**Tabelas com `tenant_id` (RLS obrigatória):** sites, pages, sections, images, blog_posts, onboarding_profiles, ia_generations, subscriptions, knowledge_vault, tenant_usage, internal_links.

**Destaque — `internal_links` (novo, Regra 7):** grafo de quem-linka-quem. Toda página/artigo precisa receber ≥2 links internos antes de publicar. Índice em `(target_type, target_id)` pra contar links recebidos rápido. A regra dos ≥2 é validada na publicação pelo seo-validator (não por constraint, pra permitir rascunho).

---

## 5. FLUXO DE DADOS — GERAÇÃO DE SITE

O caminho crítico do produto, ponta a ponta:

```
1. Cliente completa onboarding (6 steps)
   └─> onboarding_profiles.completeness_score calculado
       └─> Guardrail Nível 1: bloqueia se score < 70

2. Cliente dispara "Gerar site"
   └─> POST /api/generate/site (route handler)
       ├─> valida input (Zod) + autentica + deriva tenant_id de auth.uid()
       ├─> checa quota (tenant_usage vs plan_quotas + hard_cap_daily)
       └─> enfileira job no Inngest (não gera síncrono — duraria 30-60s)

3. Inngest worker executa o grafo LangGraph (Agente Onboarding)
   ├─> monta prompt: buildSystemPrompt('agent','onboarding',niche)
   │     = Bloco 0 (global) + Bloco 1 (agente) + Bloco N (nicho) + client_profile
   ├─> recupera contexto do knowledge_vault (RAG, filtrado por tenant_id)
   ├─> chama Claude (Sonnet) via Vercel AI SDK, streaming SSE
   ├─> Guardrail Nível 2: se confidence < 0.75 → human_review_required = true
   └─> persiste em sections (JSONB) + ia_generations (snapshot/tokens/duração)

4. seo-validator audita o output (as 8 regras + Bloco 0)
   └─> blocker crítico (FAQ<6, schema ausente, etc.) → volta pro agente corrigir

5. Cliente revisa e aprova (Human-in-the-loop obrigatório na 1ª publicação)

6. Pipeline de publicação (ver §8)
   └─> deploy no Cloudflare Pages
```

Cada geração passa por `ia_generations` + `audit_logs` (Guardrail Nível 3).

---

## 6. OS 5 AGENTES DE IA DO PRODUTO

> Atenção: estes são os agentes **do produto** (geram conteúdo pros clientes). Não confundir com os agentes **de dev** (§12), que constroem a plataforma.

Todos usam GraphState do LangGraph. Estado compartilhado: `client_profile`, `site_id`, `generated_content`, `score`, `human_review_required`, `iteration_count`.

| Agente | Trigger | Modelo | Responsabilidade | Regras AEO que aplica |
|--------|---------|--------|------------------|------------------------|
| **Onboarding** | Fim do Step 6 | Sonnet | Gera site completo | 3 (H2), 4 (FAQ≥6), 2 (schema) |
| **Blog** | Solicitação + keywords | Sonnet | Artigo 800-1200 palavras | 3, 4, 2 |
| **GBP** | Conexão/solicitação | Sonnet | Posts, respostas, descrição | 6 (NAP consistente) |
| **Auditoria** | Mensal ou manual | Haiku | Score SEO/GEO/AEO | 8 (citabilidade) |
| **Multilíngue** | Plano Pro+ (MVP B) | Sonnet | Traduz mantendo SEO local | 2, 3 |

**Guardrails Asimov (3 níveis):**
- Nível 1 (pré): `completeness_score >= 70`
- Nível 2 (in-flight): `confidence < 0.75` → flag review
- Nível 3 (pós): log em `ia_generations` + `audit_logs`

**Human-in-the-loop obrigatório:** 1ª publicação · posts GBP · resposta a review <3★ · confidence <0.75 · alteração de SEO pós-publicação · tradução.

---

## 7. ARQUITETURA DE PROMPTS — 3 CAMADAS

Prompts vivem em `prompt_templates` (banco), nunca no código. Montados em runtime:

```
prompt_final = Bloco 0 (global)        ← regras universais SEO/GEO/AEO + anti-IA
             + Bloco 1-5 (agente)      ← regras do agente (onboarding/blog/gbp/...)
             + Bloco 6-13 (nicho)      ← vocabulário e schema do nicho
             + client_profile          ← dados reais do cliente (serializado)
```

- **Bloco 0** (escrito) — endurecido com Regra 3 (H2 autossuficiente) e Regra 4 (FAQ≥6)
- **Blocos 1-13** (a escrever) — dependem da aprovação final do Bloco 0
- Versionados (`version`) — admin reverte sem deploy
- `seo-rules/*.yaml` — regras mutáveis extraíveis (ex: `ai-bots.yaml` já criado)

---

## 8. O PIPELINE AEO DE PUBLICAÇÃO

O coração do diferencial. Toda publicação (site ou artigo) passa por aqui antes de ir ao ar (Sprint S5):

```
Conteúdo aprovado
   │
   ├─[1] Sharp: imagens → WebP (85%) + 3 variantes + alt text (Haiku Vision)
   │
   ├─[2] Schema JSON-LD por tipo de página         ← Regra 2
   │     LocalBusiness/Service/Article/FAQPage + canonical
   │
   ├─[3] robots.txt gerado de seo-rules/ai-bots.yaml ← Regra 1
   │     Allow: / para GPTBot, Google-Extended, ClaudeBot, PerplexityBot...
   │
   ├─[4] sitemap.xml atualizado
   │
   ├─[5] internal_links: garante ≥2 links internos  ← Regra 7
   │     cria automaticamente em páginas relacionadas, ou bloqueia + alerta
   │
   ├─[6] seo-validator: gate final das 8 regras
   │     blocker crítico → NÃO publica
   │
   └─[7] deploy → Cloudflare Pages
         (Server-rendered, CWV > 90 — legível por agente, Regra 5)
```

Nenhuma etapa é opcional. O cliente não configura nada — é tudo default da plataforma.

---

## 9. MULTI-TENANT E SEGURANÇA

```
Requisição → Middleware (auth gate + correlation id)
           → Route handler: deriva tenant_id de auth.uid() (NUNCA do body)
           → Supabase client tipado: RLS isola por tenant_id na camada do banco
```

**Camadas de defesa (defense-in-depth):**
1. RLS no PostgreSQL (última linha — isolamento por `tenant_id`)
2. Validação no application layer (não confia só na RLS)
3. Zod em toda fronteira externa
4. Headers de segurança (CSP, HSTS, X-Frame-Options)
5. Webhooks com verificação de assinatura (Stripe HMAC, Google JWT)

`Service Role` do Supabase: só em workers Inngest, com `tenant_id` explícito e auditado.
Chave Anthropic: só server-side, nunca no browser (route handler faz proxy SSE).

Detalhe completo na skill `security-guardian`.

---

## 10. CICLO DE VIDA DO CLIENTE

```
DESCOBERTA      Palestra do Dove → demo ao vivo → ou landing self-service
   │
SIGNUP          Conta criada · trial 7d com Pro completo (cartão no Day 6)
   │
ONBOARDING      6 steps · autossalvo · score de completude (bloqueia em <70)
   │
GERAÇÃO         Agente Onboarding gera site · seo-validator audita · cliente aprova
   │
PUBLICAÇÃO      Pipeline AEO (§8) · domínio próprio (Cloudflare Registrar)
   │
OPERAÇÃO        Blog (4/20/∞ posts) · GBP · auditoria mensal · score visível
   │
COBRANÇA        Day 6 cartão → assinatura · inadimplência: 14d retry → 30d leitura
   │                                          → 60d pausa → 90d arquiva (LGPD)
RETENÇÃO        KPI = citabilidade em IA + autoridade de marca (Regra 8 ⚠️ Dove)
```

---

## 11. MAPA DE SPRINTS → ARQUITETURA

| Sprint | Constrói | Camada | Regras AEO |
|--------|----------|--------|------------|
| S1 | Infra base (Next+Supabase+Auth+Vercel+CF+R2+Resend+Inngest+Sentry+PostHog) | 0-4 | — |
| S2 | Onboarding funcional + GBP OAuth (gargalo: review Google 2-6 sem) | 1,4 | — |
| S3 | 8 templates Tailwind + paletas + Storybook | 0,1 | 5 (SSR, CWV) |
| S4 | Motor de IA: Agente Onboarding + SSE + LangGraph | 2 | 3,4,2 |
| S5 | **Pipeline AEO de publicação** (§8) | 0,2 | **1,2,7** |
| S6 | Agente de Blog + editor 3 modos | 2 | 3,4 |
| S7 | Integração GBP (Agente GBP + reviews) | 2,3 | 6 |
| S8 | Score SEO/GEO/AEO + Agente Auditoria | 2 | 8 ⚠️ |
| S9 | Stripe (trial + Day 6 + inadimplência) | 3 | — |
| S10 | Painel admin (prompt_templates editável) | 1 | — |
| S11-S18 | Pro/Agency/multilíngue/white-label (MVP B) | — | — |

**Caminho crítico:** S2 começa AGORA por causa do timer de review OAuth do Google (2-6 semanas, roda em paralelo). S4 depende dos Blocos 0-13 escritos. S7 depende de S2 (OAuth aprovado).

---

## 12. TIME DE AGENTES DE DEV

Quem constrói a plataforma (em `.claude/` e `.cursor/`). Operados por Cássio via Claude Code / Cursor.

```
AGENTES (donos de área)
  frontend-dev    Next.js, React, Tailwind, Storybook, Design Atômico
  backend-dev     Supabase, LangGraph, Stripe, Inngest, integrações
  designer        paletas, tokens, hierarquia visual

SKILLS (especialistas transversais)
  supabase-dba         schema, migrations, RLS, pgvector
  typescript-guardian  tipos estritos, branded types, Zod
  security-guardian    OWASP, multi-tenant, auth
  rag-architect        knowledge_vault, embeddings, chunking
  test-engineer        Vitest, Playwright, cobertura
  sre-observability    Sentry, PostHog, logging
  prompt-engineer      Blocos 0-13 (prompts do produto)
  seo-validator        valida as 8 regras AEO, bloqueia publicação fora do padrão

COMMANDS    /new-component · /new-migration · /new-prompt
CURSOR      6 rules (stack, arquitetura, padrões, design-atômico, search-intent, aeo)
```

**Autonomia:** semi-autônoma. Os agentes param antes de commit/push/deploy/migration e pedem aprovação do Cássio.

---

## REFERÊNCIAS CRUZADAS

- `NORTH-STAR.md` — o foco imutável
- `docs/AEO-ARCHITECTURE-RULES.md` — as 8 regras (detalhe de cada uma)
- `CLAUDE.md` — documento fundacional (35 ADRs, schema completo, presets)
- `docs/STATUS-PROJETO.md` — estado atual e próximos passos
- `prompts/global/bloco-0.md` — regras universais de geração
- `seo-rules/ai-bots.yaml` — bots de IA do robots.txt

---

*Fim do ARCHITECTURE.md. Atualizar quando uma camada, serviço ou fluxo mudar de forma estrutural.*
