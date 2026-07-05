import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import type { LayoutId } from '@/lib/templates/layouts'
import { getFontPair } from '@/lib/templates/fonts'
import SiteSocials from './shared/SiteSocials'
import SiteReveal from './shared/SiteReveal'
import ChatWidget from './shared/ChatWidget'
import BookingWidget from './shared/BookingWidget'
import LeadCaptureBar from './shared/LeadCaptureBar'
import SectionArrange from './shared/SectionArrange'
import type { SectionSnapshot } from '@/lib/editor/inline-edit'

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
  /** seções visuais na ordem salva — liga o SectionArrange (ordem/ocultas/duplicadas) */
  sections?: SectionSnapshot[]
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

export default function LayoutRenderer({ layout, c, p, preview = false, fontPair, sections }: Props) {
  const Component = LAYOUT_MAP[layout] ?? CleanLayout
  const font = getFontPair(fontPair)

  // Widget de FAQ/chat: ativo quando o negócio tem WhatsApp cadastrado ou FAQ.
  // Ocupa o canto inferior direito; os botões sociais sobem pra não sobrepor.
  const waDigits = (c.socials?.whatsapp ?? c.whatsapp ?? '').replace(/\D/g, '')
  const faqs = c.faqs ?? []
  const chatOn = waDigits.length >= 8 || faqs.length > 0

  // Widget de agendamento: ativo quando o dono ligou o toggle no editor.
  // Fica no canto inferior ESQUERDO (o direito é do chat + botões sociais).
  const bookingOn = Boolean(c.bookingEnabled && c.siteId)

  // Captura de leads: faixa INLINE no fluxo da página (fecha o site, depois
  // do layout). Não é popup/overlay — sem penalidade de interstitial e sem
  // disputar os cantos com ChatWidget/BookingWidget.
  const leadsOn = Boolean(c.leadsEnabled && c.siteId)

  // Override de fonte: renderizado DEPOIS do layout, então vence as vars :root
  // que cada layout define internamente (--font-heading / --font-body / --serif).
  // --font-accent (mono/decorativa) é preservado de propósito.
  return (
    <>
      <Component c={c} p={p} preview={preview} />
      {/* Ordem/ocultas/duplicadas das seções, aplicadas sobre o layout fixo */}
      {sections && sections.length > 0 && <SectionArrange sections={sections} />}
      {leadsOn && (
        <LeadCaptureBar
          siteId={c.siteId!}
          businessName={c.businessName}
          services={(c.services ?? []).map(s => s.name)}
          preview={preview}
        />
      )}
      <SiteSocials c={c} p={p} raise={chatOn} />
      {chatOn && <ChatWidget whatsapp={waDigits} faqs={faqs} businessName={c.businessName} />}
      {bookingOn && (
        <BookingWidget
          siteId={c.siteId!}
          businessName={c.businessName}
          services={(c.services ?? []).map(s => s.name)}
          preview={preview}
        />
      )}
      <SiteReveal />
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
