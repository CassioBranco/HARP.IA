'use client'

import Link from 'next/link'
import type { SiteData } from '../page'

type Props = {
  site: SiteData
}

// Rail do editor. Usa o MESMO vocabulário e os MESMOS ícones Phosphor da
// navegação do painel (PainelNav) pra o cliente não perder o mapa mental ao
// entrar no editor. "Personalizar" é o modo atual (edição inline). Os demais
// são atalhos pras páginas dedicadas do painel; "Painel" leva de volta ao
// menu completo. A âncora no topo volta pros "Meus sites".
const LINKS: { href: string; label: string; icon: string }[] = [
  { href: '/metrics',  label: 'Painel',         icon: 'ph-chart-line-up' },
  { href: '/blog',     label: 'Blog',           icon: 'ph-article' },
  { href: '/settings', label: 'Configurações',  icon: 'ph-gear' },
]

export default function EditorSidebar({ site }: Props) {
  return (
    <div className="ed-rail">
      <Link href="/sites" className="mk" title="Voltar aos meus sites">
        <i className="ph-fill ph-anchor" />
      </Link>

      {/* Modo atual do editor: edição inline no preview */}
      <button className="ed-tab on" title="Personalizar" disabled>
        <i className="ph-duotone ph-pencil-ruler" />
        Personalizar
      </button>

      {/* Atalhos pras páginas do painel — mesmos nomes/ícones da sidebar */}
      {LINKS.map(l => (
        <Link key={l.href} href={l.href} className="ed-tab" title={l.label}>
          <i className={`ph-duotone ${l.icon}`} />
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
