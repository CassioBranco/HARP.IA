import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import SiteNav from '../shared/SiteNav'
import SiteFAQ from '../shared/SiteFAQ'
import SiteFooter from '../shared/SiteFooter'
import SiteSchema from '../shared/SiteSchema'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

export default function ConversaoLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site e quero saber mais.`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        <SiteNav c={c} preview={preview} variant="minimal" />

        {/* HERO — CTA acima do fold, sem distração */}
        <section style={{ backgroundColor: 'var(--sp)', padding: '5rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', borderRadius: '999px', padding: '0.25rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ⚡ {c.city} · {c.state}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
              {c.heroHeadline}
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 2.5rem' }}>
              {c.heroSub}
            </p>
            <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', padding: '1.1rem 3rem', borderRadius: '0.625rem', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 8px 28px rgba(0,0,0,0.35)', letterSpacing: '-0.01em' }}>
              {c.ctaLabel} →
            </a>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginTop: '1rem' }}>
              📞 Ou ligue: <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>{c.ctaPhone}</a>
            </p>
          </div>
        </section>

        {/* PROBLEMA × SOLUÇÃO */}
        {(c.problemStatement || c.solutionStatement) && (
          <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ backgroundColor: '#fff2f2', borderRadius: '1rem', padding: '2rem', borderLeft: '4px solid #ef4444' }}>
                <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>😓 O problema</p>
                <p style={{ color: '#374151', lineHeight: 1.75, fontSize: '1.025rem' }}>
                  {c.problemStatement ?? 'Você enfrenta desafios diários que impactam sua qualidade de vida e seus resultados. O problema existe e precisa de solução especializada.'}
                </p>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '1rem', padding: '2rem', borderLeft: '4px solid #16a34a' }}>
                <p style={{ fontWeight: 700, color: '#15803d', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>✅ A solução</p>
                <p style={{ color: '#374151', lineHeight: 1.75, fontSize: '1.025rem' }}>
                  {c.solutionStatement ?? `Com ${c.yearsExperience} anos de experiência e método comprovado em ${c.city}, entregamos resultados reais para quem busca mais do que promessas.`}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* PROVA SOCIAL — números */}
        {c.stats && (
          <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--sb)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p style={{ textAlign: 'center', color: 'var(--sm)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2rem' }}>
                Resultados comprovados em {c.city}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {c.stats.map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--sf)', borderRadius: '0.875rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--sp)', lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--sm)', marginTop: '0.375rem' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* BENEFÍCIOS — lista compacta */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1.5rem' }}>
                O que você recebe com {c.businessName}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {c.services.map((svc, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--sp)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--st)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{svc.name}</p>
                      <p style={{ color: 'var(--sm)', fontSize: '0.875rem', lineHeight: 1.6 }}>{svc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={c.heroImage} alt={c.businessName} width={800} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS — compactos */}
        <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <p style={{ textAlign: 'center', color: 'var(--sm)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2rem' }}>O que dizem nossos clientes</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '0.875rem', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <p style={{ color: 'var(--sa)', fontSize: '1rem', marginBottom: '0.625rem' }}>{'★'.repeat(t.rating)}</p>
                  <p style={{ color: 'var(--sm)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.875rem' }}>"{t.text}"</p>
                  <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--sp)' }}>— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteFAQ c={c} />

        {/* CTA FINAL — máxima pressão */}
        <section style={{ backgroundColor: 'var(--sa)', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Não espere mais. Comece hoje.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>
              Atendemos em {c.city} e região. Resposta em até 2 horas em dias úteis.
            </p>
            <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: '#fff', color: 'var(--sp)', padding: '1.1rem 3rem', borderRadius: '0.625rem', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}>
              {c.ctaLabel} →
            </a>
          </div>
        </section>

        <SiteFooter c={c} mini />
      </div>
    </>
  )
}
