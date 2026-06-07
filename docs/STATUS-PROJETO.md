# HARPIA — Status do Projeto

> Atualizado: 2026-06-07 | Branch: master | Deploy: harp-ia.vercel.app

---

## RESUMO EXECUTIVO

HARPIA é uma plataforma SaaS brasileira que gera sites com SEO+GEO+AEO para PMEs locais.
Stack: Next.js 14 (App Router) + Supabase + Claude API (Sonnet) + Stripe + Vercel.
Design: esmeralda (`--primary: 160 84% 30%`) + dourado (`--accent: 38 92% 50%`).
Metodologia de conteúdo: Método CPF (C=Conhecimento, P=Posicionamento, F=Faturamento).

---

## ✅ CONCLUÍDO

### S1 — Infraestrutura (fechado 2026-06-04)
- Next.js 14 App Router + Supabase + RLS + Stripe (sandbox)
- Tabelas: `profiles`, `onboarding_profiles`, `sites`, `subscriptions`, `blog_posts`
- Auth: signup, login, callback, confirme-email
- Edge functions: generate-site, publish-site
- Deploy Vercel configurado

### S2 — Onboarding Typeform-style (fechado 2026-06-07)
- **13 telas** — 1 pergunta por tela, auto-avança em cards
- **Categorias + Nichos** — 7 categorias × 28 nichos (2 cliques)
- **Localização** — raio máx 30km, 2ª cidade opcional, hint upgrade estadual
- **TagInput** — keywords via Enter/vírgula, Backspace remove última tag
- **SEO meter** — tela "Seu conhecimento vale ouro" com score em tempo real (5 sinais)
- **CPFMini** — barras de sinal C/P/F no header, score total visível
- **Auto-save** — localStorage por tela + Supabase debounce 1.5s
- **Design tokens** — HARPIA esmeralda+dourado aplicado em globals.css
- **Redirect** — signup → /onboarding → /templates (limpa localStorage ao finalizar)

### Páginas existentes
| Rota | Status | Nota |
|------|--------|------|
| `/` | ✅ | Landing completa (Hero, Como Funciona, 3 Pilares, Planos, CTA) |
| `/signup` | ✅ | Redirect para /onboarding após cadastro |
| `/login` | ✅ | - |
| `/confirme-email` | ✅ | - |
| `/onboarding` | ✅ | 13 telas Typeform-style |
| `/templates` | ✅ | Picker com 14 nichos × 3 paletas (iframe preview) |
| `/dashboard` | ✅ Layout | Sidebar + rotas internas scaffolded |

---

## ⏳ PENDENTE — PRÓXIMO SPRINT (S3)

### Alta prioridade
- [ ] **Templates reais em Tailwind** — substituir mockups do iframe por componentes reais
  - Cada template = landing page SEO-first com AEO (FAQ ≥6, JSON-LD, H2 autossuficiente)
  - Começar pelo nicho com mais demanda: `saude/clinica`
- [ ] **Generate-site** — ligar edge function ao onboarding_profiles, chamar Claude API (Sonnet) com dados CPF
- [ ] **Publicar site** — DNS via Vercel API ou subdomínio .harp-ia.site

### Média prioridade
- [ ] **GBP OAuth** — integrar Google Business Profile para importar dados
- [ ] **Blog editor** — WYSIWYG + pipeline dove-blog
- [ ] **Dashboard Meus Sites** — cards com preview, publicação, edição

### Baixa prioridade / futura
- [ ] **Mobile preview bug** — iframe do templates não escala bem em mobile
- [ ] **Paletas por nicho** — CSS vars diferentes por categoria no picker
- [ ] **Planos estadual/nacional** — desbloquear coverage multi-cidade em planos pagos
- [ ] **E-commerce** — feature futura, não descartada

---

## ⚠️ AVISOS CRÍTICOS

### Segurança
- A `service_role` key do Supabase foi exposta no chat da sessão 2026-05-xx
- **ROTACIONAR ANTES DE IR A PRODUÇÃO** — Supabase Dashboard → Settings → API → Reset service_role

### Banco de dados
- Campo `expertise` do onboarding → salvo como `cases TEXT` (sem migração necessária)
- Campo `city2` + `state2` → salvo como `coverage_areas TEXT[]`
- `completeness_score` (0-100) calculado pelo calcCPF e salvo em cada update

---

## ARQUITETURA CPF

```
C — Conhecimento (quem você é)     = business_name + niche + city + years + credentials
P — Posicionamento (por que você)  = differentials + target_audience + pain_points + expertise
F — Faturamento (o que você vende) = services + keywords_primary + tone + gbp_connected
```

Score ≥ 70% desbloqueia o botão "Gerar meu site".

---

## DESIGN TOKENS

```css
--primary: 160 84% 30%;    /* esmeralda */
--accent:  38 92% 50%;     /* dourado */
--background: 150 30% 99%; /* quase branco com toque verde */
--font-heading: Plus Jakarta Sans (600, 700)
--font-body: Inter
```

Fonte da verdade: `design/paletas/_platform.css`

---

## RETOMADA — PRÓXIMA SESSÃO

Ler este arquivo + `CLAUDE.md` raiz. Decidir qual template construir primeiro.

Ordem sugerida de build (por volume de buscas BR):
1. `saude/clinica` — maior busca local, base para todos os outros
2. `beleza/salao` — alta demanda, menor concorrência de templates
3. `juridico/advocacia` — ticket médio alto, justifica SEO premium
