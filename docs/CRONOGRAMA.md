# ANCOREO — Cronograma do Projeto (planilha viva)

> Mesma estrutura do roadmap do Notion (Fase A → B → C → D + Sprints), com o **status real**
> preenchido a partir do git + banco + Vercel ao vivo.
> **Detalhe operacional do dia a dia vive em `docs/PROJETO/ESTADO-MVP.md`** (fonte da verdade
> mais granular). Este doc é a visão de roadmap; aquele é o "o que fazer agora".
> **Atualizado: 2026-07-05.** Marca: **ANCOREO** (infra/repo ainda usam "harp-ia": repo HARP.IA,
> projeto Vercel `ancoreo`, banco Supabase `HARP.IA`/`yejjeiveqgkgrtcettkl`).

## ✅ O que significa "lançado" (leia primeiro) — MUDOU
- **Deploy técnico:** ✅ em produção. `ancoreo.com.br` no ar com SSL desde **30/06**.
- **Beta:** ✅ **ABERTO.** Último deploy **05/07** (commit `fe81441`, Vercel READY): trouxe as
  features das noites + endurecimento de backend + auditoria. 7 migrations aplicadas em produção.
- **Login do cliente:** ✅ funciona (self-serve email+senha / Google, provisionamento automático
  de tenant, confirmação de e-mail já configurada no Supabase).
- **Falta pra VALER (não trava o beta):** subir clientes reais + configs do Cássio (chaves MP,
  Resend, CNPJ). Detalhe na seção final.

---

## FASE A — Orquestração / Planejamento — ✅ CONCLUÍDA
| Item | Status |
|------|--------|
| Prompts (global + onboarding + blog + gbp + 14 nichos) | ✅ `prompt_templates` no banco |
| ARCHITECTURE + 8 regras AEO | ✅ `docs/AEO-ARCHITECTURE-RULES.md` |
| Schema do banco (RLS multi-tenant) | ✅ aplicado |
| Design system (paletas/tokens) | ✅ Núcleo v2 "Carta Náutica" |

## FASE B — Protótipos — ✅ FEITO (viraram código na Fase C)
| Item | Status |
|------|--------|
| B1–B6 (onboarding, templates, painel, landing, editor, métricas) | ✅ |
| Redesign visual "clean" (núcleo v2) | ✅ no ar |

## FASE C — Build — ✅ NÚCLEO COMPLETO / no ar
| Sprint | Status | Real |
|--------|--------|------|
| **S1** Infra (Next.js+Supabase+Auth+Vercel) | ✅ | 04/06 |
| **S2** Onboarding wizard | ✅ | 07/06 (GBP por vínculo de link) |
| **S3** Templates + paletas | ✅ | 10 layouts |
| **S4** Motor de IA (onboarding + SSE) | ✅ | 15/06 |
| **S5** Pipeline de publicação (WebP, JSON-LD, sitemap, robots-IA, internal_links, gate) | ✅ **no ar** | DNS resolvido |
| **S6** Agente Blog + editor + FAQ estruturada | ✅ | geração + edição |
| **S7** GBP (gerar post + cadência) | ⏳ parcial | Níveis 1–2 ✅. Nível 3 (OAuth/postar sozinho) ❌ pós-beta |
| **S8** Score SEO/GEO/AEO live | ✅ | por regra, no editor + painel |
| **S9** Stripe/billing assinatura | ❌ **pós-beta** | Q1 resolvido = **beta grátis**; billing sai da v1 |
| **S10** Painel admin de prompts (UI) | ❌ | prompts por migration hoje |
| **S11** Landing + signup | ✅ | landing v2 |
| **S12** Quotas + tenant_usage | ✅ | cap diário aplicado |
| **S13** DNS / domínio próprio | ✅ **RESOLVIDO** | `ancoreo.com.br` no ar (era o gate nº 1) |
| **Beta com clientes reais** | 🔄 **destravado** | pode subir cliente AGORA — é a próxima ação |

## Entregas das "noites" (NV1–NV6) + hardening — ✅ no ar (deploy 05/07)
| Item | Status |
|------|--------|
| Captura de **leads** (faixa inline) + painel /leads | ✅ |
| **Agendamento** (widget público) + painel /agendamentos | ✅ |
| **Parcerias** (backlinks em anel A→B→C→A, opt-in, RLS corrigida) | ✅ |
| Blog: **FAQ estruturada** + capa + agendamento (colunas) | ✅ (UI de capa por artigo: pendente) |
| **Presença local** (saúde GBP, cadência) | ✅ |
| Loja: catálogo + PDP + checkout (MP/WhatsApp) + pedidos | ✅ (MP dormente até chave) |
| **Endurecimento de backend** (webhook assinado, sanitize blog, SSRF, JSON-LD, rate-limit) | ✅ |
| **E-mail transacional** (Resend) — dormente até `RESEND_API_KEY` | ✅ fiado |
| **Auditoria adversarial** (Fable 5) + 3 correções | ✅ 05/07 |

## FASE D — Pós-beta — ⬜ NÃO INICIADA
Multilíngue, White-label/API Agency, painel multi-cliente, afiliados, Stripe internacional, extras Pro/Agency.

---

## O QUE FALTA (beta já ABERTO — isto é escalar/melhorar, ação do Cássio)
1. 🟢 **Subir clientes reais** no beta (a máquina está pronta; falta uso pra colher dado).
2. 🟡 **Chaves do Mercado Pago** na Vercel (`MERCADOPAGO_ACCESS_TOKEN` + `_WEBHOOK_SECRET`) — liga checkout com cartão. Precisa acesso do Dove à conta MP.
3. 🟡 **Resend** (`RESEND_API_KEY` + domínio verificado) — liga e-mails de notificação.
4. 🟡 **CNPJ + razão social** — quando sair, commit de 2 min preenche /termos e /privacidade.
5. 🔵 **Search Console (API)** — a MELHOR próxima ferramenta: transforma as métricas "em breve"
   do painel em dado real (impressões/cliques/posição). Só vale depois de ter tráfego.
6. 🔵 **Otimização de imagem** (`next/image`/webp) — Core Web Vitals (ranking). Pós-lançamento.

## BUG VISUAL PENDENTE
- Divisor de ondas da landing (`app/landing.css`, `.anc .deep`/`.foot`): escalope invertido
  (côncavo). Fix pronto (trocar círculo do `radial-gradient` de `transparent`→`var(--ink)`).
  Aguarda confirmação de direção do Cássio.

## ⭐ PRIORIDADE FUTURA — parada por decisão do Cássio (05/07)
- 💰 **Precificar os 4 planos** (Inicial / Médio / Avançado / E-commerce): fazer a conta
  custo × margem-alvo e definir o valor de cada um. Base pronta em
  `docs/PROJETO/CUSTOS-E-PLANOS.md` (hoje sem preço; R$97 já apontado como baixo demais —
  break-even só a ~50 clientes). Retomar quando o Cássio quiser. Espelhar na dashboard do
  Notion quando o conector apontar pro workspace certo do ANCOREO.

## TRACKERS ANTIGOS (não usar — desatualizados)
- `docs/STATUS-PROJETO.md` (07/06), `docs/trello-1-a-fazer.txt`, `docs/trello-2-done.txt`.
  Substituídos por este CRONOGRAMA + `docs/PROJETO/ESTADO-MVP.md`.
