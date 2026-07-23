# ANCOREO — Roadmap Vivo (remodelado 2026-07-18)

> Substitui a seção 12 do CLAUDE.md (agora histórica). Dono: Product Owner.
> Regra de leitura: fase atual em detalhe, fases futuras em traço grosso.
> Filtro de tudo: **"isso ajuda o site do assinante a aparecer no Google/numa
> LLM?"** (NORTH-STAR). Gates de sempre: D14 (commit/push/deploy/migration só
> com OK do Cássio) + `tsc` verde + editor testado NO NAVEGADOR antes de shipar.

**Onde estamos:** beta no ar (`ancoreo.com.br`), login self-serve funcionando,
editor 2 painéis em produção, telemetria coletando, e-commerce E1/E2 codado,
uma fila de trabalho pronto AGUARDANDO deploy/migrations (gate).

---

## FASE 0 — Sincronizar e estabilizar (AGORA → ~1 semana)
*Objetivo: zerar a dívida entre "codado" e "no ar". Nada novo entra antes disso.*

| # | Item | Depende de |
|---|---|---|
| 0.1 | **Auditoria ponta-a-ponta** (cadastro → onboarding → gerar → editar → publicar → loja), só leitura, relatório fato-a-fato | Claude |
| 0.2 | Aplicar as **7 migrations escritas** (blog_faq, partner_backlinks, booking, leads, social_links, internal_links_triangulation, blog_cover_scheduling) | 🔑 OK Cássio |
| 0.3 | Deploy da fila noturna NV1–NV6 (parcerias, presença local, sanitizador, e-mail dormente) | 🔑 OK Cássio |
| 0.4 | Migration do prompt de sistema ("testimonials: 3 fictícios" → factual) — mata a contradição anti-fabricação | 🔑 OK Cássio |
| 0.5 | Legal: CNPJ/razão social em /termos e /privacidade + deploy do banner de consentimento (S03/S04, código pronto) | 🔑 Cássio (dados) |
| 0.6 | Conferir/refazer a **junction da memória** (`Desktop` → `Documents\ancoreo\memoria`) | Cássio (2 min) |
| 0.7 | Limpar dados de QA (tenant `qa-dentista@harpia.test`) — B11 | Claude |

**Critério de saída:** tudo que está "pronto local" está em produção; auditoria
diz com fato o que funciona e o que quebra.

---

## FASE 1 — Fechar o MVP (e-commerce de verdade) (~2-3 semanas)
*Objetivo: a promessa completa do MVP (D21): site + blog + GBP + score + LOJA
que processa venda real. Sem billing nosso ainda (beta grátis).*

| # | Item | Depende de |
|---|---|---|
| 1.1 | `MERCADOPAGO_ACCESS_TOKEN` + `MERCADOPAGO_WEBHOOK_SECRET` na Vercel | 🔑 Cássio/Dove (conta MP) |
| 1.2 | MP **Connect** (dinheiro da venda vai direto pro cliente) + validar assinatura no webhook de checkout | Claude, após 1.1 |
| 1.3 | Painel do dono: **gestão de produtos (UI)** — B04 | Claude (wireframe → Fase 2) |
| 1.4 | Painel do dono: **lista de pedidos (UI)** — B05 | Claude (wireframe → Fase 2) |
| 1.5 | `RESEND_API_KEY` + domínio verificado → liga e-mails transacionais (lead, pedido, agendamento) | 🔑 Cássio |
| 1.6 | Teste de compra real de ponta a ponta (produto → checkout → webhook → pedido no painel → e-mail) | Claude + Cássio |

**Critério de saída:** um cliente beta consegue vender um produto e ver o
pedido, sem intervenção nossa.

---

## FASE 2 — UX do Site Builder (wireframe primeiro, estilo depois) (paralela à F1)
*Princípio do Cássio (2026-07-09): régua = funciona e é organizado; beleza vem
depois. Prioridade definida em 2026-07-18: wireframe do builder → depois
templates.*

| # | Item | Nota |
|---|---|---|
| 2.1 | **Wireframe completo do site builder** (fluxo: onboarding → geração → editor 2 painéis → publicar; inclui telas de loja 1.3/1.4) | próximo trabalho de design — Figma/Lovable |
| 2.2 | Preview do editor sem reload a cada edição — B02 | perf percebida |
| 2.3 | Onboarding: revisar os 6 steps contra o wireframe (fricção, telemetria de abandono já coleta) | dados da F0.1 |
| 2.4 | **Repaginada dos templates** (10 layouts) — B10 | SÓ depois do wireframe aprovado |
| 2.5 | Thumbnails estáticos no seletor de template — B03 | depois da 2.4 |
| 2.6 | Estilo/beleza do painel (fase ESTILO: uiverse.io + Phosphor) + landing v2 retomada (D24 revoga quando MVP fechar) | última da fase |

**Critério de saída:** fluxo assinante inteiro navegável num wireframe aprovado
pelo Cássio; editor e painel reconstruídos sobre ele sem regressão (teste no
navegador, lição do hotfix de 10/07).

---

## FASE 3 — Beta com clientes reais (1-2 semanas de duração)
*2-5 clientes NOVOS (não existentes), grátis, teto 10. Funil: palestra do Dove.*

- Recrutar na palestra (demo ao vivo) · onboarding assistido dos primeiros 2
- Ler telemetria de funil (abandono por step) + corrigir o que travar
- 1 cliente com loja ativa processando venda real
- Colher depoimentos + primeiro caso de citabilidade (site aparecendo em IA)

**Critério de saída:** 2+ sites publicados por clientes reais sem ajuda; lista
de bugs zerada ou triada; decisão de preço final tomada (05-PLANOS-PRECOS).

---

## FASE 4 — Lançamento pago
*Só entra quando a F3 validar o fluxo. Preços: `05-PLANOS-PRECOS.md`.*

- Billing da NOSSA assinatura: **Stripe Billing** (recorrência sólida) ou **Pix Automático** (1,19%) — decidir na entrada da fase
- Enforcement de quotas por plano (`plan_quotas`/`tenant_usage` já existem no schema)
- Página de pricing pública (4 níveis + add-on e-commerce + anual -20%)
- Trial 7 dias (Médio completo, cartão Day 6) + política de inadimplência
- Migração dos betas pra planos (grandfather/desconto de fundador — decidir)

---

## FASE 5 — Pós-MVP estratégico (ordem por impacto no North Star)

1. **Relatório de citabilidade** (KPI GEO: "seu site apareceu em resposta de IA") — o diferencial do pitch ⚠️ confirmar promessa com Dove
2. **Feed pro ChatGPT Shopping / Google Merchant** — B08 (a loja que aparece na busca generativa)
3. **+6 nichos regulados** (advocacia, psicologia, odonto, fisio, vet, contabilidade) — migration do CHECK + prompts de nicho + restrições de conselho (docs/NICHOS.md) — nichos que MAIS dependem de orgânico
4. **Reviews + AggregateRating** — B07 (prova social estruturada = GEO)
5. **Auto-blog semanal** ligado por padrão no Médio (motor de recorrência de conteúdo)
6. **Multilíngue** (Avançado) + **white-label/modo agência**
7. Variações de produto (tamanho/cor) — B06 · Adapter Stripe/ACP — B09
8. `srcset` no pipeline Sharp — B01 · DataForSEO no Avançado
9. **Escala de infra**: migrar sites pra Cloudflare (for SaaS) + R2 quando o custo Vercel justificar (decisão jun/2026 já validada — é "quando", não "se")

---

## O que NÃO entra (guard-rail)
- Tráfego pago, nunca (NORTH-STAR)
- Gestão de estoque avançada, frete, marketplace (fora do escopo de loja)
- Qualquer feature que não passe no filtro "aparece na busca?"

> Histórico de fases concluídas: ver `01-BACKLOG.md` (FEITO) e git log.
> Atualizar este doc a cada virada de fase; mudanças de rota = D## novo em `03-DECISOES.md`.
