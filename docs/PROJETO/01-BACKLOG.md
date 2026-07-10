# ANCOREO — Backlog (Quadro Kanban)

> Dono: Product Owner. Atualizado a cada cartão fechado.
> Status: `📥 BACKLOG` → `🎯 SPRINT` → `🔨 EM ANDAMENTO` → `👀 EM REVISÃO` → `✅ FEITO` · `🚫 BLOQUEADO`
> Última atualização: 2026-07-10

---

## ✅ FEITO (fundação já entregue)

| # | Cartão | Cargo |
|---|---|---|
| F01 | Rebrand HARPIA→ANCOREO no banco (prompts/dados) | Backend |
| F02 | E-commerce E1: catálogo (products/collections/images) + RLS + grants | Backend |
| F03 | E-commerce E1: geração de descrição por IA (answer-first) | Backend |
| F04 | E-commerce E1: vitrine pública + JSON-LD + feed | Backend |
| F05 | E-commerce E2: orders + order_items + RLS | Backend |
| F06 | E-commerce E2: abstração `PaymentProvider` + adapter Mercado Pago | Backend |
| F07 | E-commerce E2: `startCheckout` (preço do banco) + webhook | Backend |
| F08 | Correção RLS leitura pública (admin client + published) | Backend |
| F09 | Esqueleto compartilhado `SiteShell` (loja + blog), palette-driven | Front |
| F10 | Esqueleto de blog + página índice `/blog` | Front |
| F11 | Onboarding: opção "Loja" (Tela 1) + sub-modo checkout/catálogo | Backend |
| F12 | ponytail vendorizado (AGENTS.md + CLAUDE.md) | QA |
| F13 | Preview de template lazy (IntersectionObserver) | Front |
| F14 | Ícones SVG inline (`Icon.tsx`, currentColor) nos 10 layouts + `SiteBlog` + banda de stats — substitui emojis | Front |

> **Deploy 2026-07-10** — commit `59b4e48` empurrado no `master` (Vercel), COM OK do Cássio (D14). 30 arquivos: ícones (F14) + reescrita do editor + wireframes (`docs/modelos-referencia/`). `tsc` verde + `next build` OK · sem migration.
>
> **⚠️ Hotfix 2026-07-10** — a reescrita do editor (4 colunas + skeletons) que subiu junto **travou o `SectionEditor` em loading em produção** (barras cinzas, sem campos). Revertida no commit `820909b` (editor volta pra versão da beta). `tsc` verde + `next build` OK. `next build`/`tsc` NÃO pegaram o bug (é runtime) → lição: editor exige teste no navegador antes de shipar. Reescrita preservada em `59b4e48`; correção = task aberta `task_478c2504`. Ícones (F14) seguem no ar, intactos.

---

## 🎯 SPRINT ATUAL (até 10/07) — ver `02-SPRINT-ATUAL.md`

| # | Cartão | Cargo | Status |
|---|---|---|---|
| S01 | Finalizar rename ANCOREO (painéis + refs no código) | Backend + 🚫 Cássio | 🔨 EM ANDAMENTO |
| S02 | **Telemetria de funil** (onboarding + criação de site), LGPD-safe | Backend | 🎯 SPRINT |
| S03 | **Termo de Uso + Política de Privacidade** (LGPD) | Backend | 🎯 SPRINT |
| S04 | Banner/consentimento de cookies + opt-in telemetria | Backend/Front | 🎯 SPRINT |

---

## 📥 BACKLOG (próximo, fora da sprint)

| # | Cartão | Cargo | Nota |
|---|---|---|---|
| B01 | `srcset` no pipeline Sharp (perf de imagem) | Backend | melhoria, pós-MVP |
| B02 | Preview do editor sem reload a cada edição | Front | perf |
| B03 | Thumbnails estáticos no seletor de template | Front | só DEPOIS da repaginada de templates |
| B04 | Painel do dono: gestão de produtos (UI) | Front (Design) | depende do Design |
| B05 | Painel do dono: lista de pedidos (UI) | Front (Design) | depende do Design |
| B06 | Variações de produto (tamanho/cor) | Backend | |
| B07 | Reviews + AggregateRating | Backend | |
| B08 | Submissão do feed ao ChatGPT Shopping | Backend | |
| B09 | Adapter Stripe / ACP (Instant Checkout) | Backend | quando precisar |
| B10 | Repaginada total dos templates | Front (Design) | grande |
| B11 | Limpar dados de QA (tenant `qa-dentista@harpia.test` etc.) | Backend | inofensivo |

---

## 🚫 BLOQUEADO (depende do Cássio — externo)

| # | Cartão | Depende de |
|---|---|---|
| X01 | Vincular domínio próprio (`ancoreo.com.br`) | 🔨 EM ANDAMENTO — projeto renomeado + domínio add no Vercel; falta DNS no Registro.br (A @ → 216.198.79.1, CNAME www → vercel-dns-017) + middleware tratar domínio raiz como app |
| X02 | Ligar `OPENAI_API_KEY` + Fluid Compute na Vercel | Cássio |
| X03 | Criar conta Mercado Pago + `MERCADOPAGO_ACCESS_TOKEN` | Cássio |
| X04 | Renomear projeto no painel Vercel + Supabase | Cássio |
| X05 | Redesign náutico (tokens + CSS) + UI dos painéis | Claude Design (Cássio) |
