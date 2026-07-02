# ANCOREO — Núcleo de Design "Carta Náutica" (v2, do zero)

> Fonte de verdade do visual. Toda tela nova (ou retrabalhada) segue esta cartilha.
> Definido por Cássio (2026-07-01): **azul naval + vermelho + branco**, tema náutico
> que mescla moderno com skeuomorfismo vintage naval — **sutil**, nunca fantasiado.
> **v2:** núcleo construído DO ZERO pro ANCOREO. Nada da linguagem HARPIA
> (liquid-glass, aura com blur, cards translúcidos flutuando) é reaproveitado.

---

## 1. Conceito

**Impresso naval vintage + editorial moderno.** A referência não é "SaaS escuro com
gradiente", é *material impresso de navegação*: carta náutica, bilhete de embarque,
carimbo postal, manifesto de bordo — executado com o rigor de um editorial
contemporâneo (grid, tipografia forte, respiro).

- **Superfícies públicas (landing, legal, auth)** = papel quente, tinta navy, sinais vermelhos.
- **Superfícies internas (painel, editor, onboarding)** = navy noturno "ponte de comando"
  (migração pendente pra v2 — hoje ainda estão na recolorização provisória).

## 2. Paleta

| Token | Valor | Uso |
|---|---|---|
| Tinta navy | `#0A2239` | texto, bordas, fundos escuros, primário |
| Tinta diluída | `#3D5570` | texto secundário |
| Vermelho sinal | `#D7263D` (HSL `352 68% 50%`) | CTA principal, selos, flâmulas, acentos |
| Vermelho escuro | `#A81B2E` | borda/base do vermelho |
| Papel quente | `#F7F4ED` (HSL `42 33% 96%`) | fundo claro — **NUNCA branco-azulado frio** |
| Branco papel | `#FFFDF9` | cards sobre papel |
| Linha | `rgba(10,34,57,.16)` | réguas e tracejados |

Regra de ouro: **vermelho é escasso** — 1 CTA quente por viewport. O papel quente é o
que separa o vintage do clínico.

## 3. Tipografia (a alma do núcleo)

| Papel | Fonte | Var | Uso |
|---|---|---|---|
| Display | **Fraunces** (serif vintage, itálico expressivo) | `--font-display` | h1/h2/h3 públicos, números grandes, preços |
| Técnica | **IBM Plex Mono** (caixa alta + tracking .08em) | `--font-mono` | eyebrows, labels, botões, microcopy, coordenadas |
| UI/corpo | **Inter** | `--font-body` | parágrafos e interface |
| Painel | **Plus Jakarta Sans** | `--font-heading` | headings do painel (legado, até migrar) |

O contraste Fraunces (humanista, vintage) × Plex Mono (instrumento) × Inter (neutro)
é o que dá a voz. Itálico do Fraunces em vermelho = palavra de ênfase no hero.

## 4. Dispositivos visuais canônicos

1. **Borda sólida 2px navy + sombra dura deslocada** (`5px 5px 0 #0A2239`) — todo card,
   janela, botão. É a linguagem "carimbo/impresso". Hover: translate(-2px,-2px) e sombra 7px.
2. **Réguas editoriais** — `border-top: 2px solid` separando linhas de conteúdo (manifesto, FAQ).
3. **Tracejados** — `dashed` pra divisórias internas (rota na carta).
4. **Numerais vazados** — Fraunces + `-webkit-text-stroke`, fill transparente (01/02/03).
5. **Selo/carimbo circular** — círculo 2px + anel interno tracejado, rotacionado ~-7°,
   texto mono (selos SEO/GEO/AEO, carimbo postal de score com textPath).
6. **Flâmula (pennant)** — badge com `clip-path` de bandeirola (Mais popular).
7. **Letreiro de rumo (marquee)** — faixa vermelha com texto mono branco correndo.
8. **Borda escalopada** — transição de/para bandas navy (radial-gradient repetido).
9. **Coordenadas** — microcopy mono tipo `27°05′S · 52°37′W` como detalhe de canto.
10. **Farol** — conic-gradient de feixe de luz nas bandas navy de CTA.

O que **NÃO** fazer: liquid-glass, blur pesado, gradientes multicolor, aura animada,
madeira/corda 3D, sino, timão, serifa pirata. Cantos: raio pequeno (6–12px), nunca pill
em cards (pill só em tags).

## 5. Componentes

- `.anc .btn` (papel) / `.btn.red` (sinal) / `.btn.ghost` — mono caixa alta, tecla de impresso.
- `.anc .window` — janela de browser 2px + sombra dura (demo de site de cliente).
- Tokens shadcn em `globals.css` (papel quente/navy/vermelho) — auth e telas Tailwind
  herdam automático; `.panel-naval`/`.btn-naval` seguem valendo lá.
- Banner de consentimento (`consent.css`) já está na linguagem v2.

## 6. Copy náutica (regra do Cássio)

Metáforas navais **pontuais** — 2 a 3 por página, nos pontos de maior leitura.
Aprovadas: "7 dias pra zarpar", "seu cliente está navegando agora", "negócios que não
encalham na busca", "três rumos". Nunca em texto corrido denso.

## 7. Estado da migração (2026-07-01)

- [x] Tokens `globals.css` v2 (papel quente + navy + vermelho, radius menor)
- [x] Fontes: Fraunces + IBM Plex Mono adicionadas no root layout
- [x] **Landing do zero** (`app/page.tsx` + `app/landing.css`, escopo `.anc`)
- [x] Banner de consentimento v2
- [x] Auth: fundo papel (`auth.css`) — cards herdam tokens; revisar detalhes na fase auth
- [ ] Onboarding (`onboarding.css`) — refazer na linguagem v2 (ponte de comando)
- [ ] Painel (`painel.css`) — hoje é recolorização provisória; migrar pra v2
- [ ] Editor (`editor.css`) — migrar pra v2
- [ ] Galeria de templates (`escolher-modelo.css`)
- [ ] Templates dos sites de clientes (4 visuais arrojados) — fase própria
- [ ] Páginas legais: alinhar acentos ao papel quente (hoje neutras, ok provisório)
