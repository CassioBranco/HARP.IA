# ANCOREO — Sprint Atual

> **Meta da sprint:** projeto pronto para produção (rename + telemetria + base legal LGPD).
> **Janela:** 2026-06-30 → 2026-07-10 (deadline do Cássio).
> Dono: Scrum Master. Recorte focado do `01-BACKLOG.md`.

---

## 🎯 Cartões da sprint (em ordem de prioridade)

### S01 — Finalizar rename ANCOREO · 👀 EM REVISÃO (falta deploy)
- [x] Banco varrido — limpo (só sobrou tenant de QA, inofensivo)
- [x] Cássio: renomeou projeto no painel **Vercel** (`ancoreo`)
- [x] Backend: fallbacks `harp-ia.vercel.app` → `ancoreo.com.br` (sitemap, robots, mercadopago)
- [x] Backend: middleware reconhece `ancoreo.com.br` + `www` como app (fallback de segurança se env faltar)
- [ ] Cássio: renomear projeto no painel **Supabase** (cosmético, não urgente)
- [ ] 🚫 Cássio: commit + deploy pra subir as mudanças
- **Cargo:** Backend ✓ · `tsc` verde

### S05 — Integração do domínio `ancoreo.com.br` · 🔨 EM ANDAMENTO
- [x] Projeto renomeado + domínio adicionado no Vercel (apex + www)
- [x] Middleware trata domínio raiz como app (não como site de cliente)
- [ ] 🚫 Cássio: criar DNS no Registro.br — A `@`→`216.198.79.1`, CNAME `www`→`1252b615ed3ea839.vercel-dns-017.com.`
- [ ] 🚫 Cássio: setar env **`NEXT_PUBLIC_APP_URL=https://ancoreo.com.br`** no Vercel (Production) + redeploy
- [ ] Vercel valida DNS → HTTPS automático → "Valid Configuration" verde
- **Cargo:** Backend ✓ (código) · resto são portões do Cássio
- **📍 ESTADO (2026-06-30):** Registro.br em **transição (~2h)** — zona DNS ainda não aceita registros; aguardar e voltar no MODO AVANÇADO. Deploy conjunto (migration `analytics_events` + commit + middleware/rename) **adiado a pedido do Cássio** ("mais tarde fazemos isso"). Retomar por aqui.

### S02 — Telemetria de funil (LGPD-safe) · 👀 EM REVISÃO (código pronto; falta aplicar migration + deploy)
- [x] Decisão da ferramenta: **tabela própria** (D17)
- [x] Migration `analytics_events` escrita (RLS, sem PII) — `supabase/migrations/20260630120000_analytics_events.sql`
- [x] Rota `/api/track` (allowlist, session_id httpOnly, tenant best-effort, opt-out) + lib `lib/analytics/`
- [x] Eventos fiados no funil: onboarding (start, step_view, goal, loja_modo, generate_block, generate_click) + template_choose + site_created
- [x] `tsc` verde
- [ ] 🚫 Cássio: **OK pra aplicar a migration** no banco (D14)
- [ ] 🚫 Cássio: OK pra commit + deploy
- **Eventos capturados** permitem ver: por onde abandonam, em que tela travam, % que gera, objetivo/modo/template escolhidos. Abandono = sessão com maior step < 7.
- **Cargo:** Backend ✓ → QA/Deploy (aguarda portões humanos)

### S03 — Termo de Uso + Política de Privacidade · 🎯 SPRINT
- Termo de Uso da plataforma + Política de Privacidade (LGPD: bases legais, direitos do titular, retenção, contato DPO).
- Páginas públicas + aceite no cadastro.
- **Cargo:** Backend (estrutura) · revisão de conteúdo com Cássio

### S04 — Consentimento (cookies + telemetria) · 🎯 SPRINT
- Banner de consentimento; telemetria só dispara após opt-in (ou base legal de legítimo interesse documentada).
- **Cargo:** Backend/Front

---

## 🔓 Decisões pendentes desta sprint (a alinhar com Cássio)

1. ~~Ferramenta de telemetria~~ → resolvido: tabela própria (D17).
2. **Consentimento (S04):** opt-in explícito vs legítimo interesse para métricas anônimas de produto.

---

## 📌 Próxima ação do Scrum Master
S02 está em revisão (código pronto, `tsc` verde). Aguarda 2 portões humanos: **OK pra aplicar a migration** e **OK pra commit/deploy**. Em paralelo, próximo cartão codável sem bloqueio = **S03 (Termo de Uso + Política de Privacidade)**.
