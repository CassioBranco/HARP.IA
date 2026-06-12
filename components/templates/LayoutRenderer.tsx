import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import type { LayoutId } from '@/lib/templates/layouts'

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

export default function LayoutRenderer({ layout, c, p, preview = false }: Props) {
  const Component = LAYOUT_MAP[layout] ?? CleanLayout
  return <Component c={c} p={p} preview={preview} />
}
