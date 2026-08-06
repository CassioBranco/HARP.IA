# Relatório da noite — 2026-07-02

> Trabalho autônomo executado durante a madrugada com permissão completa do
> Cássio. Gates respeitados: **nenhum** commit, push, deploy ou migration
> aplicada — só arquivos locais. Fila detalhada: `NOITE-2026-07-02.md`.

## O que foi feito (N1–N9)

### N1 — Tema claro/escuro + passe minimalista ✅
- Script anti-flash no root layout + `components/ThemeToggle.tsx`
  (localStorage `aco_theme`, respeita prefers-color-scheme).
- Variantes `.dark` pra landing ("carta náutica à noite"), auth, legal,
  consent. Toggle na navbar da landing, auth, legal, painel e galeria.
- Passe minimalista: `.btn-naval`/`.panel-naval` achatados, sombras 5→4px.

### N2 — Onboarding v2 + debug completo como usuário ✅
- `onboarding.css` reescrito token-based ("ficha de bordo" minimal).
- Debug real clicando as 7 telas: perfil salvo no banco ✓, 11 eventos de
  telemetria ✓. **2 bugs corrigidos**: autocomplete de cidades
  (Nominatim → lista IBGE local de 5.571 municípios, busca sem acento) e
  subdomínio harpia.site → ancoreo.com.br.
- Relatório: `BUGS-ONBOARDING.md` (inclui a conta de teste).

### N3 — Painel + editor v2 minimal ✅
- `painel.css` (~330 linhas) e `editor.css` (~200) reescritos token-based:
  superfícies planas 1px, mono nos rótulos, Fraunces nos h1, aura desligada,
  claro/escuro automáticos. ThemeToggle na sidebar.
- Bug consertado: auto-referência `--surf:hsl(var(--surf))` (fundos
  transparentes) + mojibake de encoding (script node com mapa cp1252).

### N4 — Galeria de templates + templates mais arrojados ✅
- **Galeria /templates v2**: papel quente, Fraunces, grade 2 colunas
  (prévia 16:10 grande), **filtro por segmento** (8 chips), botão
  **"Ver prévia"** em nova aba (evento `template_preview` na telemetria).
- **SiteReveal** (novo shared): scroll-reveal estilo Framer nos 10
  templates de cliente — seguro sem JS, respeita reduced-motion; bug de
  mismatch de hidratação achado e corrigido (init pós-load).
- Micro-interações em Clean/Profissional/Conversão (zoom de imagem, lift,
  saturação) — padrões de Framer/Wix/Squarespace.

### N5 — Triangulação de hyperlinks entre artigos ✅
- `lib/seo/triangulation.ts`: clusters por afinidade (keywords PT-BR +
  Jaccard) → **triângulos A→B→C→A** + par bidirecional + 2–4 saídas por
  artigo → **injeção de âncora natural no HTML** (inline no parágrafo que
  menciona o assunto; fallback "Leia também"; idempotente).
- Integrado no `/api/publish/blog`: cada publish triangula o site todo
  (artigo novo + backfill dos antigos).
- Núcleo validado com fixture-test: **13/13 checks**.

### N6 — Personalização do editor ✅
- Auditoria: já havia paleta (19+custom), fontes, troca de modelo, imagens,
  marca e preview mobile — paridade com o essencial do mercado.
- Novo: **botão Desfazer** (histórico de modelo/cor/fonte, padrão Framer).
- Limpeza HARPIA no editor (pássaro→âncora, harp-ia.com→ancoreo.com.br,
  overlay de geração roxo→navy/vermelho) + bug de tema claro (#fff fixo).
- Anotado pro backlog: reordenar/ocultar seções exige refactor dos 10 layouts.

### N7 — Ferramenta de blog ✅
- **Sugestões de links internos** no PostEditor (núcleo do N5 client-side,
  top 3 por afinidade, insere no cursor).
- **SEO score ampliado**: 7 checks ao vivo (título ≤60, meta 80–160,
  600+ palavras, H2, FAQ, link interno…).

### N8 — Agentes e skills internos ✅
- `.claude/agents/`: **ancoreo-designer**, **ancoreo-qa**, **ancoreo-linker**,
  **ancoreo-blogger** + README com regras da casa; `designer.md` antigo
  marcado [SUBSTITUÍDO].
- `.claude/skills/design-nucleo/` — resumo operacional do núcleo v2.

### N9 — Passada final ✅
- `npx tsc --noEmit` verde em todas as etapas.
- `next build` de produção: resultado registrado no fim deste arquivo.

## ⚠️ Gates pra sua aprovação de manhã

1. **Aplicar 2 migrations** (escritas, NÃO aplicadas):
   - `20260702020000_internal_links_triangulation.sql` (kind/context/rendered)
   - `20260702030000_blog_cover_scheduling.sql` (cover_image + scheduled_at)
   O código atual funciona SEM elas — aplicar só destrava observabilidade
   do grafo e capa/agendamento no blog.
2. **Deploy**: nada foi commitado nem deployado. Revisar → commit → deploy.
3. **Wildcard `*.ancoreo.com.br`** (Vercel + Registro.br) pros subdomínios
   dos clientes — sem isso o publish gera domínio que não resolve.
4. **Job de agendamento de posts** (decidir: cron da Vercel?) quando aplicar
   a migration do item 1.
5. **Dados da empresa** pras páginas legais (CNPJ/endereço — placeholders).

## Decisões tomadas (pra você validar)
- Reordenação de seções ficou FORA (refactor grande, risco alto de
  madrugada) — proposta documentada no agente ancoreo-designer/backlog.
- Triangulação roda no publish (site inteiro, idempotente) em vez de job
  separado — mais simples e cobre backfill de graça.
- Injeção de âncora é conservadora: não mexe em headings nem em links
  existentes; sem match seguro, cai no bloco "Leia também".

## Resultado do build de produção
✅ `npm run build` **verde** (exit 0) às ~04h de 2026-07-02. Todas as rotas
compiladas — destaques: /templates 4.87 kB, /editor/[siteId] 11.9 kB,
/onboarding 13.7 kB, shared JS 87.4 kB, middleware 82.3 kB. Nenhum erro
ou warning de compilação.

## Como conferir de manhã
1. `preview_start` (config `ancoreo-dev`, porta 3007) ou `npm run dev -- -p 3007`.
2. Landing → toggle claro/escuro; /templates → filtros + Ver prévia;
   /sites, /settings, /blog nos 2 temas; onboarding com a conta de teste
   (credenciais em BUGS-ONBOARDING.md).
3. Aprovar os gates da seção acima (migrations → commit → deploy → wildcard).
