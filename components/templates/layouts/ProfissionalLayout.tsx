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

export default function ProfissionalLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        <SiteNav c={c} preview={preview} variant="phone" />

        {/* HERO — texto + credenciais box */}
        <section style={{ backgroundColor: 'var(--sp)', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--sa)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                {c.city} · {c.state} · Desde {new Date().getFullYear() - c.yearsExperience}
              </p>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                {c.heroHeadline}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, fontSize: '1.05rem', marginBottom: '2rem' }}>
                {c.heroSub}
              </p>
              <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', padding: '0.9rem 2.25rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                {c.ctaLabel} →
              </a>
            </div>
            {/* Box de credenciais */}
            <div style={{ backgroundColor: '#fff', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sm)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Por que nos escolher</p>
              {(c.stats ?? [
                { value: `${c.yearsExperience}+`, label: 'Anos de experiência' },
                { value: '500+', label: 'Clientes atendidos' },
                { value: '98%', label: 'Satisfação' },
              ]).slice(0, 4).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--sp)', minWidth: '60px' }}>{s.value}</span>
                  <span style={{ color: 'var(--st)', fontSize: '0.875rem', fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
              {c.credential && (
                <div style={{ marginTop: '1.25rem', backgroundColor: 'var(--sb)', borderRadius: '0.625rem', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--sm)', fontWeight: 600 }}>
                  🏅 {c.credential}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BARRA DE CONFIANÇA */}
        <section style={{ backgroundColor: 'var(--sf)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '1.25rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {['Atendimento Garantido', 'Transparência Total', `${c.yearsExperience}+ Anos de Experiência`, 'Suporte Pós-Atendimento'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sm)', fontSize: '0.875rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--sa)' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </section>

        {/* SERVIÇOS — lista com ícones */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '0.75rem' }}>
                Serviços especializados em {c.city}
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Cada caso tratado com atenção individual, profissionalismo e comprometimento com o resultado.
              </p>
              <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sp)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                Falar com especialista →
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {c.services.map((svc, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', backgroundColor: 'var(--sf)', borderRadius: '0.875rem', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>{svc.icon}</div>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--sp)', marginBottom: '0.375rem', fontSize: '1rem' }}>{svc.name}</h3>
                    <p style={{ color: 'var(--sm)', fontSize: '0.875rem', lineHeight: 1.65 }}>{svc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE + TIMELINE */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1.25rem' }}>
                Sobre {c.businessName}
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{c.about}</p>
              {c.credential && (
                <div style={{ backgroundColor: 'var(--sb)', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏅</span>
                  <span style={{ color: 'var(--st)', fontWeight: 600, fontSize: '0.9rem' }}>{c.credential}</span>
                </div>
              )}
            </div>
            <div>
              <img src={c.aboutImage} alt={`Sobre ${c.businessName}`} width={600} height={500} style={{ width: '100%', borderRadius: '1rem', objectFit: 'cover', display: 'block', aspectRatio: '4/3' }} />
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS — estilo citação */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              Resultados que falam por si
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ borderLeft: '4px solid var(--sa)', paddingLeft: '1.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                  <p style={{ color: 'var(--sm)', fontSize: '0.975rem', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1rem' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--sp)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--st)', fontSize: '0.875rem' }}>{t.name}</p>
                      <p style={{ color: 'var(--sa)', fontSize: '0.8rem' }}>{'★'.repeat(t.rating)}</p>
                    </div>
                  </div>
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
