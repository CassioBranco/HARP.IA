import type { SiteContent } from '@/lib/templates/example-content'
import SiteBrand from '../shared/SiteBrand'
import type { PaletteColors } from '@/lib/templates/palettes'

function cssVars(p: PaletteColors): string {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

const BOLD_CSS = `
/* ════════════════════════════════════════════════════════════
   BOLD — Impactante · Cinematográfico
   ════════════════════════════════════════════════════════════ */
:root {
  --font-heading: 'Oswald', system-ui, sans-serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-accent: 'Space Mono', monospace;
  --dark-0: color-mix(in srgb, var(--st) 94%, black);
  --dark-1: color-mix(in srgb, var(--st) 82%, black);
  --dark-line: color-mix(in srgb, white 12%, transparent);
  --ink: rgb(255 255 255 / .92);
  --ink-2: rgb(255 255 255 / .62);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-body, system-ui, sans-serif); background: var(--dark-0); color: var(--ink); -webkit-font-smoothing: antialiased; line-height: 1.6; }
h1,h2,h3,h4 { font-family: var(--font-heading, system-ui, sans-serif); }
img { display: block; max-width: 100%; }
a { text-decoration: none; color: inherit; }
.bd-wrap { max-width: 1240px; margin: 0 auto; padding: 0 3rem; }

/* GRAIN cinematográfico */
.bd-grain { position: relative; }
.bd-grain::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .5; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E"); }

.bd-kicker { font-family: var(--font-accent); font-size: .72rem; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: var(--sa); }
.bd-btn { display: inline-flex; align-items: center; justify-content: center; gap: .6rem; background: var(--sa); color: var(--dark-0); padding: 1.05rem 2.2rem; border-radius: 4px; font-weight: 700; font-size: .95rem; letter-spacing: .02em; transition: transform .2s ease, filter .2s ease; text-decoration: none; }
.bd-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
.bd-btn-outline { background: transparent; color: var(--ink); border: 1px solid rgb(255 255 255 / .3); }
.bd-btn-outline:hover { background: rgb(255 255 255 / .08); }

/* NAV — flutuante */
.bd-nav { position: absolute; top: 0; left: 0; right: 0; z-index: 30; }
.bd-nav .bd-wrap { display: flex; align-items: center; justify-content: space-between; padding-top: 1.6rem; padding-bottom: 1.6rem; }
.bd-brand { font-family: var(--font-heading); font-weight: 800; font-size: 1.15rem; letter-spacing: .18em; text-transform: uppercase; }
.bd-brand em { font-style: normal; color: var(--sa); }
.bd-nav-links { display: flex; gap: 2.4rem; align-items: center; font-size: .85rem; letter-spacing: .05em; color: var(--ink-2); }
.bd-nav-links a:not(.bd-btn):hover { color: var(--ink); }
.bd-nav-links .bd-btn { padding: .6rem 1.4rem; font-size: .82rem; }

/* HERO cinematográfico */
.bd-hero { position: relative; min-height: 100svh; display: flex; align-items: flex-end; overflow: hidden; }
.bd-hero-bg { position: absolute; inset: 0; }
.bd-hero-bg img { width: 100%; height: 100%; object-fit: cover; }
.bd-hero-overlay { position: absolute; inset: 0; background:
    linear-gradient(to top, var(--dark-0) 4%, color-mix(in srgb, var(--dark-0) 65%, transparent) 38%, color-mix(in srgb, var(--dark-0) 25%, transparent) 70%),
    linear-gradient(100deg, color-mix(in srgb, var(--dark-0) 75%, transparent) 0%, transparent 60%); }
.bd-hero-content { position: relative; z-index: 2; width: 100%; padding-bottom: 6rem; }
.bd-hero h1 { font-family: var(--font-heading); font-size: clamp(3rem, 8.5vw, 7rem); font-weight: 800; line-height: .96; letter-spacing: -0.03em; margin: 1.4rem 0 1.8rem; max-width: 13ch; text-transform: uppercase; }
.bd-hero h1 em { font-style: normal; color: var(--sa); }
.bd-hero p.bd-sub { font-size: clamp(1rem, 1.6vw, 1.25rem); color: var(--ink-2); max-width: 32rem; margin: 0 0 2.6rem; line-height: 1.65; }
.bd-hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; }
.bd-hero-meta { position: absolute; right: 3rem; bottom: 6rem; z-index: 2; text-align: right; font-size: .78rem; letter-spacing: .15em; text-transform: uppercase; color: var(--ink-2); line-height: 2.1; }
.bd-hero-meta b { color: var(--ink); }

/* NUMBERS faixa */
.bd-numbers { border-top: 1px solid var(--dark-line); border-bottom: 1px solid var(--dark-line); }
.bd-numbers .bd-wrap { display: grid; grid-template-columns: repeat(4, 1fr); }
.bd-num-cell { padding: 2.6rem 2rem; border-right: 1px solid var(--dark-line); }
.bd-num-cell:last-child { border-right: 0; }
.bd-num-cell .bd-big { font-family: var(--font-heading); font-size: clamp(2.2rem, 4vw, 3.4rem); font-weight: 800; letter-spacing: -0.02em; line-height: 1; color: var(--ink); }
.bd-num-cell .bd-big em { font-style: normal; color: var(--sa); }
.bd-num-cell .bd-lbl { margin-top: .6rem; font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; color: var(--ink-2); }

/* SEÇÕES */
section.bd-block { padding: 7rem 0; }
section.bd-block.bd-alt { background: var(--dark-1); }
.bd-lead { max-width: 44rem; margin-bottom: 4rem; }
.bd-lead.center { margin-left: auto; margin-right: auto; text-align: center; }
.bd-lead h2 { font-family: var(--font-heading); font-size: clamp(2rem, 4.2vw, 3.4rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; margin: 1rem 0 1.2rem; text-transform: uppercase; }
.bd-lead p { color: var(--ink-2); font-size: 1.1rem; line-height: 1.7; margin: 0; }

/* SERVICE ROWS */
.bd-svc-list { border-top: 1px solid var(--dark-line); }
.bd-svc-row { display: grid; grid-template-columns: 90px 1fr 1.2fr; gap: 2rem; align-items: center; padding: 2.1rem 0; border-bottom: 1px solid var(--dark-line); transition: background .25s ease; }
.bd-svc-row:hover { background: rgb(255 255 255 / .03); }
.bd-svc-row .bd-idx { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--sa); letter-spacing: .1em; }
.bd-svc-row h3 { font-family: var(--font-heading); font-size: clamp(1.3rem, 2.4vw, 1.9rem); font-weight: 800; margin: 0; letter-spacing: -0.01em; text-transform: uppercase; }
.bd-svc-row p { color: var(--ink-2); font-size: .95rem; line-height: 1.6; margin: 0; }

/* QUOTE cinematográfica */
.bd-quote { position: relative; padding: 9rem 0; overflow: hidden; }
.bd-quote .bd-bg { position: absolute; inset: 0; }
.bd-quote .bd-bg img { width: 100%; height: 100%; object-fit: cover; }
.bd-quote .bd-ov { position: absolute; inset: 0; background: color-mix(in srgb, var(--dark-0) 78%, transparent); }
.bd-quote .bd-inner { position: relative; z-index: 2; max-width: 880px; margin: 0 auto; padding: 0 3rem; text-align: center; }
.bd-quote blockquote { font-family: var(--font-heading); font-size: clamp(1.6rem, 3.6vw, 2.8rem); font-weight: 700; line-height: 1.25; letter-spacing: -0.02em; margin: 1.4rem 0 1.6rem; }
.bd-quote cite { font-style: normal; font-size: .8rem; letter-spacing: .2em; text-transform: uppercase; color: var(--sa); }

/* ABOUT split */
.bd-about { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.bd-about img { aspect-ratio: 4/5; object-fit: cover; width: 100%; border-radius: 6px; }
.bd-about h2 { font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.02em; margin: 1rem 0 1.4rem; text-transform: uppercase; }
.bd-about p { color: var(--ink-2); line-height: 1.75; margin: 0 0 1.4rem; }
.bd-tick { display: flex; gap: .8rem; align-items: baseline; font-size: .95rem; margin-bottom: .7rem; }
.bd-tick span { color: var(--sa); font-weight: 800; }

/* BLOG cards */
.bd-post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.bd-post { border: 1px solid var(--dark-line); border-radius: 8px; overflow: hidden; background: var(--dark-1); transition: border-color .25s ease, transform .25s ease; display: block; }
.bd-post:hover { border-color: var(--sa); transform: translateY(-4px); }
.bd-post img { aspect-ratio: 16/10; object-fit: cover; width: 100%; }
.bd-post .bd-body { padding: 1.5rem; }
.bd-post .bd-cat { font-family: var(--font-accent); font-size: .68rem; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--sa); }
.bd-post h3 { font-family: var(--font-heading); font-size: 1.2rem; line-height: 1.3; margin: .7rem 0 .6rem; font-weight: 700; letter-spacing: -0.01em; text-transform: uppercase; }
.bd-post p { color: var(--ink-2); font-size: .9rem; line-height: 1.6; margin: 0 0 .9rem; }
.bd-post .bd-by { font-family: var(--font-accent); font-size: .76rem; color: var(--ink-2); letter-spacing: .04em; }

/* FAQ */
.bd-faq { max-width: 800px; margin: 0 auto; }
.bd-faq details { border-bottom: 1px solid var(--dark-line); }
.bd-faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; padding: 1.5rem 0; font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; letter-spacing: -0.01em; text-transform: uppercase; }
.bd-faq summary::-webkit-details-marker { display: none; }
.bd-faq summary::after { content: '→'; color: var(--sa); font-size: 1.2rem; transition: transform .25s ease; flex-shrink: 0; }
.bd-faq details[open] summary::after { transform: rotate(90deg); }
.bd-faq details p { color: var(--ink-2); line-height: 1.75; margin: 0 0 1.6rem; padding-right: 3rem; }

/* CTA final */
.bd-final { text-align: center; padding: 8rem 0; }
.bd-final h2 { font-family: var(--font-heading); font-size: clamp(2.4rem, 6vw, 4.6rem); font-weight: 800; letter-spacing: -0.03em; line-height: .98; margin: 1rem 0 1.6rem; text-transform: uppercase; }
.bd-final h2 em { font-style: normal; color: var(--sa); }
.bd-final p { color: var(--ink-2); font-size: 1.1rem; margin: 0 0 2.6rem; }

/* FOOTER */
.bd-footer { border-top: 1px solid var(--dark-line); padding: 3.5rem 0 2.5rem; background: var(--dark-1); }
.bd-foot-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; }
.bd-foot-grid h4 { font-family: var(--font-accent); font-size: .72rem; font-weight: 700; letter-spacing: .25em; text-transform: uppercase; color: var(--sa); margin: 0 0 1rem; }
.bd-foot-grid p, .bd-foot-grid a { display: block; margin: 0 0 .5rem; line-height: 1.6; color: var(--ink-2); font-size: .9rem; }
.bd-foot-grid a:hover { color: var(--ink); }
.bd-foot-bottom { border-top: 1px solid var(--dark-line); padding-top: 1.6rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: .8rem; color: var(--ink-2); }

@media (max-width: 880px) {
  .bd-wrap { padding: 0 1.4rem; }
  .bd-nav-links a:not(.bd-btn) { display: none; }
  .bd-hero-content { padding-bottom: 4rem; }
  .bd-hero-meta { display: none; }
  section.bd-block { padding: 4.5rem 0; }
  .bd-numbers .bd-wrap { grid-template-columns: 1fr 1fr; }
  .bd-num-cell { border-bottom: 1px solid var(--dark-line); padding: 1.6rem 1rem; }
  .bd-svc-row { grid-template-columns: 1fr; gap: .5rem; }
  .bd-about { grid-template-columns: 1fr; gap: 2.5rem; }
  .bd-post-grid { grid-template-columns: 1fr; }
  .bd-foot-grid { grid-template-columns: 1fr; gap: 1.8rem; }
}
`

export default function BoldLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  void preview
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`
  const services = c.services.slice(0, 6)
  const testimonials = c.testimonials.slice(0, 3)
  const blogPosts = c.blogPosts.slice(0, 3)
  const faqs = c.faqs.slice(0, 7)
  const stats = c.stats ?? []
  const firstTestimonial = testimonials[0]

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700;800&family=IBM+Plex+Sans:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: cssVars(p) + BOLD_CSS }} />

      {/* NAV — floating */}
      <nav className="bd-nav">
        <div className="bd-wrap">
          <a className="bd-brand" href="#"><SiteBrand c={c}>{c.businessName}</SiteBrand></a>
          <div className="bd-nav-links">
            <a href="#especialidades">Serviços</a>
            <a href="#sobre">A empresa</a>
            <a href="#blog">Blog</a>
            <a href="#duvidas">Dúvidas</a>
            <a href={whatsapp} className="bd-btn">{c.ctaLabel}</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="bd-hero bd-grain">
        <div className="bd-hero-bg">
          <img
            src={c.heroImage ?? `https://picsum.photos/seed/${c.businessName}-hero/1920/1280`}
            alt={`${c.businessName} em ${c.city}`}
            loading="eager"
          />
        </div>
        <div className="bd-hero-overlay" />
        <div className="bd-hero-content bd-wrap">
          <span className="bd-kicker">{c.city} · {c.state}</span>
          <h1>{c.heroHeadline.split(' ').slice(0, 4).join(' ')} <em>{c.heroHeadline.split(' ').slice(4).join(' ')}</em></h1>
          <p className="bd-sub">{c.heroSub}</p>
          <div className="bd-hero-cta">
            <a href={whatsapp} className="bd-btn">{c.ctaLabel}</a>
            <a href="#especialidades" className="bd-btn bd-btn-outline">Explorar ↓</a>
          </div>
        </div>
        <div className="bd-hero-meta">
          <b>{c.city}</b> · {c.state}<br />
          {c.address}<br />
          ★ {stats[3]?.value ?? '4.9'} · avaliações Google
        </div>
      </header>

      {/* NUMBERS faixa */}
      {stats.length > 0 && (
        <section className="bd-numbers" aria-label="Números">
          <div className="bd-wrap">
            {stats.slice(0, 4).map((s, i) => {
              const match = s.value.match(/^(\d+[.,]?\d*)(.*)$/)
              const num = match ? match[1] : s.value
              const suffix = match ? match[2] : ''
              return (
                <div className="bd-num-cell" key={i}>
                  <div className="bd-big">{num}{suffix && <em>{suffix}</em>}</div>
                  <div className="bd-lbl">{s.label}</div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <main>
        {/* SERVICES */}
        <section className="bd-block" id="especialidades">
          <div className="bd-wrap">
            <div className="bd-lead">
              <span className="bd-kicker">Serviços</span>
              <h2>O cuidado completo, sem sair daqui.</h2>
            </div>
            <div className="bd-svc-list">
              {services.map((svc, i) => (
                <div className="bd-svc-row" key={i}>
                  <span className="bd-idx">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{svc.name}</h3>
                  <p>{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUOTE */}
        {firstTestimonial && (
          <section className="bd-quote bd-grain" aria-label="Depoimento em destaque">
            <div className="bd-bg">
              <img
                src={c.aboutImage ?? `https://picsum.photos/seed/${c.businessName}-quote/1920/900`}
                alt={`${c.businessName}`}
                loading="lazy"
              />
            </div>
            <div className="bd-ov" />
            <div className="bd-inner">
              <span className="bd-kicker">{'★'.repeat(firstTestimonial.rating)} · avaliações Google</span>
              <blockquote>"{firstTestimonial.text}"</blockquote>
              <cite>{firstTestimonial.name}</cite>
            </div>
          </section>
        )}

        {/* ABOUT */}
        <section className="bd-block bd-alt" id="sobre">
          <div className="bd-wrap bd-about">
            <div>
              <span className="bd-kicker">Sobre nós</span>
              <h2>{c.businessName}</h2>
              <p>{c.about}</p>
              <div className="bd-tick"><span>→</span> {c.yearsExperience} anos de experiência em {c.city}</div>
              <div className="bd-tick"><span>→</span> {c.credential}</div>
              {stats.slice(0, 2).map((s, i) => (
                <div className="bd-tick" key={i}><span>→</span> {s.value} {s.label}</div>
              ))}
            </div>
            <img
              src={c.aboutImage ?? `https://picsum.photos/seed/${c.businessName}-about/760/950`}
              alt={`Equipe de ${c.businessName}`}
              loading="lazy"
            />
          </div>
        </section>

        {/* BLOG */}
        {blogPosts.length > 0 && (
          <section className="bd-block" id="blog">
            <div className="bd-wrap">
              <div className="bd-lead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <span className="bd-kicker">Blog</span>
                  <h2 style={{ marginBottom: 0 }}>Informação de quem cuida.</h2>
                </div>
                <a href="/blog" style={{ color: 'var(--sa)', fontWeight: 700, fontSize: '.85rem', letterSpacing: '.15em', textTransform: 'uppercase' }}>Todos os artigos →</a>
              </div>
              <div className="bd-post-grid">
                {blogPosts.map((post, i) => (
                  <a className="bd-post" href={`/blog/${post.slug}`} key={i}>
                    <img src={post.image} alt={post.title} loading="lazy" />
                    <div className="bd-body">
                      <span className="bd-cat">{post.title.split(' ')[0]}</span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <span className="bd-by">{new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="bd-block bd-alt" id="duvidas">
          <div className="bd-wrap">
            <div className="bd-lead center">
              <span className="bd-kicker">Dúvidas frequentes</span>
              <h2>Antes de vir.</h2>
            </div>
            <div className="bd-faq">
              {faqs.map((faq, i) => (
                <details key={i}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bd-final" id="contato">
          <div className="bd-wrap">
            <span className="bd-kicker">Agendamento</span>
            <h2>Pare de adiar.<br /><em>Agende hoje.</em></h2>
            <p>Entre em contato pelo WhatsApp e receba os horários disponíveis em minutos.</p>
            <a href={whatsapp} className="bd-btn" style={{ padding: '1.2rem 3rem', fontSize: '1.05rem' }}>{c.ctaLabel}</a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bd-footer">
        <div className="bd-wrap">
          <div className="bd-foot-grid">
            <div>
              <h4>{c.businessName}</h4>
              <p>{c.address}</p>
              <p>{c.ctaPhone} · {c.email}</p>
            </div>
            <div>
              <h4>Serviços</h4>
              {services.slice(0, 4).map((s, i) => (
                <a key={i} href="#especialidades">{s.name}</a>
              ))}
            </div>
            <div>
              <h4>Responsável</h4>
              <p>{c.credential}</p>
            </div>
          </div>
          <div className="bd-foot-bottom">
            <span>© {new Date().getFullYear()} {c.businessName}</span>
            <span>Site criado com ANCOREO</span>
          </div>
        </div>
      </footer>
    </>
  )
}
