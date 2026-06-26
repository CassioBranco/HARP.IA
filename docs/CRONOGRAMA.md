# ANCOREO — Cronograma do Projeto (alinhado ao roadmap original)

> Mesma estrutura do roadmap do Notion (Fase A → B → C → D + Sprints), com o **status real** preenchido a partir do git + banco ao vivo.
> O Notion está todo como "A fazer" porque nunca foi atualizado conforme a entrega — **este doc é a versão verdadeira.**
> Atualizado: 2026-06-26. Marca final: **ANCOREO** (infra ainda usa "harp-ia": repo, deploy, harpia.site).

## ⚠️ O que significa "lançado" (leia primeiro)
- **Deploy técnico:** ✅ o produto está em produção (harp-ia.vercel.app) e funciona ponta a ponta.
- **Lançamento comercial / beta:** ❌ ainda NÃO aberto. Sem domínio próprio no ar, sem cliente real. O banco só tem contas de teste (9 tenants / 1 user).
- **O que separa um do outro:** o gate de **DNS/domínio** (Sprint S13). É o gargalo nº 1.

---

## FASE A — Orquestração / Planejamento (Claude.ai) — ✅ CONCLUÍDA
| Item | Status | Real |
|------|--------|------|
| Prompts Bloco 0 (Global) | ✅ | No banco + CLAUDE.md |
| Prompts Blocos 1–13 (agentes + nichos) | ✅ núcleo | `prompt_templates` = 21 (global, onboarding, blog, gbp, 14 nichos). Auditoria/Multilíngue ficam p/ quando os agentes existirem |
| ARCHITECTURE.md + 8 regras AEO + seo-rules | ✅ | `docs/AEO-ARCHITECTURE-RULES.md` |
| Schema do banco (17+ tabelas + RLS) | ✅ | Aplicado e verificado no banco |
| Design system (paletas/tokens) | ✅ | globals.css |
| CLAUDE.md final | ✅ | Raiz |

## FASE B — Protótipos (B1–B6) — ✅ BASE FEITA / 🔄 REDESIGN
| Item | Status | Real |
|------|--------|------|
| B1 Onboarding · B2 Templates · B3 Painel · B4 Landing · B5 Editor blog · B6 Dashboard métricas | ✅ base | Protótipos viraram código na Fase C |
| Redesign visual "clean" | 🔄 | Em curso com **Claude Design** (front = Design; back = Code) |

## FASE C — Build (Claude Code) — NÚCLEO ✅ / FALTA O "IR AO AR"
| Sprint | Status | Real |
|--------|--------|------|
| **S1** Infra base (Next.js+Supabase+Auth+Vercel) | ✅ | 2026-06-04 |
| **S2** Onboarding wizard | ✅ | 2026-06-07. GBP via **vínculo de link** (não OAuth — OAuth fica no S7) |
| **S3** Templates em Tailwind + paletas | ✅ | 10 layouts (2026-06-11) |
| **S4** Motor de IA (Agente Onboarding + SSE) | ✅ | 2026-06-15 |
| **S5** Pipeline de publicação (WebP, JSON-LD, sitemap, robots-IA, internal_links, gate) | ✅ | 2026-06-19. **Falta só o DNS (S13) pra ir ao ar** |
| **S6** Agente Blog + editor 3 modos + calendário | ✅ geração | Editor existe; "3 modos" parcial |
| **S7** Integração GBP + Agente GBP | ⏳ parcial | Níveis 1–2 ✅ (gerador de post copia-e-cola, 18/06). **Nível 3 (OAuth/postar sozinho) ❌** — depende de Google Cloud, fica p/ planos superiores/pós-beta |
| **S8** Score SEO/GEO/AEO live + Auditoria | ✅ | Score por regra no ar |
| **S9** Stripe (assinaturas + trial) | ❌ | Pós-beta (precisa conta/chaves) |
| **S10** Painel admin (prompt_templates editável por UI) | ❌ | Prompts editáveis só por migration hoje; UI não construída |
| **S11** Landing didática + signup | ✅ | Landing de marketing pronta |
| **S12** Quotas + tenant_usage | ✅ | `plan_quotas` semeada (15), cap diário aplicado |
| **S13** Domain auto-purchase / DNS | ❌ | **GATE Nº 1 pra beta.** Código de roteamento por host pronto; falta registrar domínio + wildcard no Vercel (ação Cássio) |
| **Beta com 2–5 clientes** | ⬜ | O objetivo. Destravado pelos gates abaixo |

## FASE D — Pós-beta (D1–D8) — ⬜ NÃO INICIADA
Multilíngue (D1), White-label Agency (D2), API Agency (D3), Painel multi-cliente (D4), Afiliados (D5), Internacionalização Stripe/Paypal (D6), Extras Pro (D7), Extras Agency (D8).

---

## O QUE FALTA PRA ABRIR A BETA (em ordem)
Tudo isto é ação sua; eu guio campo a campo.
1. 🔴 **S13 — DNS / domínio** do Ancoreo (registrar + wildcard no Vercel). **Sem isto, nada vai ao ar.**
2. 🔴 **Fluid Compute na Vercel** (toggle; precisa Vercel Pro) — pra geração longa.
3. 🔴 **OPENAI_API_KEY** (RAG / cofre de conhecimento) — ligar e testar.
4. 🟡 **Redesign visual** (Claude Design) + medidor de SEO no topo do onboarding.

## BACKLOG DE PRODUTO (novas features pedidas, fora dos sprints originais)
- Apagar conta completa (hoje deixa tenant órfão — 9 tenants p/ 1 user no banco).
- Depoimentos/prova social com foto do cliente.
- Avaliações do Google no site.
- GPE mais integrado (postar/IA fluido; automação = plano superior — é o S7 Nível 3).
- Páginas de área de atuação (SEO geográfico programático, com unicidade real).
- Pesquisa dedicada GEO/AEO (lacuna da pesquisa de 25/06).
