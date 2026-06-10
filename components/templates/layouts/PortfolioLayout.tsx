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

export default function PortfolioLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`
  const items = c.portfolioItems ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        <SiteNav c={c} preview={preview} />

        {/* HERO — texto esquerda + grade de fotos direita */}
        <section style={{ backgroundColor: 'var(--sf)', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', borderRadius: '999px', padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {c.city} · {c.state}
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--st)', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                {c.heroHeadline}
              </h1>
              <p style={{ color: 'var(--sm)', lineHeight: 1.75, fontSize: '1.05rem', marginBottom: '2rem' }}>{c.heroSub}</p>
              <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sp)', color: '#fff', padding: '0.9rem 2.25rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                {c.ctaLabel} →
              </a>
            </div>
            {/* Grade 2×2 de fotos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[c.heroImage, ...(items.slice(0, 3).map(i => i.image))].map((img, i) => (
                <div key={i} style={{ borderRadius: '0.875rem', overflow: 'hidden', aspectRatio: '1/1', ...(i === 0 ? { gridColumn: '1 / -1', aspectRatio: '2/1' } : {}) }}>
                  <img src={img} alt={`${c.businessName} portfolio ${i + 1}`} width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALERIA DE TRABALHOS */}
        {items.length > 0 && (
          <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '0.75rem' }}>
                Nossos trabalhos em {c.city}
              </h2>
              <p style={{ color: 'var(--sm)', textAlign: 'center', marginBottom: '3rem' }}>
                Cada projeto com dedicação, técnica e atenção aos detalhes.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ borderRadius: '0.875rem', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', cursor: 'pointer' }}>
                    <img src={item.image} alt={item.title} width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '1.25rem 1rem 0.875rem' }}>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{item.title}</p>
                      {item.category && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{item.category}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SERVIÇOS */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {c.services.map((svc, i) => (
              <div key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '1rem', padding: '1.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.875rem' }}>{svc.icon}</div>
                <h3 style={{ fontWeight: 700, color: 'var(--sp)', marginBottom: '0.5rem', fontSize: '1rem' }}>{svc.name}</h3>
                <p style={{ color: 'var(--sm)', fontSize: '0.9rem', lineHeight: 1.65 }}>{svc.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SOBRE */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1.25rem' }}>
              Sobre {c.businessName}
            </h2>
            <p style={{ color: 'var(--sm)', lineHeight: 1.8, fontSize: '1.025rem', maxWidth: '680px', margin: '0 auto 1.5rem' }}>{c.about}</p>
            {c.credential && (
              <span style={{ display: 'inline-block', backgroundColor: 'var(--sf)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '999px', padding: '0.375rem 1rem', fontSize: '0.8rem', color: 'var(--sm)', fontWeight: 600 }}>
                🏅 {c.credential}
              </span>
            )}
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              O que dizem nossos clientes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '1rem', padding: '1.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <p style={{ color: 'var(--sa)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{'★'.repeat(t.rating)}</p>
                  <p style={{ color: 'var(--sm)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>"{t.text}"</p>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--sp)' }}>— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteBlog c={c} />
        <SiteFAQ c={c} />
        <SiteCTA c={c} preview={preview} />
        <SiteFooter c={c} />
      </div>
    </>
  )
}
