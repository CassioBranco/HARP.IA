import type { SiteContent } from '@/lib/templates/example-content'
import SiteBrand from '../shared/SiteBrand'
import Icon from '../shared/Icon'
import type { PaletteColors } from '@/lib/templates/palettes'
import SiteFAQ from '../shared/SiteFAQ'
import SiteBlog from '../shared/SiteBlog'
import SiteFooter from '../shared/SiteFooter'
import SiteSchema from '../shared/SiteSchema'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted};--ink:#161310;--paper:#ECE6D6}`
}

export default function JovemLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`

  const smash: React.CSSProperties = {
    fontFamily: "'Arial Black','Helvetica Neue',Impact,sans-serif",
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    lineHeight: 0.92,
  }

  const mono: React.CSSProperties = {
    fontFamily: "'Courier New',Courier,monospace",
  }

  const wrap: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />

      <div style={{ fontFamily: "'Courier New',Courier,monospace", backgroundColor: 'var(--paper)', color: 'var(--ink)', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* NAV — borda grossa */}
        <nav style={{ borderBottom: '3px solid var(--ink)', backgroundColor: 'var(--paper)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
            <span style={{ ...smash, fontSize: '1.5rem', lineHeight: 1 }}>
              <SiteBrand c={c}>{c.businessName.split(' ')[0]} <b style={{ color: 'var(--sp)' }}>{c.businessName.split(' ').slice(1).join(' ') || '.'}</b></SiteBrand>
            </span>
            <div style={{ display: 'flex', gap: '1.6rem', alignItems: 'center', ...mono, fontSize: '.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {['Serviços', 'Equipe', 'Blog', 'Contato'].map(item => (
                <a key={item} href="#" style={{ textDecoration: 'none', color: 'inherit' }}>{item}</a>
              ))}
              <a href={href(whatsapp)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                backgroundColor: 'var(--sp)', color: '#fff',
                padding: '.55rem 1.1rem', border: '3px solid var(--ink)',
                boxShadow: '4px 4px 0 var(--ink)', ...smash, textTransform: 'uppercase',
                fontWeight: 900, fontSize: '.82rem', textDecoration: 'none',
                transition: 'transform .12s ease, box-shadow .12s ease',
              }}>
                {c.ctaLabel}
              </a>
            </div>
          </div>
        </nav>

        {/* HERO — colagem zine */}
        <header style={{ position: 'relative', overflow: 'hidden', borderBottom: '3px solid var(--ink)' }}>
          <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: '2.5rem', alignItems: 'center', padding: '3.5rem 2rem 4.5rem' }}>
            {/* Coluna esquerda */}
            <div>
              {/* Sticker */}
              <span style={{
                display: 'inline-block', backgroundColor: 'var(--sa)', color: 'var(--ink)',
                ...mono, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                padding: '.4rem .9rem', border: '2.5px solid var(--ink)',
                boxShadow: '4px 4px 0 var(--ink)', transform: 'rotate(-3deg)',
                fontSize: '.8rem', marginBottom: '1.2rem',
              }}>
                <Icon name="bolt" size={14} /> {c.tagline ?? c.city} · {c.city}
              </span>

              {/* H1 — tipografia tripla */}
              <h1 style={{ ...smash, fontSize: 'clamp(3rem, 9vw, 7rem)', lineHeight: .82, margin: '0 0 1.4rem' }}>
                <span style={{ color: 'var(--ink)' }}>{c.heroHeadline.split(/[,.]|–/)[0]?.trim() || c.heroHeadline}</span>
                {c.heroHeadline.split(/[,.]|–/).length > 1 && (
                  <span style={{ color: 'var(--sp)', display: 'block' }}>{c.heroHeadline.split(/[,.]|–/)[1]?.trim()}</span>
                )}
                <span style={{ WebkitTextStroke: '2.5px var(--ink)', color: 'transparent', display: 'block' }}>
                  {c.city}
                </span>
              </h1>

              <p style={{ ...mono, fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '28rem', margin: '0 0 2rem' }}>
                {c.heroSub}
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <a href={href(whatsapp)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                  backgroundColor: 'var(--sp)', color: '#fff',
                  padding: '.95rem 1.9rem', border: '3px solid var(--ink)',
                  boxShadow: '6px 6px 0 var(--ink)', ...smash,
                  fontSize: '1rem', textDecoration: 'none',
                }}>
                  {c.ctaLabel}
                </a>
                <a href={href(`tel:${c.ctaPhone.replace(/\D/g, '')}`)} style={{
                  display: 'inline-flex', alignItems: 'center',
                  backgroundColor: 'var(--ss)', color: 'var(--ink)',
                  padding: '.95rem 1.9rem', border: '3px solid var(--ink)',
                  boxShadow: '6px 6px 0 var(--ink)', ...smash,
                  fontSize: '1rem', textDecoration: 'none',
                }}>
                  {c.ctaPhone}
                </a>
              </div>
            </div>

            {/* Coluna direita — frame rotacionado */}
            <div style={{ position: 'relative' }}>
              {/* Fita crepe top */}
              <div style={{
                position: 'absolute', top: '-16px', left: '30px',
                width: '120px', height: '34px',
                background: 'color-mix(in srgb, var(--sa) 75%, transparent)',
                borderLeft: '1px dashed rgb(0 0 0 / .2)', borderRight: '1px dashed rgb(0 0 0 / .2)',
                boxShadow: '0 1px 4px rgb(0 0 0 / .15)',
                transform: 'rotate(-8deg)', zIndex: 3,
              }} />
              {/* Frame principal */}
              <div style={{
                border: '3px solid var(--ink)', boxShadow: '10px 10px 0 var(--sp)',
                transform: 'rotate(2deg)', overflow: 'hidden', position: 'relative',
              }}>
                <img
                  src={c.heroImage ?? `https://picsum.photos/seed/${c.businessName}-hero/640/800`}
                  alt={`${c.businessName} – ${c.city}`}
                  width={640} height={800}
                  style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block', filter: 'grayscale(1) contrast(1.2)', mixBlendMode: 'multiply' }}
                />
                {/* Overlay de cor */}
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ss)', mixBlendMode: 'screen', opacity: .4 }} />
              </div>
              {/* Fita crepe bottom */}
              <div style={{
                position: 'absolute', bottom: '24px', right: '-20px',
                width: '90px', height: '34px',
                background: 'color-mix(in srgb, var(--sa) 75%, transparent)',
                borderLeft: '1px dashed rgb(0 0 0 / .2)', borderRight: '1px dashed rgb(0 0 0 / .2)',
                boxShadow: '0 1px 4px rgb(0 0 0 / .15)',
                transform: 'rotate(6deg)', zIndex: 3,
              }} />
              {/* Stamp */}
              <div style={{
                position: 'absolute', bottom: '-22px', left: '-22px',
                width: '96px', height: '96px', borderRadius: '50%',
                backgroundColor: 'var(--sa)', border: '3px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', ...smash, fontSize: '.72rem', lineHeight: .95,
                transform: 'rotate(-12deg)', boxShadow: '4px 4px 0 var(--ink)', zIndex: 4,
              }}>
                {c.yearsExperience}+<br />anos
              </div>
            </div>
          </div>
        </header>

        {/* TICKER — marquee bruto */}
        <div style={{ backgroundColor: 'var(--sp)', color: '#fff', borderBottom: '3px solid var(--ink)', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', gap: '2rem', padding: '.7rem 0',
            ...smash, fontSize: '1.1rem', letterSpacing: '.02em',
            whiteSpace: 'nowrap', justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {c.services.map((svc, i) => (
              <span key={i} style={{ display: 'inline-flex', gap: '2rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--sa)' }}>✸</span> {svc.name}
              </span>
            ))}
            <span style={{ color: 'var(--sa)' }}>✸</span> {c.city}/{c.state}
          </div>
        </div>

        {/* SERVIÇOS — flash grid 4 colunas */}
        <section style={{ padding: '5.5rem 0' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '2.8rem' }}>
              <span style={{ ...mono, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--sp)' }}>
                // O que fazemos
              </span>
              <h2 style={{ ...smash, fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', margin: '.6rem 0 .5rem' }}>
                Serviços &amp; estilos
              </h2>
              <p style={{ ...mono, fontSize: '1rem', maxWidth: '38rem' }}>
                Arte com técnica, entrega com energia. Cada serviço pensado para {c.city} e região.
              </p>
            </div>

            {/* Flash grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }}>
              {c.services.map((svc, i) => (
                <div key={i} style={{
                  position: 'relative', border: '3px solid var(--ink)', overflow: 'hidden',
                  aspectRatio: '1', boxShadow: '5px 5px 0 var(--ink)', backgroundColor: 'var(--paper)',
                  transform: i % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1.5deg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  padding: '1.5rem',
                }}>
                  {/* Overlay de cor por posição */}
                  <div style={{
                    position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: .15,
                    background: i % 4 === 0 ? 'var(--sp)' : i % 4 === 1 ? 'var(--ss)' : i % 4 === 2 ? 'var(--sa)' : 'var(--sp)',
                  }} />
                  <div style={{ fontSize: '2.5rem', marginBottom: '.75rem', position: 'relative', zIndex: 2 }}>{svc.image ? <img src={svc.image} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} /> : svc.icon}</div>
                  <h3 style={{ ...smash, fontSize: '1rem', margin: '0 0 .5rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>{svc.name}</h3>
                  <p style={{ ...mono, fontSize: '.7rem', textAlign: 'center', lineHeight: 1.4, margin: 0, position: 'relative', zIndex: 2, opacity: .8 }}>{svc.description}</p>
                  {/* Label bottom */}
                  <span style={{
                    position: 'absolute', left: '.5rem', bottom: '.5rem', zIndex: 3,
                    backgroundColor: 'var(--paper)', color: 'var(--ink)', ...mono,
                    fontWeight: 700, fontSize: '.7rem', textTransform: 'uppercase',
                    padding: '.2rem .5rem', border: '2px solid var(--ink)',
                  }}>{svc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EQUIPE — crew dark */}
        {c.team && c.team.length > 0 && (
          <section style={{ padding: '5.5rem 0', backgroundColor: 'var(--ink)', color: 'var(--paper)' }}>
            <div style={wrap}>
              <div style={{ marginBottom: '2.8rem' }}>
                <span style={{ ...mono, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--sa)' }}>
                  // Quem segura o trampo
                </span>
                <h2 style={{ ...smash, fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', margin: '.6rem 0 .5rem', color: 'var(--paper)' }}>
                  A equipe
                </h2>
                <p style={{ ...mono, color: 'color-mix(in srgb, var(--paper) 75%, transparent)', fontSize: '1rem' }}>
                  Profissionais que respiram {c.tagline ?? 'o ofício'} e entregam com qualidade.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.8rem' }}>
                {c.team.map((member, i) => (
                  <div key={i} style={{
                    border: '3px solid var(--paper)', boxShadow: '6px 6px 0 var(--sp)',
                    backgroundColor: 'color-mix(in srgb, var(--paper) 8%, var(--ink))',
                  }}>
                    <div style={{ aspectRatio: '1', overflow: 'hidden', borderBottom: '3px solid var(--paper)', position: 'relative' }}>
                      <img
                        src={member.image}
                        alt={member.name}
                        width={420} height={420}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(1) contrast(1.2)' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--ss)', mixBlendMode: 'screen', opacity: .35 }} />
                    </div>
                    <div style={{ padding: '1rem 1.1rem' }}>
                      <h3 style={{ ...smash, fontSize: '1.3rem', margin: '0 0 .2rem', color: 'var(--paper)' }}>{member.name}</h3>
                      <div style={{ ...mono, fontSize: '.78rem', color: 'var(--sa)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* COMO FUNCIONA — steps */}
        <section style={{ padding: '5.5rem 0' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '2.8rem', textAlign: 'center' }}>
              <span style={{ ...mono, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--sp)' }}>
                // Sem mistério
              </span>
              <h2 style={{ ...smash, fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', margin: '.6rem 0 .5rem' }}>
                Como funciona
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {[
                { n: '01', title: 'Fale com a gente', desc: `Entre em contato pelo WhatsApp ou telefone. Atendemos em ${c.city} e região.` },
                { n: '02', title: 'Diagnóstico gratuito', desc: 'Analisamos sua situação e apresentamos as melhores opções sem compromisso.' },
                { n: '03', title: 'Resultado garantido', desc: `Execução com qualidade, prazo e comprometimento total com o seu resultado.` },
              ].map((step, i) => (
                <div key={i} style={{
                  border: '3px solid var(--ink)', backgroundColor: 'var(--paper)',
                  boxShadow: '6px 6px 0 var(--ink)', padding: '1.5rem',
                  transform: i === 1 ? 'rotate(-1deg)' : undefined,
                }}>
                  <div style={{ ...smash, fontSize: '2.6rem', lineHeight: 1, color: 'var(--sp)', WebkitTextStroke: '1.5px var(--ink)' }}>{step.n}</div>
                  <h3 style={{ ...smash, fontSize: '1.15rem', margin: '.6rem 0 .4rem' }}>{step.title}</h3>
                  <p style={{ ...mono, fontSize: '.9rem', lineHeight: 1.55, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEPOIMENTO — shout */}
        {c.testimonials && c.testimonials.length > 0 && (
          <section style={{ padding: '5.5rem 0', backgroundColor: 'var(--ink)', color: 'var(--paper)', textAlign: 'center' }}>
            <div style={wrap}>
              <span style={{ ...mono, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--sa)' }}>
                // {c.testimonials.length}+ avaliações positivas
              </span>
              <blockquote style={{
                ...smash, fontSize: 'clamp(1.8rem, 5vw, 3.6rem)', lineHeight: .95,
                letterSpacing: '-0.02em', margin: '1.2rem auto',
                maxWidth: '18ch', textTransform: 'uppercase',
              }}>
                &ldquo;{c.testimonials[0]!.text.split(' ').slice(0, 12).join(' ')}&rdquo;
              </blockquote>
              <cite style={{ ...mono, fontStyle: 'normal', color: 'color-mix(in srgb, var(--paper) 80%, transparent)', fontSize: '.9rem' }}>
                {c.testimonials[0]!.name}
              </cite>
            </div>
          </section>
        )}

        {/* SOBRE — about com imagem */}
        <section style={{ padding: '5.5rem 0' }}>
          <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ border: '3px solid var(--ink)', boxShadow: '8px 8px 0 var(--sp)', overflow: 'hidden', transform: 'rotate(-1.5deg)' }}>
                <img
                  src={c.aboutImage}
                  alt={`${c.businessName} – sobre nós`}
                  width={600} height={500}
                  style={{ width: '100%', aspectRatio: '5/4', objectFit: 'cover', display: 'block', filter: 'grayscale(1) contrast(1.1)', mixBlendMode: 'multiply' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--sa)', mixBlendMode: 'screen', opacity: .3 }} />
              </div>
            </div>
            <div>
              <span style={{ ...mono, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--sp)' }}>
                // Sobre nós
              </span>
              <h2 style={{ ...smash, fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '.6rem 0 1rem' }}>
                {c.businessName}
              </h2>
              <p style={{ ...mono, fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{c.about}</p>
              {c.credential && (
                <div style={{
                  backgroundColor: 'var(--sa)', color: 'var(--ink)',
                  ...mono, fontWeight: 700, fontSize: '.8rem', textTransform: 'uppercase',
                  padding: '.4rem .9rem', border: '2.5px solid var(--ink)',
                  boxShadow: '4px 4px 0 var(--ink)',
                  display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                }}>
                  <Icon name="award" size={15} /> {c.credential}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                {(c.stats ?? [
                  { value: `${c.yearsExperience}+`, label: 'Anos de experiência' },
                  { value: '200+', label: 'Clientes atendidos' },
                  { value: '4.9★', label: 'Avaliação média' },
                  { value: '100+', label: 'Avaliações' },
                ]).slice(0, 4).map((s, i) => (
                  <div key={i} style={{ border: '3px solid var(--ink)', backgroundColor: 'var(--paper)', boxShadow: '4px 4px 0 var(--ink)', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ ...smash, fontSize: '2rem', color: i % 2 === 0 ? 'var(--sp)' : 'var(--sa)', margin: 0, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ ...mono, fontSize: '.7rem', margin: '.3rem 0 0', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <SiteBlog c={c} />
        <SiteFAQ c={c} />

        {/* CTA FINAL — dark band */}
        <section style={{ padding: '5.5rem 0', backgroundColor: 'var(--ink)', color: 'var(--paper)', textAlign: 'center', position: 'relative' }}>
          <div style={wrap}>
            <span style={{ ...mono, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--sa)' }}>
              // Bora?
            </span>
            <h2 style={{ ...smash, fontSize: 'clamp(2.6rem, 8vw, 6rem)', lineHeight: .85, letterSpacing: '-0.03em', margin: '.6rem 0 1.4rem', color: 'var(--paper)' }}>
              Fala com a <span style={{ WebkitTextStroke: '2.5px var(--paper)', color: 'transparent' }}>gente</span>
            </h2>
            <p style={{ ...mono, fontSize: '1.05rem', margin: '0 0 2rem', color: 'color-mix(in srgb, var(--paper) 80%, transparent)' }}>
              Atendemos em {c.city} e região. Manda a ideia no zap.
            </p>
            <a href={href(whatsapp)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              backgroundColor: 'var(--ss)', color: 'var(--ink)',
              padding: '1.1rem 2.4rem', border: '3px solid var(--paper)',
              boxShadow: '6px 6px 0 var(--sp)', ...smash,
              fontSize: '1.1rem', textDecoration: 'none',
            }}>
              Chamar no WhatsApp <Icon name="arrow-right" size={18} />
            </a>
          </div>
        </section>

        <SiteFooter c={c} />
      </div>
    </>
  )
}
