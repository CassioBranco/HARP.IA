# ANCOREO — Sprint Atual

> **Meta da sprint:** projeto pronto para produção (rename + telemetria + base legal LGPD).
> **Janela:** 2026-06-30 → 2026-07-10 (deadline do Cássio).
> Dono: Scrum Master. Recorte focado do `01-BACKLOG.md`.

---

## 🎯 Cartões da sprint (em ordem de prioridade)

### S01 — Finalizar rename ANCOREO · ✅ FEITO
- [x] Banco varrido — limpo (só sobrou tenant de QA, inofensivo)
- [x] Cássio: renomeou projeto no painel **Vercel** (`ancoreo`)
- [x] Backend: fallbacks `harp-ia.vercel.app` → `ancoreo.com.br` (sitemap, robots, mercadopago)
- [x] Backend: middleware reconhece `ancoreo.com.br` + `www` como app (fallback de segurança se env faltar)
- [x] **Deploy da beta** (commit `8629993`, push no `master`) — 2026-06-30
- [ ] Cássio: renomear projeto no painel **Supabase** (cosmético, não urgente)
- **Cargo:** Backend ✓ · `tsc` verde

### S05 — Integração do domínio `ancoreo.com.br` · 👀 EM REVISÃO (SSL gerando)
- [x] Projeto renomeado + domínio adicionado no Vercel (apex + www)
- [x] Middleware trata domínio raiz como app (não como site de cliente)
- [x] Cássio: criou DNS no Registro.br — A `ancoreo.com.br`→`216.198.79.1`, CNAME `www`→`1252b615ed3ea839.vercel-dns-017.com.`
- [x] Vercel detectou o DNS e está **emitindo o HTTPS** (automático)
- [ ] Cássio: setar env **`NEXT_PUBLIC_APP_URL=https://ancoreo.com.br`** no Vercel (Production) — código tem fallback, então não bloqueia
- [ ] Confirmar "Valid Configuration" verde + site abrindo em `https://ancoreo.com.br`
- **Cargo:** Backend ✓ (código) · resto são portões do Cássio
- **📍 ESTADO (2026-06-30):** DNS salvo no Registro.br; Vercel gerando SSL. Deploy da beta JÁ subiu (commit `8629993`). Falta só o SSL ficar verde e (opcional) a env `NEXT_PUBLIC_APP_URL`.

### S02 — Telemetria de funil (LGPD-safe) · ✅ FEITO (no ar)
- [x] Decisão da ferramenta: **tabela própria** (D17)
- [x] Migration `analytics_events` escrita (RLS, sem PII) — `supabase/migrations/20260630120000_analytics_events.sql`
- [x] **Migration aplicada no banco** (2026-06-30, com OK do Cássio)
- [x] Rota `/api/track` (allowlist, session_id httpOnly, tenant best-effort, opt-out) + lib `lib/analytics/`
- [x] Eventos fiados no funil: onboarding (start, step_view, goal, loja_modo, generate_block, generate_click) + template_choose + site_created
- [x] `tsc` verde
- [x] **Deploy** (commit `8629993`) — telemetria coletando em produção
- **Eventos capturados** permitem ver: por onde abandonam, em que tela travam, % que gera, objetivo/modo/template escolhidos. Abandono = sessão com maior step < 7.
- **Cargo:** Backend ✓ → no ar. Falta só o banner de consentimento (S04) pra fechar a camada LGPD.

### S03 — Termo de Uso + Política de Privacidade · 👀 EM REVISÃO (falta deploy + dados da empresa)
- [x] Páginas `/termos` e `/privacidade` criadas (`app/(legal)/`) — casca própria legível (`legal.css`)
- [x] Política cobre: dados coletados, telemetria pseudônima, bases legais LGPD, cookies, subprocessadores (Vercel/Supabase/OpenAI/Anthropic/Mercado Pago/Google), transferência internacional, retenção 12m, direitos do titular, DPO
- [x] Termo cobre: serviço, conta, planos/Mercado Pago, conteúdo por IA (sem garantia de rank), propriedade, uso aceitável, cancelamento/CDC, foro
- [x] Aceite no cadastro já existia (signup linka /termos e /privacidade) — agora os links resolvem
- [x] `tsc` verde · páginas servem 200 (verificado via HTTP)
- [ ] 🟡 Cássio: preencher dados da empresa (trechos em amarelo) — razão social, CNPJ, cidade/UF, e-mails
- [ ] 🚫 Cássio: OK pra deploy
- **Cargo:** Backend ✓ → revisão de conteúdo + dados com Cássio

### S04 — Consentimento (cookies + telemetria) · 👀 EM REVISÃO (falta deploy)
- [x] Decisão: **transparência + opt-out** (legítimo interesse), telemetria SEGUE ligada (pedido do Cássio)
- [x] `ConsentBanner` (client) montado no root layout; só aparece no host do app (não em site de cliente)
- [x] "Entendi" grava `aco_consent`; "Não quero ser rastreado" grava `aco_no_track=1` (respeitado por client + rota)
- [x] Link pra /privacidade no banner; `tsc` verde
- [ ] 🚫 Cássio: OK pra deploy
- **Cargo:** Backend/Front ✓

---

## 🔓 Decisões pendentes desta sprint (a alinhar com Cássio)

1. ~~Ferramenta de telemetria~~ → resolvido: tabela própria (D17).
2. ~~Consentimento (S04): opt-in vs legítimo interesse~~ → resolvido (D20): **legítimo interesse + opt-out**, a pedido do Cássio ("quero telemetria dos usuários da plataforma").

---

### S06 — Front-end novo (núcleo "Carta Náutica" v2, do zero) · 🔨 EM ANDAMENTO
- [x] Decisão: núcleo do ZERO baseado no ANCOREO — sem herança HARPIA (feedback direto do Cássio)
- [x] Cartilha escrita: `docs/DESIGN-NUCLEO.md` (paleta papel/navy/vermelho, Fraunces + Plex Mono, dispositivos de impresso naval)
- [x] Tokens `globals.css` v2 (papel quente) + fontes novas no root layout
- [x] **Landing refeita do zero** (`.anc`) — hero editorial, carimbo de score, marquee, manifesto, banda navy com selos, bilhetes de embarque, farol, rodapé escalopado
- [x] Banner de consentimento + fundo do auth na linguagem v2
- [x] `tsc` verde · verificado visualmente no preview (desktop + mobile)
- [ ] Onboarding, painel, editor, galeria de templates → migrar pra v2 (próximas fases)
- [ ] Templates dos sites de clientes (4 visuais arrojados) — fase própria
- **Cargo:** Front/Design (Claude) · deploy só com OK do Cássio (D14)

## 📌 Próxima ação do Scrum Master
**Auditoria do fluxo do assinante de ponta a ponta** (cadastro → onboarding →
gerar site → publicar → loja/checkout), só leitura, sem tocar em nada — pra
dizer com fato o que funciona / o que quebra / o que falta pro MVP fechar. É o
que destrava a decisão "pago já vs beta grátis" (D25). **Fonte de contexto
completa: `ESTADO-MVP.md` (leia-me primeiro).**

Pendências que continuam abertas em paralelo:
- **E-commerce agora é MVP** (D21) → loja do cliente (Connect + validar
  assinatura do webhook + `MERCADOPAGO_ACCESS_TOKEN`) + assinatura nossa.
- **Segurança:** sanitizador de HTML do blog (achado NV6) — Claude faz.
- **Legal (S03/S04):** Cássio preenche dados da empresa + OK pra deploy do banner.
- **Fila noturna NV1–NV6 + landing v2 = local, não deployado**; migrations
  escritas e não aplicadas (ver `ESTADO-MVP.md` §3). Deploy só com OK (D14).

> Beta no ar (commit `8629993`). S03/S04 codados e verdes — falta Cássio
> preencher dados da empresa nas páginas legais e dar OK pra deploy.
