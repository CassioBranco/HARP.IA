import { getPalette } from '@/lib/templates/palettes'
import { getExampleContent } from '@/lib/templates/example-content'
import LayoutRenderer from '@/components/templates/LayoutRenderer'
import type { LayoutId } from '@/lib/templates/layouts'

type Props = { searchParams: Promise<{ preset?: string; palette?: string; layout?: string }> }

export default async function TemplatePreviewPage({ searchParams }: Props) {
  const { preset = 'servicos', palette = '0', layout = 'clean' } = await searchParams
  const paletteIndex = Math.max(0, Math.min(2, parseInt(palette) || 0))
  const paletteColors = getPalette(preset, paletteIndex)
  const content = getExampleContent(preset)

  return <LayoutRenderer layout={layout as LayoutId} c={content} p={paletteColors} preview />
}
