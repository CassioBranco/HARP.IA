import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'

// ---------------------------------------------------------------------------
// SiteTemplate — renderiza o site publicado do assinante.
// Server Component puro: sem 'use client', sem estado.
// Conteúdo vem do onboarding_profiles/sections (por ora: exemplo hardcoded).
// Paleta injetada via CSS variables no <style> inline.
// ---------------------------------------------------------------------------

type Props = {
  content: SiteContent
  palette: PaletteColors
  preview?: boolean   // true = iframe/preview (desabilita links externos)
}

function cssVars(p: PaletteColors) {
  return `
    :root {
      --sp: ${p.primary};
      --ss: ${p.secondary};
      --sa: ${p.accent};
      --sb: ${p.bg};
      --sf: ${p.surface};
      --st: ${p.text};
      --sm: ${p.muted};
    }
  `
}

// Helpers de style inline para manter Server Component (sem Tailwind por nicho)
const s = {
  primary:   (extra = '') => ({ backgroundColor: 'var(--sp)', color: '#fff', ...parseExtra(extra) }),
  surface:   (extra = '') => ({ backgroundColor: 'var(--sf)', ...parseExtra(extra) }),
  bg:        (extra = '') => ({ backgroundColor: 'var(--sb)', ...parseExtra(extra) }),
  accent:    (extra = '') => ({ backgroundColor: 'var(--sa)', ...parseExtra(extra) }),
  text:      () => ({ color: 'var(--st)' }),
  muted:     () => ({ color: 'var(--sm)' }),
}

function parseExtra(extra: string): Record<string, string> {
  if (!extra) return {}
  return Object.fromEntries(
    extra.split(';').filter(Boolean).map(rule => {
      const [k, v] = rule.split(':').map(s => s.trim())
      return [k, v]
    })
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--sa)', fontSize: '1rem' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function SiteTemplate({ content: c, palette: p, preview = false }: Props) {
  const whatsappLink = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site e gostaria de mais informações.`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />

      {/* Schema JSON-LD — AEO Regra 2 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': c.schemaType,
            name: c.businessName,
            description: c.tagline,
            address: {
              '@type': 'PostalAddress',
              addressLocality: c.city,
              addressRegion: c.state,
              addressCountry: 'BR',
            },
            telephone: c.ctaPhone,
            email: c.email,
            url: preview ? undefined : `https://${c.businessName.toLowerCase().replace(/\s+/g, '')}.com.br`,
            areaServed: { '@type': 'City', name: c.city },
          }),
        }}
      />

      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        {/* ── NAV ─────────────────────────────────────────────────── */}
        <nav style={{ backgroundColor: 'var(--sp)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.01em' }}>
              {c.businessName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{c.city}/{c.state}</span>
              <a
                href={preview ? '#' : whatsappLink}
                style={{ backgroundColor: 'var(--sa)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                {c.ctaLabel}
              </a>
            </div>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: 'var(--sp)', padding: '5rem 1.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
          {/* Overlay decorativo */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '0.25rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {c.city} · {c.state} · {c.yearsExperience} anos de experiência
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              {c.heroHeadline}
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem', lineHeight: 1.65, maxWidth: '680px', margin: '0 auto 2.5rem' }}>
              {c.heroSub}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={preview ? '#' : whatsappLink}
                style={{ backgroundColor: 'var(--sa)', color: '#fff', padding: '0.9rem 2.5rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', display: 'inline-block' }}
              >
                {c.ctaLabel} →
              </a>
              <a
                href={preview ? '#' : `tel:${c.ctaPhone.replace(/\D/g, '')}`}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '0.625rem', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', display: 'inline-block' }}
              >
                📞 {c.ctaPhone}
              </a>
            </div>
          </div>
        </section>

        {/* ── SERVIÇOS ────────────────────────────────────────────── */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '0.75rem' }}>
                O que oferecemos
              </h2>
              <p style={{ color: 'var(--sm)', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto' }}>
                Serviços especializados para atender sua necessidade com qualidade e agilidade em {c.city}.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {c.services.map((svc, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}>
                  <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{svc.icon}</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--sp)', marginBottom: '0.625rem' }}>
                    {svc.name}
                  </h3>
                  <p style={{ color: 'var(--sm)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                    {svc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOBRE ───────────────────────────────────────────────── */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            {/* Placeholder de imagem */}
            <div style={{ backgroundColor: 'var(--sp)', borderRadius: '1.25rem', aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '3.5rem', opacity: 0.6 }}>📸</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Foto do profissional / equipe</span>
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1.25rem' }}>
                Sobre {c.businessName}
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '1rem' }}>
                {c.about}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ color: 'var(--sa)', fontSize: '1.1rem' }}>✓</span>
                  <span style={{ color: 'var(--st)', fontSize: '0.95rem', fontWeight: 500 }}>{c.yearsExperience} anos de experiência em {c.city}</span>
                </div>
                {c.credential && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ color: 'var(--sa)', fontSize: '1.1rem' }}>✓</span>
                    <span style={{ color: 'var(--st)', fontSize: '0.95rem', fontWeight: 500 }}>{c.credential}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ color: 'var(--sa)', fontSize: '1.1rem' }}>✓</span>
                  <span style={{ color: 'var(--st)', fontSize: '0.95rem', fontWeight: 500 }}>Atendimento presencial e online</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ─────────────────────────────────────────── */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              O que dizem nossos clientes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <StarRating rating={t.rating} />
                  <p style={{ color: 'var(--sm)', fontSize: '0.95rem', lineHeight: 1.7, margin: '0.75rem 0' }}>
                    "{t.text}"
                  </p>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--sp)' }}>— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ — AEO Regra 4: ≥6 perguntas + FAQPage schema ────── */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '0.75rem' }}>
              Perguntas frequentes
            </h2>
            <p style={{ color: 'var(--sm)', textAlign: 'center', marginBottom: '3rem' }}>
              Tire suas dúvidas sobre nossos serviços em {c.city}.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {c.faqs.map((faq, i) => (
                <details key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <summary style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--st)', cursor: 'pointer', fontSize: '1rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {faq.question}
                    <span style={{ color: 'var(--sp)', fontSize: '1.25rem', fontWeight: 300, flexShrink: 0 }}>+</span>
                  </summary>
                  <p style={{ padding: '0 1.5rem 1.25rem', color: 'var(--sm)', lineHeight: 1.75, fontSize: '0.95rem' }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* FAQPage schema — AEO Regra 4 */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: c.faqs.map(f => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: { '@type': 'Answer', text: f.answer },
                })),
              }),
            }}
          />
        </section>

        {/* ── CTA FINAL ───────────────────────────────────────────── */}
        <section style={{ backgroundColor: 'var(--sp)', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
              Pronto para resolver isso hoje?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>
              Entre em contato agora. Atendemos em {c.city} e região — presencial e online.
            </p>
            <a
              href={preview ? '#' : whatsappLink}
              style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', padding: '1rem 3rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            >
              {c.ctaLabel} pelo WhatsApp →
            </a>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <footer style={{ backgroundColor: 'var(--st)', padding: '2.5rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{c.businessName}</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>{c.address}</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>{c.email} · {c.ctaPhone}</span>
            {c.credential && (
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{c.credential}</span>
            )}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              © {new Date().getFullYear()} {c.businessName} · Site criado com HARPIA
            </span>
          </div>
        </footer>

      </div>
    </>
  )
}
