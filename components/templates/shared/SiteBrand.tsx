import type { ReactNode } from 'react'
import type { SiteContent } from '@/lib/templates/example-content'

// Mostra a logo do cliente no lugar do nome, quando houver.
// Sem logo, cai pro conteúdo original do layout (fallback seguro — não muda nada).
export default function SiteBrand({ c, children }: { c: SiteContent; children: ReactNode }) {
  if (c.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={c.logoUrl} alt={c.businessName} style={{ maxHeight: '38px', width: 'auto', display: 'block' }} />
  }
  return <>{children}</>
}
