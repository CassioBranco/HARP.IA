# NORTH STAR — Projeto HARPIA
> **Documento imutável.** Não reabrir, não relativizar, não diluir.
> Toda decisão de produto, arquitetura, prompt e código serve a este foco. Se uma feature não serve a isto, ela não entra.
> Última revisão do princípio: 2026-06-02

---

## O FOCO ÚNICO (a frase que governa tudo)

**Fazer o site de cada assinante ser a resposta que o Google e as LLMs entregam quando o cliente potencial busca algo relacionado ao negócio do assinante.**

Quando alguém — em qualquer canal de busca — procura o que o assinante vende, o site do assinante tem que estar lá. Cercando a intenção. Antes do concorrente.

---

## O QUE ISSO SIGNIFICA NA PRÁTICA

O cliente potencial busca de muitas formas. O site do assinante precisa aparecer em todas:

| Onde o cliente busca | Exemplo real | Pilar | O que o HARPIA garante |
|----------------------|--------------|-------|------------------------|
| **Google — busca local** | "onde trocar pneu perto de mim" | SEO local | Cidade-base + raio de atuação + LocalBusiness schema |
| **Google — informacional** | "quais as melhores plantas pra jardim com sol" | SEO/AEO | Blog com FAQ + Article schema, resposta direta no topo |
| **Google — transacional** | "agendar dentista sorocaba" | SEO | Página transacional, CTA dominante, schema Service |
| **ChatGPT / Gemini / Perplexity** | "qual a melhor borracharia em Sorocaba?" | GEO | Conteúdo citável por motor generativo, autoridade de marca |
| **Google AI Overviews / SGE** | resumo gerado pela IA do Google | GEO/AEO | Conteúdo estruturado pra ser extraído e citado |
| **Busca por voz** | "ok Google, jardineiro perto de mim" | AEO | Resposta direta extraível + schema + GBP conectado |

O assinante não precisa entender nada disso. O HARPIA faz por ele, automaticamente, em todo conteúdo gerado.

---

## OS 3 PILARES TÉCNICOS (a tríade inegociável)

> Definição exata dos termos — não confundir:
> - **SEO** = Search Engine Optimization → busca tradicional (Google)
> - **GEO** = **Generative Engine Optimization** → ser citado nas respostas de IAs generativas (ChatGPT, Gemini, Perplexity, AI Overviews)
> - **AEO** = Answer Engine Optimization → ser a resposta direta extraída (featured snippet, busca por voz, answer box)
> - **Busca local** (cidade-base + raio de atuação) é feature transversal do SEO local — não é "o GEO".

### SEO — ser encontrado pelo Google (busca tradicional)
- Keyword principal nos primeiros 100 caracteres
- Estrutura semântica de headings (H1 único, H2 temáticos)
- Meta description, slug amigável, sitemap, robots
- Core Web Vitals > 90 (site rápido ranqueia mais)
- Schema JSON-LD correto por tipo de página
- **SEO local**: cidade-base + raio de atuação + bairros/cidades cobertos, LocalBusiness schema, NAP consistente, GBP conectado

### GEO — ser citado pelos motores generativos (ChatGPT, Gemini, Perplexity)
- Conteúdo citável: factual, estruturado, com afirmações verificáveis que a IA reaproveita
- Autoridade de marca: nome do negócio em contexto real, consistência em texto público indexado
- Dados estruturados que o motor generativo consegue parsear e atribuir
- Score de citabilidade visível ao assinante (mede o quanto o conteúdo é citado por IA)
- KPI central: aparecer NA resposta generativa, não só rankear (CTR em AI Overview é ~1%)

### AEO — ser a resposta direta extraída (snippet, voz)
- Resposta direta na primeira frase (a IA extrai o trecho mais objetivo)
- Cada bloco H2 autossuficiente, citável isolado
- FAQPage schema (≥6 perguntas) em todo conteúdo de blog
- Linguagem clara, factual, sem floreio (motor de resposta prefere objetividade)

---

## A METÁFORA OPERACIONAL: CERCAR

Não é "ter um site". É **cercar a intenção de busca do cliente potencial**.

O cliente do assinante busca de 10 jeitos diferentes, em 5 plataformas diferentes, em 3 momentos diferentes da decisão (informacional → comercial → transacional). O HARPIA cobre todos esses pontos com:
- Páginas do site cobrindo intents transacionais e navegacionais
- Artigos de blog cobrindo intents informacionais e comerciais
- Posts de GBP cobrindo a busca local imediata
- Tudo estruturado pra ser extraído por IA

Quando o cliente busca, em qualquer ponto desse cerco, o assinante está lá.

---

## O FLUXO DO CLIENTE MUDOU (por que a tríade virou sobrevivência)

```
ANTES:  usuário → busca → site → compra
AGORA:  usuário → agente de IA → múltiplas buscas → site (intenção já qualificada) → compra
```

O agente de IA filtra **antes** do humano chegar. Se o site do assinante não aparece nas buscas que o agente faz, o lead nunca chega ao assinante. Isso transforma velocidade (Core Web Vitals > 90), HTML semântico server-rendered, schema e canonical de "boa prática" em **condição de sobrevivência**. O site precisa ser legível pra máquina, não só pra humano.

## O LIMITE HONESTO (o que o software faz e o que não faz)

A plataforma resolve a **metade técnica** de aparecer nas LLMs: site indexável e rápido, schema com nome consistente, GBP consistente, conteúdo que cita o negócio em contexto real. A **outra metade** — tornar a marca conhecida o suficiente pra LLM não tratá-la como string genérica — é presença externa (PR digital, menções, diretórios). Isso software não faz sozinho. É **serviço adicional do Dove** (upsell), não promessa do produto. Não vender o que o software sozinho não entrega.

## O KPI MUDOU (o que medimos pro cliente)

CTR dentro do AI Overview é ~1%. O objetivo não é mais "rankear no Google pra receber clique imediato". É **ser citado na resposta da IA** pra construir autoridade de marca — o clique vem depois, via busca direta pelo nome. O painel do cliente reporta **citabilidade** (apareceu em resposta de IA?) e autoridade de marca, não só posição no Google.
> ⚠️ Direção de produto registrada — confirmar com Anderson Dove antes de virar promessa oficial do pitch comercial.

## COMO ISSO FILTRA DECISÕES (teste de toda feature)

Antes de construir qualquer coisa, perguntar:

> **"Isso ajuda o site do assinante a aparecer quando o cliente dele busca no Google ou numa LLM?"**

- **Sim** → entra no roadmap, prioridade alta
- **Indireto** (suporta quem faz isso) → entra, prioridade média
- **Não** → não entra, por mais "legal" que pareça

Exemplos de aplicação do filtro:
- Editor de blog com 3 modos → **sim** (mais conteúdo indexável e citável)
- Score SEO/GEO/AEO visível → **sim** (mede e melhora o cerco)
- E-commerce com checkout → **não** (não serve ao foco — e está fora de escopo de propósito)
- Tema dark mode bonito → **indireto** (UX, não o foco) — só se sobrar tempo

---

## O QUE ISSO **NÃO** É (no escopo atual)

- Não é tráfego pago. Nunca. O foco é 100% orgânico.
- Não é "ter presença digital" genérica. É aparecer na **busca com intenção de compra/contratação**.
- Não é vaidade de design. Site bonito que não aparece na busca é fracasso do produto.

**Sobre e-commerce:** por ora o HARPIA gera landing/institucional/catálogo e a conversão é por contato (WhatsApp, telefone, agendamento, visita). E-commerce (checkout, carrinho) é uma **feature futura possível** — não está descartada, apenas está fora do MVP atual. A arquitetura é mantida aberta pra essa evolução (abstração de `Product`, `PaymentProvider` planejado). O que **não** muda nunca é o foco em SEO/GEO/AEO — mesmo um site de e-commerce no futuro só faz sentido no HARPIA se for o e-commerce que mais aparece na busca.

---

## POR QUE ISSO É IMUTÁVEL

O mercado de site builder é saturado (Wix, Squarespace, WordPress). O HARPIA não compete em "fazer site". Compete em **fazer o site aparecer quando o cliente busca** — no Google e, cada vez mais, nas LLMs que estão virando o novo ponto de partida da busca.

Esse é o único diferencial defensável. Tudo no produto orbita em torno dele. Mudar esse foco é virar mais um site builder genérico — e morrer.

---

*Fim do North Star. Este documento não muda. Features mudam; o foco não.*
