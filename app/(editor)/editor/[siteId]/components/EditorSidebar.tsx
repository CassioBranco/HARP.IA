'use client'

import Link from 'next/link'
import type { SiteData } from '../page'

type Props = {
  site: SiteData
}

// Ícones do rail. "Personalizar" é a edição inline (no editor).
// Blog / Métricas / Conta têm PÁGINA DEDICADA no painel — viram links, não painéis apertados.
const customizeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
)

const LINKS: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '/blog',    label: 'Blog',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> },
  { href: '/metrics', label: 'Métricas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { href: '/settings', label: 'Conta',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
]

export default function EditorSidebar({ site }: Props) {
  return (
    <div className="ed-rail">
      <Link href="/sites" className="mk" title="Meus sites">
        <i className="ph-fill ph-bird" />
      </Link>

      {/* Edição do site (ativo sempre — é o que o editor faz) */}
      <button className="ed-tab on" title="Personalizar" disabled>
        {customizeIcon}
        Personalizar
      </button>

      {/* Páginas dedicadas do painel */}
      {LINKS.map(l => (
        <Link key={l.href} href={l.href} className="ed-tab" title={l.label}>
          {l.icon}
          {l.label}
        </Link>
      ))}

      <div className="foot">
        <span className={`badge ${site.status === 'published' ? 'ok' : 'warn'}`}>
          {site.status === 'published' ? 'No ar' : 'Rascunho'}
        </span>
      </div>
    </div>
  )
}
