// Paletas por nicho. Índice 0/1/2 = as 3 opções oferecidas na galeria.
// [primary, secondary, accent, bg, surface, text, muted]

export type PaletteColors = {
  primary: string
  secondary: string
  accent: string
  bg: string
  surface: string
  text: string
  muted: string
}

const PALETTES: Record<string, PaletteColors[]> = {
  advocacia: [
    { primary: '#1e3a5f', secondary: '#2d5282', accent: '#c9a84c', bg: '#f8f7f4', surface: '#ffffff', text: '#1a1a2e', muted: '#6b7280' },
    { primary: '#1e293b', secondary: '#334155', accent: '#64748b', bg: '#f1f5f9', surface: '#ffffff', text: '#0f172a', muted: '#94a3b8' },
    { primary: '#0f172a', secondary: '#1e293b', accent: '#f59e0b', bg: '#ffffff', surface: '#f8fafc', text: '#0f172a', muted: '#64748b' },
  ],
  contabilidade: [
    { primary: '#1e3a5f', secondary: '#2d5282', accent: '#2d6a4f', bg: '#f8f9fa', surface: '#ffffff', text: '#1a1a2e', muted: '#6b7280' },
    { primary: '#1e293b', secondary: '#334155', accent: '#059669', bg: '#f0fdf4', surface: '#ffffff', text: '#0f172a', muted: '#6b7280' },
    { primary: '#0f172a', secondary: '#1e293b', accent: '#0891b2', bg: '#f0f9ff', surface: '#ffffff', text: '#0f172a', muted: '#64748b' },
  ],
  psicologia: [
    { primary: '#6b8f71', secondary: '#5a7a60', accent: '#a8c5a0', bg: '#faf7f2', surface: '#ffffff', text: '#2d3b2e', muted: '#7a8c7b' },
    { primary: '#6b7280', secondary: '#4b5563', accent: '#9f8fc4', bg: '#faf5ff', surface: '#ffffff', text: '#1f2937', muted: '#9ca3af' },
    { primary: '#4a7c59', secondary: '#3d6b4a', accent: '#8fbc8f', bg: '#f6f4ef', surface: '#ffffff', text: '#1a2e1b', muted: '#6b8f71' },
  ],
  clinica: [
    { primary: '#0d9488', secondary: '#0f766e', accent: '#5eead4', bg: '#f0fdfa', surface: '#ffffff', text: '#134e4a', muted: '#6b7280' },
    { primary: '#2563eb', secondary: '#1d4ed8', accent: '#93c5fd', bg: '#eff6ff', surface: '#ffffff', text: '#1e3a5f', muted: '#6b7280' },
    { primary: '#16a34a', secondary: '#15803d', accent: '#86efac', bg: '#f0fdf4', surface: '#ffffff', text: '#14532d', muted: '#6b7280' },
  ],
  odontologia: [
    { primary: '#0ea5e9', secondary: '#0284c7', accent: '#7dd3fc', bg: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e', muted: '#6b7280' },
    { primary: '#1d4ed8', secondary: '#1e40af', accent: '#93c5fd', bg: '#eff6ff', surface: '#ffffff', text: '#1e3a5f', muted: '#6b7280' },
    { primary: '#0891b2', secondary: '#0e7490', accent: '#67e8f9', bg: '#ecfeff', surface: '#ffffff', text: '#164e63', muted: '#6b7280' },
  ],
  fisioterapia: [
    { primary: '#16a34a', secondary: '#15803d', accent: '#4ade80', bg: '#f0fdf4', surface: '#ffffff', text: '#14532d', muted: '#6b7280' },
    { primary: '#d97706', secondary: '#b45309', accent: '#fcd34d', bg: '#fffbeb', surface: '#ffffff', text: '#78350f', muted: '#6b7280' },
    { primary: '#0d9488', secondary: '#0f766e', accent: '#5eead4', bg: '#f0fdfa', surface: '#ffffff', text: '#134e4a', muted: '#6b7280' },
  ],
  veterinaria: [
    { primary: '#16a34a', secondary: '#15803d', accent: '#f97316', bg: '#fafaf9', surface: '#ffffff', text: '#14532d', muted: '#6b7280' },
    { primary: '#7c3aed', secondary: '#6d28d9', accent: '#f472b6', bg: '#fdf4ff', surface: '#ffffff', text: '#4c1d95', muted: '#6b7280' },
    { primary: '#0d9488', secondary: '#0f766e', accent: '#fbbf24', bg: '#fefce8', surface: '#ffffff', text: '#134e4a', muted: '#6b7280' },
  ],
  imobiliaria: [
    { primary: '#1e293b', secondary: '#334155', accent: '#c9a84c', bg: '#fafaf9', surface: '#ffffff', text: '#0f172a', muted: '#6b7280' },
    { primary: '#111827', secondary: '#1f2937', accent: '#6b7280', bg: '#f9fafb', surface: '#ffffff', text: '#030712', muted: '#9ca3af' },
    { primary: '#292524', secondary: '#44403c', accent: '#d4a017', bg: '#fefce8', surface: '#ffffff', text: '#1c1917', muted: '#78716c' },
  ],
  restaurante: [
    { primary: '#b45309', secondary: '#92400e', accent: '#fbbf24', bg: '#fffbeb', surface: '#ffffff', text: '#78350f', muted: '#92400e' },
    { primary: '#7c2d12', secondary: '#9a3412', accent: '#d97706', bg: '#fef3c7', surface: '#ffffff', text: '#7c2d12', muted: '#92400e' },
    { primary: '#dc2626', secondary: '#b91c1c', accent: '#f97316', bg: '#fff7ed', surface: '#ffffff', text: '#7f1d1d', muted: '#9a3412' },
  ],
  salao: [
    { primary: '#be185d', secondary: '#9d174d', accent: '#f9a8d4', bg: '#fdf2f8', surface: '#ffffff', text: '#831843', muted: '#9d174d' },
    { primary: '#92400e', secondary: '#78350f', accent: '#d6b899', bg: '#fefaf5', surface: '#ffffff', text: '#78350f', muted: '#a16207' },
    { primary: '#374151', secondary: '#1f2937', accent: '#9ca3af', bg: '#f9fafb', surface: '#ffffff', text: '#111827', muted: '#6b7280' },
  ],
  escola: [
    { primary: '#1d4ed8', secondary: '#1e40af', accent: '#fbbf24', bg: '#fffbeb', surface: '#ffffff', text: '#1e3a5f', muted: '#6b7280' },
    { primary: '#7c3aed', secondary: '#6d28d9', accent: '#60a5fa', bg: '#eff6ff', surface: '#ffffff', text: '#4c1d95', muted: '#6b7280' },
    { primary: '#059669', secondary: '#047857', accent: '#f59e0b', bg: '#fefce8', surface: '#ffffff', text: '#064e3b', muted: '#6b7280' },
  ],
  servicos: [
    { primary: '#0e7490', secondary: '#0c6173', accent: '#0891b2', bg: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e', muted: '#6b7280' },
    { primary: '#1e40af', secondary: '#1e3a8a', accent: '#3b82f6', bg: '#eff6ff', surface: '#ffffff', text: '#1e3a5f', muted: '#6b7280' },
    { primary: '#1e293b', secondary: '#0f172a', accent: '#f97316', bg: '#fff7ed', surface: '#ffffff', text: '#0f172a', muted: '#6b7280' },
  ],
  institucional: [
    { primary: '#1e3a5f', secondary: '#2d5282', accent: '#64748b', bg: '#f8fafc', surface: '#ffffff', text: '#0f172a', muted: '#94a3b8' },
    { primary: '#0f172a', secondary: '#1e293b', accent: '#475569', bg: '#f1f5f9', surface: '#ffffff', text: '#0f172a', muted: '#94a3b8' },
    { primary: '#374151', secondary: '#1f2937', accent: '#9ca3af', bg: '#f9fafb', surface: '#ffffff', text: '#111827', muted: '#6b7280' },
  ],
  landing: [
    { primary: '#111827', secondary: '#1f2937', accent: '#f59e0b', bg: '#fffbeb', surface: '#ffffff', text: '#030712', muted: '#6b7280' },
    { primary: '#0f172a', secondary: '#1e293b', accent: '#6366f1', bg: '#eef2ff', surface: '#ffffff', text: '#0f172a', muted: '#6b7280' },
    { primary: '#1e293b', secondary: '#334155', accent: '#10b981', bg: '#f0fdf4', surface: '#ffffff', text: '#0f172a', muted: '#6b7280' },
  ],
}

export function getPalette(preset: string, index: number): PaletteColors {
  const palettes = PALETTES[preset] ?? PALETTES['servicos']
  return palettes[Math.min(index, palettes.length - 1)] ?? palettes[0]
}

export function paletteToCSS(p: PaletteColors): string {
  return `
    --site-primary: ${p.primary};
    --site-secondary: ${p.secondary};
    --site-accent: ${p.accent};
    --site-bg: ${p.bg};
    --site-surface: ${p.surface};
    --site-text: ${p.text};
    --site-muted: ${p.muted};
  `
}
