# Análise: Conversion — Desenvolvimento de Sites (SEO + GEO)

> **Referência durável, não estado do projeto.** Nada aqui está construído no
> ANCOREO só por estar escrito aqui. O que existe de verdade está no
> [ESTADO.md](../../ESTADO.md); o que virou tarefa saiu da Parte 4 e foi para a
> fila de trabalho.

**Fonte:** https://www.conversion.com.br/seo/desenvolvimento-de-sites
**Páginas irmãs auditadas:** /geo, /geo/semantic-branding, /seo/seo-tecnico, /seo/metodologia, /seo/ai-content-builder, /searchhub, /llms.txt, /robots.txt
**Data da análise:** 13/08/2026
**Objetivo:** extrair (1) o esqueleto de landing page replicável e (2) o inventário de técnicas, estratégias e ferramentas SEO/GEO/AEO que eles declaram usar — com tradução para uma plataforma de criação de sites com essas camadas embutidas.

---

# PARTE 1 — ANATOMIA DA LANDING PAGE

## 1.1 Os 13 blocos, na ordem exata

| # | Bloco | Copy real | Função persuasiva |
|---|---|---|---|
| 1 | **Hero** | Kicker "Desenvolvimento de Sites" → H1 "O novo serviço da Conversion, uma nova era para o seu site" → sub "Nós implementamos sites institucionais, plataformas de conteúdo e web apps com arquitetura escalável, otimizados tanto para SEO quanto para GEO, e focados em conversão" → CTA "Solicite uma proposta" (âncora `#orcamento`) → colagem visual | Promessa + escopo + os 3 eixos de valor em uma frase |
| 2 | **Prova social imediata** | 37 logos em carrossel (iFood, Nestlé, Sephora, Localiza, Stone, Americanas, Sicredi…) | Empresta autoridade antes de qualquer argumento |
| 3 | **Performance** | Kicker "Performance" → "Sites rápidos, impecáveis para SEO & GEO e focados em aumentar a conversão" + 3 bullets (Core Web Vitals como critério de arquitetura / HTML enxuto e rendering / experiência rápida para usuários **e agentes de IA**) | Primeiro pilar técnico. Já planta "agente de IA" |
| 4 | **Case na prática (dogfooding)** | "Os números deste próprio site": **1.366** URLs indexáveis · **~14** collections no CMS · **100/100** auditoria técnica · **+235%** tráfego orgânico da Academy em 4 meses | Prova irrefutável e barata: o próprio site é o case |
| 5 | **Stack — "Por que Payload"** | 3 cards: Open source · Backend + front-end · MCP + API | Justifica a escolha técnica e transforma em diferencial |
| 6 | **AI Workflow** | "Até 5x mais rápido para implementar e evoluir o seu site" + diagrama humano → agentes → humano + 4 bullets + "entregas típicas em menos de 1 mês (sob consulta)" | Ataca a objeção de prazo e preço sem citar preço |
| 7 | **Integração com o time** | "Seu design system continua sendo a fonte de verdade" → 4 cards: Cores · Tipografia · Espaçamento · Componentes | Neutraliza o medo de perder controle da marca |
| 8 | **Gestão de conteúdo** | "Painel sob medida ou, ainda melhor, faça tudo conversando em um chat" (MCP + API) | Mostra a vida **depois** da entrega |
| 9 | **Ferramentas de IA** | 3 cards: AI Content Builder · Image Creator · MCP | Prova que é produto, não serviço artesanal |
| 10 | **Grid de 8 benefícios** | PageSpeed 100/85 · Otimização técnica · Navegação agêntica · Workflows de IA · Gestão via chat · Arquitetura flexível · Hospedagem segura · Manutenção contínua | Varredura de escaneabilidade — o leitor que pulou tudo lê aqui |
| 11 | **Segurança (anti-objeção)** | "Diga adeus a falhas de segurança de plugins gratuitos: construímos features personalizadas" | Ataque frontal ao WordPress-com-plugins, que é o concorrente real |
| 12 | **Formulário de orçamento** | "Fale com nosso time e coloque o site da sua empresa na era agêntica" — 13 campos com Segmento (25 opções), Nº de funcionários (9 faixas), Cargo (15 opções), Área, "Como conheceu", "Principal desafio" | Qualificação pesada = filtro de lead + dado de roteamento comercial |
| 13 | **Footer-silo** | Menus SEO / GEO / PR / Soluções / Cases / Academy / Empresa + Plataformas Homologadas + Great Place to Work + telefone + e-mail | Distribuição de autoridade interna e NAP |

## 1.2 O padrão de repetição (o que copiar)

Sete das oito seções internas seguem exatamente o mesmo molde:

```
[KICKER curto]  →  [H2 orientado a benefício, não a feature]
→ [1 parágrafo técnico com jargão específico]
→ [3 a 4 bullets curtos e paralelos]
→ [imagem alternando lado esquerdo/direito]
```

Isso é o que faz a página parecer densa e ao mesmo tempo escaneável. Alterna bloco-texto e bloco-cards (3 ou 4 colunas) para quebrar o ritmo.

## 1.3 As sete decisões de copy que sustentam a página

1. **Um CTA só, repetido.** "Solicite uma proposta" no hero, âncora para o formulário no fim. Zero preço, zero botão concorrente.
2. **Cada seção mata uma objeção específica.** Lento → Performance. Caro/demorado → AI Workflow. Vão destruir minha marca → Design System. E depois, quem mexe? → Gestão de conteúdo. É seguro? → Segurança.
3. **Números quebrados, nunca redondos.** 1.366, ~14, +235%. Número redondo cheira a estimativa.
4. **Honestidade calibrada.** "PageSpeed 100/85 — 100 antes de tags e mídia; 85 depois de Analytics e assets." Admitir a perda compra confiança para o resto da página.
5. **Prazo com escape.** "Entregas típicas em menos de 1 mês (sob consulta)". Ancora rápido sem virar promessa contratual.
6. **Dogfooding como case.** "A plataforma que você está navegando agora foi construída com este método." Elimina a necessidade de case de cliente.
7. **Vocabulário de fronteira.** "era agêntica", "navegação agêntica", "GEO", "MCP". Posiciona como quem chegou primeiro, mesmo quando a entrega é a de sempre.

## 1.4 O que a LP deles NÃO tem — e é a sua brecha

Auditei o código da página. O schema declarado é `Organization + WebPage + BreadcrumbList + Service`. Faltam:

- **Nenhum bloco de FAQ visível** e nenhum `FAQPage` no JSON-LD → a página não está otimizada para AEO (resposta direta). Ironia útil: eles vendem GEO numa página que não faz AEO.
- **Nenhum depoimento nesta LP** (existem em /geo e /seo-tecnico, não aqui).
- **Nenhum case nomeado de cliente** com número atrelado.
- **Nenhuma faixa de preço nem "para quem é / para quem não é"**.
- **Nenhum comparativo** com a alternativa (WordPress + plugins) além do parágrafo de segurança.
- **`robots.txt` genérico** — `User-Agent: *`, sem regra nominal para GPTBot, ClaudeBot, PerplexityBot, Google-Extended.

Sua plataforma pode nascer com tudo isso e usar exatamente essa diferença como argumento de venda.

---

# PARTE 2 — INVENTÁRIO DE TÉCNICAS, ESTRATÉGIAS E FERRAMENTAS

Cada item: **o que é → pra que serve → como incorporar certo na sua plataforma.**

## 2.1 Camada SEO técnico

### Core Web Vitals — LCP, INP, CLS
**O que é.** As três métricas de experiência do Google. LCP (Largest Contentful Paint) = tempo até o maior elemento visível pintar, meta ≤ 2,5s. INP (Interaction to Next Paint) = latência de resposta a cliques/toques, meta ≤ 200ms. CLS (Cumulative Layout Shift) = quanto o layout pula durante o carregamento, meta ≤ 0,1.
**Pra que serve.** Fator de ranqueamento leve no Google, mas fator de conversão pesado. E agentes de IA que rastreiam com timeout curto simplesmente desistem de páginas lentas.
**Como incorporar.** Não trate como auditoria pós-entrega — trate como *trava de build*. Na sua plataforma: `width`/`height` obrigatórios em toda imagem (mata CLS), `fetchpriority="high"` na imagem do hero, fonte com `font-display: swap` e `preload`, zero JS de terceiro no caminho crítico. Rode Lighthouse CI no deploy e **bloqueie a publicação** se LCP > 2,5s. Vender "trava de build" é mais forte que vender "otimização".

### HTML enxuto + estratégia de rendering (SSR/SSG)
**O que é.** Entregar o conteúdo já no HTML do servidor, em vez de montar via JavaScript no navegador.
**Pra que serve.** O Googlebot renderiza JS, mas em segunda fila e com atraso. Crawlers de IA (GPTBot, ClaudeBot, PerplexityBot) em geral **não executam JavaScript**. Conteúdo que só existe depois do JS é conteúdo invisível para IA.
**Como incorporar.** Regra de ouro da sua plataforma: *todo texto indexável nasce no HTML da resposta.* SSG para páginas institucionais e blog, ISR para conteúdo que muda. Teste de aceite simples: `curl` na página e conferir se o H1, o texto principal e o FAQ aparecem no HTML cru. Se não aparecem, a página não está pronta.

### Crawl budget
**O que é.** O volume de páginas que um buscador se dispõe a rastrear no seu domínio por período.
**Pra que serve.** Em site pequeno é irrelevante. Em site com centenas de URLs (filtros, paginações, tags), lixo indexável consome a cota e as páginas que importam demoram a ser vistas.
**Como incorporar.** Gere `noindex` automático para paginações profundas, páginas de tag vazias e combinações de filtro. Sitemap segmentado por tipo (páginas, posts, serviços, locais) com `lastmod` verdadeiro. Nunca deixe a plataforma criar URL sem decidir o status de indexação dela.

### Arquitetura de no máximo 3 cliques
**O que é.** Qualquer página relevante alcançável em até 3 cliques a partir da home.
**Pra que serve.** Profundidade de clique é proxy de importância. Página no 5º nível recebe pouca autoridade interna e é rastreada raramente.
**Como incorporar.** Sua plataforma deve **calcular e exibir** a profundidade de cada página no painel, e alertar quando passar de 3. Junto: hub pages por cluster e breadcrumb obrigatório.

### Dados estruturados JSON-LD
**O que é.** Um bloco de JSON no `<head>` que declara, em vocabulário schema.org, o que a página é. A Conversion cita `FAQ, How-to, Product, Organization` e usa nesta LP `Organization + WebPage + BreadcrumbList + Service`.
**Pra que serve.** Duas coisas distintas. (a) SEO: habilita rich snippets. (b) **GEO/AEO: é o formato que LLM consome sem ambiguidade.** Quando o modelo precisa saber quem presta o serviço, onde, e quanto custa, o JSON-LD entrega isso sem interpretação.
**Como incorporar.** Geração automática por tipo de página, nunca manual:

| Tipo de página | Schema mínimo |
|---|---|
| Home | `Organization` + `WebSite` (+ `SearchAction`) |
| Institucional | `AboutPage` + `Organization` |
| Serviço | `Service` (com `serviceType`, `areaServed`, `provider`) + `BreadcrumbList` |
| Serviço local | `LocalBusiness` + `geo` + `openingHoursSpecification` + `areaServed` |
| Artigo | `Article`/`BlogPosting` + `author` (`Person` com `sameAs`) + `datePublished`/`dateModified` |
| Qualquer LP | `FAQPage` com 4–8 perguntas |
| Tutorial | `HowTo` com `step` |
| Produto | `Product` + `Offer` + `AggregateRating` |

Encadeie com `@id` (o `@graph`, como eles fazem) para que Organization, WebPage e Service se refiram entre si em vez de existirem soltos. Valide no Rich Results Test dentro do próprio fluxo de publicação.

### Canonical, sitemap.xml, robots.txt, hreflang
**O que é.** Canonical resolve conteúdo duplicado apontando a versão oficial. Sitemap lista o que deve ser rastreado. Robots.txt regula acesso de bots. Hreflang mapeia versões por idioma/região ("SEO internacional" na página deles).
**Como incorporar.** Tudo automático e nunca editável por engano pelo cliente final. Detalhe que quase ninguém faz: **listar os agentes de IA nominalmente no robots.txt** (`GPTBot`, `ClaudeBot`, `Claude-User`, `PerplexityBot`, `Google-Extended`, `CCBot`, `Bytespider`) com `Allow` explícito. A Conversion não fez isso — é diferencial pronto para você.

### Performance de assets, preload/preconnect e imagens
**O que é.** `preconnect` abre a conexão com domínios externos antes da necessidade; `preload` antecipa recursos críticos (fonte, imagem do hero). Imagens em WebP/AVIF, `srcset`, `loading="lazy"` fora da dobra.
**Pra que serve.** É o que separa 85 de 100 no PageSpeed. Imagem é quase sempre o LCP.
**Como incorporar.** Pipeline de mídia obrigatório no upload: converte para WebP, gera 3 a 4 tamanhos, comprime, **exige alt text** e — se o site for de serviço local — grava EXIF e GPS coerentes com o local atendido. Bloqueie o publish se houver imagem sem alt.

### Segurança por ausência de plugins
**O que é.** Em vez de empilhar plugins de terceiros, construir a funcionalidade. Deles: "controle de acesso, atualizações contínuas e superfície de ataque reduzida", "código versionado, revisão e deploy controlado".
**Pra que serve.** Argumento comercial e técnico ao mesmo tempo. A maioria dos incidentes em sites de PME vem de plugin desatualizado.
**Como incorporar.** Transforme em número na sua LP: "0 plugins de terceiros" vs. "um WordPress médio roda 20 a 30". É comparação concreta, e comparação concreta vende.

## 2.2 Camada GEO (Generative Engine Optimization)

### GEO — a definição que eles usam
**O que é.** Otimizar para ser **citado dentro da resposta** de ChatGPT, Gemini, Perplexity, AI Overviews e AI Mode — não para ranquear numa lista de links. Eles ancoram no dado do Gartner de que ~25% das buscas serão via IA até 2026 e se posicionam como "agência pioneira em GEO no Brasil".
**A diferença que importa.** SEO disputa **posição**; GEO disputa **citação**. Em GEO não existe página 2: ou a marca está na resposta ou não existe.
**Como incorporar.** GEO não é uma aba do painel, é um conjunto de restrições sobre como o conteúdo é escrito e servido: resposta objetiva nos primeiros 2 parágrafos, dado com fonte e data, entidade nomeada por extenso (não "nós"/"a empresa"), e blocos de 40 a 80 palavras que possam ser extraídos inteiros.

### llms.txt
**O que é.** Arquivo markdown na raiz do domínio, criado para dar a agentes de IA um mapa legível do site. O da Conversion, na íntegra:

```
# Conversion
> Visão geral legível pelo agente para Conversion.

## Site
- Home / Contato / Insights (estudos e guias) / Blog / Cases

## Recursos do agente
- Mapa do site (sitemap.xml)

## Sinais de conteúdo
- Content-Signal: ai-train=yes, search=yes, ai-input=yes

## Uso
- Ferramentas e rotas públicas são read-only para agentes em v1.
```

**Pra que serve.** Não é padrão oficial nem garante nada — é sinal de intenção e um atalho de contexto. Custo de implementação: quase zero.
**Como incorporar.** Gere automático para todo site da plataforma, a partir do conteúdo real: descrição da entidade em uma linha, links principais, sitemap, sinais de conteúdo e o que é permitido ao agente. Vale um `llms-full.txt` com o conteúdo integral das páginas-chave em texto puro para sites pequenos.

### Content-Signal (`ai-train=yes, search=yes, ai-input=yes`)
**O que é.** Sinalização de permissões de uso do conteúdo, no formato da Content Signals Policy da Cloudflare: `search` (indexação), `ai-input` (uso como contexto em resposta gerada, ou seja RAG), `ai-train` (uso em treinamento).
**Pra que serve.** Declara publicamente o que você autoriza. Quem quer ser citado por IA marca `search=yes` e `ai-input=yes`. `ai-train` é escolha estratégica: `yes` para agência que quer virar referência; `no` para quem tem conteúdo proprietário a proteger.
**Como incorporar.** Faça disso **uma pergunta no onboarding do cliente**, com o padrão em `search=yes, ai-input=yes, ai-train=no` e o cliente podendo abrir. Emitir tanto no llms.txt quanto no header HTTP `Content-Signal`. Vira um argumento de governança que nenhum construtor de site oferece.

### Navegação agêntica
**O que é.** "Arquitetura preparada para agentes e robôs de busca" — na prática, o site ser navegável e compreensível por um agente que lê HTML e chama APIs, não por um humano com mouse.
**Pra que serve.** É a aposta de que a próxima "sessão" no site será de um agente comprando, agendando ou comparando em nome do usuário.
**Como incorporar.** HTML semântico de verdade (`<main>`, `<article>`, `<nav>`, headings hierárquicos sem pular nível), rótulos ARIA corretos, formulários com `label` associado, e — o passo avançado — expor endpoints públicos read-only em JSON (catálogo, serviços, horários, unidades). Acessibilidade e navegação agêntica são o mesmo trabalho.

### MCP (Model Context Protocol) no CMS
**O que é.** Protocolo aberto que permite a um assistente de IA (Claude, ChatGPT, Gemini) conversar diretamente com um sistema — no caso, o CMS. O Payload expõe MCP nativamente, e é isso que sustenta o "crie e edite páginas literalmente conversando".
**Pra que serve.** Duas frentes. (a) Operação: o cliente edita o site pelo chat, sem aprender painel. (b) Escala: publicar 40 páginas de bairro/serviço vira uma conversa, não 40 formulários.
**Como incorporar.** Se sua plataforma expuser um servidor MCP, isso vira o diferencial mais difícil de copiar do mercado brasileiro. Comece read-only (ler estrutura, páginas, métricas), depois libere escrita com aprovação humana obrigatória — exatamente o "read-only para agentes em v1" que eles declararam.

### Mapeamento de prompts
**O que é.** Em vez de keyword research, levantar as **perguntas conversacionais** reais que o público faz a uma IA. "melhor agência SEO SP" vira "qual agência de SEO contratar para um e-commerce de médio porte em São Paulo".
**Pra que serve.** É a nova pesquisa de palavra-chave. Prompt tem 15 a 30 palavras, contexto, restrição e intenção embutida — e é isso que o modelo precisa casar com seu conteúdo.
**Como incorporar.** No onboarding, gere de 30 a 50 prompts por cliente (por segmento, dor, objeção e estágio), rode em ChatGPT/Gemini/Perplexity e registre o baseline: aparece? em que posição da resposta? com que frase? Isso vira o relatório mensal e a matéria-prima do conteúdo. Ferramenta paga não é obrigatória para começar.

### Semantic Branding / Branding Semântico
**O que é.** Mapear como o Google e as IAs **entendem e associam** a marca: a que entidades, temas e atributos ela está ligada, e onde estão os gaps. Eles vendem como ferramenta proprietária, com quatro pilares — posicionamento de marca, topic clusters, PR, autoridade tópica — mais duas variáveis: profundidade de conteúdo e popularidade de marca.
**Pra que serve.** Modelo de linguagem não indexa páginas, associa entidades. Se "Dicas do Dove" não estiver semanticamente colado a "SEO para PME", "GEO" e "conteúdo local", nenhuma otimização de página resolve.
**Como incorporar.** Diagnóstico de entrada, entregue como documento: pergunte à IA "o que é [marca]?", "quem são os principais fornecedores de [serviço] em [cidade]?", "com o que [marca] está associada?". Compare o que voltou com o posicionamento pretendido. O delta é o plano de conteúdo dos 6 meses seguintes.

### Topical map, topic clusters e autoridade tópica
**O que é.** Cobrir um território temático inteiro — pilar + satélites + interligação — em vez de publicar artigos avulsos.
**Pra que serve.** Autoridade tópica é o que faz o modelo escolher você como fonte quando o assunto aparece. Cobertura parcial não gera citação.
**Como incorporar.** A plataforma deve **desenhar o mapa antes da primeira publicação** e depois exibir a cobertura em percentual ("cluster NR-12: 7 de 12 subtemas publicados"). Linkagem interna sugerida automaticamente entre pilar e satélites. E trava anti-canibalização: alertar quando um novo conteúdo disputar a mesma intenção de um já publicado.

### Diagnóstico de presença em IA
**O que é.** Medir a visibilidade da marca dentro de ChatGPT, Google AI Overviews e afins — o que a indústria chama de *share of model*.
**Pra que serve.** GEO sem medição é achismo. Este é o KPI que substitui "posição média" no relatório.
**Como incorporar.** Painel com quatro números por mês: taxa de citação (% dos prompts em que a marca aparece), posição na resposta, sentimento/atributo associado, e concorrentes citados junto. É o gráfico que segura contrato de retainer.

### E-E-A-T e o "Ciclos de SEO 4.0"
**O que é.** O framework deles reorganiza E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) em 5 etapas: **Expertise** (definir territórios temáticos) → **Authority** (transformar em reconhecimento via conteúdo, Digital PR, menções e backlinks) → **Trustworthiness** (autoria, fontes, provas, transparência, segurança técnica) → **Data & Performance** (medir para priorizar) → **Experience** (converter aprendizado em resposta à intenção de busca).
**Pra que serve.** É o que separa conteúdo citável de conteúdo genérico. Modelos de IA privilegiam fonte identificável e verificável.
**Como incorporar.** Transforme em campos obrigatórios do CMS: autor real com bio, foto, credencial e `sameAs` para LinkedIn; `datePublished` e `dateModified` visíveis; fontes citadas com link e data; página "Quem somos" com pessoas de verdade; página de política editorial. Sem autor identificável, `Article` schema não sustenta E-E-A-T.

### Digital PR, Data PR, Newsjacking e Link Building 4.0
**O que é.** Gerar menções e links por meio de pesquisa própria (Data PR), aproveitamento de pauta quente (Newsjacking) e relacionamento com imprensa — em vez de comprar link.
**Pra que serve.** Menção em veículo de autoridade é hoje **fonte que a IA cita**. Modelos puxam de portais, Reddit, YouTube e imprensa, não só do site da marca.
**Como incorporar.** Você provavelmente não vai vender PR. Mas pode embutir o gerador: a plataforma produz, com os dados do próprio cliente, um estudo/levantamento anual pronto para virar release. Um dado proprietário gera link e citação por anos.

## 2.3 Camada de produto e ferramentas proprietárias

### Payload CMS
**O que é.** CMS headless open source em TypeScript, rodando sobre Next.js — backend e frontend na mesma stack, com collections definidas em código e MCP/API nativos.
**Por que eles escolheram.** Os três argumentos da página: open source com regras de negócio próprias, stack única, e MCP + API para edição conversacional. O case interno: 1.366 URLs, ~14 collections.
**Como incorporar.** Se sua plataforma tem stack própria, o aprendizado é o modelo mental: **schema-first**. Cada tipo de conteúdo é uma collection com campos tipados, e cada campo tipado alimenta automaticamente o JSON-LD, o sitemap, as meta tags e o llms.txt. É isso que torna "SEO/GEO/AEO embutido" verdadeiro em vez de checklist manual.

### AI Content Builder
**O que é.** Sistema multiagente proprietário — **20 agentes especializados**, workflow de **6 etapas**, **9 camadas de revisão**, revisão humana no fim. Produz artigos, PDPs, páginas de categoria e conteúdo formatado para GEO. Promessa: até 5x mais produção.
**Diferencial declarado.** Escreve com o tom de voz, as guidelines de marca e a base de conhecimento do cliente — não texto genérico de IA.
**Como incorporar.** O padrão a copiar é a **cadeia de agentes especializados com revisão humana obrigatória no fim**, não o prompt único. Uma versão enxuta e viável: pesquisa → briefing com dados de mercado → arquitetura de conteúdo → redação → revisão SEO → revisão GEO/AEO → revisão anti-vício de IA → aprovação humana. Guarde tom de voz e base de conhecimento **por cliente**, versionados — é isso que impede a saída genérica.

### Image Creator
**O que é.** Geração dinâmica de imagens e ilustrações a partir do design system do cliente.
**Pra que serve.** Resolve o gargalo real de todo site de PME: falta de imagem própria, e banco de imagem genérico que derruba a percepção de qualidade.
**Como incorporar.** Amarre ao design system (paleta, tipografia, estilo) e ao pipeline de SEO de imagem: nome de arquivo descritivo, alt text gerado a partir do contexto da seção, WebP, dimensões corretas, EXIF/GPS quando for serviço local.

### SearchHub
**O que é.** Plataforma interna de gestão da operação de SEO — workflows de produção, aprovação de conteúdo, previsibilidade de entrega, visão tipo Gantt. Exclusiva para clientes. O pitch: "eliminou literalmente milhares de planilhas".
**Pra que serve.** Não é ferramenta de SEO, é ferramenta de **retenção**. Cliente que acompanha entrega em painel cancela menos.
**Como incorporar.** É o item mais subestimado da lista e provavelmente o de maior ROI para você. Um painel onde o cliente vê o que foi publicado, o que está na fila, o score técnico do site e a evolução de citação em IA transforma serviço em produto — e justifica mensalidade.

### Workflow de AI Engineering (humano → agentes → humano)
**O que é.** Metodologia proprietária em que o humano entra no início (consultivo, estratégico, criativo) e no fim (revisão), e agentes autônomos executam o miolo. Resultado declarado: até 5x mais rápido, entrega típica em menos de 1 mês.
**Como incorporar.** Adote e **mostre o diagrama na sua LP** — eles mostram. O desenho comunica em 2 segundos o que 3 parágrafos não comunicam: você não é uma agência lenta nem uma IA sem responsável.

### Design tokens do Figma como fonte de verdade
**O que é.** Cores, tipografia, espaçamento e componentes aprovados no Figma virando código sem tradução paralela.
**Pra que serve.** Anti-objeção de agência: "vocês vão descaracterizar minha marca".
**Como incorporar.** Sua plataforma deve **importar tokens** (JSON do Figma ou CSS variables) e usá-los como base do tema. Cliente com marca definida entra com a marca dele; cliente sem marca recebe um preset.

---

# PARTE 3 — BLUEPRINT DA SUA LANDING PAGE

Estrutura derivada da deles, corrigindo as lacunas e adaptada para PME brasileira.

```
01 · HERO
     Kicker: "Plataforma de criação de sites"
     H1: [promessa de resultado, não de tecnologia]
     Sub: 1 frase com os 3 eixos — SEO + GEO/AEO nativos, velocidade de entrega, preço claro
     CTA único → âncora #proposta
     Selo de prova: "site entregue em X dias" ou "PageSpeed 100"

02 · PROVA SOCIAL
     Logos ou, se ainda não houver volume, 3 mini-cases com número real
     (número honesto e pequeno vence logo emprestado)

03 · O PROBLEMA
     Bloco que a Conversion não tem e que funciona muito melhor para PME:
     "Seu site foi feito para o Google de 2015. Hoje quem responde é a IA — e ela não te cita."
     3 bullets de sintoma reconhecível

04 · PERFORMANCE  [molde: kicker + H2 + parágrafo + 3 bullets + imagem]
     Core Web Vitals como trava de build, HTML servido pronto, rápido para pessoa e para agente

05 · SEO EMBUTIDO
     Schema automático por tipo de página · sitemap e canonical automáticos ·
     arquitetura ≤3 cliques · trava anti-canibalização

06 · GEO + AEO EMBUTIDOS   ← seu diferencial central, e o que eles não detalham
     llms.txt gerado automático · Content-Signal configurável ·
     robots.txt com agentes de IA nominais · FAQPage em toda página ·
     conteúdo em blocos extraíveis · painel de citação em IA

07 · CASE NA PRÁTICA (dogfooding)
     "Os números desta própria plataforma": 4 métricas quebradas e verificáveis

08 · COMO FUNCIONA
     Diagrama humano → agentes → humano, com prazo típico e escape ("sob consulta")

09 · SUA MARCA CONTINUA SUA
     4 cards: cores · tipografia · espaçamento · componentes

10 · DEPOIS DA ENTREGA
     Painel próprio, edição por chat/MCP, manutenção contínua
     (a objeção nº 1 da PME é "e depois, quem mexe?")

11 · GRID DE 8 BENEFÍCIOS
     Escaneável, com um número honesto e calibrado no primeiro card

12 · SEGURANÇA
     "0 plugins de terceiros" vs. "20 a 30 num WordPress médio"

13 · PARA QUEM É / PARA QUEM NÃO É     ← eles não têm; qualifica e cria confiança

14 · PREÇO OU FAIXA                     ← eles não têm; para PME, ausência de preço mata o lead

15 · FAQ VISÍVEL (6 a 8 perguntas) + FAQPage schema   ← seu bloco de AEO
     "Quanto custa?" · "Em quanto tempo?" · "Funciona com meu domínio atual?" ·
     "O que é GEO?" · "Preciso entender de tecnologia?" · "E se eu quiser sair?"

16 · FORMULÁRIO
     Para PME: máximo 6 campos (nome, WhatsApp, e-mail, empresa, site atual, desafio).
     13 campos como os deles só funcionam com marca já consolidada.

17 · FOOTER-SILO
     Links por cluster + NAP + certificações + redes
```

**Regra de ordem:** promessa → prova → dor → solução técnica (do mais familiar ao mais novo) → prova própria → processo → anti-objeções → conversão. SEO antes de GEO, sempre: o comprador entende SEO e usa esse entendimento como ponte para GEO.

---

# PARTE 4 — CHECKLIST DO QUE A PLATAFORMA DEVE GERAR SOZINHA

Se cada item abaixo for automático, "SEO/GEO/AEO embutido" deixa de ser promessa e vira arquitetura.

**Por página**
- [ ] Title 50–60 caracteres e meta description 140–160, com fallback gerado
- [ ] H1 único, hierarquia de headings sem pular nível
- [ ] Canonical auto
- [ ] JSON-LD encadeado por `@graph`, conforme o tipo de página
- [ ] `FAQPage` com 4–8 perguntas (bloco padrão em toda página)
- [ ] OG e Twitter Card com imagem gerada
- [ ] Todo texto indexável presente no HTML servido
- [ ] Imagens: WebP, dimensões declaradas, alt obrigatório, lazy fora da dobra
- [ ] Bloco de resposta direta (40–80 palavras) logo abaixo do H1 — o alvo de citação
- [ ] Autor identificado com bio e `sameAs`, `datePublished` e `dateModified`
- [ ] Profundidade de clique calculada e alerta acima de 3
- [ ] Sugestão automática de links internos dentro do cluster
- [ ] Trava de build: Lighthouse CI, publish bloqueado com LCP > 2,5s

**Por domínio**
- [ ] `sitemap.xml` segmentado com `lastmod` real
- [ ] `robots.txt` com GPTBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, CCBot listados nominalmente
- [ ] `llms.txt` gerado do conteúdo real, atualizado a cada publicação
- [ ] `Content-Signal` definido no onboarding (padrão: `search=yes, ai-input=yes, ai-train=no`)
- [ ] Endpoints públicos read-only em JSON para agentes
- [ ] Servidor MCP do CMS — read-only na v1, escrita com aprovação humana depois
- [ ] Painel do cliente: score técnico, cobertura de cluster, taxa de citação em IA
- [ ] Baseline de 30–50 prompts rodados no onboarding, remedidos mensalmente
- [ ] Zero plugins de terceiros — número exibido como argumento comercial

---

## Fontes

- [Desenvolvimento de Sites — Conversion](https://www.conversion.com.br/seo/desenvolvimento-de-sites)
- [GEO — Generative Engine Optimization](https://www.conversion.com.br/geo)
- [Semantic Branding](https://www.conversion.com.br/geo/semantic-branding)
- [SEO Técnico](https://www.conversion.com.br/seo/seo-tecnico)
- [Metodologia — Ciclos de SEO 4.0](https://www.conversion.com.br/seo/metodologia)
- [AI Content Builder](https://www.conversion.com.br/seo/ai-content-builder)
- [SearchHub](https://www.conversion.com.br/searchhub)
- [llms.txt](https://www.conversion.com.br/llms.txt) · [robots.txt](https://www.conversion.com.br/robots.txt)
