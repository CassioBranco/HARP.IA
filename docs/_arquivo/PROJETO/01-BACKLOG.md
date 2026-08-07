# ANCOREO — Backlog (Quadro Kanban)

> Dono: Product Owner. Atualizado a cada cartão fechado.
> Status: `📥 BACKLOG` → `🎯 SPRINT` → `🔨 EM ANDAMENTO` → `👀 EM REVISÃO` → `✅ FEITO` · `🚫 BLOQUEADO`
> Última atualização: 2026-07-18 · **Plano-mestre: `04-ROADMAP.md`** (os itens B## abaixo agora têm fase atribuída lá)

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
| F15 | Editor de 2 painéis (Conteúdo + Design) com `load()` blindado — substitui a versão single-panel da beta | Front |

> **Deploy 2026-07-10** — commit `59b4e48` empurrado no `master` (Vercel), COM OK do Cássio (D14). 30 arquivos: ícones (F14) + reescrita do editor + wireframes (`docs/modelos-referencia/`). `tsc` verde + `next build` OK · sem migration.
>
> **⚠️ Hotfix 2026-07-10** — a reescrita do editor (4 colunas + skeletons) que subiu junto **travou o `SectionEditor` em loading em produção** (barras cinzas, sem campos). Revertida no commit `820909b` (editor volta pra versão da beta). `tsc` verde + `next build` OK. `next build`/`tsc` NÃO pegaram o bug (é runtime) → lição: editor exige teste no navegador antes de shipar. Reescrita preservada em `59b4e48`; correção = task aberta `task_478c2504`. Ícones (F14) seguem no ar, intactos.
>
> **✅ Deploy 2026-07-16** — editor de **2 painéis** (Conteúdo à esquerda, Design & Ajustes à direita) foi pra produção. Construído sobre o core da beta (que funciona) + `SectionEditor` com `load()` endurecido (try/catch/finally, sem loading eterno). Testado localmente antes do merge. Branch `editor-2paineis` (`4862bc3`) → merge `057d538` no `master`. Deploy Vercel `dpl_7Ef6...` = READY. `tsc` verde. Substitui a versão single-panel da beta. Encerra o problema do hotfix acima.

---

## 🎯 SPRINT ATUAL (18/07 → 31/07) — ver `02-SPRINT-ATUAL.md`

| # | Cartão | Cargo | Status |
|---|---|---|---|
| 0.1 | Auditoria ponta-a-ponta do fluxo do assinante (só leitura) | QA | 🎯 SPRINT |
| 0.2/0.3 | Aplicar 7 migrations + deploy fila NV1–NV6 | Backend | 🚫 GATE (OK Cássio) |
| 0.4 | Migration prompt de sistema (anti-fabricação) | Backend | 🚫 GATE (OK Cássio) |
| 0.5 | Legal: dados da empresa + deploy banner (ex-S03/S04, código pronto) | 🚫 Cássio | 👀 EM REVISÃO |
| 0.6 | Junction da memória (Desktop → Documents) | 🚫 Cássio | 🚫 BLOQUEADO |
| 0.7 | Limpar tenant de QA (ex-B11) | Backend | 🎯 SPRINT |
| 2.1 | Wireframe do site builder (fluxo completo + telas de loja) | Design | 🎯 SPRINT |

> Sprint anterior (30/06→10/07) encerrada em 18/07 — resumo do que fechou no topo do `02-SPRINT-ATUAL.md`. S01/S02/S05 ✅ FEITO; S03/S04 viraram o cartão 0.5.

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
