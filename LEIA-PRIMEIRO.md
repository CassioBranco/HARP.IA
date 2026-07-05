# ANCOREO — Mapa do Projeto (leia primeiro)

> Casa única e organizada do projeto ANCOREO. Tudo que é ANCOREO mora aqui.
> Reorganizado em 2026-06-26: erguido pra fora do "porão" (`Marketing GERAL/claude`) pra esta pasta dedicada.

## ⚡ Como abrir (importante)
Abra o Claude Code **nesta pasta** (`C:\Users\cassio\Documents\ancoreo`), não no porão antigo.
Assim, toda sessão já carrega: as skills do projeto + a memória do projeto. Fim do "começar do zero".

## 🧭 Onde está cada coisa

| O quê | Onde | Observação |
|-------|------|-----------|
| **Documento fundacional** | [CLAUDE.md](CLAUDE.md) | Visão, stack, banco, agentes, decisões. Ler antes de mexer. |
| **Foco imutável** | [NORTH-STAR.md](NORTH-STAR.md) | SEO + GEO + AEO. Filtro de toda feature. |
| **Roadmap / cronograma** | [docs/CRONOGRAMA.md](docs/CRONOGRAMA.md) | Onde viemos, onde estamos, o que falta. Fonte da verdade do estado. |
| **Handoff** | [HANDOFF.md](HANDOFF.md) | Estado de entrega entre sessões. |
| **Memória viva** | `memoria/` | Fatos do projeto. O Claude lê/escreve aqui (via junction). Fora do git. |
| **Skills do projeto** | `.claude/skills/` | 13 skills. Carregam sozinhas ao abrir aqui. |
| **Agentes de dev** | `.claude/agents/` | backend-dev, frontend-dev, designer |
| **Comandos** | `.claude/commands/` | new-component, new-migration, new-prompt |
| **Código (Next.js)** | `app/`, `lib/`, `components/` | App Router + libs |
| **Banco** | `supabase/`, `db/` | Migrations versionadas + DDL |
| **Regras de arquitetura** | `docs/AEO-ARCHITECTURE-RULES.md`, `docs/NICHOS.md` | 8 regras AEO + nichos regulados |

## 🛠️ Skills do projeto (atalhos de fluxo)
Mais usadas:
- **`cronograma`** — "onde estamos / o que falta" (e atualiza o CRONOGRAMA.md)
- **`ancoreo-status`** — verifica o estado real (git + banco + build) antes de afirmar algo
- **`seo-validator`** — última barreira antes de publicar conteúdo
- **`supabase-dba`** / **`supabase-migration`** — schema, RLS, migrations
- **`prompt-engineer`** — prompts dos agentes (Blocos 0–13)
- **`rag-architect`** — knowledge_vault / embeddings
- demais: api-route, nextjs-component, security-guardian, sre-observability, test-engineer, typescript-guardian

## 🔌 Infra (fatos rápidos)
- **Repo git:** github.com/CassioBranco/HARP.IA (deploy puxa daqui — mover a pasta não afeta)
- **Deploy:** harp-ia.vercel.app (Vercel, via GitHub)
- **Banco:** Supabase (multi-tenant + RLS)
- **Gate nº 1 pra beta:** DNS/domínio próprio (Sprint S13) — ver CRONOGRAMA.md

## 📌 Como a memória funciona agora
- A pasta `memoria/` é a **fonte única**.
- O harness procura a memória em `~/.claude/projects/C--Users-cassio-Desktop-ANCOREO/memory`, que é uma **junction** apontando pra `memoria/`. Ou seja: o que o Claude lê/escreve cai aqui, versionável e visível.
- Memória de **outros projetos** (SUORT, Encontro do Mundo, pipeline Dove) continua no porão antigo — não se mistura mais com ANCOREO.
