import type { SiteContent } from '@/lib/templates/example-content'
import SiteBrand from '../shared/SiteBrand'
import Icon from '../shared/Icon'
import type { PaletteColors } from '@/lib/templates/palettes'
import SiteFAQ from '../shared/SiteFAQ'
import SiteBlog from '../shared/SiteBlog'
import SiteFooter from '../shared/SiteFooter'
import SiteSchema from '../shared/SiteSchema'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted};--line:rgb(255 255 255 / .1)}`
}

export default function TechLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`

  const heading: React.CSSProperties = {
    fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
    fontWeight: 800,
  }

  const wrap: React.CSSProperties = {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 2rem',
  }

  const gradText: React.CSSProperties = {
    background: 'linear-gradient(100deg, var(--sp), var(--ss) 55%, var(--sa))',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  }

  const kicker: React.CSSProperties = {
    fontFamily: "'JetBrains Mono','Courier New',monospace",
    fontSize: '.78rem',
    fontWeight: 700,
    letterSpacing: '.25em',
    textTransform: 'uppercase',
    color: 'var(--sa)',
  }

  const btn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '.5rem',
    background: 'linear-gradient(100deg, var(--sp), var(--ss))',
    color: '#fff', padding: '1rem 2rem', borderRadius: '999px',
    fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
    boxShadow: '0 8px 30px color-mix(in srgb, var(--sp) 35%, transparent)',
    transition: 'transform .2s, box-shadow .2s',
  }

  const btnGhost: React.CSSProperties = {
    ...btn,
    background: 'transparent',
    border: '1px solid rgb(255 255 255 / .2)',
    boxShadow: 'none',
  }

  const services = c.services ?? []
  const stats = c.stats ?? [
    { value: `${c.yearsExperience}+`, label: 'Anos de experiência' },
    { value: '200+', label: 'Clientes atendidos' },
    { value: '4.9★', label: 'Avaliação média' },
    { value: '100+', label: 'Avaliações' },
  ]

  const colorCycle = ['var(--sa)', 'var(--ss)', 'var(--sp)'] as const

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />

      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* NAV — glassmorphism */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'color-mix(in srgb, var(--sb) 80%, transparent)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.3rem 2rem' }}>
            <span style={{ ...heading, fontSize: '1.4rem', letterSpacing: '.02em' }}>
              <SiteBrand c={c}>{c.businessName.split(' ')[0]}<span style={gradText}>.</span></SiteBrand>
            </span>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '.92rem', color: 'var(--sm)' }}>
              {['Serviços', 'Sobre', 'Blog', 'Dúvidas'].map(item => (
                <a key={item} href="#" style={{ textDecoration: 'none', color: 'inherit' }}>{item}</a>
              ))}
              <a href={href(whatsapp)} style={{ ...btn, padding: '.6rem 1.4rem', fontSize: '.9rem' }}>
                {c.ctaLabel}
              </a>
            </div>
          </div>
        </nav>

        {/* HERO — assimétrico 3fr/2fr */}
        <header style={{ position: 'relative' }}>
          {/* Glow blobs */}
          <div style={{ position: 'absolute', top: '-100px', left: '-60px', width: '420px', height: '420px', borderRadius: '50%', background: 'var(--sp)', filter: 'blur(90px)', opacity: .5, zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '120px', right: '-80px', width: '380px', height: '380px', borderRadius: '50%', background: 'var(--ss)', filter: 'blur(90px)', opacity: .4, zIndex: 0, pointerEvents: 'none' }} />

          <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '3rem', alignItems: 'center', padding: '4rem 2rem 6rem', position: 'relative', zIndex: 2 }}>
            <div>
              <span style={kicker}>{c.tagline ?? c.schemaType} · {c.city}/{c.state}</span>
              <h1 style={{ ...heading, fontSize: 'clamp(3rem, 7.5vw, 6rem)', lineHeight: .96, letterSpacing: '-0.03em', margin: '1.3rem 0 1.4rem' }}>
                {c.heroHeadline.split(/[,.]|–/)[0]?.trim() || c.heroHeadline}{' '}
                <span style={gradText}>
                  {c.heroHeadline.split(/[,.]|–/)[1]?.trim() || c.city}
                </span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--sm)', lineHeight: 1.6, margin: '0 0 2.2rem', maxWidth: '30rem' }}>
                {c.heroSub}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href={href(whatsapp)} style={btn}>{c.ctaLabel} <Icon name="arrow-right" size={17} /></a>
                <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={btnGhost}>{c.ctaPhone}</a>
              </div>
            </div>

            {/* Hero card */}
            <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 30px 60px color-mix(in srgb, var(--sp) 30%, transparent)' }}>
              <img
                src={c.heroImage ?? `https://picsum.photos/seed/${c.businessName}-hero/640/854`}
                alt={`${c.businessName} – ${c.city}`}
                width={640} height={854}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '1.6rem', background: 'linear-gradient(to top, rgb(0 0 0 / .8), transparent)', fontWeight: 700, fontSize: '1.1rem' }}>
                <span style={{ color: 'var(--sa)' }}>+{c.yearsExperience * 10}</span> clientes atendidos ✦
              </div>
            </div>
          </div>
        </header>

        {/* STRIP — marquee */}
        <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '1.2rem 0' }}>
          <div style={{ ...wrap }}>
            <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap', fontFamily: "'Space Grotesk',system-ui,sans-serif", fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', fontSize: '1rem', color: 'var(--sm)' }}>
              {services.map((svc, i) => (
                <div key={i}>{svc.name} <span style={{ color: 'var(--ss)' }}>✦</span></div>
              ))}
              <div>{c.city}/{c.state} <span style={{ color: 'var(--ss)' }}>✦</span></div>
            </div>
          </div>
        </div>

        {/* STATS — 4 colunas */}
        <section style={{ padding: '6rem 0', position: 'relative' }}>
          <div style={wrap}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {stats.slice(0, 4).map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--line)', borderRadius: '20px', backgroundColor: 'var(--sf)' }}>
                  <div style={{ ...heading, fontSize: 'clamp(2rem, 4vw, 3rem)', ...gradText }}>{s.value}</div>
                  <div style={{ color: 'var(--sm)', fontSize: '.85rem', marginTop: '.3rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVIÇOS — masonry */}
        <section style={{ padding: '6rem 0', position: 'relative' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '3rem' }}>
              <span style={kicker}>Os serviços</span>
              <h2 style={{ ...heading, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', margin: '.8rem 0 .6rem', lineHeight: 1.02, letterSpacing: '-0.02em' }}>
                Escolha o seu <span style={gradText}>caminho</span>
              </h2>
              <p style={{ color: 'var(--sm)', fontSize: '1.1rem', margin: 0 }}>
                Cada serviço, uma forma diferente de entregar resultado em {c.city}.
              </p>
            </div>

            {/* Masonry — 3 colunas */}
            <div style={{ columns: 3, columnGap: '1.25rem' }}>
              {services.map((svc, i) => (
                <div key={i} style={{
                  breakInside: 'avoid', marginBottom: '1.25rem',
                  borderRadius: '22px', overflow: 'hidden', position: 'relative',
                  backgroundColor: 'var(--sf)', border: '1px solid var(--line)',
                  padding: '2rem',
                  minHeight: i % 3 === 1 ? '280px' : '200px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                  <span style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{svc.icon}</span>
                  <span style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 800, color: colorCycle[i % 3] }}>
                    {c.tagline ?? c.schemaType}
                  </span>
                  <h3 style={{ ...heading, margin: '.3rem 0 0', fontSize: '1.4rem' }}>{svc.name}</h3>
                  <p style={{ color: 'var(--sm)', fontSize: '.9rem', marginTop: '.5rem', lineHeight: 1.6 }}>{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE — grid 1/1 */}
        <section style={{ padding: '6rem 0', position: 'relative' }}>
          <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              {/* Glow atrás da imagem */}
              <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '340px', height: '340px', borderRadius: '50%', background: 'var(--sa)', filter: 'blur(90px)', opacity: .35, zIndex: 0, pointerEvents: 'none' }} />
              <img
                src={c.aboutImage}
                alt={`${c.businessName} – espaço e equipe`}
                width={720} height={560}
                style={{ width: '100%', borderRadius: '24px', position: 'relative', zIndex: 2, display: 'block' }}
                loading="lazy"
              />
            </div>
            <div>
              <span style={kicker}>Sobre {c.businessName}</span>
              <h2 style={{ ...heading, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.05, margin: '.8rem 0 1.2rem' }}>
                Um lugar pra <span style={gradText}>crescer sem medo</span>
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.7, margin: '0 0 1.4rem' }}>{c.about}</p>
              {c.credential && (
                <p style={{ color: 'var(--sa)', fontWeight: 700, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><Icon name="award" size={16} /> {c.credential}</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', marginTop: '1.2rem' }}>
                {c.services.slice(0, 3).map((svc, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'baseline' }}>
                    <span style={{ color: colorCycle[i % 3], fontWeight: 800 }}>✦</span> {svc.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTO — centrado */}
        {c.testimonials && c.testimonials.length > 0 && (
          <section style={{ padding: '6rem 0', position: 'relative' }}>
            {/* Glow central */}
            <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', width: '380px', height: '380px', borderRadius: '50%', background: 'var(--ss)', filter: 'blur(90px)', opacity: .4, zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ ...wrap }}>
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
                <span style={kicker}>Quem atendemos, aprova</span>
                <blockquote style={{ ...heading, fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '1.4rem 0 1.6rem' }}>
                  &ldquo;{c.testimonials[0]!.text}&rdquo;
                </blockquote>
                <cite style={{ fontStyle: 'normal', color: 'var(--sm)', fontSize: '1rem' }}>
                  {c.testimonials[0]!.name}
                </cite>
              </div>
            </div>
          </section>
        )}

        <SiteBlog c={c} dark />
        <SiteFAQ c={c} dark />

        {/* CTA FINAL */}
        <section style={{ padding: '6rem 0', position: 'relative', textAlign: 'center' }}>
          {/* Glows */}
          <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', width: '420px', height: '420px', borderRadius: '50%', background: 'var(--sp)', filter: 'blur(90px)', opacity: .5, zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: '10%', bottom: 0, width: '340px', height: '340px', borderRadius: '50%', background: 'var(--sa)', filter: 'blur(90px)', opacity: .35, zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ ...wrap, position: 'relative', zIndex: 2 }}>
            <span style={kicker}>Bora?</span>
            <h2 style={{ ...heading, fontSize: 'clamp(2.4rem, 6.5vw, 5rem)', letterSpacing: '-0.03em', lineHeight: .98, margin: '.8rem 0 1.4rem' }}>
              Sua primeira consulta<br /><span style={gradText}>é por nossa conta.</span>
            </h2>
            <p style={{ color: 'var(--sm)', fontSize: '1.2rem', margin: '0 0 2.4rem' }}>
              Atendemos em {c.city} e região. Agende agora e venha sentir a diferença.
            </p>
            <a href={href(whatsapp)} style={{ ...btn, padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
              {c.ctaLabel} no WhatsApp <Icon name="arrow-right" size={18} />
            </a>
          </div>
        </section>

        <SiteFooter c={c} />
      </div>
    </>
  )
}
