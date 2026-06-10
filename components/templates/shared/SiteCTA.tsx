import type { SiteContent } from '@/lib/templates/example-content'

type Props = {
  c: SiteContent
  preview: boolean
  variant?: 'default' | 'warm' | 'gradient' | 'minimal'
  heading?: string
  subheading?: string
}

export default function SiteCTA({ c, preview, variant = 'default', heading, subheading }: Props) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site e gostaria de mais informações.`

  const h = heading ?? 'Pronto para resolver isso hoje?'
  const sub = subheading ?? `Entre em contato agora. Atendemos em ${c.city} e região — presencial e online.`

  if (variant === 'gradient') {
    return (
      <section style={{ background: 'linear-gradient(135deg, var(--sp) 0%, var(--ss) 100%)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{h}</h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>{sub}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              {c.ctaLabel} →
            </a>
            <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', padding: '1rem 2rem', borderRadius: '0.625rem', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              📞 {c.ctaPhone}
            </a>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'warm') {
    return (
      <section style={{ backgroundColor: 'var(--sf)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1rem' }}>{h}</h2>
          <p style={{ color: 'var(--sm)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>{sub}</p>
          <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sp)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '999px', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none' }}>
            {c.ctaLabel} →
          </a>
        </div>
      </section>
    )
  }

  if (variant === 'minimal') {
    return (
      <section style={{ backgroundColor: 'var(--sb)', padding: '4rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--st)', marginBottom: '0.375rem' }}>{h}</p>
            <p style={{ color: 'var(--sm)', fontSize: '0.95rem' }}>{sub}</p>
          </div>
          <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sp)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {c.ctaLabel} →
          </a>
        </div>
      </section>
    )
  }

  // default
  return (
    <section style={{ backgroundColor: 'var(--sp)', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>{h}</h2>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>{sub}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            {c.ctaLabel} →
          </a>
          <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', padding: '1rem 2rem', borderRadius: '0.625rem', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
            📞 {c.ctaPhone}
          </a>
        </div>
      </div>
    </section>
  )
}
