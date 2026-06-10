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

export default function AcolhedorLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`
  const team = c.team ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'Georgia,serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        <SiteNav c={c} preview={preview} />

        {/* HERO — centrado, acolhedor */}
        <section style={{ backgroundColor: 'var(--sf)', padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', borderRadius: '50%', backgroundColor: 'var(--sp)', opacity: 0.06 }} />
          <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1.5rem', border: '4px solid var(--sa)' }}>
              <img src={c.heroImage} alt={c.businessName} width={90} height={90} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <p style={{ color: 'var(--sp)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>
              {c.city} · {c.state} · {c.yearsExperience} anos cuidando de pessoas
            </p>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 700, color: 'var(--st)', lineHeight: 1.25, marginBottom: '1.25rem' }}>
              {c.heroHeadline}
            </h1>
            <p style={{ color: 'var(--sm)', lineHeight: 1.85, fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              {c.heroSub}
            </p>
            <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sp)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', fontFamily: 'system-ui,sans-serif' }}>
              {c.ctaLabel} →
            </a>
          </div>
        </section>

        {/* NOSSA HISTÓRIA */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
              <img src={c.aboutImage} alt={`Sobre ${c.businessName}`} width={600} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              <p style={{ color: 'var(--sa)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem', fontFamily: 'system-ui,sans-serif' }}>Nossa história</p>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1.25rem', lineHeight: 1.3 }}>
                Por que fazemos o que fazemos
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.9, fontSize: '1rem', marginBottom: '1.5rem' }}>{c.about}</p>
              {c.credential && (
                <p style={{ color: 'var(--sp)', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'system-ui,sans-serif' }}>🏅 {c.credential}</p>
              )}
            </div>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              Como podemos ajudar você em {c.city}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {c.services.map((svc, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '1.25rem', padding: '2.25rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>{svc.icon}</div>
                  <h3 style={{ fontWeight: 700, color: 'var(--sp)', marginBottom: '0.75rem', fontSize: '1.05rem' }}>{svc.name}</h3>
                  <p style={{ color: 'var(--sm)', fontSize: '0.9rem', lineHeight: 1.75, fontFamily: 'system-ui,sans-serif' }}>{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EQUIPE */}
        {team.length > 0 && (
          <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '3rem' }}>
                Conheça quem vai te atender
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', justifyItems: 'center' }}>
                {team.map((member, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1rem', border: '3px solid var(--sa)' }}>
                      <img src={member.image} alt={member.name} width={100} height={100} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <p style={{ fontWeight: 700, color: 'var(--st)', fontSize: '1rem', marginBottom: '0.25rem', fontFamily: 'system-ui,sans-serif' }}>{member.name}</p>
                    <p style={{ color: 'var(--sm)', fontSize: '0.8rem', fontFamily: 'system-ui,sans-serif' }}>{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DEPOIMENTOS — grandes e emocionais */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              Histórias reais de quem atendemos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '1.25rem', padding: '2.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <p style={{ fontSize: '1.15rem', color: 'var(--st)', lineHeight: 1.85, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--sp)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', fontFamily: 'system-ui,sans-serif' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--st)', fontFamily: 'system-ui,sans-serif' }}>{t.name}</p>
                      <p style={{ color: 'var(--sa)', fontSize: '0.875rem' }}>{'★'.repeat(t.rating)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteBlog c={c} />
        <SiteFAQ c={c} />
        <SiteCTA c={c} preview={preview} variant="warm" />
        <SiteFooter c={c} />
      </div>
    </>
  )
}
