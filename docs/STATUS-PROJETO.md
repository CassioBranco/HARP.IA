# STATUS DO PROJETO HARPIA — Documento de Handoff

> **Propósito:** Este documento existe para retomar o projeto em uma janela de contexto limpa. Se você é uma instância do Claude lendo isto no início de uma sessão nova, leia este documento + o `CLAUDE.md` raiz + os arquivos de memória, e você terá contexto suficiente para continuar sem reler o histórico de chat.
>
> **Última atualização desta sessão:** 2026-06-02

---

## 1. COMO USAR ESTE DOCUMENTO (instrução para o Claude)

1. Leia `dove-site-builder/NORTH-STAR.md` PRIMEIRO (foco imutável — SEO/GEO/AEO)
2. Leia este documento inteiro
3. Leia `dove-site-builder/CLAUDE.md` (documento fundacional — 35 ADRs no §13)
4. Leia os arquivos de memória do projeto (auto-carregados): `project_harpia.md`, `feedback_metodo-cpf-universal.md`, `feedback_harpia-nao-e-ecommerce.md`
5. Vá direto para a seção "PRÓXIMO PASSO IMEDIATO" abaixo
6. Não tente reconstruir o histórico de chat — tudo que importa está nos documentos canônicos

---

## 2. O QUE É O PROJETO (resumo de 6 linhas)

**Projeto HARPIA** (codinome interno; nome comercial a definir) é um serviço brasileiro de criação de sites com IA embutida, focado em PMEs locais, cujo foco principal é o **melhor SEO/GEO/AEO do mercado mundial** (ver `NORTH-STAR.md`). No escopo atual gera **landing pages, sites institucionais e catálogos** (e-commerce é feature futura possível, não descartada). Diferencial: Método CPF de Anderson Dove + SEO local (cidade-base + raio de atuação) + GEO (Generative Engine Optimization — citação por IAs) + FAQ schema automático + score de citabilidade + search intent. Conversão por contato (WhatsApp, telefone, agendamento). Aquisição via palestras do Dove + landing page self-service.

- **Owner do produto:** Anderson Dove (Anderson Marques), Sorocaba/SP
- **Operador (quem está no chat):** Cássio Branco — decide quase tudo operacionalmente, cursou ADS, entende estrutura de código mas não escreve sintaxe do zero (delega pra agentes de dev). Avisa quando uma decisão veio do Dove.

---

## 3. DOCUMENTOS CANÔNICOS (fontes de verdade)

| Documento | O que contém |
|-----------|--------------|
| `dove-site-builder/NORTH-STAR.md` | **Foco imutável** — SEO/GEO/AEO. Ler PRIMEIRO. Filtro de toda feature |
| `dove-site-builder/docs/AEO-ARCHITECTURE-RULES.md` | **8 regras de arquitetura AEO** (mandato). robots.txt IA, JSON-LD>llms.txt, H2 autossuficiente, FAQ≥6, legível-por-agente, marca-ruído, anti-órfã, KPI citabilidade |
| `dove-site-builder/seo-rules/ai-bots.yaml` | Lista de bots de IA liberados no robots.txt de todo site |
| `dove-site-builder/docs/ARCHITECTURE.md` | Mapa de arquitetura navegável (camadas, serviços, fluxos, pipeline AEO, sprints). Ler depois do North Star |
| `dove-site-builder/CLAUDE.md` | Documento fundacional. §4 schema (17 tabelas), §13 = 35 ADRs, §9 onboarding wizard |
| `dove-site-builder/prompts/global/bloco-0.md` | Regras universais de geração (16 seções, inclui §5.5 search intent) |
| `dove-site-builder/prompts/agents/onboarding.md` | Bloco 1 — Agente Onboarding (precisa refatorar pra tirar duplicação com Bloco 0) |
| `dove-site-builder/legal/*.md` | 4 documentos jurídicos (privacidade, termos, cookies, DPA) com placeholders |
| `dove-site-builder/db/seed-plan-quotas.sql` | Seed de quotas por plano |
| `dove-site-builder/docs/roadmap-notion.csv` | Roadmap completo (54 tarefas) pra importar Notion/Trello |
| `dove-site-builder/.claude/` | Config de agentes de dev (Claude Code) — PARCIALMENTE CRIADO (ver seção 6) |
| `dove-site-builder/.cursor/rules/` | Config Cursor — AINDA NÃO CRIADO |

---

## 4. ESTADO DAS TASKS

| # | Task | Status |
|---|------|--------|
| #1 | Atualizar roadmap (CSV + Trello) | ✅ completed |
| #2 | Escrever ARCHITECTURE.md | ✅ completed (2026-06-02) — `docs/ARCHITECTURE.md`, 12 seções (camadas, serviços, dados, fluxos, agentes, pipeline AEO, ciclo de vida, mapa de sprints) |
| #3 | Setup agentes de dev (Claude Code + Cursor) | ✅ completed — 22 arquivos (3 agentes + 8 skills + 3 commands + 6 cursor rules + cursorignore) |
| #4 | Refatorar Bloco 1 + escrever Blocos 2-13 + seo-rules YAMLs | 🟡 parcial — `seo-rules/ai-bots.yaml` criado; Blocos 1-13 aguardam aprovação final do Bloco 0 |
| #5 | Setup Google OAuth via dicasdodove.com.br | ⬜ pending — bloqueada por #6 (preencher placeholders jurídicos) |
| #S1 | Infra base (beta free tier) | ✅ **COMPLETO (2026-06-04)** — Supabase (HARP.IA, SP) + 17 tabelas + RLS + Auth email + Next.js 14 + GitHub (CassioBranco/HARP.IA) + **deploy Vercel NO AR: harp-ia.vercel.app** (auto-deploy a cada push no master). Fundação técnica de pé. |
| #6 | 4 documentos jurídicos | ✅ completed (faltam placeholders: CNPJ, endereço, DPO, data, nome comercial) |
| #7 | North Star + 8 regras AEO absorvidas em todos os documentos | ✅ completed (2026-06-02) |
| #8 | Diagrama visual + documento explicativo da arquitetura (Mermaid + Canva/Excalidraw) | ⬜ pending — entregar ANTES da Fase C começar, depois de aprovar Bloco 0 e fechar Blocos de prompt. Alinhado ao ARCHITECTURE.md (AEO, multi-tenant, 5 agentes, RAG, pipeline correto). Inclui contraste com o diagrama-rascunho do Cássio |

### 🔴 OBRIGATÓRIO antes de publicar (segurança)
- **Rotacionar a service_role do Supabase** — ela apareceu em chat durante o setup (2026-06-04). Risco atual baixo (DB vazio/offline), mas ANTES de qualquer deploy público: Supabase → Settings → API → gerar novo JWT secret → recopiar anon+service_role → atualizar `.env.local` e variáveis da Vercel.

### Decisões de infra/hospedagem fechadas (Jun/2026)
- **Stack final pensada pra escalar grande:** Cloudflare (sites) + Cloudflare for SaaS (domínios+SSL automático) + R2 (imagens) + Supabase (banco) + Vercel (painel)
- **Beta no FREE TIER da stack final** (teto 10 clientes) → ao validar, só UPGRADE de plano, sem migrar plataforma.
- **Maior custo variável = Claude API** (~R$1–3/cliente/mês). Infra quase grátis no início; cresce com a receita. Guia: `docs/SETUP-S1-INFRA.md`.

### ⚠️ Decisões pendentes do DOVE (não são do Cássio)
| Tema | Pergunta a levar pro Dove | Impacto |
|------|---------------------------|---------|
| KPI = citabilidade (Regra 8) | "O painel passa a reportar citabilidade em IA + autoridade de marca, em vez de só posição no Google — fecha?" | Muda a promessa de venda e o que o Agente Auditoria (S8) reporta |
| Upsell PR digital (Regra 6) | "Presença externa / PR digital vira serviço adicional do pitch (executado por você), já que software não torna marca conhecida sozinho?" | Nova linha de receita + honestidade de escopo |
| Nome comercial | Definir nome final (hoje só codinome HARPIA) | Destrava placeholders jurídicos + branding |

---

## 5. DECISÕES FECHADAS (resumo — detalhes em CLAUDE.md §13, 35 ADRs)

**Produto:** codinome HARPIA / foco principal melhor SEO/GEO/AEO do mundo / tipo de site landing-institucional-catálogo no escopo atual (e-commerce futuro possível) / search intent obrigatório por página e artigo (informacional/comercial/transacional/navegacional) / Método CPF universal (aplicável a qualquer profissional, sem ancorar nenhuma área)

**Planos:** Starter R$97 / Pro R$197 / Agency R$297 / trial 7d com Pro completo + cartão Day 6 / quotas fair-use 4-20-ilimitado posts/mês

**Stack:** Next.js 14 + Supabase + Sharp + Vercel (app) + Cloudflare Pages (sites publicados) + Cloudflare R2 (imagens) + Resend (email) + Inngest (fila) + Sentry+PostHog (observabilidade) + LangGraph + Vercel AI SDK + Storybook

**IA:** chave Anthropic única da plataforma (BYO descartado) / roteamento por agente: Sonnet pra criar, Haiku pra analisar / 5 agentes do produto (onboarding, blog, gbp, auditoria, multilíngue) / abstração Vercel AI SDK (trocar provider = 1 linha)

**Domínio cliente:** todo cliente tem domínio próprio / modelo híbrido (Starter "compra pra mim +R$8/mês" ou "já tenho", Pro/Agency já tem)

**UX:** cocktail Shopify (estrutura) + Ghost (editor blog) + Beehiiv (métricas) + Cal.com (settings) + Stripe (billing) / editor 3 modos (manual/revisão/automático)

**Billing:** Stripe Brasil agora + abstração PaymentProvider pra Paypal/internacional futuro / inadimplência 14d retries + 30d leitura + 60d pausa + arquiva 90d / foro Sorocaba / limitação responsabilidade valor pago último ano / sem SLA explícito v1 / arrependimento 7d se não usado / 18+

**MVP A (inclui tudo):** onboarding + site + editor + blog + GBP + score + admin completo + Stripe + landing page. **MVP B (futuro):** internacionalização + multilíngue + white-label + parcerias.

**Execução:** modelo agentes de dev (Claude Code + Cursor) operados por Cássio / prazo ~10-13 semanas / beta com 2-5 clientes novos por 1-2 semanas / Claude Max 20x ($200/mês) / autonomia semi-autônoma (pede aprovação antes de commit/push/deploy) / time enxuto inicial (3 subagents + 5 skills + 3 commands) / orquestração híbrida (Claude no chat monta base, Cássio opera)

**OAuth Google:** usar dicasdodove.com.br como domínio inicial (não esperar nome comercial) / submeter Verification quanto antes (timer 2-6 semanas roda em paralelo) / estepe enquanto não aprova = compositor de GPE (IA gera, cliente cola manualmente)

---

## 6. TASK #3 — CONCLUÍDA ✅ (2026-05-29)

Estrutura final: 22 arquivos criados (skills ampliadas com absorção do repositório github.com/Jeffallan/claude-skills + seo-validator e cursor rule AEO adicionados na estruturação das 8 regras).

### ✅ Todos criados
```
.claude/settings.json                          ✓ permissions semi-autônomas, env vars
.claude/agents/frontend-dev.md                 ✓ Next.js 14, React, Tailwind, Storybook
.claude/agents/backend-dev.md                  ✓ Supabase, LangGraph, Stripe, Inngest
.claude/agents/designer.md                     ✓ paletas, tokens, Design Atômico

.claude/skills/supabase-dba/SKILL.md           ✓ DBA PostgreSQL/RLS/pgvector (absorvido postgres-pro)
.claude/skills/typescript-guardian/SKILL.md    ✓ TypeScript strict, branded types, Zod (absorvido typescript-pro)
.claude/skills/security-guardian/SKILL.md      ✓ OWASP, multi-tenant, auth (absorvido secure-code-guardian)
.claude/skills/rag-architect/SKILL.md          ✓ RAG, knowledge_vault, embeddings (absorvido rag-architect)
.claude/skills/test-engineer/SKILL.md          ✓ Vitest, Playwright, cobertura (absorvido test-master)
.claude/skills/sre-observability/SKILL.md      ✓ Sentry, PostHog, logging (absorvido monitoring-expert)
.claude/skills/prompt-engineer/SKILL.md        ✓ Blocos 0-13, versionamento (absorvido prompt-engineer)
.claude/skills/seo-validator/SKILL.md          ✓ valida as 8 regras AEO + Bloco 0, bloqueia publicação fora do padrão

.claude/commands/new-component.md              ✓ /new-component [nome] [tipo]
.claude/commands/new-migration.md              ✓ /new-migration [descrição]
.claude/commands/new-prompt.md                 ✓ /new-prompt [agente] [nicho?]

.cursor/rules/01-stack-tecnico.mdc             ✓ stack + ADRs core
.cursor/rules/02-arquitetura.mdc               ✓ multi-tenant + RLS + 3-camadas prompts
.cursor/rules/03-padroes-codigo.mdc            ✓ naming, padrões de rota, TypeScript
.cursor/rules/04-design-atomico.mdc            ✓ Storybook protege átomos/moléculas
.cursor/rules/05-search-intent.mdc             ✓ como aplicar os 4 intents
.cursor/rules/06-aeo-arquitetura.mdc           ✓ as 8 regras AEO sempre em contexto
.cursorignore                                  ✓ node_modules, .git, build, dist, .env
```

**Time completo de agentes/skills:**
- Agentes (3): frontend-dev | backend-dev | designer
- Skills (8): supabase-dba | typescript-guardian | security-guardian | rag-architect | test-engineer | sre-observability | prompt-engineer | seo-validator
- Commands (3): /new-component | /new-migration | /new-prompt
- Cursor rules (6 + ignore): stack | arquitetura | padrões | design-atômico | search-intent | aeo-arquitetura

---

## 6.5. ONDE PARAMOS (handoff 2026-06-04 — sessão 2)

**S1 COMPLETO e no ar:** Supabase (HARP.IA, SP) + 17 tabelas + RLS + Auth email + Next.js 14 + GitHub (CassioBranco/HARP.IA) + Vercel (**harp-ia.vercel.app**, auto-deploy no push do master).

**Telas construídas — Jornada 1 e 2 completas (casca visual):**

| Tela | Arquivo | Status |
|------|---------|--------|
| Landing page (Apresentação) | `app/page.tsx` | ✅ Hero + Como funciona + SEO/GEO/AEO + Planos + CTA |
| Login | `app/(auth)/login/page.tsx` | ✅ Formulário real, Supabase Auth, tratamento de erro |
| Cadastro | `app/(auth)/signup/page.tsx` | ✅ Formulário real, Supabase Auth, tela pós-confirmação |
| Onboarding wizard | `app/onboarding/page.tsx` | ✅ 6 steps completos, autossalvo Supabase, score ao vivo, layout focado |
| Dashboard home | `app/(dashboard)/sites/page.tsx` | ✅ Empty state + grid de sites + banner onboarding incompleto + próximos passos |
| Dashboard layout | `app/(dashboard)/layout.tsx` | ✅ Sidebar com nav, email do usuário, badge de plano |

**Design system aplicado:**
- `app/globals.css` — tokens HARPIA (esmeralda + dourado + floresta)
- `app/layout.tsx` — Plus Jakarta Sans (títulos) + Inter (corpo) via `next/font`
- `tailwind.config.ts` — `fontFamily.heading` e `fontFamily.body` adicionados

**Expansão de nichos (2026-06-04):** plataforma passou de 8 para **14 presets**. Adicionados: `advocacia`, `contabilidade`, `psicologia`, `odontologia`, `fisioterapia`, `veterinaria`. Motivação: profissões reguladas que dependem de SEO por não poderem fazer tráfego pago (OAB, CFM, CFP, CFO). Documentação completa em `docs/NICHOS.md`. Migration em `supabase/migrations/20260604120000_expand_nichos.sql` — **rodar no Supabase antes de usar esses nichos em produção**.

| Galeria de templates | `app/templates/page.tsx` | ✅ 14 nichos × 3 paletas, preview de cores ao vivo, cria registro em `sites`, redireciona pro dashboard |
| Dashboard home | `app/(dashboard)/sites/page.tsx` | ✅ Empty state + grid de sites + banner onboarding incompleto + próximos passos |
| Dashboard layout | `app/(dashboard)/layout.tsx` | ✅ Sidebar com nav, email do usuário, badge de plano |

**Fluxo completo agora funcional:**
```
/ → /signup → /onboarding → /templates → /sites (dashboard)
```

| Template do site | `components/templates/SiteTemplate.tsx` | ✅ Server Component completo — nav, hero, serviços, sobre, depoimentos, FAQ (AEO ≥6), CTA, footer, schema JSON-LD + FAQPage |
| Sistema de paletas | `lib/templates/palettes.ts` | ✅ 14 nichos × 3 paletas, CSS variables injetadas inline |
| Conteúdo de exemplo | `lib/templates/example-content.ts` | ✅ 3 nichos com exemplo real (advocacia, servicos, clinica) + fallback genérico |
| Preview do site | `app/preview/[siteId]/page.tsx` | ✅ Barra de preview + renderiza template com paleta do site |
| Site publicado | `app/[domain]/page.tsx` | ✅ Busca site por domínio, renderiza template, gera metadata SEO |

**Fluxo completo do protótipo:**
```
/ → /signup → /onboarding → /templates → /sites → /preview/[id]
```

**Para subir no Vercel:** fazer push no master. Auto-deploy já está configurado.
**Antes do deploy:** rodar migration `20260604120000_expand_nichos.sql` no Supabase.

**PRÓXIMO PASSO:** ligar o onboarding_profiles ao template (substituir conteúdo de exemplo pelo real do banco) + Agente Onboarding (motor de IA — Blocos 1-13).

**⚠️ Pendências travadas:** rotacionar service_role antes de cliente real · confirmar repo GitHub é Private · decisões do Dove (KPI citabilidade, upsell PR, nome comercial) · OAuth Google (timer 2-6 sem, começar cedo) · aprovar Bloco 0 → escrever Blocos 1-13.

**Como trabalhamos:** Cássio é iniciante em código — explicar simples (conceito+decisão+impacto), guiar clique a clique. Construção real acontece no Cursor (agente nativo); Claude no chat = estratégia, design, desbloqueio. Não usar Lovable (retrabalho). Linguagem/vocabulário = calibragem futura.

---

## 7. PRÓXIMO PASSO IMEDIATO

Em ordem de prioridade sugerida (Cássio decide):

1. **Aprovar o Bloco 0** (Cássio) — destrava escrever os Blocos 1-13. É o gargalo da Fase A.
2. **Task #4 — Refatorar Bloco 1 + escrever Blocos 2-13** — depende de #1. Coração do produto (a geração SEO/GEO/AEO).
3. **Task #5 — OAuth Google** — Cássio preenche placeholders jurídicos, publica no dicasdodove.com.br, faz setup no Google Cloud (Claude guia screenshot por screenshot). Timer de review 2-6 semanas roda em paralelo — começar cedo.
4. **Levar decisões pendentes ao Dove** — KPI citabilidade, upsell PR digital, nome comercial (ver seção 4).

**Recomendação:** aprovar o Bloco 0 é o desbloqueio mais valioso agora. Com ele liberado, os Blocos 1-13 (a inteligência de geração) podem ser escritos, e aí a Fase A fecha de fato. Em paralelo, iniciar o OAuth porque o timer do Google é o caminho crítico mais longo.

**Fase A — o que falta pra fechar 100%:** Blocos 1-13 + Design system (paletas/tokens) + seo-rules por nicho. Estrutura, decisões e documentação canônica estão completas.

---

## 8. COMO ME COMPORTAR COM O CÁSSIO (regras de interação)

- Cássio decide quase tudo. Avisa quando vier do Dove.
- Cássio entende estrutura/conceito de código, NÃO escreve sintaxe — explico em conceito + decisão + impacto, deixo sintaxe pros agentes de dev.
- Tom direto, sem floreio (estilo Dove): sem gerundismo, sem em-dash no corpo, sem "estratégico/transformador/jornada".
- Confirmar decisões antes de executar trabalho grande; oferecer recomendação clara em cada escolha.

---

## 9. ARMADILHAS CONHECIDAS (não repetir erros)

1. **Método CPF é universal** — apresentar como universal de cara, sem ancorar nenhuma área específica (nem pra negar). Nenhum nicho é referência central; todos são exemplos equivalentes. (ver memória `feedback_metodo-cpf-universal.md`)
2. **HARPIA — escopo atual sem e-commerce** — sites são landing/institucional/catálogo, conversão por contato (sem checkout/carrinho no MVP). E-commerce é feature FUTURA possível, não um "nunca". O imutável é o foco SEO/GEO/AEO. Shopify é referência só de UX do painel, não de features de loja. (ver memória `feedback_harpia-nao-e-ecommerce.md`)
3. **Não dividir tarefas "Dove faz X / Cássio faz Y"** — Cássio opera tudo sozinho por enquanto.
4. **Browser automation gasta MUITOS tokens** (~50k por sessão) — preferir gerar arquivos pra import manual quando possível.
5. **Não hardcodar prompts no código** — vivem em `prompt_templates` no banco.
6. **Não tocar em átomos/moléculas** sem aprovação humana (Design Atômico protegido por Storybook).

---

## 10. PLACEHOLDERS PENDENTES (Cássio preenche)

Nos 4 documentos jurídicos (`legal/*.md`):
- `[NOME_COMERCIAL]` → nome final (por ora "HARPIA")
- `[DOMINIO]` → dicasdodove.com.br
- `[CNPJ]` → CNPJ da Dicas do Dove
- `[DATA_PUBLICACAO]` → data de publicação
- `[NOME_DPO]` → Encarregado de Dados
- `[ENDERECO_COMPLETO]` → endereço sede

---

*Fim do documento de handoff. Atualizar ao fim de cada sessão significativa.*
