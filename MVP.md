# MVP ANCOREO — 5 pilares

Escopo travado por você em 07/08/2026:
**onboarding · site builder · blog builder · métricas SEO/GEO/AEO · Google Perfil de Empresa 100% funcional.**

E-commerce está **fora**. O código da loja fica onde está, dormente, sem tela.
Nada de loja entra em sprint até o MVP estar no ar.

Estado verificado dos pilares: [ESTADO.md](ESTADO.md) (gerado, não escrito).
Como trabalhamos: [RITUAL.md](RITUAL.md).

---

## A distinção que muda o plano

Existem duas coisas com o mesmo nome e você precisa saber qual está comprando:

| | o que é | temos? |
|---|---|---|
| **Score de otimização** | checklist do que a página tem: título no tamanho, meta, FAQ, palavras, links internos | **sim, real e funcionando** |
| **Métrica de resultado** | onde você aparece, quantos te acham, quem te citou | **quase nada** |

`lib/seo/site-score.ts` calcula as 3 dimensões de verdade e grava histórico
diário. Isso é score. Já a tela `/aeo` mostra "score de visibilidade em IA" com
dado **inventado** (`isSample: true`) — está fora do menu de propósito.

Vender score como métrica é a coisa mais fácil de fazer e a que mais rápido
queima o cliente, porque ele conta os telefonemas que recebeu. O MVP entrega
score real **mais** um punhado de métricas de resultado que dá pra medir
honestamente hoje.

---

## Pilar 1 — Onboarding

**Hoje:** 7 telas, funciona. 13 perfis criados, 8 sites gerados, **1 publicado**.

O funil vaza entre gerar e publicar: 8 → 1. Isso não é bug de código, é o
buraco de produto do MVP. Alguém chega até o site pronto e para ali.

| Pronto quando | |
|---|---|
| 1.1 | Sei por que 7 de 8 pararam: evento de abandono por tela, visível no painel interno |
| 1.2 | Quem gerou site e não publicou recebe um e-mail em 24h com o link do rascunho |
| 1.3 | Sessão de teste T1 passa com 3 pessoas de fora sem eu explicar nada |

---

## Pilar 2 — Site builder

**Hoje:** gera por IA, editor inline funciona, publica em subdomínio, 1 site no ar.
É o pilar mais maduro. Migration de 05/08 já matou o depoimento fictício.

| Pronto quando | |
|---|---|
| 2.1 | Tela de domínio próprio no painel (hoje não existe — tarefa #14) |
| 2.2 | Republicar não quebra edição feita à mão |
| 2.3 | Site publicado passa em Lighthouse ≥ 90 em performance e acessibilidade |
| 2.4 | Sessão T2 passa |

Arranjo de tela: `docs/modelos-referencia/` — `landing-servico.html` é o mais
alinhado ao cliente típico do ANCOREO. [Índice do acervo](docs/modelos-referencia/README.md).

---

## Pilar 3 — Blog builder

**Hoje:** editor, FAQ, preview de snippet, rota de publicação com gate AEO,
grafo de links internos. Tudo escrito. **Zero posts no banco.**

Nunca foi exercido ponta a ponta por ninguém. Um caminho de código que nunca
rodou com dado real não é um pilar pronto, é uma hipótese.

| Pronto quando | |
|---|---|
| 3.1 | 5 posts reais publicados por mim num site de teste, sem tocar em código |
| 3.2 | Links internos automáticos apontam pra posts que existem (grafo validado) |
| 3.3 | Post publicado aparece no sitemap e no llms.txt do tenant |
| 3.4 | Sessão T3 passa |

Arranjo de tela: `docs/modelos-referencia/blog-magicui.html` cobre a listagem e
o artigo. Duas coisas de lá que hoje não temos e valem a pena: **contador por
tag** nos filtros e **thumb 16:9 no card**. [Índice do acervo](docs/modelos-referencia/README.md).

---

## Pilar 4 — Métricas SEO / GEO / AEO

**Hoje real:** score das 3 dimensões, histórico diário, visitas do site
publicado (`site_view`), leads, links quebrados sob demanda.
**Hoje falso:** tudo em `/aeo`.

O MVP não inventa medição. Entrega o que dá pra medir de verdade:

| camada | métrica do MVP | de onde vem | custo |
|---|---|---|---|
| SEO | score + histórico | já existe | zero |
| SEO | posição real das palavras-chave | Search Console API (OAuth self-service, sem fila de aprovação) | zero |
| GEO | visitas, origem, leads | `analytics_events` | zero |
| AEO | **visitas de bots de IA** — GPTBot, ClaudeBot, PerplexityBot, Google-Extended | user-agent no middleware | zero |
| AEO | citação de marca em ChatGPT/Gemini | consulta paga aos modelos | **pós-MVP** |

A linha de bots de IA é a boa notícia: é medição real, custa nada, e é a coisa
mais próxima de "as IAs estão lendo meu site" que existe sem pagar API. Dá pra
mostrar num gráfico e é verdade.

| Pronto quando | |
|---|---|
| 4.1 | `/aeo` reescrita: sai o dado sintético, entra visita de bot de IA real (tarefa #13) |
| 4.2 | Search Console conectado por OAuth, posição real no painel |
| 4.3 | Nenhum número na interface vem de `isSample` — sonda do ESTADO.md verde |
| 4.4 | Sessão T4 passa |

---

## Pilar 5 — Google Perfil de Empresa

**Hoje:** zero integração com o Google. `/gbp` é "a IA escreve o texto, você
copia e cola no seu perfil". 2 dos 13 perfis informaram o link. 0 posts gerados.

**O obstáculo que não depende de nós:** publicar direto no perfil exige a
Google Business Profile API, e o Google só libera depois de aprovar um
formulário de solicitação de acesso. É fila, leva semanas, e é recusada com
frequência. Amarrar o lançamento nisso é entregar a data do MVP pro Google.

**Decisão que estou assumindo** (me corrija se discordar):

> **Caminho B agora, caminho A protocolado hoje.**
> **B** = fluxo assistido completo, sem depender do Google. **A** = API oficial,
> vira upgrade que remove o passo de colar quando (e se) o acesso sair.

"100% funcional" no MVP significa: **o post sai toda semana no perfil do
cliente**, não "o servidor fala com a API". O cliente não vê a diferença; o
calendário dele vê.

| Pronto quando (caminho B) | |
|---|---|
| 5.1 | Pedido de acesso à Business Profile API protocolado — **primeira coisa, hoje**, porque a fila corre em paralelo |
| 5.2 | Onboarding valida o link do perfil de verdade (hoje aceita qualquer texto) |
| 5.3 | Calendário: a IA prepara os posts do mês, não um avulso |
| 5.4 | Um clique copia o texto formatado e abre o perfil na tela certa |
| 5.5 | Cliente marca "publiquei" e o histórico registra — sem isso não há métrica de GBP |
| 5.6 | Lembrete por e-mail quando o post da semana está esperando |
| 5.7 | Sessão T5 passa |

---

## Sequência até o lançamento

Hoje é 07/08. Três sprints, lançamento na semana de 01/09.

| sprint | janela | foco | seu papel |
|---|---|---|---|
| **S1** | 08/08 – 15/08 | GBP caminho B inteiro + protocolar API | front das telas de GBP |
| **S2** | 16/08 – 23/08 | Métricas honestas: mata o sintético, entra bot de IA + Search Console | front de `/aeo` e `/metrics` |
| **S3** | 24/08 – 31/08 | Fechar vazamento do funil, domínio próprio, 5 posts reais | front do domínio |
| **Lançamento** | 01/09 | 5 clientes reais, convite direto | você conduz |

O que sai de cada sprint não é código: é uma **sessão de teste passada**. Sprint
sem sessão de teste passada não fechou, mesmo com tudo commitado.

---

## Portões que exigem você

Não são portões de permissão — você já liberou commit, push, deploy e migration.
São os pontos onde **olho humano decide melhor que máquina**, e eu paro e mostro:

| # | portão | quando | o que você faz |
|---|---|---|---|
| G1 | **Texto que vai pro cliente** | antes de qualquer e-mail automático ir ao ar | lê e aprova a redação |
| G2 | **Qualidade do que a IA escreveu** | 1 site e 1 post gerados por sprint | julga se você assinaria embaixo |
| G3 | **Número novo na interface** | toda vez que aparece uma métrica nova | confirma que é medição e não estimativa |
| G4 | **Fim de sprint** | sexta | roda a sessão de teste comigo do lado |
| G5 | **Lançar** | 01/09 | você decide, com o ESTADO.md na frente |

G3 é o portão que teria evitado a tela `/aeo` sintética existir.

---

## Fora do MVP (não voltar a discutir até 01/09)

Loja e checkout · billing da assinatura · citação de marca em ChatGPT/Gemini ·
parcerias entre clientes · agendamentos além do que já existe.
