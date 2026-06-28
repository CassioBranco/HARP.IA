import type { ReactNode } from 'react'
import Link from 'next/link'
import type { PaletteColors } from '@/lib/templates/palettes'
import { getFontPair } from '@/lib/templates/fonts'

// ── Esqueleto de loja ────────────────────────────────────────────────────────
// Estrutura ÚNICA que "veste" qualquer template: adota a paleta, a fonte e a
// marca do site do cliente via CSS vars (--st-*). Mesma filosofia do esqueleto
// de blog (app/[domain]/blog). O Design pode sobrepor variações por template
// depois; a base já se adapta sozinha — inclusive aos templates repaginados.
export default function StoreShell({
  palette, businessName, logoUrl, fontPair, children,
}: {
  palette: PaletteColors
  businessName: string
  logoUrl?: string | null
  fontPair?: string | null
  children: ReactNode
}) {
  const font = getFontPair(fontPair)
  const vars = {
    '--st-primary': palette.primary,
    '--st-secondary': palette.secondary,
    '--st-accent': palette.accent,
    '--st-bg': palette.bg,
    '--st-surface': palette.surface,
    '--st-text': palette.text,
    '--st-muted': palette.muted,
    ...(font ? { '--st-font-h': font.heading, '--st-font-b': font.body } : {}),
  } as React.CSSProperties

  return (
    <div style={vars}>
      {font && <link rel="stylesheet" href={font.href} />}
      <div style={{
        background: 'var(--st-bg)',
        color: 'var(--st-text)',
        fontFamily: 'var(--st-font-b, system-ui), system-ui, sans-serif',
        minHeight: '100vh',
      }}>
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--st-surface)', padding: '16px 24px',
        }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none',
            color: 'var(--st-text)', fontWeight: 700, fontFamily: 'var(--st-font-h, inherit)',
          }}>
            {logoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logoUrl} alt={businessName} style={{ height: 30, width: 'auto' }} />
              : null}
            <span>{businessName}</span>
          </Link>
          <Link href="/loja" style={{ color: 'var(--st-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Loja
          </Link>
        </header>

        {children}

        <footer style={{ borderTop: '1px solid var(--st-surface)', padding: '20px 24px', color: 'var(--st-muted)', fontSize: 13 }}>
          {businessName}
        </footer>
      </div>
    </div>
  )
}
