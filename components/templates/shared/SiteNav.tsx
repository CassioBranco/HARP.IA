import type { SiteContent } from '@/lib/templates/example-content'

type Props = {
  c: SiteContent
  preview: boolean
  variant?: 'default' | 'transparent' | 'phone' | 'minimal'
}

export default function SiteNav({ c, preview, variant = 'default' }: Props) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`

  if (variant === 'minimal') {
    return (
      <nav style={{ backgroundColor: 'var(--sp)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{c.businessName}</span>
          <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', textDecoration: 'none' }}>
            📞 {c.ctaPhone}
          </a>
        </div>
      </nav>
    )
  }

  const bg = variant === 'transparent'
    ? 'rgba(0,0,0,0.35)'
    : 'var(--sp)'

  const position = variant === 'transparent' ? 'absolute' : 'sticky'

  return (
    <nav style={{ backgroundColor: bg, padding: '0 1.5rem', position, top: 0, zIndex: 50, width: '100%', boxShadow: variant === 'transparent' ? 'none' : '0 2px 8px rgba(0,0,0,0.12)', backdropFilter: variant === 'transparent' ? 'blur(4px)' : 'none' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.01em' }}>{c.businessName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {variant === 'phone' && (
            <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              📞 {c.ctaPhone}
            </a>
          )}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {['Serviços', 'Sobre', 'Blog', 'Contato'].map(item => (
              <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>{item}</a>
            ))}
          </div>
          <a href={href(whatsapp)} style={{ backgroundColor: 'var(--sa)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {c.ctaLabel}
          </a>
        </div>
      </div>
    </nav>
  )
}
