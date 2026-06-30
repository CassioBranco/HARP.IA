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

### Marca

- **D16 — Nome do projeto: ANCOREO** (era HARPIA/harp-ia). Banco já limpo; falta renomear projeto no painel Vercel + Supabase e ajustar refs `harp-ia.vercel.app` no código.
