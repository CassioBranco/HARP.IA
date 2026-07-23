# Wireframe de referência — Site Builder (protótipo Lovable "Simple Site Studio")

> Capturado do protótipo do Cássio no Lovable em 2026-07-22 (projeto
> `4f5bfb7f-9081-4e47-96d7-4950c79ab95c`). Serve de referência para o
> **cartão 2.1 — Wireframe do site builder** do ANCOREO.
> Régua: funcional e organizado primeiro, beleza depois.

---

## Tela 1 — Seleção de template (entrada do builder)

Cabeçalho: **Website Builder** com tagline **SEO · GEO · AEO**.

Filtros/controles (nesta ordem, topo da tela):
- **Abas de categoria:** Landing Page · E-commerce · Blog · Site Institucional
- **Seletor de estilo:** Minimalista · Bold-Tech · Corporativo-Elegante
- **Cards de template** em grade, cada um com botão **"Editar este modelo"**
- Skeleton loaders (~1,5s) enquanto carrega a grade

Papel no fluxo ANCOREO: é a ponte onboarding → geração. O usuário escolhe
categoria + estilo, a IA gera, e ele cai no editor (tela 2).

---

## Tela 2 — Editor (o núcleo — é o que o ANCOREO precisa ter)

Layout de **3 painéis** + **barra de score no topo**.

### Barra de score SEO/GEO/AEO (topo — elemento âncora do produto)

Alinhada 1:1 ao north-star (SEO + GEO + AEO). Da esquerda pra direita:

| Elemento | Valor no protótipo | Nota |
|---|---|---|
| Círculo grande | **45** — "OTIMIZAÇÃO IA & BUSCA" | score agregado |
| Sub-score 1 | **SEO Traditional — 52** | barra de progresso laranja |
| Sub-score 2 | **GEO Index — 38** | barra de progresso |
| Sub-score 3 | **AEO Readiness — 41** | barra de progresso |
| Botão destaque | **"Melhorar SEO/GEO/AEO com IA"** | ação de 1 clique (optimistic render 45→95) |

Cada sub-score tem tooltip (?) explicando o que é. Toast + indicador de
cache local ao aplicar a melhoria por IA.

Controles auxiliares do topo: alternador de viewport (desktop/tablet/mobile),
toggle **Fácil / Avançado**, undo/redo, **Visualizar**, **Publicar**.

### Painel esquerdo — SEÇÕES PRONTAS (blocos arrastáveis)

"Clique ou arraste uma seção para o seu site. Sem complicação!"
- Cabeçalho com Foto (capa grande / boas-vindas)
- Texto de Apresentação (sobre você/negócio)
- Galeria Simples (várias fotos em grade)
- Lista de Recursos (o que você oferece)
- **Bloco de FAQ (AEO)** — perguntas e respostas para IAs ← camada AEO explícita
- Botão de Contato

### Painel central — CANVAS DE PREVIEW

Área de arrastar-e-soltar ("Arraste e solte um bloco aqui"). Preview vivo
do site sendo montado.

### Painel direito — PROPRIEDADES (edita o bloco selecionado)

Contextual ao bloco (ex.: bloco `hero` selecionado):
- **Mudar Texto Principal** (input) — ex.: "Bem-vindo ao meu site"
- **Texto de Apoio** (textarea) — ex.: "Uma pequena descrição…"
- **Trocar Foto** (upload/clique)
- **Estilo de Cor:** Claro · Escuro · Destaque
- **Tamanho do Bloco:** Pequeno · Médio · Grande
- Modo Fácil/Avançado no rodapé do painel

Rodapé: "Salvo automaticamente há 2 min" · nome da página (Início).

---

## O que trazer disso pro ANCOREO (cartão 2.1)

1. **A barra de score SEO/GEO/AEO no topo do editor** é o diferencial. Hoje o
   editor ANCOREO tem 2 painéis (Conteúdo + Design) sem essa barra. É o item
   mais valioso a portar.
2. **Bloco de FAQ (AEO) como seção de primeira classe** — bate com a memória
   "FAQ = alta pesquisa" e com o north-star AEO.
3. **Painel de PROPRIEDADES contextual** (campos por bloco) — comparar com o
   `SectionEditor` atual, que estava renderizando barras cinzas vazias
   (bug em investigação, ver `docs/PROJETO/PROTOCOLO-DIAGNOSTICO.md`).
4. **Toggle Fácil/Avançado** — progressive disclosure pro dono de PME leigo.
5. Fluxo de entrada por **categoria + estilo** antes de gerar.

> Diferença de stack: o protótipo Lovable é Vite/React/shadcn. O ANCOREO é
> Next.js 14 App Router. Isto aqui é referência de UX/layout, não código a
> copiar.

---

## Versão no Figma (continuação do trabalho — 2026-07-22)

Portei o wireframe pro **Figma Make** (conta do Cássio), gerando uma versão
navegável e já com a **marca ANCOREO**:

- **Arquivo:** "Wireframe editor ANCOREO" — Versão 1 (auto-salvo).
- **URL:** https://www.figma.com/make/ElSAvK6D1j4fxkasZDY0Gp/Wireframe-editor-ANCOREO
- **O que ficou pronto (tela do editor):**
  - Topo: logo ANCOREO + score circular **45/100 "Otimização IA & Busca"** +
    sub-scores **SEO Tradicional 52 · GEO Index 38 · AEO Readiness 41** (com
    barras) + botão **"✨ Melhorar SEO/GEO/AEO com IA"** + alternador
    desktop/tablet/mobile + **Visualizar** + **Publicar**.
  - Esquerda **Seções Prontas**: 6 blocos arrastáveis com handle, FAQ com tag
    **AEO**, botão "+ Nova Seção".
  - Centro **Canvas de Preview**: mockup de browser (`meusite.ancoreo.com.br`),
    seções empilháveis clicáveis, zona de drop "+ Soltar seção aqui",
    Desfazer/Refazer.
  - Direita **Propriedades**: Texto Principal, Texto de Apoio, Trocar Foto,
    Estilo de Cor (Claro/Escuro/Destaque), Tamanho do Bloco (Peq/Méd/Grande).
  - Interativo: clicar em seção da biblioteca adiciona ao canvas; clicar no
    canvas seleciona o bloco e carrega as propriedades.

Próximo passo possível: usar essa tela como espec visual do **cartão 2.1** e
portar a barra de score SEO/GEO/AEO pro editor real (Next.js), que hoje só tem
os 2 painéis Conteúdo + Design, sem a barra.
