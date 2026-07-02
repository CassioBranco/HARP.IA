---
name: design-nucleo
description: Regras do núcleo de design v2 "Carta Náutica" do ANCOREO. Use SEMPRE antes de estilizar qualquer tela do produto (landing, auth, onboarding, painel, editor, galeria) — carrega paleta, tipografia, dispositivos e as proibições. NÃO vale pros templates de site de cliente (identidade própria por layout).
---

# Núcleo de design v2 — Carta Náutica

Fonte completa: `docs/DESIGN-NUCLEO.md` (ler pra decisões finas). Este é o
resumo operacional que evita os erros já cometidos e rejeitados.

## Paleta (tokens HSL em app/globals.css)
- Papel quente `#F7F4ED` (claro) / navy noturno `#0B1F35` (.dark) — NUNCA
  branco-azulado frio.
- Tinta navy `#0A2239` = cor primária de texto/superfícies fortes.
- Vermelho de sinal `#D7263D` = accent ESCASSO (ação, destaque, 1 elemento
  por dobra no máximo).
- Todo CSS novo é token-based (`hsl(var(--foreground))` etc.) → tema escuro
  automático. Hex fixo só em decoração deliberada.

## Tipografia
- Fraunces (`--font-display`) — títulos editoriais, itálico pra ênfase.
- IBM Plex Mono (`--font-mono`) — rótulos/kickers UPPERCASE, letter-spacing.
- Inter (`--font-body`) — corpo. Plus Jakarta (`--font-heading`) — headings de UI.

## Superfícies
- **Públicas** (landing, legal, consent): impresso naval — borda 2px, sombra
  dura `4px 4px 0`, dispositivos (carimbo postal SVG textPath, flâmula
  clip-path, numerais `-webkit-text-stroke`, marquee, borda recortada
  radial-gradient, coordenadas mono, farol conic).
- **Internas** (onboarding, painel, editor, galeria): FLAT minimal — borda
  1px, sombra `0 1px 3px rgba(10,34,57,.06)`, caráter vem da tipografia
  (Fraunces no h1 + mono nos rótulos). Pedido explícito do Cássio:
  "levemente mais minimalista, principalmente pós-landing".

## Proibições (rejeitadas pelo Cássio)
- liquid-glass, aura, blur decorativo, gradiente roxo — linguagem HARPIA.
- Auto-referência de token `--x:hsl(var(--x))` (vira transparente) — usar
  nome local: `--surf:hsl(var(--card))`.
- Get/Set-Content do PowerShell em arquivo UTF-8 (mojibake) — usar node.

## Checklist antes de dar por pronto
1. Testou os DOIS temas no preview (bg/cor computados)?
2. Zero erro novo de console?
3. `npx tsc --noEmit` verde?
4. Marca = âncora (`ph-anchor`), domínio = ancoreo.com.br (nada de
   harpia.site / harp-ia.com / pássaro).
