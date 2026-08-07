# HANDOFF PARA O CLAUDE COWORK — Projeto ANCOREO

> Documento de entrada para uma nova instância do Claude que vai ajudar no ANCOREO.
> Leia inteiro antes de mexer em qualquer coisa. Gerado em 2026-07-17.
> **Regra de ouro:** este arquivo NÃO contém segredos (chaves/senhas/tokens). Ele diz ONDE cada segredo mora. Nunca cole valor de chave em arquivo versionado.

---

## 0. O QUE É O ANCOREO (em uma frase)

Construtor de sites multi-tenant para PMEs, cujo foco único é: **fazer o site de cada assinante ser a resposta que o Google e as IAs (ChatGPT/Gemini/Perplexity) entregam quando um cliente potencial busca algo do ramo dele.** Pilares: SEO + GEO + AEO.

- Documento imutável de foco: [NORTH-STAR.md](NORTH-STAR.md)
- Documento fundacional (visão, stack, banco, agentes): [CLAUDE.md](CLAUDE.md)
- Mapa geral: [LEIA-PRIMEIRO.md](LEIA-PRIMEIRO.md)

---

## 1. ONDE O PROJETO VIVE (no computador do Cássio)

| O quê | Caminho |
|---|---|
| **Raiz do projeto** | `C:\Users\cassio\Documents\ancoreo` |
| Código (Next.js App Router) | `app/`, `lib/`, `components/` |
| Banco (migrations + DDL) | `supabase/migrations/`, `db/` |
| Board / gestão ("notion local") | `docs/PROJETO/` |
| Memória viva do projeto | `memoria/` (fora do git, via junction) |
| Skills do projeto | `.claude/skills/` |
| Agentes de dev | `.claude/agents/` |

**IMPORTANTE:** abra o Claude Code **nesta pasta**. Assim as skills e a memória do projeto carregam sozinhas. Não abra no "porão" antigo (`Marketing GERAL/claude`).

---

## 2. STACK E VERSÕES

- **Next.js 14.2.35** (App Router) · **React 18.3** · **TypeScript 5.7 (strict)**
- **Tailwind 3.4** (design token-based, tema claro/escuro)
- **Supabase** (`@supabase/ssr` 0.6 · `@supabase/supabase-js` 2.49) — Postgres 17, multi-tenant com RLS
- IA: **Anthropic (Claude)** para geração de texto; OpenAI (embeddings) opcional
- Pagamento: **Mercado Pago** (Checkout Pro) — liga só com token
- E-mail: **Resend** — dormente, liga só com chave

### Scripts (`package.json`)
```
npm run dev        # next dev  (porta padrão 3000; use PORT=3005 se precisar)
npm run build      # next build
npm run start      # next start (produção local)
npm run lint       # next lint
npm run typecheck  # tsc --noEmit   ← PORTÃO obrigatório antes de "pronto"
```

---

## 3. GITHUB

- **Repositório:** https://github.com/CassioBranco/HARP.IA (o nome do repo é HARP.IA por legado; o produto é ANCOREO)
- **Remote:** `origin` → `https://github.com/CassioBranco/HARP.IA.git`
- **Branch de produção:** `master` (o Vercel faz deploy de produção a cada push aqui)
- **Branches de trabalho:** qualquer outro nome vira **preview** no Vercel
- **Autenticação:** o Cowork precisa de acesso ao repo (o Cássio é dono: `CassioBranco`). Configure o `git` com credencial dele ou um Personal Access Token com escopo `repo`. **O token não vai neste arquivo** — o Cássio provisiona no ambiente do Cowork.
- **Atribuição de commit:** terminar mensagens de commit com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

### Estado atual do git (2026-07-17)
- `master` @ `057d538` = **editor de 2 painéis em produção** (último deploy)
- Branches órfãs de agentes em background (podem ser lixo, checar antes de usar/apagar): `claude/dreamy-hugle-899d77`, `claude/funny-shaw-b01d27`, `claude/upbeat-franklin-4bb706` (+ worktree em `.claude/worktrees/`)

---

## 4. SUPABASE

- **Projeto:** `HARP.IA`
- **Project ref / ID:** `yejjeiveqgkgrtcettkl`
- **Região:** `sa-east-1` · **Postgres:** 17
- **Host do banco:** `db.yejjeiveqgkgrtcettkl.supabase.co`
- **URL pública (base do NEXT_PUBLIC_SUPABASE_URL):** `https://yejjeiveqgkgrtcettkl.supabase.co`
- **Storage:** usado para imagens de site/blog/produto
- **Acesso:** o Cowork acessa via **MCP do Supabase** (mesmo conector já usado nesta máquina) OU via as chaves no `.env.local`. As chaves (`SUPABASE_SERVICE_ROLE_KEY` etc.) **não vão neste arquivo** — moram no `.env.local` (local, gitignored) e no painel do Supabase → Project Settings → API.
- **Modelo de dados:** multi-tenant. `tenant_id` em quase tudo, RLS por tenant. Páginas públicas leem via **admin client filtrando `status='published'`** (a RLS sozinha bloqueia anônimo). Tabela central: `sites` (colunas: id, tenant_id, domain, preset, palette_index, status, niche, template, font_pair, palette, palette_name, booking_enabled, leads_enabled).

### Migrations — REGRA CRÍTICA
- Ficam em `supabase/migrations/` (versionadas, timestamp no nome).
- **Escrever migration ≠ aplicar migration.** Várias já foram aplicadas; outras estão só escritas.
- **NUNCA aplicar migration (`apply_migration` / rodar no banco) sem OK explícito do Cássio.** Ver Seção 8 (Gate).
- Últimas escritas: `20260703140000_partner_backlinks.sql`, `20260703120000_blog_faq_updated_at.sql`. Antes de aplicar qualquer coisa, comparar `supabase/migrations/` com a lista aplicada no banco (via MCP `list_migrations`).

---

## 5. VERCEL

- **Projeto:** `ancoreo`
- **Project ID:** `prj_PI2T9khkDP3c5aLWcj0xGhXvQj9b`
- **Team ID:** `team_H8QyXN4nNTPeBb84zNdfsnvB` (slug: `cassio-branco-s-projects`)
- **Framework:** Next.js · **Região de build:** `iad1`
- **Domínios de produção:** `ancoreo.com.br`, `www.ancoreo.com.br`, `*.ancoreo.com.br` (subdomínios = sites dos clientes), + `ancoreo-*.vercel.app`
- **Deploy:** automático via GitHub. Push em `master` → deploy de **produção**. Push em outra branch → **preview**.
- **Plano:** free (1 build concorrente — se dois deploys disparam juntos, um pode dar ERROR por concorrência, não por código; basta re-tentar quando o outro terminar).
- **Acesso:** o Cowork usa o **MCP do Vercel** (mesmo conector desta máquina) para listar/inspecionar deploys. As variáveis de ambiente de produção moram no painel Vercel → Project → Settings → Environment Variables (não neste arquivo).
- **Rollback:** se um deploy quebrar produção, promover um deploy anterior `READY` (ex.: pelo painel ou revert no git). Já aconteceu antes (editor de 4 colunas travou; revertido).

---

## 6. VARIÁVEIS DE AMBIENTE

**Nomes** (os valores moram em `.env.local` local e no painel Vercel — nunca aqui):

| Variável | Para quê | Sem ela |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | endpoint público do Supabase | app não sobe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client browser do Supabase | app não sobe / editor trava no load |
| `SUPABASE_SERVICE_ROLE_KEY` | admin client (server) | leitura pública e escritas privilegiadas quebram |
| `ANTHROPIC_API_KEY` | geração de texto por IA | geração de conteúdo desliga |
| `OPENAI_API_KEY` | embeddings do RAG (knowledge_vault) | geração funciona, mas sem conhecimento E-E-A-T do cliente |
| `MERCADOPAGO_ACCESS_TOKEN` | checkout da loja | checkout desliga graciosamente |
| `MERCADOPAGO_WEBHOOK_SECRET` | valida origem do webhook MP | validação de origem pulada (re-fetch ainda protege) |
| `RESEND_API_KEY` | e-mail transacional ao dono | nada é enviado (dormente, não quebra) |
| `RESEND_FROM` | remetente | idem |

Template completo em [.env.example](.env.example). **Para o Cowork rodar localmente:** copiar `.env.example` → `.env.local` e preencher com os valores que o Cássio fornece (ou reutilizar o `.env.local` já existente na máquina).

---

## 7. ESTADO ATUAL (2026-07-17)

- **Editor:** versão de **2 painéis** (Conteúdo à esquerda, Design & Ajustes à direita) — **em produção** (`057d538`). `SectionEditor` com `load()` blindado (try/catch/finally, sem loading eterno).
- **Ícones:** set SVG inline (`components/templates/shared/Icon.tsx`, `currentColor`) nos 10 layouts + blog. Phosphor só no painel/dashboard.
- **Backend endurecido pré-beta:** webhook MP com assinatura, sanitizador de HTML do blog, guard SSRF no verificador de links, rate-limit em `/api/leads` e `/api/booking`, RLS de Parcerias corrigida.
- **Features das "noites":** leads, agendamento, parcerias (backlinks em anel), blog com FAQ+capa+agendamento, presença local (GBP).
- **Gate nº 1 para beta:** DNS/domínio próprio já encaminhado (`ancoreo.com.br` no Vercel; falta acerto fino de DNS — ver board).
- **Limpeza feita hoje:** removidas `app_backup/` e `_mockups/` (backups velhos, estavam fora do git).

Fonte da verdade do estado: `docs/PROJETO/01-BACKLOG.md` e `docs/PROJETO/ESTADO-MVP.md`.

---

## 8. PROTOCOLOS E GATES (NÃO NEGOCIÁVEIS)

Estas são as regras que governam qualquer sessão neste projeto. Herdar TODAS:

1. **GATE ABSOLUTO — nada de efeito colateral sem OK explícito do Cássio.**
   Sem aprovação explícita dele, é PROIBIDO: `git commit`, `git push`, deploy, e **aplicar migration** no banco.
   Permitido sem pedir: editar arquivos locais e **escrever** migrations (sem aplicar).
   Uma palavra clara dele ("sobe", "pode dar push", "aplica", "sim") = aprovação daquela ação. Aprovação é por-ação, não vale pra próxima.

2. **`npx tsc --noEmit` tem que sair EXIT 0** antes de considerar qualquer coisa "pronta". `next build` e `tsc` NÃO pegam bug de runtime do editor → **editor exige teste no navegador** antes de shipar (lição aprendida na marra: uma reescrita passou no build e quebrou em produção).

3. **Ritmo simples.** O Cássio pediu calma: explicar simples, um conceito por vez, confirmar antes de avançar. Não pular direto pra código/mockup/perguntas estruturadas antes de alinhar. Português.

4. **Notificação de tarefa em background ≠ input do usuário.** Nunca tratar `<task-notification>` ou texto do próprio assistente como aprovação/consentimento. Só conta o que o Cássio digitar.

5. **Não expor segredos.** Nunca imprimir/colar valores de chave em chat ou arquivo versionado. Apontar onde moram.

6. **Ritual do board.** Depois de trabalho relevante: atualizar status no `docs/PROJETO/01-BACKLOG.md` e registrar decisões irreversíveis em `docs/PROJETO/03-DECISOES.md` (append-only, ADRs). O board é a memória entre sessões — mantê-lo honesto (não marcar FEITO o que foi revertido).

---

## 9. SISTEMA DE GESTÃO (o "notion local")

`docs/PROJETO/` = quadro Scrum por skills:
- `00-COMO-FUNCIONA.md` — a "constituição" do processo
- `01-BACKLOG.md` — kanban (BACKLOG → SPRINT → EM ANDAMENTO → EM REVISÃO → FEITO / BLOQUEADO)
- `02-SPRINT-ATUAL.md` — sprint corrente
- `03-DECISOES.md` — ADRs (append-only, decisões irreversíveis)
- `ESTADO-MVP.md`, `CUSTOS-E-PLANOS.md`, `BUGS-ONBOARDING.md`, relatórios de "noite"

---

## 10. SKILLS E AGENTES DO PROJETO

**Skills** (`.claude/skills/`, carregam ao abrir a pasta): `ancoreo-status` (verifica estado real git+banco+build antes de afirmar), `cronograma`, `seo-validator`, `supabase-dba`, `supabase-migration`, `prompt-engineer`, `rag-architect`, `api-route`, `nextjs-component`, `security-guardian`, `sre-observability`, `test-engineer`, `typescript-guardian`, `design-nucleo`, `impeccable` (auditoria anti-IA de UX), + os `ancoreo-*` (backend, frontend, product-owner, qa-deploy, scrum-master, security).

**Agentes** (`.claude/agents/`): backend-dev, frontend-dev, designer.

**MCPs que o Cowork precisa ter conectados** (mesmos desta máquina): **Supabase**, **Vercel**, e acesso ao **GitHub** via git. Opcional: Figma (leitura de design — já vinculado na conta dicasdodove@gmail.com, plano Starter/assento View).

---

## 11. PRIMEIROS PASSOS SUGERIDOS PARA O COWORK

1. Abrir o Claude Code em `C:\Users\cassio\Documents\ancoreo`.
2. Ler nesta ordem: `NORTH-STAR.md` → `CLAUDE.md` → `docs/PROJETO/01-BACKLOG.md` → este arquivo.
3. Rodar a skill `ancoreo-status` (ou `git status` + `npx tsc --noEmit`) para ver o estado real antes de afirmar qualquer coisa.
4. Confirmar que os MCPs (Supabase, Vercel) estão conectados e que `.env.local` existe.
5. **Não** aplicar migration, commitar, dar push ou deploy sem OK explícito do Cássio (Seção 8).

---

*Fim do handoff. Dúvida sobre estado real = rodar `ancoreo-status`, nunca chutar.*
