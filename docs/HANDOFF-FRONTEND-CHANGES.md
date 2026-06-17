# Handoff pro Claude Design — mudanças no front-end (jun/2026)

> De: Claude Code (back-end). Pra: Claude Design (front-end).
> Contexto: mexi em arquivos da sua camada por necessidade técnica (perf, bug, feature).
> Abaixo, tudo que toquei no front, separado por **precisa da sua atenção** vs **só pra ciência (visual idêntico)**.

---

## 🔴 PRECISA DO SEU OLHAR (UI nova com estilo provisório)

### 1. Editor — overlay de "gerando site com IA"
- **Arquivo:** `app/(editor)/editor/[siteId]/page.tsx`
- **O que é:** quando o cliente abre um site recém-criado (ainda sem conteúdo), o editor agora **dispara a geração automaticamente** e mostra um overlay sobre o preview: ícone de estrelinha + "A IA está escrevendo seu site…" (estado de erro tem ícone de aviso + botão "Tentar de novo").
- **Status do estilo:** fiz com **inline styles provisórios** (fundo `rgba(11,20,38,.82)` + blur, ícone `ph-sparkle ai-spark`, texto Plus Jakarta). **Funciona, mas é placeholder.** Se quiser desenhar esse estado de loading/erro direito (animação, copy, identidade), é todo seu.

### 2. Selo de IA padronizado (estrelinha)
- **Arquivos:** `components/draft/AiHelp.tsx` (componentes `AiSpark` + `AiHelp`) e estilos `.ai-spark` / `.ai-help` em `app/globals.css`.
- **O que é:** unifiquei o ícone de IA (antes era um mix de ✨, varinha e sparkle) numa **estrelinha com gradiente** (`linear-gradient(135deg,#7c6df0,#3b82f6,#16a8c0)`) + uma pill "A IA pode ajudar". Aplicado em: onboarding (campo "Sobre" e botão gerar), editor (Preencher tudo / Reescrever / Página toda), blog (card e modal), imagens (alt text).
- **Status:** funcional e consistente, mas **a cor/forma do selo é sua decisão** — principalmente como a estrelinha gradiente fica sobre o **botão âmbar** ("Gerar meu site"). Se destoar, ajuste.

---

## 🟡 SÓ PRA CIÊNCIA (visual idêntico — não precisa fazer nada)

### 3. Fontes agora vêm do `next/font` (não mais do Google CDN)
- **Arquivos:** `app/layout.tsx`, `app/(dashboard)/painel.css`, `app/onboarding/onboarding.css`, `app/landing.css`, `app/templates/escolher-modelo.css`
- **O que mudou:** as 4 folhas de estilo faziam `@import` das fontes (Inter + Plus Jakarta) do Google CDN, **em duplicidade** com o `next/font` que já as self-hosta. Removi os `@import`; as famílias literais agora resolvem via `var(--font-heading)` / `var(--font-body)`, com o nome literal só como fallback.
- **Impacto visual:** **nenhum** — mesmas fontes, mesmos pesos (liberei a faixa 500–800 da Plus Jakarta no `next/font`). Só ganho de performance. O `onboarding.css` mantém o `@import` apenas do JetBrains Mono.

### 4. Painéis mortos removidos
- **Arquivos deletados:** `app/(editor)/editor/[siteId]/components/panels/BlogPanel.tsx`, `MetricsPanel.tsx`, `AccountPanel.tsx`
- **O que é:** código morto (não eram mais renderizados — o editor usa páginas dedicadas pra blog/métricas/conta). Removidos. Sem efeito visual.

### 5. Onboarding — raio de MEI/micro limitado a 30 km
- **Arquivo:** `app/onboarding/page.tsx` (tela 4, slider de raio de atuação)
- **O que mudou:** o slider ia até 80 km; agora o **máximo é 30 km** para porte MEI/micro (regra de negócio). Só mudou o `max` do slider e a trava — o visual do componente é o mesmo.

---

## Observação geral
Nada disso mexeu na **estrutura/identidade** do design — só perf, um bug de fonte e a feature de auto-geração. O brief de simplificação (densidade, cores, escala) continua sendo o trabalho principal seu: ver `docs/BRIEF-DESIGN-SIMPLIFICACAO.md`.
