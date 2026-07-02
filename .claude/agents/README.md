# Agentes do ANCOREO

Operadores especializados invocáveis via Task/Agent. Criados/atualizados na
noite de 2026-07-02 (núcleo de design v2 "Carta Náutica").

## Ativos

| Agente | Papel | Quando usar |
|--------|-------|-------------|
| **ancoreo-designer** | Guardião do núcleo visual v2 (docs/DESIGN-NUCLEO.md) nas telas do produto | Estilizar tela nova, variante claro/escuro, auditoria de consistência |
| **ancoreo-qa** | Debug de fluxo como usuário real no preview (porta 3007) | Antes de entregar mudança de fluxo; relatório em docs/PROJETO/BUGS-*.md |
| **ancoreo-linker** | Triangulação de links internos (lib/seo/triangulation.ts + internal_links) | Grafo de links, órfãos, âncoras contextuais, backfill |
| **ancoreo-blogger** | Pipeline de artigo: geração IA → editor → gate AEO → publish | Melhorar/depurar o fluxo de postagem e o score de SEO |
| frontend-dev | Implementação React/Next de produção | Feature/refactor de UI (o designer propõe, ele implementa) |
| backend-dev | API routes, Supabase, RLS, migrations (escrever, não aplicar) | Lógica de servidor e banco |

## Substituído

- `designer.md` (pré-v2) → usar **ancoreo-designer**. O antigo referencia
  Storybook/paletas-por-nicho/design atômico que não refletem o núcleo atual.

## Regras da casa (valem pra todos)

- Design: seguir `docs/DESIGN-NUCLEO.md`; NADA de liquid-glass/aura (linguagem
  HARPIA rejeitada). Interno = flat minimal; público = impresso naval.
- Banco: migrations são ESCRITAS em supabase/migrations e aplicadas só com
  aprovação do Cássio (mcp apply_migration é gate humano).
- `npx tsc --noEmit` verde antes de dar qualquer item por pronto.
- Deploy/commit/push: só com pedido explícito do Cássio.
