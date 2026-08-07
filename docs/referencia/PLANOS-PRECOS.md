# ANCOREO — Planos e Preços (PROPOSTA para decisão)

> Criado 2026-07-18 a pedido do Cássio. Consolida D26 (4 níveis) + os custos
> reais de `CUSTOS-E-PLANOS.md` numa proposta fechada de preço.
> **STATUS: PROPOSTA.** Valores finais = decisão do Cássio/Dove. Quando aprovar,
> registrar em `03-DECISOES.md` e este doc vira fonte da verdade de planos.
> Premissas: Haiku 4.5 primário (D22), câmbio ~R$5,80/US$, cache de prompt ligado.

---

## 1. O raciocínio (por que estes números)

O custo tem duas partes (detalhe em `CUSTOS-E-PLANOS.md`):
- **Fixo:** ≈ R$950–1.850/mês (Vercel Pro + Supabase Pro + Claude Code dev + monitoramento). Não depende de clientes.
- **Variável por cliente:** dominado pela IA de texto. Com Haiku 4.5 + cache:
  - Inicial ≈ **R$15–30/mês** (IA R$4–9 + imagens + infra incremental + domínio amortizado)
  - Médio ≈ **R$25–45/mês** (IA R$10–21 + volume maior de conteúdo)
  - Avançado ≈ **R$45–80/mês** de infra/IA **+ horas humanas de consultoria** (custo real: hora da equipe)

Regras de precificação que a proposta segue:
1. **Margem bruta alvo de SaaS: 70–85%** sobre o custo variável.
2. **O preço cobre o variável com folga desde o cliente nº 1**; o fixo se dilui com a base.
3. **A quota de conteúdo por plano é a proteção de margem** (IA é o custo que escala).
4. Good-Better-Best com âncora no Médio ("Mais popular").
5. E-commerce como **add-on ligável em qualquer plano** + taxa por venda (modelo Shopify) — receita alinhada ao sucesso do cliente.

---

## 1.5 BENCHMARK DE MERCADO (pesquisado 2026-07-18) — por que dá pra cobrar MAIS

O ANCOREO **não compete com builder** (NORTH-STAR) — ele substitui o pacote
site + conteúdo + SEO local + GBP que hoje só existe como SERVIÇO:

| Alternativa do cliente | Preço/mês (2026) | Entrega |
|---|---|---|
| Wix Core/Business | US$36–46 (~R$210–270) | só o site, zero SEO feito, zero conteúdo |
| Builders IA (Durable, 10Web, Framer) | US$10–25 (~R$60–150) | site por IA, SEO fraco, nada local-Brasil |
| **Freelancer SEO local** | **R$500–1.500** | otimização mensal, SEM site |
| **Consultor especialista** | **R$2.000–8.000** | SEO pra PME |
| **Agência SEO** | **R$3.000–15.000** | serviço completo |
| Artigo avulso (freelancer) | R$150–500 **por artigo** | um texto |

O Médio entrega o equivalente a **R$1.500–3.000/mês** de mercado. Precificar na
régua do Wix era erro de âncora: preço baixo demais sinaliza produto genérico
pra quem já cotou agência. Teto prático: o público é PME de palco, sensível a
preço — acima de ~R$300 no plano âncora a conversão self-serve sofre.
**Estratégia:** lançar nos valores REVISADOS abaixo + **desconto de fundador**
pros betas (preço antigo vitalício = urgência na palestra). Subir depois é
traumático; baixar é fácil.

---

## 2. A PROPOSTA — 4 níveis (REVISADA 2026-07-18 pós-benchmark)

| | 🟢 **Inicial** | 🔵 **Médio** ⭐ mais popular | 🟣 **Avançado** | 🟠 **E-commerce** (add-on) |
|---|---|---|---|---|
| **Preço proposto** | **R$147/mês** | **R$297/mês** | **R$697/mês** | **+R$69/mês + 1,5% por venda** |
| (proposta conservadora anterior) | R$97 | R$197 | R$497 | +R$49 + 1,5% |
| Âncora de valor no pitch | "menos que 1 artigo de freelancer" | "10% do preço de uma agência, 24h no ar" | "metade de um freelancer, com consultoria humana" | "fração do Shopify + apps" |
| Anual (-20%) | ~R$118/mês | ~R$238/mês | ~R$558/mês | fee anual não muda |
| Promessa | "Estar na internet" | "Fazer o site trabalhar" | "Dominar o nicho" | "Vender online aparecendo na busca" |
| Sites | 1 | 1 | 3 (+R$97/site extra) | — (herda do plano) |
| Artigos de blog IA/mês | 4 | 12 + **auto-blog semanal** | 30 (fair use) | — |
| Posts GBP/mês | 15 | ilimitado | ilimitado | — |
| Score SEO/GEO/AEO | básico | completo | completo + auditoria semanal | Product/Offer no score |
| Parcerias (anel de backlinks) | ❌ | ✅ | ✅ prioridade nos anéis | — |
| GBP (Google Perfil) | checklist básico | completo (posts + reviews IA) | completo | — |
| Consultoria humana | ❌ | ❌ | **1 call/trimestre** (SEO/GEO/branding) | — |
| Multilíngue | ❌ | ❌ | ✅ (5 traduções/mês) | — |
| White-label / painel de clientes | ❌ | ❌ | ✅ (modo agência) | — |
| Loja (produtos + checkout MP) | modo `catalogo` só | modo `catalogo` só | modo `catalogo` só | **checkout real** (Connect) |
| Taxa por venda | — | — | — | 1,5% (cai pra **0,5%** no Avançado) |
| Hard cap diário (anti-abuso) | 5 | 15 | 50 | — |
| Suporte | e-mail | e-mail prioritário | WhatsApp + prioridade máxima | — |

**Médio = Opção A + B juntas** (volume + alcance), como recomendado no
`CUSTOS-E-PLANOS.md` §3: Inicial *existe*, Médio *cresce*, Avançado *domina*.

### Por que R$697 no Avançado (e não R$297)
O Avançado carrega **horas humanas** (consultoria trimestral) + multilíngue + 3
sites — e o benchmark mostra que o comprador desse nível compara com freelancer
(R$500–1.500) e consultor (R$2.000+), não com builder. R$697 fica abaixo do
piso do freelancer ENTREGANDO mais, paga a hora da equipe e mantém ~79% de
margem. Agência grande (5+ sites) = "fale com a gente", preço sob consulta.

### Trial
7 dias grátis com o **Médio completo**, sem cartão no signup (cartão no Day 6) —
mantém a mecânica da palestra. Sem cartão no Day 7 → modo leitura 30 dias.

---

## 3. Prova de margem (sanidade dos números)

Custo variável vs preço (pior caso do custo):

| Plano | Preço | Custo variável (teto) | Margem bruta/cliente | % |
|---|---|---|---|---|
| Inicial | R$147 | R$30 | R$117 | 80% |
| Médio | R$297 | R$45 | R$252 | 85% |
| Avançado | R$697 | R$80 + ~R$65/mês de hora amortizada | R$552 | 79% |

**Break-even do fixo** (R$1.400/mês médio): ~6 clientes no Médio, ou mix
60/30/10 ≈ **7 clientes**. Cenário 50 clientes (mix 60/30/10): receita ≈
R$13.055/mês · custo total ≈ R$3.450 · **lucro ≈ R$9.600 (~74% líquida antes
de imposto)**. A alavanca continua sendo volume de IA — por isso as quotas.
**Desconto de fundador:** betas travam o preço conservador (R$97/197/497)
vitalício — custa ~R$100/mês por beta e vira urgência real na palestra.

---

## 4. O que falta pra travar (checklist de decisão do Cássio/Dove)

- [ ] Aprovar/ajustar os 4 preços — **revisados** (147/297/697) vs conservadores (97/197/497); benchmark em §1.5 sustenta os revisados
- [ ] Aprovar o **desconto de fundador** pros betas (preço conservador vitalício)
- [ ] Confirmar Médio = A+B (volume + alcance)
- [ ] Confirmar taxa do add-on E-commerce (1,5% / 0,5%) e o fee mensal
- [ ] Definir "fale com a gente" pra agência (a partir de quantos sites?)
- [ ] Travar cotações finais (Vercel/Supabase/Anthropic/imagem) — `CUSTOS-E-PLANOS.md` §1.5
- [ ] Registrar decisão final em `03-DECISOES.md` (D28) e atualizar CLAUDE.md §3
- [ ] Beta continua **GRÁTIS** (teto 10 clientes) até o billing existir — os preços acima entram junto com o billing (Fase 3 do `04-ROADMAP.md`)
