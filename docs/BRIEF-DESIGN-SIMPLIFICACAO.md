# Brief de Design — Simplificar o painel HARPIA pro público leigo

> Para: Claude Design
> De: Cássio (via Claude Code)
> Data: 2026-06-17
> Escopo: **interface da plataforma** (painel, editor, onboarding). **NÃO** os templates de site dos clientes.

---

## 1. O problema (feedback real de usuário)

Um usuário testou e resumiu: *"as transições e a interface estão duras, a densidade é alta demais, os itens e textos parecem grandes."* Ele viu num desktop 1080p, 24".

Diagnóstico de UX (Claude Code, olhando o CSS): **o problema não é tamanho de fonte — é peso visual e densidade decorativa.** O público da plataforma é dono de negócio local (academia, clínica, salão, restaurante), **não é técnico**. A interface atual é bonita, mas "impressiona" quando devia "acalmar". Para esse público, cada elemento decorativo é uma decisão a mais que o cérebro precisa processar.

## 2. Evidências concretas (do `painel.css` / `editor.css` / `onboarding.css`)

O tema é "liquid glass" escuro (`--pbg:#0b1426`), e quase todo elemento carrega múltiplas camadas visuais:

- **Quadradinhos de ícone com gradiente por toda parte** (40–54px): `.stat .si`, `.ai-banner .ic`, `.plan-now .ic`, `.sess .si`, `.newcard .plus`, `.empty-hero .bigic`. São dezenas de "azulejos" gradiente competindo por atenção.
- **4 cores de destaque** disputando: azul (`#3b82f6`), teal (`#16a8c0`), âmbar (`#f5a30a`), violeta (`#7c6df0`). Sem hierarquia clara de quando usar cada uma.
- **Sombras e brilhos empilhados** em quase tudo: botões têm 4 box-shadows (`inset` + `inset` + drop + drop), cards têm `0 24px 50px` + `inset`. Pesa.
- **Cards grandes**: `.card` padding `1.5rem`, raio `18px`, blur `20px saturate(160%)`. Cada item ocupa muito e "flutua".
- **Densidade alta**: muitos blocos colados (banners, stats, toolbars, listas) sem respiro entre eles.

## 3. A direção que eu recomendo

Inverter o princípio: de **"impressionar"** para **"sumir e deixar o trabalho aparecer"**. Referência mental: painel do **Stripe (modo claro)**, **Notion**, **Linear** — calmos, planos, com muito espaço em branco e UMA cor de destaque.

Pontos concretos pra decidir (são SUAS decisões de identidade, eu só aponto):

1. **Fundo claro?** Avaliar migrar o painel pra fundo claro/neutro. Escuro + glass é "techie"; o público é leigo. (Se mantiver escuro, reduzir drasticamente o glass.)
2. **Uma cor de destaque.** Eleger o azul como única cor de ação. Teal/âmbar/violeta viram exceções pontuais (sucesso, alerta), não decoração.
3. **Achatar.** Menos sombra, menos blur, menos gradiente. Borda fina + leve elevação em vez de "vidro flutuante".
4. **Menos azulejos de ícone.** Ícone simples, monocromático, alinhado ao texto — não um quadrado gradiente de 46px pra cada coisa.
5. **Mais respiro.** Aumentar o espaço entre blocos; reduzir o "peso" de cada card (padding/sombra/raio menores e mais consistentes).
6. **Escala tipográfica mais suave.** Definir 4–5 tamanhos fixos e usar só eles (hoje há muitos `.xx rem` espalhados).

## 4. Como eu preciso receber (pra aplicar sem reescrever seu design)

O ideal é você me entregar **tokens**, não telas refeitas — assim eu aplico no CSS existente sem quebrar a estrutura:

- **Paleta final** (fundo, superfície, texto, muted, linha, 1 cor de destaque + estados de sucesso/alerta/erro).
- **Escala tipográfica** (ex.: 12 / 14 / 16 / 20 / 28px, com peso e uso de cada um).
- **Espaçamento** (escala: 4 / 8 / 12 / 16 / 24 / 32…).
- **Raio, borda e sombra** padrão (1 nível de elevação, não 4).
- **Regra dos ícones** (tamanho, cor, quando usar fundo).
- 1 print/mockup de **uma tela de referência** (ex.: "Meus sites" ou o editor) mostrando a nova densidade. O resto eu replico seguindo os tokens.

## 5. O que NÃO mudar

- **Os templates de site dos clientes** (`components/templates/layouts/*`) — são o produto final, têm outra lógica e estão fora deste brief.
- A **estrutura/funcionalidade** do painel (navegação, fluxos, o que cada tela faz). É só a camada visual.
- Os **componentes protegidos** (`components/atoms/`, `molecules/`) sem combinar antes.

## 6. Arquivos que recebem o resultado

- `app/(dashboard)/painel.css` — painel (dashboard, blog, settings, métricas, editor de post)
- `app/(editor)/editor.css` — editor de site
- `app/onboarding/onboarding.css` — onboarding
- tokens base em `app/globals.css`

---

**Resumo numa frase:** mais simples, mais claro, mais respiro, uma cor só — calmo pra um dono de negócio que não é de tecnologia. Me manda os tokens e eu aplico.
