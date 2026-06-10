import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import SiteFAQ from '../shared/SiteFAQ'
import SiteBlog from '../shared/SiteBlog'
import SiteFooter from '../shared/SiteFooter'
import SiteSchema from '../shared/SiteSchema'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

export default function JovemLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`
  const items = c.portfolioItems ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: "'system-ui',-apple-system,sans-serif", backgroundColor: 'var(--st)', color: '#fff', minHeight: '100vh' }}>

        {/* NAV minimal dark */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.02em' }}>{c.businessName}</span>
            <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
              {['Serviços', 'Trabalhos', 'Blog', 'Contato'].map(item => (
                <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>{item}</a>
              ))}
              <a href={href(whatsapp)} style={{ background: 'linear-gradient(135deg, var(--sp), var(--sa))', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                {c.ctaLabel}
              </a>
            </div>
          </div>
        </nav>

        {/* HERO ASSIMÉTRICO — tipografia grande */}
        <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--st) 0%, #1a1a2e 100%)' }}>
          {/* Círculo decorativo */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, var(--sp) 0%, transparent 70%)', opacity: 0.25 }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '30%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, var(--sa) 0%, transparent 70%)', opacity: 0.15 }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '3rem', alignItems: 'center', position: 'relative' }}>
            <div>
              <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                📍 {c.city} · {c.state}
              </div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
                {c.heroHeadline}
              </h1>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '560px' }}>
                {c.heroSub}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href={href(whatsapp)} style={{ display: 'inline-block', background: 'linear-gradient(135deg, var(--sp), var(--sa))', color: '#fff', padding: '1rem 2.5rem', borderRadius: '999px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
                  {c.ctaLabel} →
                </a>
                <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', padding: '1rem 2rem', borderRadius: '999px', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
                  📞 {c.ctaPhone}
                </a>
              </div>
            </div>
            <div style={{ borderRadius: '1.5rem', overflow: 'hidden', aspectRatio: '3/4', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={c.heroImage} alt={c.businessName} width={600} height={800} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* SERVIÇOS — cards offset coloridos */}
        <section style={{ padding: '6rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: 'var(--st)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                O que<br />fazemos
              </h2>
              <p style={{ color: 'var(--sm)', maxWidth: '360px', lineHeight: 1.7 }}>
                Serviços especializados com energia, técnica e entrega de resultados reais em {c.city}.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {c.services.map((svc, i) => (
                <div key={i} style={{
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  marginTop: i === 1 ? '2rem' : 0,
                  background: i === 0
                    ? 'linear-gradient(135deg, var(--sp), var(--ss))'
                    : i === 1
                    ? 'var(--sf)'
                    : `linear-gradient(135deg, var(--sa), ${p.accent}aa)`,
                  border: i === 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                  boxShadow: i !== 1 ? '0 8px 30px rgba(0,0,0,0.15)' : 'none',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>{svc.icon}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: i === 1 ? 'var(--st)' : '#fff', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>{svc.name}</h3>
                  <p style={{ color: i === 1 ? 'var(--sm)' : 'rgba(255,255,255,0.82)', fontSize: '0.9rem', lineHeight: 1.7 }}>{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE — números grandes */}
        <section style={{ padding: '6rem 1.5rem', background: 'linear-gradient(135deg, var(--st) 0%, #1a1a2e 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '1.5rem', lineHeight: 1.15 }}>
                Sobre {c.businessName}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '2.5rem' }}>{c.about}</p>
              {c.credential && <p style={{ color: 'var(--sa)', fontWeight: 600, fontSize: '0.875rem' }}>🏅 {c.credential}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {(c.stats ?? [
                { value: `${c.yearsExperience}+`, label: 'Anos de experiência' },
                { value: '500+', label: 'Projetos entregues' },
                { value: '98%', label: 'Clientes satisfeitos' },
                { value: '4.9★', label: 'Avaliação média' },
              ]).slice(0, 4).map((s, i) => (
                <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                  <p style={{ fontSize: '2.5rem', fontWeight: 900, color: i % 2 === 0 ? 'var(--sa)' : 'var(--sp)', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTFÓLIO — scattered */}
        {items.length > 0 && (
          <section style={{ padding: '6rem 1.5rem', backgroundColor: 'var(--sb)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: 'var(--st)', letterSpacing: '-0.03em', marginBottom: '3rem', textAlign: 'center' }}>
                Nossos trabalhos
              </h2>
              <div style={{ columns: '3', columnGap: '1rem' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ breakInside: 'avoid', marginBottom: '1rem', borderRadius: '1rem', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                    <img src={item.image} alt={item.title} width={400} height={i % 3 === 1 ? 300 : 200} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.75))', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DEPOIMENTOS — cards modernos */}
        <section style={{ padding: '6rem 1.5rem', background: 'linear-gradient(135deg, var(--st) 0%, #1a1a2e 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
              O que dizem sobre nós
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '1.25rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sp), var(--sa))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>{t.name}</p>
                      <p style={{ color: 'var(--sa)', fontSize: '0.75rem' }}>{'★'.repeat(t.rating)}</p>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.75 }}>"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteBlog c={c} dark />
        <SiteFAQ c={c} dark />

        {/* CTA gradiente */}
        <section style={{ background: 'linear-gradient(135deg, var(--sp) 0%, var(--sa) 100%)', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              {c.ctaLabel}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>
              Atendemos em {c.city} e região. Fale agora e comece seu projeto.
            </p>
            <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: '#fff', color: 'var(--sp)', padding: '1rem 3rem', borderRadius: '999px', fontWeight: 900, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              Falar agora →
            </a>
          </div>
        </section>

        <SiteFooter c={c} />
      </div>
    </>
  )
}
