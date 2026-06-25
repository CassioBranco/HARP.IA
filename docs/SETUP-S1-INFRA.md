# GUIA S1 — Montar a Fundação Técnica (passo a passo pra iniciante)
> Este documento ensina, em linguagem simples, como levantar a base do ANCOREO.
> Você não precisa saber programar. Você cria contas, copia chaves e aprova; os agentes de dev escrevem o código.
> Última atualização: 2026-06-02

---

## ANTES DE TUDO — a ideia em 1 parágrafo

Pensa no ANCOREO como uma casa. O **S1 é a fundação + encanamento + luz**: nada visível ainda, mas sem isso nada funciona. A gente vai (1) preparar suas ferramentas, (2) criar as contas dos serviços, (3) levantar o projeto, (4) ligar o banco de dados, (5) colocar no ar. Cada serviço tem um papel; explico cada um quando chegar nele.

> ## 🧪 ESTRATÉGIA DE BETA (decisão Jun/2026, importante)
> A gente constrói **direto na stack final** (Cloudflare + Supabase + Vercel), mas no **plano GRÁTIS** de cada uma. O free tier aguenta tranquilo o teto de **10 clientes da beta** (Cloudflare dá 100 domínios grátis; Supabase, 50 mil usuários). Quando a beta validar e os clientes pagantes chegarem, a gente **NÃO migra de plataforma** — só clica em "upgrade" do plano. Zero retrabalho.

**Divisão de trabalho:**
- **Você (Cássio):** cria contas, copia chaves, clica em painéis, aprova, roda comandos que eu te der prontos.
- **Os agentes de dev (Claude Code / Cursor):** escrevem todo o código e as migrations.
- **Eu (Claude no chat):** te explico, gero os comandos prontos, reviso.

---

## PARTE 0 — Suas ferramentas (instalar na máquina, 1 vez só)

| Ferramenta | O que é | Como instalar |
|-----------|---------|---------------|
| **Node.js** (versão LTS) | O "motor" que roda o projeto na sua máquina | nodejs.org → baixa o LTS → instala clicando next |
| **Git** | Guarda o histórico do código (tipo "salvar versões") | git-scm.com → baixa → instala |
| **Cursor** (ou VS Code) | O editor onde os agentes de dev trabalham | cursor.com → baixa → instala |
| **Conta GitHub** | A "nuvem" onde o código mora | github.com → criar conta grátis |

**Como saber que deu certo:** abre o terminal (no Cursor: menu Terminal → New Terminal) e digita:
```
node --version
git --version
```
Se aparecer um número de versão em cada, está instalado. Se der "command not found", reinstala.

---

## PARTE 1 — Notion: seu painel de controle do projeto

**Por que Notion:** pra você enxergar o que está feito, o que falta e em que ordem — sem depender de mim ou de abrir arquivos. Já temos o roadmap pronto pra importar.

**Passo a passo:**
1. Cria conta grátis em notion.so
2. Cria uma página nova → digita `/table` → escolhe **Table - Full page**
3. No canto, clica nos `...` → **Merge with CSV** (ou **Import**)
4. Sobe o arquivo `dove-site-builder/docs/roadmap-notion.csv`
5. Pronto: vira um quadro com todas as tarefas, fases, status e prioridade

**Dica:** depois, clica em **+ Add a view → Board**, agrupa por "Status". Vira um kanban (A fazer / Em andamento / Done) que você arrasta os cartões.

**Como saber que deu certo:** você vê ~55 tarefas no Notion, organizáveis por fase (A, B, C, D) e status.

---

## PARTE 2 — As contas dos serviços (criar agora, todas têm plano grátis)

Cada serviço é uma peça da casa. Cria as 3 essenciais do S1 primeiro; as outras criamos quando chegar a sprint delas.

### Essenciais do S1 (criar agora)

| Serviço | Papel (analogia) | O que fazer |
|---------|------------------|-------------|
| **GitHub** | O cofre do código | Já criada na Parte 0 |
| **Supabase** | O banco de dados + login dos usuários (a "memória" da casa) | supabase.com → sign up com GitHub |
| **Vercel** | Onde o painel do ANCOREO fica no ar | vercel.com → sign up com GitHub |

### Pra depois (não precisa agora — só anota que existem)
Cloudflare (hospeda os sites dos clientes), Stripe (cobrança), Resend (e-mails), Inngest (fila), Sentry + PostHog (monitoramento), Cloudflare R2 (imagens). Cada uma entra na sua sprint.

---

## PARTE 3 — Levantar o projeto Next.js (o esqueleto do app)

**O que é Next.js:** a tecnologia que monta tanto o painel administrativo quanto os sites dos clientes. É o "esqueleto" da casa.

**Você não escreve isso.** O agente `backend-dev` (ou `frontend-dev`) cria pra você. Seu papel é:
1. Criar uma pasta pro projeto no seu computador
2. Abrir ela no Cursor
3. Pedir pro agente: *"Crie o projeto Next.js 14 base do ANCOREO seguindo o CLAUDE.md — App Router, TypeScript estrito, Tailwind, estrutura de pastas do §10"*
4. O agente roda os comandos e cria os arquivos. Ele para e te pede aprovação antes de qualquer coisa importante (essa é a regra "semi-autônoma" que configuramos).

**Como saber que deu certo:** o agente roda `npm run dev`, te dá um link tipo `http://localhost:3000`, você abre no navegador e vê uma página inicial. Está vivo na sua máquina.

---

## PARTE 4 — Ligar o banco de dados (Supabase)

**O que acontece aqui:** o Supabase guarda tudo — usuários, sites, textos, blog. A gente precisa (a) criar o banco lá e (b) criar as 17 tabelas que já desenhamos.

### 4a. Criar o projeto no Supabase
1. No painel do Supabase → **New Project**
2. Dá um nome (ex: `ancoreo-dev`), escolhe uma senha forte pro banco (anota num lugar seguro), região **South America (São Paulo)**
3. Espera ~2 minutos enquanto ele cria

### 4b. Copiar as 3 chaves (o agente precisa delas)
No painel do projeto → **Settings → API**, copia:
- **Project URL** (endereço do banco)
- **anon public key** (chave pública, pode ir pro navegador)
- **service_role key** (chave secreta — NUNCA vai pro navegador, só no servidor)

Você me manda essas 3 (ou cola você mesmo no arquivo `.env.local` que o agente criar). Elas são a "senha" do app pra falar com o banco.

### 4c. Criar as 17 tabelas
Aqui entra o agente `supabase-dba`. Você pede:
*"Crie as migrations das 17 tabelas do CLAUDE.md §4, com RLS, e me mostre antes de aplicar."*

Ele escreve os arquivos SQL, te mostra, você aprova, e aí ele aplica no Supabase. **Importante:** ele SEMPRE para antes de aplicar (regra que configuramos), porque banco não tem "desfazer".

**Como saber que deu certo:** no Supabase → **Table Editor**, você vê as 17 tabelas listadas (tenants, users, sites, pages, blog_posts, internal_links, etc.).

---

## PARTE 5 — Login dos usuários (Auth)

**O que é:** o sistema que deixa as pessoas criarem conta e entrarem. O Supabase já faz isso pronto — a gente só liga.

**Passo:**
1. No Supabase → **Authentication → Providers**
2. Ativa **Email** (login por e-mail/senha) — esse é o do S1
3. O **Google** (pro GBP) a gente configura na sprint S2, junto com o OAuth — não agora

O agente `backend-dev` conecta o login às telas. Você pede:
*"Implemente o fluxo de signup/login com Supabase Auth nas rotas (auth)."*

**Como saber que deu certo:** você consegue criar uma conta de teste no `localhost:3000`, sair e entrar de novo.

---

## PARTE 6 — Colocar no ar (Vercel)

**O que é:** até agora o app só roda na sua máquina. A Vercel coloca ele num endereço de internet de verdade.

**Passo a passo:**
1. O código precisa estar no GitHub primeiro. O agente faz isso (`git push`) — mas **só com sua aprovação** (regra configurada).
2. Na Vercel → **Add New → Project** → conecta seu repositório do GitHub
3. Em **Environment Variables**, cola as mesmas chaves do Supabase (URL, anon, service_role)
4. Clica **Deploy** e espera ~2 minutos

**Como saber que deu certo:** a Vercel te dá um link tipo `ancoreo-dev.vercel.app`. Você abre e o app está no ar, na internet, com login funcionando.

---

## RESUMO — a ordem dos passos

```
0. Instalar Node, Git, Cursor + conta GitHub
1. Notion: importar o roadmap (seu painel de controle)
2. Criar contas: Supabase + Vercel
3. Agente cria o projeto Next.js (você abre no navegador)
4. Supabase: criar banco → copiar 3 chaves → agente cria as 17 tabelas
5. Ligar o login (Auth por e-mail)
6. Deploy na Vercel (app no ar na internet)
```

Ao fim do S1 você tem: **um app no ar, com banco de dados e login funcionando.** Vazio ainda, mas é a fundação sobre a qual todo o resto é construído.

---

## O QUE É SEU vs O QUE É DO AGENTE (pra não travar)

| Tarefa | Quem faz |
|--------|----------|
| Criar contas (Supabase, Vercel, Notion) | **Você** |
| Copiar chaves dos painéis | **Você** |
| Clicar "Deploy", "New Project" | **Você** |
| Aprovar antes de aplicar migration / push | **Você** |
| Escrever código, migrations, configs | **Agente** |
| Rodar comandos no terminal | **Agente** (te mostra) ou você cola pronto |
| Explicar, gerar comando, revisar | **Eu (chat)** |

---

## REGRA DE OURO PRA NÃO SE PERDER

Quando não souber o que fazer, pergunta assim: *"Cláudio, estou no passo X da Parte Y do SETUP-S1, e apareceu isso: [print/erro]. O que faço?"* — e eu te guio do ponto exato.

Nunca rode um comando que você não entendeu sem perguntar. Nunca cole a `service_role key` em lugar que vá pro navegador (ela é secreta).

---

*Fim do guia S1. Próximo guia (S2) só depois que esta fundação estiver no ar.*
