import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import type { LayoutId } from '@/lib/templates/layouts'
import { getFontPair } from '@/lib/templates/fonts'

import CleanLayout from './layouts/CleanLayout'
import BoldLayout from './layouts/BoldLayout'
import ProfissionalLayout from './layouts/ProfissionalLayout'
import PortfolioLayout from './layouts/PortfolioLayout'
import AcolhedorLayout from './layouts/AcolhedorLayout'
import ConversaoLayout from './layouts/ConversaoLayout'
import MagazineLayout from './layouts/MagazineLayout'
import AcademiaLayout from './layouts/AcademiaLayout'
import JovemLayout from './layouts/JovemLayout'
import TechLayout from './layouts/TechLayout'

interface Props {
  layout: LayoutId
  c: SiteContent
  p: PaletteColors
  preview?: boolean
  /** id do par tipográfico escolhido pelo cliente (sites.font_pair) */
  fontPair?: string | null
}

const LAYOUT_MAP = {
  clean: CleanLayout,
  bold: BoldLayout,
  profissional: ProfissionalLayout,
  portfolio: PortfolioLayout,
  acolhedor: AcolhedorLayout,
  conversao: ConversaoLayout,
  magazine: MagazineLayout,
  academia: AcademiaLayout,
  jovem: JovemLayout,
  tech: TechLayout,
} as const satisfies Record<LayoutId, React.ComponentType<{ c: SiteContent; p: PaletteColors; preview: boolean }>>

export default function LayoutRenderer({ layout, c, p, preview = false, fontPair }: Props) {
  const Component = LAYOUT_MAP[layout] ?? CleanLayout
  const font = getFontPair(fontPair)

  // Override de fonte: renderizado DEPOIS do layout, então vence as vars :root
  // que cada layout define internamente (--font-heading / --font-body / --serif).
  // --font-accent (mono/decorativa) é preservado de propósito.
  return (
    <>
      <Component c={c} p={p} preview={preview} />
      {font && (
        <>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={font.href} />
          <style dangerouslySetInnerHTML={{ __html:
            `:root{--font-heading:${font.heading};--serif:${font.heading};--font-body:${font.body};}`
          }} />
        </>
      )}
    </>
  )
}
