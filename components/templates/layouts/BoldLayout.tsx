import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import SiteNav from '../shared/SiteNav'
import SiteFAQ from '../shared/SiteFAQ'
import SiteBlog from '../shared/SiteBlog'
import SiteCTA from '../shared/SiteCTA'
import SiteFooter from '../shared/SiteFooter'
import SiteSchema from '../shared/SiteSchema'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

export default function BoldLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        {/* HERO FULLSCREEN */}
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <img src={c.heroImage} alt={c.businessName} width={1400} height={900} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <SiteNav c={c} preview={preview} variant="transparent" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
              <div style={{ maxWidth: '820px' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', borderRadius: '999px', padding: '0.3rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {c.city} · {c.state}
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                  {c.heroHeadline}
                </h1>
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem', lineHeight: 1.65, maxWidth: '640px', margin: '0 auto 2.5rem' }}>
                  {c.heroSub}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={href(whatsapp)} style={{ backgroundColor: 'var(--sa)', color: '#fff', padding: '1rem 2.75rem', borderRadius: '0.625rem', fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.4)', display: 'inline-block' }}>
                    {c.ctaLabel} →
                  </a>
                  <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', padding: '1rem 2rem', borderRadius: '0.625rem', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', display: 'inline-block' }}>
                    📞 {c.ctaPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* Scroll hint */}
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textAlign: 'center', zIndex: 1 }}>
            ↓ conheça mais
          </div>
        </div>

        {/* SERVIÇOS — cards coloridos */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', fontWeight: 800, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              O que oferecemos em {c.city}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {c.services.map((svc, i) => (
                <div key={i} style={{ backgroundColor: i === 0 ? 'var(--sp)' : 'var(--sf)', borderRadius: '1rem', padding: '2.25rem', boxShadow: i === 0 ? '0 8px 30px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{svc.icon}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: i === 0 ? '#fff' : 'var(--sp)', marginBottom: '0.75rem' }}>{svc.name}</h3>
                  <p style={{ color: i === 0 ? 'rgba(255,255,255,0.82)' : 'var(--sm)', fontSize: '0.925rem', lineHeight: 1.7 }}>{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE — imagem grande */}
        <section style={{ padding: '0', backgroundColor: 'var(--sf)', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
              <img src={c.aboutImage} alt={`Sobre ${c.businessName}`} width={600} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: 'var(--st)', marginBottom: '1.25rem' }}>
                Sobre {c.businessName}
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.8, marginBottom: '2rem' }}>{c.about}</p>
              {c.stats && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {c.stats.slice(0, 4).map((s, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--sp)' }}>{s.value}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--sm)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS — dark */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--st)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '3rem' }}>
              O que dizem nossos clientes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: '2.5rem', color: 'var(--sa)', lineHeight: 1, marginBottom: '1rem' }}>"</p>
                  <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '1.25rem' }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--sp)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>{t.name}</p>
                      <p style={{ color: 'var(--sa)', fontSize: '0.75rem' }}>{'★'.repeat(t.rating)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteBlog c={c} />
        <SiteFAQ c={c} />
        <SiteCTA c={c} preview={preview} variant="gradient" />
        <SiteFooter c={c} />
      </div>
    </>
  )
}
