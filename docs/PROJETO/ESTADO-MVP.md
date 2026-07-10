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
**🚀 DEPLOY FEITO (2026-07-05).** Commit `fe81441` na `master`, buildado e no ar
na Vercel (deployment `dpl_ACptq…`, state READY, produção). As **7 migrations**
da leva foram **aplicadas em produção** e verificadas (tabelas leads/booking/
partner_* + colunas). Auditoria adversarial do Fable 5 rodada e 3 correções
aplicadas antes do push. Páginas legais limpas ao vivo (sem placeholders/notas
internas; "em atualização durante o beta"). Confirmado via WebFetch em
`ancoreo.com.br/termos`.

**✅ LOGIN DO CLIENTE JÁ FUNCIONA** (confirmado pelo Cássio 2026-07-05): auth
self-serve (email+senha / Google) + provisionamento automático de tenant já
estão de pé; a confirmação de e-mail no Supabase já foi configurada em sessão
anterior. NÃO retomar "config de login/Supabase" — está resolvido.

**Retomar por:** o que ainda depende do Cássio —
1. **Chaves do Mercado Pago:** `MERCADOPAGO_ACCESS_TOKEN` +
   `MERCADOPAGO_WEBHOOK_SECRET` na **Vercel** (env de produção) pra loja
   processar de verdade. Precisa do acesso do Dove à conta MP. Enquanto ausente,
   webhook cai em `unconfigured` (loja dormente).
2. **E-mail (Resend):** `RESEND_API_KEY` + domínio verificado → liga as
   notificações (módulo já fiado, dormente).
3. **CNPJ/legal:** quando sair, commit de 2 min preenche razão social + CNPJ +
   sede reais em /termos e /privacidade (hoje "em atualização durante o beta").
4. **Bug visual pendente:** divisor de ondas da landing (`.anc .deep`/`.foot` em
   `app/landing.css`) está com o escalope invertido (côncavo). Fix = trocar o
   círculo do `radial-gradient` de `transparent`→`var(--ink)` (convexo). NÃO
   aplicado — aguardava confirmação de direção do Cássio.
5. **Q1 (decisão, PÓS-beta):** billing da assinatura (Q1 = beta grátis, fora da
   v1).

---

## 0.1 EM CURSO — Wireframe do editor + anti-fabricação (2026-07-09)
> **Princípio do Cássio (2026-07-09):** primeiro o **wireframe funcional e limpo**,
> estilo/beleza **depois**. Régua atual = funciona e é organizado, não bonito.
> Fonte de ícones/animações pra fase de ESTILO (não agora): **uiverse.io** +
> Phosphor (`public/icons`). Tudo abaixo é **LOCAL, tsc OK, NÃO deployado**.

- ✅ **IA parou de inventar (anti-"enche-linguiça").** Reescrito o user-prompt de
  `app/api/generate/site/route.ts` com "REGRA DE FATOS" no topo: só escreve com
  fato do perfil; onde falta, deixa marcador `[ ]` em vez de inventar;
  `testimonials` **sempre `[]`**; removidas as cotas que forçavam padding
  (2-3 parágrafos / cidade 2x). **Pendente:** o prompt de SISTEMA no banco
  (`seed_prompt_templates.sql:63`) ainda diz "testimonials: 3 fictícios" — some
  a contradição. Corrigir via **migration** (mexe em prod → GATE do Cássio).
- ✅ **Editor reorganizado em 2 laterais** (Cássio: "muito melhor"). Antes: 9 abas
  de ~34px espremidas num painel só. Agora: **esquerda = Conteúdo** (Textos,
  Imagens, Marca) · **direita = Design & Ajustes** (Modelo, Cores, Fontes, SEO,
  Agenda, Leads) · preview grande no meio. Arqs: `app/(editor)/editor.css` (grid
  4 col + wrap das abas), `CustomizationPanel.tsx` (2 painéis, `leftTab`/`rightTab`),
  `editor/[siteId]/page.tsx`.
- ✅ **Campo de depoimentos REAIS** no editor (`SectionEditor.tsx` + `SECTIONS`):
  nome (obrigatório), texto, nota, **foto (opcional, reusa `/api/images/upload`)**,
  **data (opcional)**. A IA nunca toca em depoimento (botões de IA escondidos).
  Dado flui: `build-site-content.ts` (photo_url→photoUrl, date) + tipo em
  `example-content.ts`. **Seção vazia agora some** em todos os layouts (guardas
  corrigidas em CleanLayout + AcademiaLayout; os outros 7 já ok). Foto/data
  renderizados no **CleanLayout** (modelo padrão).
- ✅ **Bug de arraste de imagem corrigido.** (a) Dropzone do painel
  (`ImageUploader.tsx`) virou alvo de drop de verdade: `<div>` com
  dragEnter/Over/Leave/Drop + destaque visual "Solte a foto pra enviar" (antes
  era `<button>` sem feedback, parecia morto). (b) Modelos Jovem/Tech
  renderizavam `<img src={c.heroImage}>` sem fallback (quebrada quando vazia) e
  Acolhedor renderizava a imagem condicional (sem alvo pra 1ª foto) — agora todos
  têm placeholder picsum como os demais modelos, então sempre há onde soltar.
- ✅ **Imagem por serviço** (resolve o "espaços limitados"): cada serviço aceita
  foto opcional no editor (`SectionEditor` services + `uploadSvcPhoto`). Dado flui
  (`ServiceItem.image` → `build-site-content` → `SiteContent.services.image`) e é
  **renderizado nos 8 modelos** que têm seção de serviços: nos com ícone a foto
  substitui o emoji; nos sem ícone (Clean/Bold/Profissional) entra como miniatura.
  Sem foto = comportamento antigo (ícone/número). Antes só havia 2 slots
  (hero/about); agora tem 1 por serviço também.
- ⏳ **Falta neste bloco (fase de estilo / gates):**
  1. **Foto/data dos depoimentos nos outros 8 layouts** (só Clean renderiza hoje).
  2. Migration do prompt de sistema no banco (contradição "3 fictícios" — gate).
  3. Galeria dedicada / mais slots ainda podem entrar se o Cássio quiser.

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
