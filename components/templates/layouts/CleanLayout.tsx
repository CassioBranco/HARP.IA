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

export default function CleanLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        <SiteNav c={c} preview={preview} />

        {/* HERO — split 50/50 */}
        <section style={{ backgroundColor: 'var(--sf)', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--sp)', color: '#fff', borderRadius: '999px', padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {c.city} · {c.state} · {c.yearsExperience} anos
              </div>
              {/* AEO Regra 3: H1 com keyword + cidade */}
              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--st)', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                {c.heroHeadline}
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--sm)', lineHeight: 1.75, marginBottom: '2rem' }}>
                {c.heroSub}
              </p>
              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                <a href={href(whatsapp)} style={{ backgroundColor: 'var(--sp)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block' }}>
                  {c.ctaLabel} →
                </a>
                <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ backgroundColor: 'transparent', color: 'var(--sp)', padding: '0.875rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', border: '2px solid var(--sp)', display: 'inline-block' }}>
                  📞 {c.ctaPhone}
                </a>
              </div>
            </div>
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
              <img src={c.heroImage} alt={`${c.businessName} em ${c.city}`} width={900} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* STATS */}
        {c.stats && (
          <section style={{ backgroundColor: 'var(--sp)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
              {c.stats.map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SERVIÇOS */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '0.75rem' }}>
              Nossos serviços em {c.city}
            </h2>
            <p style={{ color: 'var(--sm)', textAlign: 'center', marginBottom: '3rem', maxWidth: '520px', margin: '0 auto 3rem' }}>
              Serviços especializados com qualidade e atenção individualizada para cada cliente.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {c.services.map((svc, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{svc.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--sp)', marginBottom: '0.625rem' }}>{svc.name}</h3>
                  <p style={{ color: 'var(--sm)', fontSize: '0.925rem', lineHeight: 1.7 }}>{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={c.aboutImage} alt={`Sobre ${c.businessName}`} width={600} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1.25rem' }}>
                Sobre {c.businessName}
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.8, marginBottom: '1.75rem' }}>{c.about}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  `${c.yearsExperience} anos de experiência em ${c.city}`,
                  c.credential,
                  'Atendimento presencial e online',
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ color: 'var(--sa)', fontWeight: 700 }}>✓</span>
                    <span style={{ color: 'var(--st)', fontSize: '0.95rem' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              O que dizem nossos clientes em {c.city}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '1rem', padding: '1.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <p style={{ color: 'var(--sa)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>{'★'.repeat(t.rating)}</p>
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
