# ANCOREO — Sistema de Gestão do Projeto (Scrum por Skills)

> 👉 **Onde estamos AGORA + próximos passos: `PAINEL.md`** (leia esse primeiro).
> Este arquivo aqui é só o **ritual** — como o projeto é tocado.
>
> **Por que isso existe:** garantir que nenhuma sessão de trabalho se perca ou se
> contradiga. Toda decisão e todo progresso ficam aqui, versionados no git.
> Esta pasta é a **fonte única da verdade** do desenvolvimento do ANCOREO.

---

## A regra de ouro (o ritual)

Qualquer trabalho no ANCOREO segue 3 passos, sempre nesta ordem:

1. **LER antes de agir** → abrir `02-SPRINT-ATUAL.md` (o que fazer agora) e
   `03-DECISOES.md` (o que já está decidido e não se rediscute).
2. **AGIR** → executar a tarefa como o cargo responsável (ver skills abaixo).
3. **ESCREVER depois** → atualizar o status do cartão no `01-BACKLOG.md` e, se
   tomou uma decisão nova/irreversível, registrar em `03-DECISOES.md`.

Se o passo 3 não foi feito, **a tarefa não está concluída.**

---

## Os arquivos (a "base de dados")

| Arquivo | É o quê | Quem manda nele |
|---|---|---|
| `00-COMO-FUNCIONA.md` | Este guia (a constituição) | Scrum Master |
| `01-BACKLOG.md` | Todos os cartões + status (o quadro Kanban) | Product Owner |
| `02-SPRINT-ATUAL.md` | O foco da semana (recorte do backlog) | Scrum Master |
| `03-DECISOES.md` | Decisões travadas — não se rediscutem | todos (append-only) |

---

## Os cargos (skills em `.claude/skills/`)

| Skill | Cargo | Função |
|---|---|---|
| `ancoreo-scrum-master` | 🧭 Scrum Master | Lê o quadro, escolhe o próximo cartão, chama o especialista, fecha o cartão. É o maestro. |
| `ancoreo-product-owner` | 📋 Product Owner | Dono do backlog e das prioridades. Decide o que entra na sprint e a ordem. |
| `ancoreo-backend` | 🔧 Backend | Banco (Supabase/RLS), server actions, APIs, pagamentos, telemetria. |
| `ancoreo-frontend` | 🎨 Front (handoff Design) | Estrutura/esqueletos do front. O **visual** é do Claude Design — esta skill prepara o terreno e integra. |
| `ancoreo-qa-deploy` | 🧪 QA & Deploy | `tsc`, testes, revisão de diff, build na Vercel, migrações. Último portão antes de fechar. |

---

## Status possíveis de um cartão

`📥 BACKLOG` → `🎯 SPRINT` → `🔨 EM ANDAMENTO` → `👀 EM REVISÃO` → `✅ FEITO`
(ou `🚫 BLOQUEADO` quando depende de algo externo — sempre anotar do que depende).

---

## Portões de aprovação humana (NUNCA pular)

`commit`, `push`, `deploy` e `migration_apply` exigem **OK explícito do Cássio**.
Segredos (ANTHROPIC / OPENAI / service_role / MERCADOPAGO) **nunca** são expostos.

---

## Comunicação

Ritmo simples: explicar claro, um conceito por vez, confirmar antes de avançar.
O design visual é responsabilidade do **Claude Design** (Cássio cuida).
