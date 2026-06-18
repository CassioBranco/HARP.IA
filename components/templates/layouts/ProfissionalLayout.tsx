import type { SiteContent } from '@/lib/templates/example-content'
import SiteBrand from '../shared/SiteBrand'
import type { PaletteColors } from '@/lib/templates/palettes'

function cssVars(p: PaletteColors): string {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

const templateCSS = `
/* ════════════════════════════════════════════════════════════
   PROFISSIONAL — Corporativo Swiss · CSS compartilhado
   Grid rigoroso, numeração, citação tipográfica gigante.
   Paleta via --sp/--ss/--sa/--sb/--sf/--st/--sm.
   ════════════════════════════════════════════════════════════ */
:root {
  --line: color-mix(in srgb, var(--st) 14%, var(--sb));
  --line-soft: color-mix(in srgb, var(--st) 8%, var(--sb));
  --font-heading: 'Libre Franklin', system-ui, sans-serif;
  --font-body: 'Source Sans 3', system-ui, sans-serif;
  --font-accent: 'IBM Plex Mono', monospace;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-body, system-ui, sans-serif); color: var(--st); background: var(--sb); -webkit-font-smoothing: antialiased; line-height: 1.6; }
h1,h2,h3,h4 { font-family: var(--font-heading, system-ui, sans-serif); }
img { display: block; max-width: 100%; }
a { text-decoration: none; color: inherit; }
.p-wrap { max-width: 1200px; margin: 0 auto; padding: 0 2.5rem; }
.p-kicker { font-size: .72rem; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--sa); font-family: var(--font-accent) !important; }
.p-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: var(--sp); color: #fff; padding: .9rem 1.8rem; border-radius: 2px; font-weight: 600; font-size: .92rem; letter-spacing: .02em; transition: background .2s ease; cursor: pointer; }
.p-btn:hover { background: var(--ss); }
.p-btn-gold { background: var(--sa); color: #2a2308; }
.p-btn-gold:hover { background: color-mix(in srgb, var(--sa) 85%, white); }
.p-btn-out { background: transparent; color: var(--sp); border: 1px solid var(--line); }
.p-btn-out:hover { background: var(--sf); }

/* top + nav */
.p-topbar { background: var(--sp); color: rgb(255 255 255 / .85); font-size: .8rem; }
.p-topbar .p-wrap { display: flex; justify-content: space-between; gap: 1rem; padding: .55rem 2.5rem; flex-wrap: wrap; }
nav.p-site { background: var(--sb); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 40; }
nav.p-site .p-wrap { display: flex; align-items: center; justify-content: space-between; padding-top: 1.1rem; padding-bottom: 1.1rem; }
.p-brand { font-family: var(--font-heading); font-weight: 700; font-size: 1.3rem; letter-spacing: -0.01em; }
.p-brand em { font-style: normal; color: var(--sa); }
.p-nav-links { display: flex; gap: 2rem; align-items: center; font-size: .9rem; color: var(--sm); }
.p-nav-links a:not(.p-btn):hover { color: var(--sp); }

/* HERO grid Swiss */
.p-hero { display: grid; grid-template-columns: 1.15fr .85fr; gap: 4rem; align-items: center; padding: 4.5rem 0 4rem; }
.p-hero h1 { font-size: clamp(2.2rem, 4.2vw, 3.5rem); line-height: 1.1; letter-spacing: -0.02em; margin: 1.3rem 0 1.4rem; font-weight: 700; }
.p-hero p { font-size: 1.15rem; line-height: 1.7; color: var(--sm); margin: 0 0 2.2rem; max-width: 32rem; }
.p-hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; }
.p-hero-img { position: relative; }
.p-hero-img img { aspect-ratio: 4/5; object-fit: cover; width: 100%; }
.p-hero-img::after { content: ''; position: absolute; left: -14px; top: -14px; right: 14px; bottom: 14px; border: 1px solid var(--sa); z-index: -1; }

/* credentials bar */
.p-creds { background: var(--sf); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.p-creds .p-wrap { display: grid; grid-template-columns: repeat(4, 1fr); }
.p-cred { padding: 2.2rem 1.5rem; text-align: center; border-right: 1px solid var(--line); }
.p-cred:last-child { border-right: 0; }
.p-cred .p-big { font-family: var(--font-heading); font-size: 2rem; font-weight: 700; color: var(--sp); letter-spacing: -0.01em; }
.p-cred .p-lbl { color: var(--sm); font-size: .82rem; margin-top: .3rem; letter-spacing: .02em; }

/* block */
section.p-block { padding: 5.5rem 0; }
.p-head { max-width: 40rem; margin-bottom: 3.2rem; }
.p-head.p-center { margin: 0 auto 3.2rem; text-align: center; }
.p-head h2 { font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 700; letter-spacing: -0.01em; margin: .9rem 0 1rem; }
.p-head p { color: var(--sm); font-size: 1.05rem; line-height: 1.7; margin: 0; }

/* serviços 2col numerados */
.p-svc2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 4rem; }
.p-svc { display: grid; grid-template-columns: auto 1fr; gap: 1.3rem; padding: 1.6rem 0; border-bottom: 1px solid var(--line-soft); }
.p-svc .p-idx { font-family: var(--font-heading); font-size: .85rem; font-weight: 700; color: var(--sa); letter-spacing: .1em; padding-top: .2rem; }
.p-svc h3 { font-size: 1.15rem; margin: 0 0 .35rem; font-weight: 700; }
.p-svc p { color: var(--sm); font-size: .92rem; line-height: 1.6; margin: 0; }

/* citação gigante */
.p-quote { background: var(--sp); color: #fff; position: relative; overflow: hidden; }
.p-quote .p-wrap { padding: 5.5rem 2.5rem; max-width: 920px; position: relative; }
.p-quote .p-mark { position: absolute; top: 2rem; left: 1.5rem; font-family: Georgia, serif; font-size: 14rem; line-height: 1; color: var(--sa); opacity: .25; }
.p-quote blockquote { position: relative; font-family: var(--font-heading); font-size: clamp(1.5rem, 3.2vw, 2.4rem); line-height: 1.35; font-weight: 600; letter-spacing: -0.01em; margin: 0 0 1.6rem; }
.p-quote cite { font-style: normal; color: var(--sa); font-size: .82rem; letter-spacing: .15em; text-transform: uppercase; }

/* sobre */
.p-about { background: var(--sf); }
.p-about .p-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4.5rem; align-items: center; }
.p-about img { aspect-ratio: 4/3; object-fit: cover; width: 100%; }
.p-about h2 { font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; margin: .9rem 0 1.2rem; letter-spacing: -0.01em; }
.p-about p { color: var(--sm); line-height: 1.75; margin: 0 0 1.5rem; }
.p-checks { display: flex; flex-direction: column; gap: .7rem; }
.p-checks div { display: flex; gap: .7rem; align-items: baseline; font-size: .96rem; }
.p-checks span { color: var(--sa); font-weight: 700; }

/* cta */
.p-cta-band { background: var(--sa); color: #2a2308; }
.p-cta-band .p-wrap { display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding: 3rem 2.5rem; flex-wrap: wrap; }
.p-cta-band h2 { font-size: clamp(1.5rem, 2.6vw, 2.1rem); font-weight: 700; margin: 0; letter-spacing: -0.01em; max-width: 30rem; }

/* blog cards */
.p-post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
.p-post { border: 1px solid var(--line-soft); transition: border-color .2s, box-shadow .2s; background: var(--sb); }
.p-post:hover { border-color: var(--line); box-shadow: 0 12px 32px rgb(0 0 0 / .06); }
.p-post img { aspect-ratio: 16/10; object-fit: cover; width: 100%; }
.p-post .p-body { padding: 1.5rem; }
.p-post .p-cat { font-size: .68rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--sa); }
.p-post h3 { font-size: 1.18rem; line-height: 1.3; margin: .6rem 0 .5rem; font-weight: 700; }
.p-post:hover h3 { color: var(--sp); }
.p-post p { color: var(--sm); font-size: .9rem; line-height: 1.6; margin: 0 0 .8rem; }
.p-post .p-by { font-size: .76rem; color: var(--sm); letter-spacing: .03em; }

/* faq */
.p-faq { max-width: 820px; margin: 0 auto; border-top: 1px solid var(--line); }
.p-faq details { border-bottom: 1px solid var(--line); }
.p-faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 1.5rem; align-items: center; padding: 1.4rem 0; font-family: var(--font-heading); font-size: 1.1rem; font-weight: 600; }
.p-faq summary::-webkit-details-marker { display: none; }
.p-faq summary::after { content: '+'; color: var(--sa); font-size: 1.4rem; font-weight: 300; transition: transform .2s; flex-shrink: 0; }
.p-faq details[open] summary::after { transform: rotate(45deg); }
.p-faq details p { color: var(--sm); line-height: 1.75; margin: 0 0 1.4rem; padding-right: 2.5rem; }

/* footer */
footer.p-site { background: var(--sp); color: rgb(255 255 255 / .72); }
footer.p-site .p-wrap { padding-top: 3.5rem; padding-bottom: 2.5rem; }
.p-foot-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; }
.p-foot-grid h4 { font-size: .72rem; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--sa); margin: 0 0 1rem; }
.p-foot-grid p, .p-foot-grid a { display: block; margin: 0 0 .5rem; line-height: 1.6; color: rgb(255 255 255 / .72); font-size: .9rem; }
.p-foot-grid a:hover { color: #fff; }
.p-foot-bottom { border-top: 1px solid rgb(255 255 255 / .15); padding-top: 1.6rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: .8rem; }

@media (max-width: 880px) {
  .p-wrap { padding: 0 1.4rem; }
  .p-topbar .p-wrap { padding: .55rem 1.4rem; }
  .p-nav-links a:not(.p-btn) { display: none; }
  .p-hero { grid-template-columns: 1fr; gap: 2.5rem; padding: 3rem 0; }
  .p-hero-img::after { display: none; }
  .p-creds .p-wrap { grid-template-columns: 1fr 1fr; }
  .p-cred { border-bottom: 1px solid var(--line); }
  .p-cred:nth-child(odd) { border-right: 1px solid var(--line); }
  section.p-block { padding: 4rem 0; }
  .p-svc2 { grid-template-columns: 1fr; gap: 0; }
  .p-about .p-inner { grid-template-columns: 1fr; gap: 2.5rem; }
  .p-quote .p-mark { font-size: 8rem; }
  .p-post-grid { grid-template-columns: 1fr; }
  .p-foot-grid { grid-template-columns: 1fr; gap: 1.8rem; }
}
`

export default function ProfissionalLayout({
  c,
  p,
  preview = false,
}: {
  c: SiteContent
  p: PaletteColors
  preview?: boolean
}) {
  const href = (url: string) => (preview ? '#' : url)
  const whatsapp = href(`https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`)

  // Build stats/credentials for the bar (up to 4)
  const defaultStats = [
    { value: `${c.yearsExperience}+`, label: `anos em ${c.city}` },
    { value: `${c.services.length}`, label: 'especialidades' },
    { value: '4.9 ★', label: 'avaliação média' },
    { value: c.credential || 'Reg.', label: 'profissional registrado' },
  ]
  const stats = c.stats && c.stats.length >= 4 ? c.stats : defaultStats

  // First testimonial for the giant quote
  const quote = c.testimonials[0]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) + templateCSS }} />

      {/* TOPBAR */}
      <div className="p-topbar">
        <div className="p-wrap">
          <span>{c.ctaPhone} · {c.email}</span>
          <span>{c.city}/{c.state}</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="p-site">
        <div className="p-wrap">
          <a className="p-brand" href="#">
            <SiteBrand c={c}>{c.businessName.split(' ')[0]}{' '}
            <em>{c.businessName.split(' ').slice(1).join(' ')}</em></SiteBrand>
          </a>
          <div className="p-nav-links">
            <a href="#especialidades">Especialidades</a>
            <a href="#sobre">A clínica</a>
            <a href="#blog">Blog</a>
            <a href="#duvidas">Dúvidas</a>
            <a href={whatsapp} className="p-btn">Agendar consulta</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="p-wrap">
        <div className="p-hero">
          <div>
            <span className="p-kicker">{c.city}/{c.state} · Desde {new Date().getFullYear() - c.yearsExperience}</span>
            <h1>{c.heroHeadline}</h1>
            <p>{c.heroSub}</p>
            <div className="p-hero-cta">
              <a href={whatsapp} className="p-btn">{c.ctaLabel}</a>
              <a href="#especialidades" className="p-btn p-btn-out">Ver especialidades</a>
            </div>
          </div>
          <div className="p-hero-img">
            <img
              src={c.heroImage || `https://picsum.photos/seed/profissional-hero/760/950`}
              alt={`${c.businessName} em ${c.city}`}
              loading="eager"
            />
          </div>
        </div>
      </header>

      {/* CREDENTIALS BAR */}
      <section className="p-creds" aria-label="Credenciais">
        <div className="p-wrap">
          {stats.slice(0, 4).map((s, i) => (
            <div className="p-cred" key={i}>
              <div className="p-big">{s.value}</div>
              <div className="p-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <main>
        {/* SERVICES */}
        <section className="p-block" id="especialidades">
          <div className="p-wrap">
            <div className="p-head">
              <span className="p-kicker">Especialidades</span>
              <h2>O cuidado completo em {c.city}, num só endereço</h2>
              <p>Profissionais com agenda própria, você consulta sempre com quem conhece seu histórico.</p>
            </div>
            <div className="p-svc2">
              {c.services.map((svc, i) => (
                <div className="p-svc" key={i}>
                  <span className="p-idx">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{svc.name}</h3>
                    <p>{svc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GIANT QUOTE */}
        {quote && (
          <section className="p-quote" aria-label="Depoimento em destaque">
            <div className="p-wrap">
              <span className="p-mark" aria-hidden="true">&ldquo;</span>
              <blockquote>{quote.text}</blockquote>
              <cite>{quote.name}</cite>
            </div>
          </section>
        )}

        {/* ABOUT */}
        <section className="p-block p-about" id="sobre">
          <div className="p-wrap p-inner">
            <img
              src={c.aboutImage || `https://picsum.photos/seed/profissional-about/760/570`}
              alt={`Equipe ${c.businessName}`}
              loading="lazy"
            />
            <div>
              <span className="p-kicker">A clínica</span>
              <h2>Estrutura completa, atendimento de família</h2>
              <p>{c.about}</p>
              <div className="p-checks">
                {c.credential && (
                  <div><span>✓</span> {c.credential}</div>
                )}
                <div><span>✓</span> {c.yearsExperience}+ anos de história em {c.city}</div>
                {c.services.slice(0, 2).map((svc, i) => (
                  <div key={i}><span>✓</span> {svc.name}</div>
                ))}
                <div><span>✓</span> Atendimento em {c.address}</div>
              </div>
            </div>
          </div>
        </section>

        {/* BLOG */}
        {c.blogPosts && c.blogPosts.length > 0 && (
          <section className="p-block" id="blog">
            <div className="p-wrap">
              <div
                className="p-head"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', gap: '1.5rem', flexWrap: 'wrap' }}
              >
                <div style={{ maxWidth: '36rem' }}>
                  <span className="p-kicker">Blog · Saúde em dia</span>
                  <h2 style={{ marginBottom: 0 }}>Conteúdo de quem cuida de você</h2>
                </div>
                <a href="#blog" style={{ color: 'var(--sp)', fontWeight: 600 }}>Ver todos os artigos →</a>
              </div>
              <div className="p-post-grid">
                {c.blogPosts.slice(0, 3).map((post, i) => (
                  <a className="p-post" href="#blog" key={i}>
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                    />
                    <div className="p-body">
                      <span className="p-cat">{post.excerpt.split(' ')[0]}</span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <span className="p-by">{post.date}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {c.faqs && c.faqs.length > 0 && (
          <section className="p-block" id="duvidas" style={{ paddingTop: 0 }}>
            <div className="p-wrap">
              <div className="p-head p-center">
                <span className="p-kicker">Dúvidas frequentes</span>
                <h2>O que você precisa saber antes de vir</h2>
              </div>
              <div className="p-faq">
                {c.faqs.map((faq, i) => (
                  <details key={i}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* CTA BAND */}
      <section className="p-cta-band" id="contato">
        <div className="p-wrap">
          <h2>Agende sua consulta hoje e seja atendido pelo nome, não pela senha.</h2>
          <a href={whatsapp} className="p-btn" style={{ background: 'var(--sp)', color: '#fff' }}>
            {c.ctaLabel}
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-site">
        <div className="p-wrap">
          <div className="p-foot-grid">
            <div>
              <h4>{c.businessName}</h4>
              <p>{c.address}</p>
              <p>{c.ctaPhone} · {c.email}</p>
            </div>
            <div>
              <h4>Localização</h4>
              <p>{c.city}/{c.state}</p>
              <p>{c.address}</p>
            </div>
            <div>
              <h4>Navegue</h4>
              <a href="#especialidades">Especialidades</a>
              <a href="#sobre">A clínica</a>
              <a href="#blog">Blog</a>
              <a href="#duvidas">Dúvidas frequentes</a>
            </div>
            <div>
              <h4>Contato</h4>
              <p>{c.ctaPhone}</p>
              {c.credential && <p>{c.credential}</p>}
            </div>
          </div>
          <div className="p-foot-bottom">
            <span>© {new Date().getFullYear()} {c.businessName}</span>
            <span>Site criado com HARPIA</span>
          </div>
        </div>
      </footer>
    </>
  )
}
