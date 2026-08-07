# ANCOREO — Custos operacionais + estrutura de planos (rascunho estratégico)

> Criado 2026-07-04 a pedido do Cássio. Objetivo: mapear os custos reais de
> rodar o serviço pra depois precificar com margem. **VALORES DE PLANO NÃO
> definidos aqui** (decisão final do Cássio). Números de custo são ESTIMATIVAS
> com faixas — dependem de escala (nº de clientes) e da escolha de modelo de IA.
> Câmbio usado: ~R$5,80/US$ (ajustar). Verificar cotações exatas antes de fechar.

## 1. Custos — de onde sai o dinheiro

### 1a. Custo FIXO mensal (independe do nº de clientes) — fase inicial
| Item | O que é | Estimativa/mês |
|---|---|---|
| Vercel (Pro) | hospedagem do app Next.js + funções | US$20 base + uso → **R$120–260** |
| Supabase (Pro) | banco Postgres + auth + storage | US$25 → **R$145–210** |
| E-mail transacional (Resend/Postmark) | convites, avisos, recuperação de senha | US$0–20 → **R$0–120** |
| Claude Code (assinatura de dev) | construção + manutenção do serviço (você pediu incluir) | US$100–200 → **R$580–1.160** |
| Monitoramento/erros (Sentry etc.) | observabilidade | R$0–150 |
| Diversos (backups, domínio do app, ferramentas) | — | R$100–150 |
| **Subtotal fixo** | | **≈ R$1.000–1.800/mês** |

> O maior peso fixo é a **assinatura de desenvolvimento (Claude Code)** — é o
> "salário da fábrica". Ela some proporcionalmente conforme a base cresce.

### 1b. Custo VARIÁVEL por cliente ativo/mês
| Item | Observação | Estimativa |
|---|---|---|
| **IA de texto (Claude API)** — sites, blog, FAQ, posts do Google | **O MAIOR custo variável.** Escala com volume de conteúdo e depende MUITO do modelo (Fable/Haiku barato ↔ Opus caro) + cache de prompt | **R$30–90+** (cresce com nº de artigos/mês) |
| **Geração de imagem (Nano Banana/Higgsfield)** | ~2 créditos/imagem; um site usa ~8–15 imagens na montagem + algumas/mês | Setup ~R$15–40 + **R$5–15/mês** |
| Infra incremental (banda, linhas de banco, funções) | pequeno por cliente no começo | R$2–10 |
| Domínio (se incluso no plano) | .com.br ~R$40–60/ano | ~R$4–5/mês amortizado |
| **Subtotal variável/cliente** | dominado pela IA | **≈ R$40–120/mês** |

### 1c. Custo total conforme a base cresce (ilustrativo)
Fórmula: `fixo + (nº clientes × variável)`. Mostra por que preço baixo **dá prejuízo no começo**:

| Nº de clientes | Custo total/mês (aprox.) | Custo POR cliente |
|---|---|---|
| 10 | ~R$1.500 + 10×60 = **R$2.100** | **~R$210** |
| 50 | ~R$1.800 + 50×60 = **R$4.800** | **~R$96** |
| 100 | ~R$2.500 + 100×60 = **R$8.500** | **~R$85** |

> Conclusão: a **R$97**, só passamos a NÃO ter prejuízo lá pra ~50 clientes — e
> ainda sem margem, sem suporte humano, sem imposto. Repricing pra cima está
> certo. E a alavanca de custo é o **volume de conteúdo (IA)** → os planos DEVEM
> limitar volume por faixa (protege a margem automaticamente).

### 1d. Custos que NÃO são fixos nossos (ficam na receita/no cliente)
- **Taxa de gateway** (Stripe/MP): ~3–4% + fixo por transação — sai da receita, não é despesa fixa.
- **Loja do cliente**: no modelo Connect, o dinheiro da venda vai direto pro cliente; a taxa do gateway é dele. A NOSSA receita ali é a **taxinha por venda concluída** (ver plano E-commerce).
- **DataForSEO** (dados de keyword): pausado; só liga no plano avançado, custo por consulta.
- **Consultoria humana** (plano avançado): custo de HORA da equipe, não de infra.

## 1.5 — COTAÇÕES REAIS (pesquisadas 2026-07-04, câmbio ~R$5,80/US$)

### Infra fixa (preços de tabela confirmados)
| Serviço | Plano | Preço | Em R$ |
|---|---|---|---|
| Vercel | Pro | US$20/mês (1TB banda, +US$0,60/1M invocações, US$20 crédito incluso) | ~R$116 |
| Supabase | Pro | US$25/mês (8GB DB, 250GB egress, 100k MAU, US$10 compute incluso) | ~R$145 |
| Resend (e-mail) | Free→Pro | Free 3k/mês; Pro US$20 = 50k e-mails | R$0–116 |
| Claude Code (dev) | Max | ~US$100–200/mês | R$580–1.160 |
| Monitoramento + diversos | — | — | R$100–300 |
| **Fixo total (fase inicial)** | | | **≈ R$950–1.850/mês** |

### Preço da API de IA — por modelo (por 1M tokens)
| Modelo | Input | Output | Blended (~50/50) |
|---|---|---|---|
| **Haiku 4.5** | US$1 | US$5 | **US$3** ✅ mais barato |
| **Sonnet 4.6** | US$3 | US$15 | US$9 |
| **Opus 4.8** | US$5 | US$25 | US$15 |
| **Fable 5** | US$10 | US$50 | **US$30** ⚠️ o MAIS caro |

> ⚠️ **CORREÇÃO IMPORTANTE:** o **Fable 5 é o mais CARO** (US$10/50), o dobro do
> Opus 4.8. A ideia antiga de "Fable = barato" está errada pra custo. Pra
> geração de conteúdo em massa, o campeão de custo-benefício é o **Haiku 4.5**
> (US$1/5), com **Sonnet 4.6** como degrau de qualidade. Alavancas: **cache de
> prompt = -90% no input cacheado**; **batch = -50% em tudo**.

### Custo de IA por cliente/mês, por modelo (otimizado com cache/batch)
Estimativa de volume: Inicial ~0,5M tokens · Médio ~1,2M · Avançado ~3M+ (pipeline
multi-agente de artigo é o que mais consome).
| Tier | Haiku 4.5 | Sonnet 4.6 | Opus 4.8 |
|---|---|---|---|
| Inicial | **R$4–9** | R$13–26 | R$22–44 |
| Médio | **R$10–21** | R$31–63 | R$52–104 |
| Avançado | **R$26–52** | R$78–157 | R$130–261 |

> O modelo é uma alavanca de **~10x** (Haiku vs Opus). Por isso: **Haiku 4.5 como
> primário**, **Sonnet 4.6 como qualidade/backup**, TODOS na mesma skill,
> pipeline e parâmetros (uniformidade que o Cássio exigiu). Trocar de modelo =
> mudar um parâmetro; a arquitetura é model-agnostic.

### Imagem (Nano Banana Pro / Gemini 3 Pro Image — API direta)
US$0,039 (1K) · US$0,134 (2K) · US$0,24 (4K); batch = metade. Um site ~10 imagens
≈ **R$3–8 (uma vez)**. Barato. (Via Higgsfield são "2 créditos/imagem" — a API
direta do Google tende a sair mais barato; avaliar a troca.)

### Taxas de gateway (saem da RECEITA, não são custo fixo)
| Gateway | Cartão | Pix | Recorrência |
|---|---|---|---|
| **Stripe BR** | 3,99% + R$0,39 | 1,19% | +0,4% (Billing) |
| **Mercado Pago** (Checkout Pro) | 4,98% na hora / 3,98% D+30 | 0,99% | via preapproval |

> Nosso faturamento: **Stripe Billing** (recorrência sólida) OU **Pix Automático**
> (1,19%, bem mais barato que cartão). Loja do cliente: **MP/Stripe Connect** —
> a taxa é do cliente, não nossa.

## 2. Protocolos de precificação mais usados (base do mercado)
Padrões consolidados em SaaS/site builders (Wix, Squarespace, Shopify, Framer, Webflow, HubSpot):
1. **Good-Better-Best (3 níveis)** + âncora no do meio ("Mais popular") — já fazemos. Somar um de e-commerce.
2. **Métrica de valor** (o que se cobra "por"): pra builder = **por site + volume de conteúdo/gerações de IA**. Alinha preço ao nosso custo real.
3. **Trial/freemium**: 7 dias grátis (já temos). Sem cartão pra reduzir atrito.
4. **Teto de uso + add-ons/overage** pra IA — protege margem (padrão dos SaaS de IA: "X gerações/mês", extra é add-on).
5. **Desconto anual** (~20%) — o mockup já prevê ("Anual economize 20%").
6. **E-commerce**: modelo Shopify/Wix — mensalidade menor + **taxa por venda** nos planos baixos, taxa cai/zera nos altos.
7. **Topo "Fale com vendas"** (agency/enterprise) — preço sob consulta.

## 3. Estrutura de planos (4 níveis) — sem preço, só o esqueleto

### 🟢 Inicial ("Estar na internet")
Foco: o pequeno negócio que só quer existir no Google/IAs.
- **1 site** (subdomínio grátis ou domínio próprio)
- Editor visual completo
- **Poucos artigos de blog/mês** (ex.: 2–4) — teto de IA baixo
- SEO/GEO/AEO base + score
- Presença local básica (checklist do Google)
- Suporte por e-mail

### 🔵 Médio ("Crescer com o site") — 3 opções de separação (escolher)
Ideia central: Inicial = *ter* o site; Médio = *fazer o site trabalhar*. Separo por 3 eixos que mapeiam um negócio em crescimento E os nossos custos:
- **Opção A (volume):** 1 site, **mais artigos/mês** (ex.: 8–12) + **auto-blog semanal ligado** + relatórios de presença. Simples de explicar.
- **Opção B (alcance):** tudo da A + **Parcerias** (triangulação de backlinks) + ferramentas completas de Google Perfil (GBP). É o "crescer aparecendo em mais lugares".
- **Opção C (escala leve):** **2 sites** + volume médio + presença completa — pro cliente com 2 negócios/marcas.
> Recomendo **A + B juntas** como o "Médio" (volume + alcance), deixando "mais sites" só pro Avançado. É a separação mais limpa: Inicial existe, Médio cresce, Avançado domina.

### 🟣 Avançado ("Autoridade / Agência")
Foco: quem quer dominar o nicho, ou agência gerenciando vários clientes.
- Tudo do Médio, com **teto de conteúdo alto/ilimitado**
- **Consultoria humana com a equipe**: branding + SEO/AEO/GEO (calls periódicas)
- **Múltiplos sites / white-label / painel de clientes** (agência)
- API + suporte prioritário
- Done-for-you: conteúdo estratégico feito com a gente
- (Outros benefícios a definir — ex.: DataForSEO liberado, auditorias trimestrais)

### 🟠 E-commerce (add-on OU tier próprio)
Foco: quem vende online.
- Loja (produtos, carrinho, checkout via **gateway conectado do próprio cliente** — Connect)
- **Taxa pequena por venda concluída** (modelo Shopify): mensalidade menor + fee por transação; **o fee cai/zera** conforme sobe de plano
- Recomendo: **add-on ligável em qualquer plano** (mais flexível que tier isolado) + a taxa por venda como nossa receita variável alinhada ao sucesso do cliente

## 4. Próximos passos
1. Cássio escolhe a separação do **Médio** (recomendo A+B).
2. Fechar **cotações exatas** dos fornecedores (Vercel/Supabase/Anthropic/Higgsfield/e-mail) pra travar o custo real por cliente.
3. Definir **teto de IA por faixa** (nº de artigos/gerações) — é o que protege a margem.
4. Só então: **precificar** cada plano (custo × margem-alvo).
5. Amarrar no checkout: aceite de contrato + regras de recorrência/cancelamento (ver doc de gateways).
