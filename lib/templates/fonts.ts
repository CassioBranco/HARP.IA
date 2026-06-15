// Pares tipográficos do editor — fonte única de verdade.
// Usado tanto pelo painel de personalização quanto pelo renderer dos layouts,
// para que a fonte escolhida pelo cliente realmente apareça no site.

export type FontPair = {
  id: string
  name: string
  sample: string
  /** font-family aplicada em títulos (--font-heading / --serif) */
  heading: string
  /** font-family aplicada no corpo (--font-body) */
  body: string
  /** URL do Google Fonts que carrega as duas famílias */
  href: string
}

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'classico', name: 'Clássico', sample: 'Plus Jakarta + Inter',
    heading: "'Plus Jakarta Sans', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap',
  },
  {
    id: 'elegante', name: 'Elegante', sample: 'Playfair + Lato',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Lato', system-ui, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Lato:wght@400;700&display=swap',
  },
  {
    id: 'moderno', name: 'Moderno', sample: 'Sora + DM Sans',
    heading: "'Sora', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap',
  },
  {
    id: 'acolhedor', name: 'Acolhedor', sample: 'Merriweather + Nunito',
    heading: "'Merriweather', Georgia, serif",
    body: "'Nunito', system-ui, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Nunito:wght@400;600;700&display=swap',
  },
  {
    id: 'arrojado', name: 'Arrojado', sample: 'Bebas Neue + Inter',
    heading: "'Bebas Neue', Impact, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap',
  },
  {
    id: 'jovem', name: 'Jovem', sample: 'Space Grotesk + Outfit',
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Outfit:wght@400;500;600&display=swap',
  },
]

export const DEFAULT_FONT_PAIR = 'classico'

export function getFontPair(id: string | null | undefined): FontPair | null {
  if (!id) return null
  return FONT_PAIRS.find(f => f.id === id) ?? null
}
