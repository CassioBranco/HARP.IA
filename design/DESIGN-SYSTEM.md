# SISTEMA VISUAL — Projeto ANCOREO
> Fundação de design. Define a identidade da plataforma (painel) e a arquitetura de paletas por nicho (sites gerados).
> A identidade visual é calibrável (vive em tokens/CSS variables — troca sem reescrever código). O que importa agora é a ESTRUTURA.
> Última atualização: 2026-06-04

---

## 1. DOIS SISTEMAS VISUAIS (não confundir)

| Sistema | Onde aparece | Tokens |
|---------|-------------|--------|
| **Plataforma (painel)** | App que o assinante usa (dashboard, onboarding, editor) | Variáveis shadcn (`--background`, `--primary`...) em `globals.css` |
| **Sites gerados (nichos)** | Os sites que a IA cria pros clientes | Variáveis `--color-*` por nicho em `design/paletas/{niche}-{0\|1\|2}.css` |

A plataforma tem **uma** identidade (a marca ANCOREO). Cada nicho tem **3 paletas** (cliente escolhe no onboarding).

---

## 2. IDENTIDADE DA PLATAFORMA (marca ANCOREO — v1)

**Conceito:** autoridade orgânica. ANCOREO é o predador de topo da busca — visão aguçada, presença confiável. Para um público B2B local, precisa transmitir **confiança + modernidade + competência**, sem ser frio nem genérico.

**Direção visual:**
- **Base:** verde-floresta profundo (quase preto esverdeado) — autoridade, "orgânico"
- **Primária:** esmeralda — crescimento, posicionamento orgânico (o que o produto entrega)
- **Acento:** dourado/âmbar — o olho da ancoreo, calor brasileiro, o "pop" de destaque (CTAs, badges)
- **Neutros:** cinzas levemente esverdeados (não cinza morto)

Por que não azul: todo SaaS é azul. Esmeralda + dourado sobre floresta é distinto, on-brand (orgânico + predador) e memorável.

> ⚠️ Cores são v1, ajustáveis. A ESTRUTURA (tokens, light/dark, escala) é o que fica.

---

## 3. TIPOGRAFIA

| Uso | Fonte | Por quê |
|-----|-------|---------|
| **Títulos (headings)** | Plus Jakarta Sans | Moderna, geométrica, com personalidade — profissional sem ser corporativa |
| **Corpo (body/UI)** | Inter | Padrão-ouro de legibilidade em tela, neutra, escala bem |

- Ambas grátis (Google Fonts), via `next/font` (performático, sem layout shift)
- Escala de títulos: H1 clamp(2rem, 4vw, 3rem) · H2 1.875rem · H3 1.5rem
- Corpo: 16px desktop / 15px mobile · line-height 1.6 (corpo), 1.2 (títulos)
- Peso: títulos 600-700, corpo 400-500

---

## 4. TOKENS DE FORMA (não-cor)

- **Raio de borda:** 10px (`--radius: 0.625rem`) — moderno, suave, não infantil
- **Espaçamento:** escala Tailwind padrão (múltiplos de 4px)
- **Sombras:** sutis, em camadas (sm/md/lg) — nunca sombra preta dura
  - sm: `0 1px 2px rgb(0 0 0 / 0.04)`
  - md: `0 4px 12px rgb(0 0 0 / 0.06)`
  - lg: `0 12px 32px rgb(0 0 0 / 0.08)`
- **Motion:** transições 150-200ms ease-out (hover, focus). Respeitar `prefers-reduced-motion`.

---

## 5. ACESSIBILIDADE (inegociável)

- Contraste WCAG AA: 4.5:1 texto normal, 3:1 texto grande
- Focus ring visível em tudo que é interativo (`--ring`)
- Estados explícitos: hover / focus / active / disabled
- Dark mode nativo (a plataforma já nasce com os dois)

---

## 6. ARQUITETURA DE PALETAS POR NICHO

Cada nicho tem identidade visual própria (o vibe do negócio). 3 variações por nicho.

**Profissões reguladas**

| Nicho | Vibe | Cor dominante |
|-------|------|---------------|
| Advocacia | Autoridade, sobriedade, confiança | Azul-marinho + dourado |
| Contabilidade | Precisão, seriedade, solidez | Azul-escuro + verde-discreto |
| Psicologia | Acolhimento, calma, segurança | Verde-sálvia + bege-quente |

**Saúde**

| Nicho | Vibe | Cor dominante |
|-------|------|---------------|
| Clínica | Calmo, confiável, limpo | Teal (azul-esverdeado) |
| Odontologia | Limpeza, claridade, saúde | Branco + azul-claro |
| Fisioterapia | Movimento, recuperação, energia | Verde-claro + branco |
| Veterinária | Natureza, cuidado, carinho | Verde + laranja-suave |

**Outros**

| Nicho | Vibe | Cor dominante |
|-------|------|---------------|
| Restaurante | Apetitoso, acolhedor, sensorial | Terracota + dourado |
| Imobiliária | Sólido, premium | Grafite + dourado |
| Salão | Aspiracional, próximo | Rosé + nude |
| Escola | Vibrante, confiável | Azul vivo + amarelo |
| Serviços | Versátil, profissional | Azul-petróleo |
| Institucional | Neutro, sério | Cinza-azulado |
| Landing | Contraste forte, conversão | Preto + 1 acento |

Cada paleta define 7 variáveis (ver arquivos `design/paletas/`):
`--color-primary` `--color-secondary` `--color-accent` `--color-background` `--color-surface` `--color-text` `--color-text-muted`

Exemplos prontos: `clinica-0.css`, `restaurante-0.css`. As outras seguem o mesmo molde.

---

## 7. COMO IMPLEMENTAR (ordem)

1. **Plataforma primeiro** — tokens da marca em `globals.css` (via `_platform.css`) + fontes via `next/font` + `tailwind.config.ts` referenciando as variáveis
2. **Componentes base** (shadcn) herdam os tokens automaticamente — botão, card, input
3. **Paletas de nicho** — entram quando construirmos os 8 templates (Sprint S3)

O `frontend-dev`/Cursor implementa; este doc + os arquivos CSS são a fonte de verdade do visual.
