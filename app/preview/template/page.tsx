import { getPalette, type PaletteColors } from '@/lib/templates/palettes'
import { getExampleContent } from '@/lib/templates/example-content'
import LayoutRenderer from '@/components/templates/LayoutRenderer'
import type { LayoutId } from '@/lib/templates/layouts'

type Props = {
  searchParams: Promise<{ preset?: string; palette?: string; layout?: string; colors?: string }>
}

// `colors` = 7 hex separados por vírgula, na ordem das 7 vars do template:
// primary, secondary, accent, bg, surface, text, muted (= --sp,--ss,--sa,--sb,--sf,--st,--sm).
// Quando presente, vence o sistema antigo de paleta-por-nicho (escolher-modelo v2).
function parseColors(raw?: string): PaletteColors | null {
  if (!raw) return null
  const parts = raw.split(',').map(s => s.trim())
  if (parts.length < 7) return null
  const hex = /^#?[0-9a-fA-F]{3,8}$/
  if (!parts.slice(0, 7).every(p => hex.test(p))) return null
  const norm = (h: string) => (h.startsWith('#') ? h : `#${h}`)
  const [primary, secondary, accent, bg, surface, text, muted] = parts.map(norm)
  return { primary, secondary, accent, bg, surface, text, muted } as PaletteColors
}

export default async function TemplatePreviewPage({ searchParams }: Props) {
  const { preset = 'servicos', palette = '0', layout = 'clean', colors } = await searchParams
  const paletteIndex = Math.max(0, Math.min(2, parseInt(palette) || 0))
  const paletteColors = parseColors(colors) ?? getPalette(preset, paletteIndex)
  const content = getExampleContent(preset)

  return <LayoutRenderer layout={layout as LayoutId} c={content} p={paletteColors} preview />
}
