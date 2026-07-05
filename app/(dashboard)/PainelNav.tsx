'use client'

// Itens de navegação do painel (liquid-glass). Estado ativo via pathname.
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/metrics',  label: 'Painel',         icon: 'ph-chart-line-up' },
  { href: '/sites',    label: 'Meus sites',    icon: 'ph-globe-hemisphere-west' },
  { href: '/editor',   label: 'Editor',         icon: 'ph-pencil-ruler' },
  { href: '/blog',     label: 'Blog',           icon: 'ph-article' },
  { href: '/agendamentos', label: 'Agendamentos', icon: 'ph-calendar-check' },
  { href: '/leads',    label: 'Leads',          icon: 'ph-envelope-simple' },
  { href: '/gbp',      label: 'Google',         icon: 'ph-google-logo' },
  { href: '/parcerias', label: 'Parcerias',     icon: 'ph-handshake' },
  { href: '/settings', label: 'Configurações',  icon: 'ph-gear' },
]

export default function PainelNav() {
  const pathname = usePathname()
  return (
    <>
      {NAV.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.href} href={item.href} className={`nav-item ${active ? 'on' : ''}`}>
            <i className={`ph-duotone ${item.icon}`} /> {item.label}
          </Link>
        )
      })}
    </>
  )
}
