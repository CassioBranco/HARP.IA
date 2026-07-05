# ANCOREO — Estado do MVP (LEIA-ME PRIMEIRO / fonte da verdade VIVA)

> Atualizado 2026-07-04. Este doc existe pra **sobreviver a `/clear` e a
> compactação de contexto**. Qualquer sessão que perca o histórico deve LER
> ESTE ARQUIVO primeiro, junto com `NORTH-STAR.md` (raiz), `02-SPRINT-ATUAL.md`
> e `03-DECISOES.md`. Ele **substitui** trechos desatualizados de
> `STATUS-PROJETO.md` (2026-06-07).
>
> ⚠️ **Pasta do projeto:** `C:\Users\cassio\Documents\ancoreo` (ANCOREO tem
> memória própria). Se a sessão abriu na pasta "Marketing GERAL/claude" (o
> porão), ela NÃO está no projeto — trabalhar ANCOREO por caminho absoluto ou
> reabrir o Claude dentro da pasta ANCOREO.

---

## 0. PRÓXIMA AÇÃO DECIDIDA (retomar por aqui)
**Endurecimento de backend FEITO** (2026-07-04): webhook assinado + sanitizador
de blog + SSRF + JSON-LD + auditoria das 9 rotas novas (todas sólidas;
integridade de preço do checkout confirmada correta). Tudo LOCAL, tsc verde,
não commitado. Detalhe na seção 6.

**Retomar por:** destravar o que depende do Cássio —
1. **Q1 (decisão):** lançar **pago já** ou **beta grátis primeiro**? → destrava
   o billing da assinatura (única peça de backend que falta construir).
2. **Config (Cássio põe as chaves):** `MERCADOPAGO_ACCESS_TOKEN` +
   `MERCADOPAGO_WEBHOOK_SECRET` no ambiente pra loja processar de verdade.
3. **Infra de e-mail (Resend):** notificar o dono em lead/agendamento/pedido —
   precisa `RESEND_API_KEY` + domínio verificado. Construir quando configurado.

---

## 1. Escopo do MVP (ATUALIZADO)
- **Foco imutável** (NORTH-STAR): o site do assinante **aparecer na busca**
  (SEO + GEO + AEO). Isso não muda nunca. Filtro de toda feature: "isso ajuda o
  site a aparecer no Google/numa LLM?".
- **E-COMMERCE ENTRA NO MVP** (D21, 2026-07-04). Emenda a posição antiga
  ("checkout = pós-MVP"). O foco SEO/GEO/AEO segue soberano — a loja só vale se
  for a que **mais aparece na busca**. Consequência: **pagamentos agora são
  MVP** (loja do cliente + assinatura nossa).

## 2. Estado real (verificado)
- ✅ **Beta no ar** desde 30/06 (commit `8629993`, branch `master`). Telemetria
  coletando em produção (migration `analytics_events` aplicada com OK do
  Cássio). Domínio `ancoreo.com.br` com SSL gerando (S05).
- ✅ **service_role key do Supabase ROTACIONADA** (Cássio, 2026-07-04). Bloqueio
  antigo "rotacionar antes de produção" **RESOLVIDO**. O Claude NÃO tem a key
  antiga e não deve procurá-la (D23).
- ⏳ **Trabalho da fila noturna (NV1–NV6) + landing v2 = LOCAL**, não
  commitado/deployado. Migrations dessas features estão **ESCRITAS, não
  aplicadas**.
- Detalhe do que cada NV entregou: `NOITE-2026-07-04.md` +
  `RELATORIO-NOITE-2026-07-04.md`. Resumo:
  - **NV4 — Parcerias** (triangulação de backlinks entre clientes, anéis de 3
    A→B→C→A, opt-in, solicitação+aceite). Arquivos: `lib/seo/partner-match.ts`,
    `lib/seo/partner-inject.ts` (com fix de XSS cross-tenant:
    `SAFE_DOMAIN`/`SAFE_SLUG`), `app/api/partners/respond/route.ts`, migration
    `supabase/migrations/20260703140000_partner_backlinks.sql`.
  - **NV5 — Presença local** (`lib/seo/local-presence.ts`; cards em
    `MetricsView.tsx`; cadência GBP em `GbpClient.tsx`).
  - **Integração de janelas:** `EditorSidebar.tsx` com ícones/vocabulário
    alinhados ao painel (Phosphor).
  - **NV6 — Segurança:** build verde, tsc verde, postMessage/JSON-LD/FAQ-route
    aprovados. Achado médio pendente: **sanitizador de HTML do blog**.
  - **Landing v2** (`app/page.tsx` + `app/landing.css`, imagens de farol via
    Nano Banana em `public/img/`): **PARADA** como base de front futura (D24).

## 3. Migrations ESCRITAS e NÃO aplicadas (gate do Cássio)
`blog_faq`, `partner_backlinks` (`20260703140000`),
`internal_links_triangulation`, `social_links`, `booking`, `leads`,
`blog_cover_scheduling`. Aplicar só com OK explícito (D14).

**Auditadas 2026-07-04:** 6 batem com o código e estão prontas. A de
`partner_backlinks` tinha 2 bugs (corrigidos, ainda não aplicada): (a) o aceite
quebrava — RLS `WITH CHECK from=self` barrava o destinatário; (b) um membro
podia forjar o aceite dos outros 2. Corrigido: `partner_rings`/`_requests`/
`_ring_links` viraram **SELECT-only** pra authenticated; escrita passa pelas
rotas `request`/`respond` via `admin` após autorização. `tsc` verde.

## 4. Decisões travadas relevantes (ver `03-DECISOES.md` p/ a lista completa)
- **D21 — E-commerce no MVP.** **D22 — IA: Haiku 4.5 primário, Sonnet 4.6
  backup, model-agnostic, mesma skill/pipeline/parâmetros.** **D23 —
  service_role rotacionada.** **D24 — front despriorizado.** **D25 — auditoria
  antes de decidir pago/grátis.**
- **D26 — Publicação NUNCA automática.** Fluxo obrigatório: onboarding → gerar
  RASCUNHO → editar no editor → **publicar por ação explícita** (botão dentro do
  editor). Gerar ≠ publicar; jamais criar atalho "gerar e publicar". (Já
  implementado: `generate/site` = draft; `/api/publish` explícito + gate AEO.)
- **D27 — NUNCA prometer performance imediata.** Nada de "primeira página/topo
  do Google/resultado rápido". Só mostrar dado REAL; estimativas só quando
  houver base real de tempos (via telemetria `analytics_events` + Search
  Console/Analytics). Painel já faz isso (ranking/visitas = "em breve", sem
  número fabricado). Verificado 2026-07-04.
- **Planos** (esqueleto, sem preço — `CUSTOS-E-PLANOS.md`): Inicial · Médio ·
  Avançado · E-commerce. Médio = **volume + alcance** (mais artigos + auto-blog
  + Parcerias + GBP completo). E-commerce = **taxa pequena por venda** (add-on
  ligável). ⚠️ Fable 5 é o modelo mais CARO (US$10/50) — não usar em geração em
  massa.

## 5. GATE ABSOLUTO
**Sem commit, push, deploy ou migration_apply sem aprovação explícita do
Cássio.** Só arquivos locais e migrations escritas. `npx tsc --noEmit` tem que
estar verde antes de marcar qualquer item como pronto. NÃO confiar em auto-
report de subagente — verificar pessoalmente com `git status --porcelain` +
`npx tsc --noEmit` + lendo os arquivos.

## 6. Bloqueios pra "MVP tudo ok"
- ✅ **Segurança (feito 2026-07-04, local, tsc verde, não commitado):**
  - **Sanitizador de HTML do blog** — `lib/blog/sanitize.ts` (allowlist
    `sanitize-html`), aplicado no render em `BlogArticle.tsx` antes do TOC.
    Provado: script/onclick/javascript:/iframe removidos.
  - **SSRF no verificador de links** (`app/api/score/[siteId]/links`) — guard
    `lib/net/safe-fetch.ts` bloqueia loopback/IP privado/link-local/metadados
    (169.254.169.254) e valida cada redirecionamento. `link-checker.ts` usa
    `safeFetch`. Provado contra 14 casos.
  - **Breakout `</script>` no JSON-LD** — helper `lib/seo/jsonld.ts`
    (`jsonLdScript`, escapa `<`) aplicado em `produto/[slug]`, `[domain]/page`,
    `SiteSchema.tsx`, `SiteTemplate.tsx`. Blog já era seguro.
  - **Webhook de pagamento** — validação de assinatura `x-signature` do MP em
    `lib/ecommerce/payments/mercadopago.ts` (HMAC, `MERCADOPAGO_WEBHOOK_SECRET`).
  - **Rate-limit** (feito): `lib/net/rate-limit.ts` — teto de 12 envios/site/60s
    em `/api/leads` e `/api/booking` (anti-flood, serverless-safe).
  - **E-mail transacional (feito, DORMENTE):** `lib/email/` (resend + builders,
    módulo criado pelo Fable 5 e revisado) + `lib/auth/owner.ts` (resolve e-mail
    do dono) + fiação em leads/booking/webhook de pedido. Desligado até
    `RESEND_API_KEY` + domínio verificado (Cássio). Não envia nada sem a chave.
  - **Auditoria adversarial pré-deploy (Fable 5, verificada à mão 2026-07-04):**
    nada CRÍTICO/ALTO; padrão multi-tenant (tenant_id derivado no servidor +
    escrita anônima só via service_role + RLS SELECT-only nas parcerias)
    confirmado correto. 3 correções aplicadas (local, tsc verde): (#1) webhook MP
    busca pagamento pelo `data.id` da QUERY (valor assinado), não do body;
    (#5) `.gitignore` barra `app_backup/`+`_mockups/` (render de blog ANTIGO sem
    sanitize — não podia ir ao deploy); (#7) `oneLine()` tira `\r\n` do nome do
    visitante no assunto do e-mail. Hardening PÓS-beta (não bloqueia): rate-limit
    é por-site sem teto global (#3, add honeypot/turnstile ao escalar), spam de
    convites de parceria sem limite (#4), `partner_optin` expõe `tenant_id` cru a
    autenticados (#6, by design). Operacional: garantir `MERCADOPAGO_WEBHOOK_SECRET`
    no ambiente de produção antes da loja ir ao vivo (#2).
- 🟢 **Pagamentos (agora MVP):**
  - *Assinatura nossa:* construir. Stripe Billing recomendado (ou Pix
    Automático 1,19%). **GATE:** pago já OU beta grátis primeiro? (Q1).
  - *Loja do cliente:* MP/Stripe **Connect** (dinheiro vai direto pro cliente) +
    **validar assinatura do webhook** (buraco em
    `app/api/checkout/webhook/route.ts`) + `MERCADOPAGO_ACCESS_TOKEN`.
- 🟡 **Legal/LGPD:** Cássio preenche dados da empresa (CNPJ, razão social,
  e-mails) em `/termos` e `/privacidade` + OK pra deploy do banner (código
  pronto e verde — S03/S04).
- 🟢 **Deploy do trabalho novo:** aplicar migrations + commit + deploy (só com
  OK). Ver seção 3.

## 7. Perguntas abertas que destravam o MVP
1. **(Q1) RESOLVIDO 2026-07-04: BETA GRÁTIS primeiro.** Billing da assinatura
   sai da v1 (pós-beta). Clientes usam grátis no beta; as LOJAS deles já
   processam vendas reais via MP. O billing será construído depois, sobre uso
   real. Deixa de ser bloqueio de lançamento.
2. **(Q2)** Aplicar migrations pendentes + deployar as NV **agora**, ou
   **estabilizar só o core do beta** primeiro?

## 8. Como retomar depois do /clear
1. Ler este doc + `NORTH-STAR.md` + `02-SPRINT-ATUAL.md` + `03-DECISOES.md`.
2. Rodar a **auditoria** da seção 0 (é a próxima ação).
3. Respeitar o GATE ABSOLUTO (seção 5).
