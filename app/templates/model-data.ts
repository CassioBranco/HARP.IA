// ============================================================
// HARPIA — Dados da tela "escolher-modelo" (v2)
// Portado 1:1 do protótipo design_handoff_harpia/onboarding/escolher-modelo.html.
// Visual e textos NÃO devem ser alterados aqui sem aprovação (Claude Design).
// ============================================================

import type { LayoutId } from '@/lib/templates/layouts'
import type { Objetivo } from '@/lib/onboarding/types'

// ── Modelos (10) — [slug, nome, descrição, swatch[3]] ────────
// swatch = cor-identidade do modelo, mostrada na mini-amostra do rail.
export const MODELS: { id: LayoutId; name: string; desc: string; swatch: [string, string, string] }[] = [
  { id: 'clean',        name: 'Clean',        desc: 'Minimalista elegante', swatch: ['#0E7C86', '#16B3A6', '#F2F8F9'] },
  { id: 'bold',         name: 'Bold',         desc: 'Cinematográfico dark', swatch: ['#0E7C86', '#16B3A6', '#0F2A2E'] },
  { id: 'profissional', name: 'Profissional', desc: 'Corporativo sólido',   swatch: ['#1E3A5F', '#C9A84C', '#F8F7F4'] },
  { id: 'portfolio',    name: 'Portfólio',    desc: 'Visual forte',         swatch: ['#0E7C86', '#16B3A6', '#F2F8F9'] },
  { id: 'acolhedor',    name: 'Acolhedor',    desc: 'Quente e humano',      swatch: ['#6B8F71', '#C99B6E', '#F2ECE2'] },
  { id: 'conversao',    name: 'Conversão',    desc: 'Alta conversão',       swatch: ['#15425B', '#F97316', '#F4F7F9'] },
  { id: 'magazine',     name: 'Magazine',     desc: 'Editorial',            swatch: ['#1D4ED8', '#C2410C', '#F4F5F7'] },
  { id: 'academia',     name: 'Academia',     desc: 'Educacional',          swatch: ['#1D4ED8', '#FBBF24', '#EFF4FF'] },
  { id: 'tech',         name: 'Tech',         desc: 'Dark / neon',          swatch: ['#6366F1', '#22D3EE', '#12121E'] },
  { id: 'jovem',        name: 'Jovem',        desc: 'Zine / grunge',        swatch: ['#E0195A', '#F5C518', '#111111'] },
]

// ── Paletas nomeadas ─────────────────────────────────────────
// colors = [sp, ss, sa, sb, sf, st, sm] (primary, secondary, accent, bg, surface, text, muted)
// 'Original' (colors null) = mantém o default do template.
export type PaletteGroup = 'base' | 'Frias' | 'Quentes' | 'Naturais' | 'Neutras' | 'custom'
export interface NamedPalette {
  name: string
  colors: string[] | null
  group: PaletteGroup
}

export const PALETTES: NamedPalette[] = [
  { name: 'Original',   colors: null, group: 'base' },
  { name: 'Teal',       colors: ['#0E7C86', '#1B9AAA', '#16B3A6', '#FFFFFF', '#F2F8F9', '#0F2A2E', '#5A7378'], group: 'Frias' },
  { name: 'Azul',       colors: ['#1D4ED8', '#60A5FA', '#FBBF24', '#FFFFFF', '#EFF4FF', '#101A33', '#55627D'], group: 'Frias' },
  { name: 'Oceano',     colors: ['#0E7490', '#06B6D4', '#F4B740', '#FFFFFF', '#ECFEFF', '#0A2A33', '#4E707A'], group: 'Frias' },
  { name: 'Roxo',       colors: ['#6D28D9', '#A78BFA', '#22D3EE', '#FFFFFF', '#F5F3FF', '#241246', '#6B6385'], group: 'Frias' },
  { name: 'Marinho',    colors: ['#1E3A8A', '#3B82F6', '#38BDF8', '#FFFFFF', '#EEF3FB', '#0E1A38', '#566179'], group: 'Frias' },
  { name: 'Terracota',  colors: ['#B23A1E', '#D9622B', '#E8A33D', '#FFFDF8', '#FBF1E6', '#2A1A12', '#7A5C4A'], group: 'Quentes' },
  { name: 'Laranja',    colors: ['#C2410C', '#F97316', '#0EA5E9', '#FFFBF7', '#FFF1E6', '#2A1606', '#7A5A45'], group: 'Quentes' },
  { name: 'Vinho',      colors: ['#7B1E3B', '#A8324F', '#D9A441', '#FFFCFA', '#F7ECEF', '#2A0E18', '#8A6470'], group: 'Quentes' },
  { name: 'Rosé',       colors: ['#BE185D', '#F472B6', '#F59E0B', '#FFFFFF', '#FDF2F8', '#3A1226', '#8A5E72'], group: 'Quentes' },
  { name: 'Coral',      colors: ['#E11D48', '#FB7185', '#FB923C', '#FFFCFC', '#FFF1F2', '#2A0D14', '#8A5C63'], group: 'Quentes' },
  { name: 'Mostarda',   colors: ['#A16207', '#CA8A04', '#0E7490', '#FFFEFB', '#FBF6EC', '#2C2410', '#7A6F55'], group: 'Quentes' },
  { name: 'Verde',      colors: ['#16A34A', '#4ADE80', '#D97706', '#FFFFFF', '#F0FDF4', '#14321F', '#5A7163'], group: 'Naturais' },
  { name: 'Floresta',   colors: ['#14532D', '#15803D', '#CA8A04', '#FCFEFB', '#ECFDF3', '#10261A', '#54705E'], group: 'Naturais' },
  { name: 'Menta',      colors: ['#0F766E', '#2DD4BF', '#F59E0B', '#FFFFFF', '#ECFDFA', '#0C2A27', '#4F726E'], group: 'Naturais' },
  { name: 'Navy ouro',  colors: ['#1E3A5F', '#2C4E78', '#C9A84C', '#FFFFFF', '#F8F7F4', '#14233A', '#5C6B7E'], group: 'Naturais' },
  { name: 'Grafite',    colors: ['#334155', '#64748B', '#F59E0B', '#FFFFFF', '#F1F5F9', '#0F172A', '#5B6472'], group: 'Neutras' },
  { name: 'Carvão',     colors: ['#27272A', '#52525B', '#EAB308', '#FFFFFF', '#F4F4F5', '#18181B', '#5C5C63'], group: 'Neutras' },
  { name: 'Pedra',      colors: ['#57534E', '#A8A29E', '#0D9488', '#FFFFFF', '#F5F5F4', '#1C1917', '#6B645E'], group: 'Neutras' },
]

export const PALETTE_GROUPS: PaletteGroup[] = ['Frias', 'Quentes', 'Naturais', 'Neutras']

// Paleta personalizada default (o cliente ajusta os 3 primeiros; superfícies derivam).
export const CUSTOM_DEFAULT: string[] = ['#3B82F6', '#60A5FA', '#F59E0B', '#FFFFFF', '#EEF3FB', '#101A2E', '#5A6678']

// ── Helpers de cor (deriva superfícies do tom principal na custom) ──
function hx(c: string): [number, number, number] {
  const h = c.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const toHex = (x: number) => Math.round(x).toString(16).padStart(2, '0')
export function tint(c: string, f: number): string {
  const [r, g, b] = hx(c)
  return '#' + [r, g, b].map(x => toHex(x + (255 - x) * f)).join('')
}
export function shade(c: string, f: number): string {
  const [r, g, b] = hx(c)
  return '#' + [r, g, b].map(x => toHex(x * (1 - f))).join('')
}

// Monta os 7 tons da custom a partir dos 3 escolhidos (principal/apoio/destaque).
export function buildCustom(primary: string, support: string, accent: string): string[] {
  return [primary, support, accent, '#FFFFFF', tint(primary, 0.92), shade(primary, 0.78), '#5A6678']
}

// ── Paleta ORIGINAL de cada template ────────────────────────
// A assinatura de cor que veio com o design do Claude Design, por modelo.
// Ordem: [primary, secondary, accent, bg, surface, text, muted] (= --sp..--sm).
// Usada na grade de escolha pra cada template aparecer com a SUA cara,
// e gravada como paleta inicial do site ao escolher.
export const ORIGINAL_PALETTES: Record<LayoutId, string[]> = {
  clean:        ['#0E7C86', '#16B3A6', '#16B3A6', '#FFFFFF', '#F2F8F9', '#0F2A2E', '#5A7378'],
  bold:         ['#16B3A6', '#0E7C86', '#19C7B8', '#0F2A2E', '#143A3E', '#EAF6F5', '#8BA8AA'],
  profissional: ['#1E3A5F', '#2C4E78', '#C9A84C', '#FFFFFF', '#F8F7F4', '#14233A', '#5C6B7E'],
  portfolio:    ['#0E7C86', '#16B3A6', '#F4B740', '#FFFFFF', '#EEF6F6', '#0F2A2E', '#5A7378'],
  acolhedor:    ['#6B8F71', '#C99B6E', '#C99B6E', '#FFFDF9', '#F2ECE2', '#2E3A2C', '#7A7468'],
  conversao:    ['#15425B', '#1E5A78', '#F97316', '#FFFFFF', '#F4F7F9', '#0E2230', '#55636E'],
  magazine:     ['#1D4ED8', '#1E40AF', '#C2410C', '#FFFFFF', '#F4F5F7', '#111827', '#55627D'],
  academia:     ['#1D4ED8', '#1E40AF', '#FBBF24', '#FFFFFF', '#EFF4FF', '#101A33', '#55627D'],
  tech:         ['#6366F1', '#818CF8', '#22D3EE', '#12121E', '#1B1B2E', '#E6E8FF', '#8A8DB0'],
  jovem:        ['#E0195A', '#F5C518', '#F5C518', '#111111', '#1C1C1C', '#F5F5F5', '#9A9A9A'],
}

// ── Objetivo → modelo sugerido (pré-seleção da tela) ─────────
export const OBJETIVO_TO_LAYOUT: Record<Objetivo, LayoutId> = {
  servico_agendamento: 'clean',
  institucional: 'profissional',
  portfolio: 'portfolio',
  loja: 'conversao',
}
