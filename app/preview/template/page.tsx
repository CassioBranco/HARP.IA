import { getPalette } from '@/lib/templates/palettes'
import { getExampleContent } from '@/lib/templates/example-content'
import SiteTemplate from '@/components/templates/SiteTemplate'

type Props = { searchParams: Promise<{ preset?: string; palette?: string }> }

export default async function TemplatePreviewPage({ searchParams }: Props) {
  const { preset = 'servicos', palette = '0' } = await searchParams
  const paletteIndex = Math.max(0, Math.min(2, parseInt(palette) || 0))
  const paletteColors = getPalette(preset, paletteIndex)
  const content = getExampleContent(preset)

  return <SiteTemplate content={content} palette={paletteColors} preview />
}
