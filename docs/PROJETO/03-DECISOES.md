# ANCOREO — Decisões Travadas (ADR-lite)

> Append-only. Cada decisão aqui **não se rediscute** sem o Cássio reabrir.
> Antes de propor qualquer coisa, conferir esta lista para não contradizer o passado.

Formato: `D## — Decisão — data — motivo curto`

---

### Arquitetura & Stack

- **D01 — Stack: Next.js 14 (App Router) + RSC + Server Actions + Supabase Postgres.** — base do projeto. Referência de e-commerce = "headless commerce" (mesmo padrão do Next.js Commerce da Vercel).
- **D02 — Multi-tenant por RLS** via `auth_tenant_id()` (SECURITY DEFINER) + policies `tenant_isolation`. O dono logado só enxerga o próprio tenant.
- **D03 — Leitura pública (vitrine/blog) via admin client (service_role) filtrando `status='published'` no código.** — 2026-06-26 — visitante é anônimo; RLS não libera. Em vez de abrir policy pública (mexer na segurança), lemos com service_role e filtramos publicado. A chave nunca vai ao browser (roda só no servidor).

### E-commerce

- **D04 — Checkout REAL, Mercado Pago primeiro.** — começa pelo gateway mais rápido/barato. Stripe/ACP entram depois.
- **D05 — Abstração de pagamento (`PaymentProvider`).** — trocar/somar gateway sem reescrever o checkout. MP é só o primeiro adapter.
- **D06 — Preço SEMPRE vem do banco no checkout.** — nunca confiar em preço vindo do cliente (segurança).
- **D07 — Dois modos de loja:** `checkout` (compra real) e `catalogo` (CTA vira WhatsApp). Escolhido no onboarding (Tela 1).

### Front / Esqueleto

- **D08 — Esqueleto fixo + skin por template.** — `SiteShell` compartilhado (loja + blog), controlado por paleta (vars CSS `--st-*`). Estrutura fixa (bom p/ SEO); visual troca por template.
- **D09 — Imagens: Sharp pré-WebP no upload + `<img>` puro. NÃO usar next/image.** — evita custo de otimização da Vercel. Melhoria futura = `srcset`, não trocar de abordagem.
- **D10 — Visual/náutico é do Claude Design.** — backend/estrutura é minha; cor/tipografia/layout é dele. Tokens CSS primeiro destravam tudo.
- **D27 — Ícones dos sites publicados = SVG inline (`Icon.tsx`, `currentColor`), NÃO fonte Phosphor.** — 2026-07-10 — nos sites de cliente cada ícone é SVG puro que herda a cor do contexto, sem carregar fonte de ícones (Core Web Vitals/SEO; renderiza no servidor, zero JS). Phosphor continua só no painel/editor. Regra: reutilizar `components/templates/shared/Icon.tsx` em todos os layouts, nunca soltar SVG avulso. Emojis de chrome dos 10 layouts já convertidos; pendências abertas (chips): `svc.icon` de serviço + remoção de código morto (`SiteCTA`/`SiteNav`/`SiteTemplate`).

### Conteúdo / SEO

- **D11 — SEO/GEO/AEO nativo:** JSON-LD (Product/Offer/FAQPage/AggregateRating/Article), conteúdo answer-first, feed de produto (JSONL) p/ Google Merchant/ChatGPT.

### Processo & Ferramentas

- **D12 — NÃO adotar Claude Flow nem swarm de código externo.** — risco no `~/.claude`. Incorporamos só o conceito de memória/board.
- **D13 — ponytail (ruleset) vendorizado** em `AGENTS.md` — padrão de código "senpapreguiçoso", mas sem preguiça em entendimento/validação/segurança/acessibilidade.
- **D14 — Portões humanos:** commit, push, deploy, migration_apply exigem OK do Cássio.
- **D15 — Skills de projeto vivem em `ANCOREO/.claude/skills/`** (versionadas no repo) — não em `%APPDATA%`, que o sync da Anthropic pode sobrescrever.

### Telemetria & Privacidade

- **D17 — Telemetria = tabela própria no Supabase (`analytics_events`), não PostHog.** — 2026-06-30 — custo zero, dados na nossa mão, sem operador externo nem transferência internacional → Termo/LGPD mais limpo.
- **D18 — Telemetria LGPD privacy-by-design:** pseudônima (session_id aleatório em cookie httpOnly), 1st-party, sem PII/IP/UA cru (só classe de device), opt-out via cookie `aco_no_track`. Base legal: legítimo interesse (métricas de produto agregadas). Banner de consentimento = cartão S04. Retenção sugerida 12 meses.
- **D19 — Telemetria nunca quebra a UX:** ingestão é best-effort (try/catch em tudo); allowlist de eventos na rota `/api/track` barra dado arbitrário.
- **D20 — Consentimento = transparência + opt-out (legítimo interesse), não opt-in bloqueante.** — 2026-06-30 — a pedido do Cássio ("quero telemetria dos usuários da plataforma"). Banner informa e oferece desativar; telemetria roda por padrão (dado pseudônimo de produto). Banner só no host do app, nunca em site publicado de cliente.

### Marca

- **D16 — Nome do projeto: ANCOREO** (era HARPIA/harp-ia). Banco já limpo; projeto da Vercel renomeado pra `ancoreo` e refs `harp-ia` no código ajustadas (2026-07-31). Falta só o que é externo: renomear o repo GitHub `HARP.IA` e o projeto no painel do Supabase.

### MVP, custos & IA (fase de fechamento)

- **D21 — E-commerce ENTRA no MVP.** — 2026-07-04 — decisão do Cássio, emenda a posição antiga ("checkout = pós-MVP"). Foco SEO/GEO/AEO segue soberano (a loja só vale se for a que mais aparece na busca). Consequência: **pagamentos agora são MVP** — loja do cliente (Connect + webhook assinado) + assinatura nossa.
- **D22 — IA custo-benefício, model-agnostic.** — 2026-07-04 — **Haiku 4.5 primário** (US$1/5), **Sonnet 4.6 backup/qualidade** (US$3/15). Trocar de modelo = 1 parâmetro; TODOS os agentes na MESMA skill/pipeline/parâmetros pra uniformidade absoluta. ⚠️ **Fable 5 é o MAIS caro** (US$10/50) — nunca em geração em massa. Alavancas: cache de prompt (-90% input cacheado) + batch (-50%). Custos detalhados em `CUSTOS-E-PLANOS.md`.
- **D23 — service_role key do Supabase ROTACIONADA.** — 2026-07-04 — feito pelo Cássio. O aviso "rotacionar antes de produção" está resolvido; o Claude não tem a key antiga e não deve procurá-la.
- **D24 — Front-end despriorizado até o MVP fechar.** — 2026-07-04 — a landing v2 (`app/page.tsx` + `app/landing.css` + imagens de farol em `public/img/`) fica parada como base de front futura. Não investir mais nela até o MVP estar ok.
- **D25 — Decidir "pago já vs beta grátis" só DEPOIS da auditoria de fluxo.** — 2026-07-04 — a escolha do modelo de lançamento (gate do billing, Q1) depende de saber se o fluxo cadastro→onboarding→gerar→publicar→loja funciona. Próxima ação = auditoria ponta-a-ponta (só leitura). Ver `ESTADO-MVP.md` §0.
- **D26 — Planos: 4 níveis (Inicial · Médio · Avançado · E-commerce).** — 2026-07-04 — Médio = **volume + alcance** (mais artigos + auto-blog semanal + Parcerias/backlinks + GBP completo). E-commerce = **taxa pequena por venda** (add-on ligável em qualquer plano). Métrica de valor = por site + volume de conteúdo/gerações de IA (alinha preço ao custo). **Valores NÃO definidos** — decisão final do Cássio depois de travar cotações e teto de IA por faixa. Esqueleto em `CUSTOS-E-PLANOS.md`.
