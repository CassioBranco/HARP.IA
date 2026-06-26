# ANCOREO — Contexto pro novo chat (leia isto primeiro)

> Cole/abra este arquivo no início de uma nova sessão. Resume o essencial pra continuar sem se perder.
> Datado: 2026-06-26.

## Em uma frase
ANCOREO é um SaaS brasileiro que gera sites com o melhor SEO/GEO/AEO do mercado pra PMEs locais. O produto **funciona ponta a ponta em produção**, mas **a beta ainda não foi aberta** — falta o gate de DNS.

## Quem é quem
- **Anderson Dove** — dono do produto/visão (Método CPF, 100% orgânico).
- **Cássio** (você fala com ele) — operador técnico, orquestra os agentes de dev.
- **Fronteira:** front-end visual = **Claude Design**; back-end/lógica = **Claude Code**. Não reescrever o design do Cássio.

## North Star (imutável)
O site do assinante tem que ser a **resposta** que o Google E as LLMs entregam quando o cliente dele busca. Tríade: SEO + GEO + AEO. Filtro de toda feature: "isso ajuda o site a aparecer na busca/na LLM?".

## Onde está a verdade do projeto
1. **`docs/CRONOGRAMA.md`** — status real por Fase/Sprint (a versão verdadeira; o Notion está todo "A fazer" e NÃO reflete a realidade).
2. **git** — o que foi construído (89 commits, 04/06→hoje).
3. **`CLAUDE.md`** — documento fundacional + log de decisões (não reabrir decisões de lá).
4. **Banco ao vivo** (Supabase MCP, project `yejjeiveqgkgrtcettkl`) — confirma o que roda de verdade.
5. **Skills:** `cronograma` (jornada/onde estamos) e `ancoreo-status` (verificação técnica pontual).

## Estado real (2026-06-26)
- **Pronto:** Fase A (planejamento), Fase B (protótipos base), e a maior parte da Fase C — S1 infra, S2 onboarding (gate 75%), S3 templates, S4 motor IA, S5 pipeline de publicação, S6 blog, S7 GBP níveis 1–2, S8 score, S11 landing, S12 quotas.
- **Banco:** 9 tenants / 1 user / 6 sites / 30 sections / 16 gerações → pipeline roda. Vazios: blog_posts, gbp_posts, internal_links, knowledge_vault (features existem mas não exercitadas; RAG desligado).
- **Feito nesta semana:** service_role rotacionada, rename HARPIA→ANCOREO, gate onboarding 75% (assume Google Meu Negócio vinculado), fix do bug de apagar conta (FK cascade), pesquisa de SEO geográfico programático.

## Próximo passo que importa (pra abrir a beta)
1. 🔴 **DNS / domínio** (S13) — registrar + wildcard no Vercel. Gargalo nº 1.
2. 🔴 **Fluid Compute** na Vercel (toggle, precisa Pro).
3. 🔴 **OPENAI_API_KEY** (RAG) — ligar e testar.
Depois: redesign visual (Claude Design) + backlog de produto (ver fim do CRONOGRAMA.md).

## Regras de trabalho com o Cássio (importantes)
- **Ritmo simples:** explicar simples, 1 conceito por vez, confirmar antes de avançar. Não pular pra código/mockup sem alinhar.
- **Segurança:** nunca expor/ler valores de segredos (ANTHROPIC/OPENAI/service_role). Nunca pôr `sb_secret_` em var `NEXT_PUBLIC_` (é bloqueada no browser).
- **Migrations ao vivo só com OK do Cássio.** Pergunte antes de apagar tabela/campo (banco não tem undo).
- **Não inventar status:** sempre conferir git/banco/deploy antes de dizer "pronto" ou "falta" (use a skill `cronograma`).

## Pendência aberta sobre o Notion
O Notion (workspace local do Cássio, 2 visões: "HARPIA-roadmap" e "Roadmap — Site Builder Dove") está com TODOS os itens em "A fazer", desatualizado. A integração Notion em nuvem conectada (workspace "Dicas do Dove") NÃO enxerga essas páginas. Se for pra atualizar o Notion, é via controle de tela (app local) ou compartilhando as páginas com a integração.
