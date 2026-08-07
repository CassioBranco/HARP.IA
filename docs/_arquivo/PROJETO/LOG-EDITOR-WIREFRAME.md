# Log — Porte do wireframe Lovable → editor real (Fase 2.1)

> Registro curto do que foi construído no editor, em ordem. O *código* está no git
> (fonte de verdade dos diffs); aqui fica só o **porquê** e o **estado**, pra qualquer
> sessão futura retomar sem reler tudo. Append-only.

## Slice 1 — Barra de score SEO · GEO · AEO (topo do editor) ✅

- **O quê:** portou o elemento central do wireframe pro editor real: círculo de score
  agregado + 3 sub-scores (SEO / GEO / AEO), calculados AO VIVO do conteúdo do site.
  Botão "Melhorar SEO/GEO/AEO" abre o dropdown com os checks pendentes por dimensão.
- **Arquivos:** `app/(editor)/editor/[siteId]/components/ScoreBar.tsx`,
  `lib/seo/site-score.ts` (motor de 3 dimensões, reusa `lib/seo/score.ts`),
  `app/(editor)/editor.css` (classes `ed-score-*`). Montada em `page.tsx` com
  `refreshKey={previewKey}` (recalcula a cada save/preview).
- **Por que o score do site usa média simples (não ponderada):** os checks de
  `site-score.ts` não têm `weight`, então `computeSeoScore` cai em média simples
  (ok/total). É proposital — a régua ponderada com pesos mora na rota
  `/api/score/[siteId]` (outro consumidor). São dois scorers convivendo de propósito.
- **Estado real medido (site Anteteguemon):** SEO 100 · GEO 83 · AEO 100 · geral 94.
  Único vermelho = GEO "contato": o hero diz "Pedir pelo WhatsApp" mas `cta_phone`
  está vazio, então não há número pra IA citar.

## Slice 2 — Itens pendentes viram acionáveis + fix do telefone ✅

- **O quê:** cada item vermelho do dropdown virou clicável. **Telefone/contato** abre
  um campo inline; ao salvar, grava em `hero.cta_phone` e o score recalcula na hora
  (GEO 83→100, geral 94→100). Os demais itens mostram um "como resolver" apontando o
  painel certo (SEO, Serviços, FAQ, Blog).
- **Decisão de produto:** o botão NÃO finge que a IA adivinha dado do dono. Item que só
  o dono sabe (telefone) = campo pra digitar; item que a IA consegue escrever
  (descrição, FAQ) = gerador de IA (próximo passo, endpoints `generate-description` e
  `generate-faq` já existem).
- **Caminho de escrita:** client Supabase (`createBrowserClient`) com
  `update(content).eq('page_id', …).eq('section_type','hero')` — MESMO caminho do
  `useEditBridge`/`SectionEditor`, protegido por RLS por tenant. Sem rota nova.
- **Regex do telefone** mantida em sincronia com o check `contato` de `site-score.ts`.
- **Arquivos:** `ScoreBar.tsx` (fixer inline), `editor.css` (classes `ed-score-fix-*`).
- **Verificação:** `npx tsc --noEmit` exit 0. Preview visual pendente (servidor de dev
  bloqueado nesta sessão — ver `docs/DEV-LOGIN.md` pra rodar local).

## Ferramenta de apoio criada nesta fase

- **`/dev-login`** (`app/dev-login/route.ts`) — atalho de teste local sem senha, 404
  fora de `development`. Detalhes em `docs/DEV-LOGIN.md`.

## Próximo passo aberto

- Plugar "Gerar com IA" no mesmo dropdown para o item GEO "descrição" (chama
  `generate-description`, mostra preview, grava em `about.body` após aprovar).
