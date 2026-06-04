# REGRAS DE ARQUITETURA AEO/GEO/SEO — Projeto HARPIA
> **Mandato de arquitetura.** Estas 8 regras vêm de pesquisa de mercado validada (webinar AEO 2026) e têm impacto DIRETO no que o produto constrói. Não são dicas de conteúdo — são especificações.
> Servem ao `NORTH-STAR.md`. Ler junto com ele.
> Fechado: 2026-06-02

---

## Glossário (não confundir os termos)

- **SEO** — Search Engine Optimization → busca tradicional no Google. Inclui **SEO local** (cidade-base + raio de atuação, LocalBusiness schema, GBP).
- **GEO** — **Generative Engine Optimization** → ser citado/mencionado nas respostas de IAs generativas (ChatGPT, Gemini, Perplexity, Google AI Overviews). NÃO é "geográfico/local".
- **AEO** — Answer Engine Optimization → ser a resposta direta extraída (featured snippet, busca por voz, answer box).

## Por que este documento existe

O North Star diz **o quê** (o site do assinante aparece quando o cliente busca no Google e nas LLMs). Este documento diz **como garantir tecnicamente** — as 8 regras que separam um site que é citado por IA de um que é ignorado.

Cada regra tem: o princípio, o impacto no produto, e onde no projeto ela é implementada.

---

## REGRA 1 — Todo site nasce com bots de IA liberados no robots.txt

**Princípio:** site bloqueado para bot de IA não existe para ~51% das buscas atuais (as que passam por LLM). O `robots.txt` precisa liberar explicitamente os crawlers de IA.

**Bots a permitir (lista mínima, manter atualizada):**
```
User-agent: GPTBot           # OpenAI / ChatGPT
User-agent: OAI-SearchBot    # OpenAI SearchGPT
User-agent: ChatGPT-User     # ChatGPT browsing
User-agent: Google-Extended  # Gemini / Bard / Vertex
User-agent: Anthropic-AI     # Claude (treino)
User-agent: ClaudeBot        # Claude (indexação)
User-agent: Claude-Web       # Claude browsing
User-agent: PerplexityBot    # Perplexity
User-agent: Applebot-Extended# Apple Intelligence
Allow: /
```

**Impacto no produto:** etapa OBRIGATÓRIA no pipeline de publicação. Não é configuração opcional do usuário — todo site gerado nasce assim. O cliente não vê, não decide; é default da plataforma.

**Onde implementa:** Agente/pipeline de Publicação (Sprint S5). Gerador de `robots.txt` + `sitemap.xml`. A lista de bots vive em config versionada (`seo-rules/ai-bots.yaml`) pra atualizar sem deploy quando surgir bot novo.

---

## REGRA 2 — JSON-LD é o protocolo principal de comunicação com IAs (não llms.txt)

**Princípio:** o que as IAs realmente consomem é **Schema JSON-LD + HTML semântico extraível + canonical + sitemap**. O `llms.txt` tem menos impacto do que o mercado divulga. Não desperdiçar esforço de engenharia priorizando llms.txt.

**Ordem de prioridade técnica:**
1. JSON-LD correto por tipo de página (LocalBusiness, Service, Article, FAQPage, etc.)
2. HTML semântico extraível (headings corretos, sem conteúdo crítico em JS client-side)
3. `canonical` em toda página
4. `sitemap.xml` sempre atualizado
5. `llms.txt` — gerar versão básica, mas é baixa prioridade

**Impacto no produto:** o schema é gerado **automaticamente por tipo de página**, sem o usuário configurar nada. Já está mapeado no Bloco 0 §7 e CLAUDE.md §6-§7. Esta regra confirma a rota e evita gastar tempo em llms.txt elaborado.

**Onde implementa:** Agentes de geração (todos) + pipeline de publicação. Validação no `seo-validator`.

---

## REGRA 3 — Cada bloco H2 é autossuficiente; primeira frase após H2 = resposta direta

**Princípio:** a IA lê em **chunks**, não em páginas inteiras. Se um bloco H2 não faz sentido sozinho, fora do contexto do resto do artigo, ele não é citado. Cada H2 precisa ser um mini-documento completo. A primeira frase depois do H2 é o candidato a featured snippet e a citação em AI Overview.

**Regras de geração:**
- Primeira frase após cada H2 responde diretamente o que o H2 promete (não "introduz" — responde)
- Cada bloco H2 é compreensível isolado, sem depender de parágrafo anterior
- Sem pronomes órfãos no início de bloco ("Isso acontece porque..." — isso o quê?)
- Sem "como vimos acima" / "conforme citado" — o chunk não tem o "acima"

**Impacto no produto:** refina a regra AEO existente (Bloco 0 §6) — antes valia pro artigo todo, agora vale **por bloco H2**. Vira instrução explícita no prompt do Agente Blog (Bloco 2) e validação no seo-validator.

**Onde implementa:** prompt-engineer (Bloco 2 - Blog, Bloco 0 §6 endurecido) + seo-validator (checa primeira frase de cada H2).

---

## REGRA 4 — FAQ com FAQPage schema, mínimo 6 perguntas, automático

**Princípio:** ChatGPT, Gemini e Perplexity consomem `FAQPage` schema diretamente. É o canal MAIS DIRETO de aparecer em resposta generativa. Sem FAQ com schema, o site perde esse canal.

**Regras:**
- Todo artigo de blog tem FAQ de **mínimo 6 perguntas** (era 5 no Bloco 0 — piso subiu)
- Home tem FAQ
- Schema `FAQPage` gerado automaticamente, sempre
- Perguntas em linguagem real do público (a pergunta que a pessoa digita/fala)
- Resposta com a resposta na primeira frase (casа com Regra 3)

**Impacto no produto:** endurece regra existente. Ajuste no Bloco 0 §6 (mínimo 5 → 6) e no Agente Blog. O schema já estava previsto; o que muda é o piso e a obrigatoriedade absoluta.

**Onde implementa:** prompt-engineer (Bloco 0 §6, Bloco 2) + gerador de schema no pipeline.

---

## REGRA 5 — O site precisa ser legível para AGENTE, não só para humano

**Princípio:** o fluxo do usuário mudou.
```
ANTES:  usuário → busca → site → compra
AGORA:  usuário → agente de IA → múltiplas buscas → site (intenção já qualificada) → compra
```
O agente filtra ANTES do humano chegar. Se o site não aparece nas buscas que o agente faz, o lead nunca chega. Isso transforma velocidade, HTML limpo, schema e canonical de "boa prática" em **condição de sobrevivência**.

**Impacto no produto:** não é feature nova — é o *porquê* dos não-funcionais serem inegociáveis:
- Core Web Vitals > 90 (não é vaidade — agente abandona site lento)
- HTML semântico server-rendered (conteúdo crítico nunca só em JS client-side)
- Schema + canonical + sitemap (o agente precisa entender a estrutura)

**Onde implementa:** entra como justificativa no NORTH-STAR. Critério duro no sre-observability (monitora CWV dos sites publicados) e no frontend-dev (Server Components, conteúdo no HTML inicial).

---

## REGRA 6 — Marca desconhecida para a LLM = string genérica (limite do software + upsell)

**Princípio:** se o nome do cliente nunca apareceu em texto público indexado, o modelo trata como ruído. A plataforma resolve **metade** do problema (a técnica). A outra metade é presença externa, que software não faz sozinho.

**O que a plataforma RESOLVE (metade técnica):**
- Site indexável e rápido
- Schema com `name` / `Organization` consistente
- GBP consistente (NAP igual em todo lugar)
- Conteúdo de blog que cita o nome em contexto real

**O que a plataforma NÃO resolve sozinha (metade externa):**
- PR digital, menções em sites de terceiros
- Presença em diretórios, imprensa, parcerias
- Construção de autoridade de marca fora do próprio site

**Impacto no produto:** dois efeitos.
1. **Honestidade de escopo:** não prometer que o software sozinho torna a marca conhecida pelas LLMs.
2. **Oportunidade de receita:** a metade externa vira **serviço adicional no pitch comercial** (PR digital / presença externa) — executado pelo Dove, não pelo software.

**Onde implementa:** NORTH-STAR (limite honesto) + material de pitch comercial (upsell). Sem mudança de código.

---

## REGRA 7 — Nenhuma página órfã: toda página recebe ≥2 links internos

**Princípio:** cluster órfão (página sem links internos apontando pra ela) é **penalização semântica**. Nenhuma página pode existir sem receber ao menos 2 links internos de outras páginas do mesmo site.

**Regras:**
- Ao publicar página/artigo novo, o sistema garante ≥2 links internos apontando pra ele
- Duas estratégias: (a) criar os links automaticamente em páginas relacionadas, ou (b) alertar o usuário com sugestões de onde linkar
- Default da plataforma: **criar automaticamente** quando houver páginas tematicamente relacionadas; alertar quando não houver

**Impacto no produto:** **única das 8 regras que muda o modelo de dados.** Precisa rastrear o grafo de links internos do site. Nova tabela `internal_links` (ver `CLAUDE.md` §4). Lógica nova no Agente de Publicação. **Entra no MVP** (decisão Cássio 2026-06-02) — é diferencial real e barato de manter.

**Onde implementa:** supabase-dba (tabela `internal_links`) + Agente de Publicação (S5) + seo-validator (bloqueia publicação de página que ficaria órfã).

---

## REGRA 8 — O KPI mudou: de "rankear para clicar" para "ser citado pela IA"

**Princípio:** CTR dentro do AI Overview é ~1%. O objetivo não é mais "rankear no Google pra receber clique imediato". É **ser citado na resposta da IA** pra construir autoridade de marca — o clique vem depois, via busca direta pelo nome.

**O que isso muda no que a plataforma reporta ao cliente:**
- ANTES (KPI velho): posição no Google, número de cliques orgânicos
- AGORA (KPI novo): **citabilidade** (apareceu em resposta de IA?), menções de marca, busca direta pelo nome, share of voice em AI Overview

**Impacto no produto:** redefine o **Score SEO/GEO/AEO** e o Agente de Auditoria (S8). O painel do cliente não pode mostrar só "posição no Google" — precisa mostrar sinais de citabilidade e autoridade de marca.

**⚠️ DECISÃO PENDENTE (Dove):** muda o discurso de venda e a promessa ao cliente. Registrado como direção de produto, mas **confirmar com Anderson Dove** antes de virar KPI oficial do pitch — é decisão de produto/comercial dele.

**Onde implementa:** Agente de Auditoria (S8) + score_rules (banco) + painel admin (o que o cliente vê).

---

## RESUMO — impacto por tipo

| # | Regra | Tipo de mudança | Sprint / Onde |
|---|-------|-----------------|---------------|
| 1 | robots.txt libera bots de IA | Etapa nova de pipeline | S5 Publicação + `seo-rules/ai-bots.yaml` |
| 2 | JSON-LD > llms.txt | Validação (rota confirmada) | Todos os agentes + seo-validator |
| 3 | H2 autossuficiente | Refina regra de geração | Bloco 0 §6 + Bloco 2 + seo-validator |
| 4 | FAQ ≥6 + FAQPage auto | Endurece regra | Bloco 0 §6 + Bloco 2 |
| 5 | Legível para agente | Justifica não-funcionais | NORTH-STAR + SRE + frontend |
| 6 | Marca = ruído | Limite honesto + upsell | NORTH-STAR + pitch |
| 7 | Sem página órfã (≥2 links) | **Feature + schema banco** | S5 + nova tabela `internal_links` |
| 8 | KPI = citabilidade | Redefine score (⚠️ Dove) | S8 Auditoria + score + painel |

---

## O que NÃO muda o dev agora (contexto, não arquitetura)

O resto do webinar é estratégia de conteúdo e contexto de mercado — alimenta o pitch comercial e a estratégia editorial do Dove, mas não muda o que os agentes de dev constroem nesta fase. Registrar no material de marketing/palestra, não aqui.

---

*Fim. Este documento é fonte de verdade pras decisões de arquitetura SEO/GEO/AEO. Atualizar quando surgir nova evidência validada.*
