import type { SiteContent } from '@/lib/templates/example-content'
import SiteBrand from '../shared/SiteBrand'
import type { PaletteColors } from '@/lib/templates/palettes'

function cssVars(p: PaletteColors): string {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

const CLEAN_CSS = `
/* ════════════════════════════════════════════════════════════
   CLEAN — Minimalista Elegante
   ════════════════════════════════════════════════════════════ */
:root {
  --serif: 'Spectral', Georgia, serif;
  --font-heading: 'Spectral', Georgia, serif;
  --font-body: 'Mulish', system-ui, sans-serif;
  --font-accent: 'DM Mono', monospace;
  --line: color-mix(in srgb, var(--st) 10%, var(--sb));
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-body, system-ui, sans-serif); color: var(--st); background: var(--sb); -webkit-font-smoothing: antialiased; line-height: 1.6; }
img { display: block; max-width: 100%; }
a { text-decoration: none; color: inherit; }
.cl-serif { font-family: var(--serif); font-weight: 600; letter-spacing: -0.01em; }
.cl-wrap { max-width: 1180px; margin: 0 auto; padding: 0 2.5rem; }
.cl-eyebrow { font-family: var(--font-accent); font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .2em; color: var(--sa); }
.cl-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: var(--sp); color: #fff; padding: .9rem 1.8rem; border-radius: 10px; font-weight: 600; font-size: .95rem; transition: filter .2s ease; text-decoration: none; }
.cl-btn:hover { filter: brightness(1.12); }
.cl-btn-ghost { background: transparent; color: var(--sp); border: 1px solid var(--line); }
.cl-btn-ghost:hover { background: var(--sf); filter: none; }

/* NAV */
.cl-nav { position: sticky; top: 0; z-index: 40; background: color-mix(in srgb, var(--sb) 88%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.cl-nav .cl-wrap { display: flex; align-items: center; justify-content: space-between; padding-top: 1.1rem; padding-bottom: 1.1rem; }
.cl-brand { font-family: var(--serif); font-size: 1.35rem; font-weight: 600; }
.cl-brand em { font-style: normal; color: var(--sp); }
.cl-nav-links { display: flex; gap: 2.2rem; align-items: center; font-size: .95rem; color: var(--sm); }
.cl-nav-links a:not(.cl-btn):hover { color: var(--st); }

/* SECTIONS */
section.cl-block { padding: 6rem 0; }
.cl-section-head { max-width: 36rem; margin-bottom: 3.5rem; }
.cl-section-head.center { margin-left: auto; margin-right: auto; text-align: center; }
.cl-section-head h2 { font-family: var(--serif); font-size: clamp(1.8rem, 3vw, 2.4rem); margin: .9rem 0 1rem; font-weight: 600; letter-spacing: -0.01em; }

/* HERO 50/50 editorial */
.cl-hero { display: grid; grid-template-columns: 1.02fr .98fr; gap: 5.5rem; align-items: center; padding: 5rem 0 5.5rem; }
.cl-hero .cl-lede { font-family: var(--font-accent, monospace); font-size: .78rem; letter-spacing: .12em; text-transform: uppercase; color: var(--sm); display: flex; align-items: center; gap: .7rem; margin-bottom: 2rem; }
.cl-hero .cl-lede::before { content: ''; width: 34px; height: 1px; background: var(--sp); display: inline-block; }
.cl-hero h1 { font-size: clamp(2.6rem, 4.6vw, 4rem); line-height: 1.06; margin: 0 0 1.6rem; font-weight: 600; letter-spacing: -0.015em; font-family: var(--serif); }
.cl-hero > div > p { font-size: 1.18rem; line-height: 1.75; color: var(--sm); margin: 0 0 2.6rem; max-width: 30rem; }
.cl-hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
.cl-hero-cta .cl-text-link { font-size: .95rem; color: var(--st); display: inline-flex; align-items: center; gap: .4rem; }
.cl-hero-fig { position: relative; }
.cl-hero-fig img { aspect-ratio: 4/5; object-fit: cover; width: 100%; }
.cl-hero-fig figcaption { font-family: var(--font-accent, monospace); font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: var(--sm); margin-top: .9rem; display: flex; justify-content: space-between; }
.cl-hero-rating { position: absolute; left: -1.8rem; bottom: 3.2rem; background: var(--sb); padding: 1.1rem 1.3rem; box-shadow: 0 18px 40px rgb(0 0 0 / .1); display: flex; align-items: center; gap: .9rem; }
.cl-hero-rating .cl-num { font-family: var(--serif); font-size: 1.9rem; color: var(--sp); line-height: 1; }
.cl-hero-rating .cl-lbl { font-size: .76rem; color: var(--sm); line-height: 1.4; }
.cl-hero-rating .cl-stars { color: var(--sa); font-size: .78rem; letter-spacing: 1px; }

/* META row */
.cl-meta { display: grid; grid-template-columns: repeat(3, 1fr); }
.cl-meta > div { padding: 2.6rem 0 0; }
.cl-meta .cl-k { font-family: var(--font-accent, monospace); font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; color: var(--sm); margin-bottom: .8rem; }
.cl-meta .cl-v { font-family: var(--serif); font-size: 1.7rem; color: var(--st); font-weight: 600; line-height: 1.15; }

/* APPROACH */
.cl-approach { display: grid; grid-template-columns: 0.8fr 2.2fr; gap: 3.5rem; align-items: start; }
.cl-approach .cl-label { font-family: var(--font-accent, monospace); font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sp); padding-top: .6rem; }
.cl-approach .cl-statement { font-family: var(--serif); font-size: clamp(1.6rem, 2.8vw, 2.4rem); line-height: 1.32; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.cl-approach .cl-statement span { color: var(--sm); }

/* SERVICES */
.cl-spec-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; }
.cl-spec-head h2 { font-family: var(--serif); font-size: clamp(1.7rem, 3vw, 2.3rem); margin: 0; font-weight: 600; letter-spacing: -0.01em; }
.cl-spec-head .cl-count { font-family: var(--font-accent, monospace); font-size: .8rem; color: var(--sm); }
.cl-spec-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0 4rem; }
.cl-spec { display: grid; grid-template-columns: 2.4rem 1fr; gap: 1rem; align-items: baseline; padding: 1.5rem 0; border-top: 1px solid var(--line); transition: padding-left .25s ease; }
.cl-spec:hover { padding-left: .6rem; }
.cl-spec .cl-idx { font-family: var(--font-accent, monospace); font-size: .8rem; color: var(--sp); }
.cl-spec h3 { font-family: var(--serif); font-size: 1.3rem; margin: 0 0 .3rem; font-weight: 600; }
.cl-spec p { color: var(--sm); font-size: .92rem; line-height: 1.6; margin: 0; }

/* BAND image */
.cl-band { position: relative; }
.cl-band img { width: 100%; height: clamp(280px, 42vw, 520px); object-fit: cover; }
.cl-band figcaption { font-family: var(--font-accent, monospace); font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: var(--sm); margin-top: .9rem; }

/* ABOUT */
.cl-about { background: var(--sf); }
.cl-about .cl-about-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.cl-about img { aspect-ratio: 4/3; object-fit: cover; width: 100%; }
.cl-about h2 { font-family: var(--serif); font-size: clamp(1.8rem, 3vw, 2.4rem); margin: 1rem 0 1.3rem; font-weight: 600; letter-spacing: -0.01em; }
.cl-about p { color: var(--sm); line-height: 1.8; margin: 0 0 1.8rem; }
.cl-checks { display: flex; flex-direction: column; gap: .8rem; }
.cl-checks div { display: flex; gap: .8rem; align-items: baseline; font-size: .98rem; }
.cl-checks .cl-check-icon { color: var(--sp); }

/* TEAM */
.cl-team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
.cl-doc img { aspect-ratio: 4/5; object-fit: cover; width: 100%; margin-bottom: 1.1rem; }
.cl-doc h3 { font-family: var(--serif); font-size: 1.15rem; margin: 0 0 .25rem; font-weight: 600; }
.cl-doc .cl-spec-n { color: var(--sp); font-size: .88rem; }

/* TESTIMONIALS */
.cl-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
.cl-testi .cl-stars { color: var(--sa); letter-spacing: 2px; font-size: .9rem; }
.cl-testi p { font-family: var(--serif); font-size: 1.15rem; line-height: 1.55; color: var(--st); margin: 1rem 0 1.1rem; font-weight: 500; }
.cl-testi cite { font-style: normal; font-size: .85rem; color: var(--sm); }

/* BLOG */
.cl-post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
.cl-post img { aspect-ratio: 3/2; object-fit: cover; border-radius: 14px; margin-bottom: 1.1rem; width: 100%; }
.cl-post .cl-cat { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .15em; color: var(--sa); }
.cl-post h3 { font-family: var(--serif); font-size: 1.25rem; line-height: 1.3; margin: .5rem 0 .5rem; font-weight: 600; }
.cl-post:hover h3 { color: var(--sp); }
.cl-post p { color: var(--sm); font-size: .92rem; line-height: 1.65; margin: 0 0 .7rem; }
.cl-post .cl-by { font-size: .8rem; color: var(--sm); }

/* FAQ */
.cl-faq { max-width: 760px; margin: 0 auto; }
.cl-faq details { border-bottom: 1px solid var(--line); }
.cl-faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1.3rem 0; font-family: var(--serif); font-size: 1.12rem; font-weight: 600; }
.cl-faq summary::-webkit-details-marker { display: none; }
.cl-faq summary::after { content: '+'; font-size: 1.5rem; font-weight: 300; color: var(--sp); transition: transform .2s ease; flex-shrink: 0; }
.cl-faq details[open] summary::after { transform: rotate(45deg); }
.cl-faq details p { color: var(--sm); line-height: 1.75; margin: 0 0 1.4rem; padding-right: 2.5rem; }

/* CTA */
.cl-cta { background: var(--sf); border-radius: 24px; padding: 4.5rem 3rem; text-align: center; margin-bottom: 6rem; }
.cl-cta h2 { font-family: var(--serif); font-size: clamp(1.8rem, 3vw, 2.6rem); margin: .9rem 0 1rem; font-weight: 600; }
.cl-cta p { color: var(--sm); font-size: 1.1rem; margin: 0 0 2.2rem; }

/* FOOTER */
.cl-footer { border-top: 1px solid var(--line); padding: 3.5rem 0 2.5rem; color: var(--sm); font-size: .92rem; }
.cl-foot-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; }
.cl-foot-grid h4 { font-family: var(--serif); color: var(--st); font-size: 1rem; margin: 0 0 .9rem; }
.cl-foot-grid p, .cl-foot-grid a { display: block; margin: 0 0 .5rem; line-height: 1.6; color: var(--sm); }
.cl-foot-grid a:hover { color: var(--sp); }
.cl-foot-bottom { border-top: 1px solid var(--line); padding-top: 1.6rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: .85rem; }

.cl-hairline { border: 0; border-top: 1px solid var(--line); margin: 0; }

@media (max-width: 880px) {
  .cl-wrap { padding: 0 1.4rem; }
  .cl-nav-links a:not(.cl-btn) { display: none; }
  section.cl-block { padding: 4rem 0; }
  .cl-hero { grid-template-columns: 1fr; gap: 3rem; padding: 3rem 0 3.5rem; }
  .cl-hero-fig img { aspect-ratio: 4/3; }
  .cl-hero-rating { left: 1rem; }
  .cl-meta { grid-template-columns: 1fr; }
  .cl-meta > div { padding: 1.6rem 0; border-top: 1px solid var(--line); }
  .cl-approach { grid-template-columns: 1fr; gap: 1.4rem; }
  .cl-spec-list { grid-template-columns: 1fr; }
  .cl-about .cl-about-inner { grid-template-columns: 1fr; gap: 2.5rem; }
  .cl-team-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .cl-testi-grid { grid-template-columns: 1fr; gap: 2.2rem; }
  .cl-post-grid { grid-template-columns: 1fr; }
  .cl-cta { padding: 3rem 1.4rem; margin-bottom: 4rem; }
  .cl-foot-grid { grid-template-columns: 1fr; gap: 1.8rem; }
}
`

export default function CleanLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  void preview
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`
  const services = c.services.slice(0, 6)
  const team = c.team?.slice(0, 3) ?? []
  const testimonials = c.testimonials.slice(0, 3)
  const blogPosts = c.blogPosts.slice(0, 3)
  const faqs = c.faqs.slice(0, 8)

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;1,400&family=Mulish:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: cssVars(p) + CLEAN_CSS }} />

      {/* NAV */}
      <nav className="cl-nav">
        <div className="cl-wrap">
          <a className="cl-brand" href="#"><SiteBrand c={c}>{c.businessName}</SiteBrand></a>
          <div className="cl-nav-links">
            <a href="#especialidades">Serviços</a>
            {team.length > 0 && <a href="#equipe">Equipe</a>}
            <a href="#blog">Blog</a>
            <a href="#duvidas">Dúvidas</a>
            <a href={whatsapp} className="cl-btn" style={{ padding: '.6rem 1.3rem', fontSize: '.9rem' }}>{c.ctaLabel}</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="cl-wrap">
        <div className="cl-hero">
          <div>
            <div className="cl-lede">{c.city} · {c.state}</div>
            <h1 className="cl-serif">{c.heroHeadline}</h1>
            <p>{c.heroSub}</p>
            <div className="cl-hero-cta">
              <a href={whatsapp} className="cl-btn">{c.ctaLabel}</a>
              <a href="#sobre" className="cl-text-link">Nossa história →</a>
            </div>
          </div>
          <figure className="cl-hero-fig">
            <img src={c.heroImage ?? `https://picsum.photos/seed/${c.businessName}/760/950`} alt={`${c.businessName} em ${c.city}`} loading="eager" />
            <figcaption><span>{c.businessName}</span><span>{c.city}, {c.state}</span></figcaption>
            <div className="cl-hero-rating">
              <div className="cl-num cl-serif">{c.stats?.[3]?.value ?? '4.9'}</div>
              <div>
                <div className="cl-stars">★★★★★</div>
                <div className="cl-lbl">avaliações<br />no Google</div>
              </div>
            </div>
          </figure>
        </div>

        {/* META row */}
        <div className="cl-meta">
          <div>
            <div className="cl-k">Experiência</div>
            <div className="cl-v cl-serif">{c.yearsExperience} anos<br />de atuação</div>
          </div>
          <div>
            <div className="cl-k">Especialização</div>
            <div className="cl-v cl-serif">{services.length} serviços<br />especializados</div>
          </div>
          <div>
            <div className="cl-k">Credencial</div>
            <div className="cl-v cl-serif" style={{ fontSize: '1.1rem' }}>{c.credential}</div>
          </div>
        </div>
      </header>

      <main>
        {/* APPROACH */}
        <section className="cl-block cl-wrap" id="sobre">
          <div className="cl-approach">
            <div className="cl-label">Nossa abordagem</div>
            <p className="cl-statement cl-serif">{c.about}</p>
          </div>
        </section>

        <hr className="cl-hairline" />

        {/* SERVICES */}
        <section className="cl-block cl-wrap" id="especialidades">
          <div className="cl-spec-head">
            <h2 className="cl-serif">Serviços</h2>
            <span className="cl-count">{String(services.length).padStart(2, '0')} áreas</span>
          </div>
          <div className="cl-spec-list">
            {services.map((svc, i) => (
              <div className="cl-spec" key={i}>
                <span className="cl-idx">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{svc.name}</h3>
                  <p>{svc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BAND */}
        <figure className="cl-band">
          <img src={c.aboutImage ?? `https://picsum.photos/seed/${c.businessName}-band/1600/620`} alt={`Estrutura de ${c.businessName}`} loading="lazy" />
          <div className="cl-wrap"><figcaption>{c.businessName} · {c.city}, {c.state}</figcaption></div>
        </figure>

        {/* ABOUT */}
        <section className="cl-block cl-about" id="sobre-nos">
          <div className="cl-wrap cl-about-inner">
            <img src={c.aboutImage ?? `https://picsum.photos/seed/${c.businessName}-about/760/570`} alt={`Equipe de ${c.businessName}`} loading="lazy" />
            <div>
              <div className="cl-eyebrow">Sobre nós</div>
              <h2 className="cl-serif">Conheça {c.businessName}</h2>
              <p>{c.about}</p>
              <div className="cl-checks">
                <div><span className="cl-check-icon">✓</span> {c.yearsExperience} anos de experiência em {c.city}</div>
                <div><span className="cl-check-icon">✓</span> {c.credential}</div>
                {c.stats?.slice(0, 2).map((s, i) => (
                  <div key={i}><span className="cl-check-icon">✓</span> {s.value} {s.label}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        {team.length > 0 && (
          <section className="cl-block cl-wrap" id="equipe">
            <div className="cl-spec-head" style={{ marginBottom: '2.5rem' }}>
              <h2 className="cl-serif">Quem vai cuidar de você</h2>
              <span className="cl-count">Equipe</span>
            </div>
            <div className="cl-team-grid">
              {team.map((member, i) => (
                <div className="cl-doc" key={i}>
                  <img src={member.image} alt={member.name} loading="lazy" />
                  <h3 className="cl-serif">{member.name}</h3>
                  <div className="cl-spec-n">{member.role}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        <section className="cl-block cl-wrap">
          <div className="cl-spec-head" style={{ marginBottom: '2.5rem' }}>
            <h2 className="cl-serif">Quem cuida com a gente, recomenda</h2>
            <span className="cl-count">Depoimentos</span>
          </div>
          <div className="cl-testi-grid">
            {testimonials.map((t, i) => (
              <div className="cl-testi" key={i}>
                <div className="cl-stars">{'★'.repeat(t.rating)}</div>
                <p>"{t.text}"</p>
                <cite>{t.name}</cite>
              </div>
            ))}
          </div>
        </section>

        {/* BLOG */}
        {blogPosts.length > 0 && (
          <section className="cl-block cl-wrap" id="blog" style={{ paddingTop: 0 }}>
            <div className="cl-spec-head" style={{ marginBottom: '2.5rem' }}>
              <h2 className="cl-serif">Do nosso blog</h2>
              <span className="cl-count" style={{ color: 'var(--sp)' }}>Ver todos →</span>
            </div>
            <div className="cl-post-grid">
              {blogPosts.map((post, i) => (
                <a className="cl-post" href={`/blog/${post.slug}`} key={i} style={{ display: 'block' }}>
                  <img src={post.image} alt={post.title} loading="lazy" />
                  <span className="cl-cat">{post.excerpt.split(' ').slice(0, 2).join(' ')}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="cl-by">{new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="cl-block cl-wrap" id="duvidas" style={{ paddingTop: 0 }}>
          <div className="cl-section-head center">
            <div className="cl-eyebrow">Dúvidas frequentes</div>
            <h2 className="cl-serif" style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', margin: '.9rem 0 1rem' }}>O que você precisa saber</h2>
          </div>
          <div className="cl-faq">
            {faqs.map((faq, i) => (
              <details key={i}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cl-wrap" id="contato">
          <div className="cl-cta">
            <div className="cl-eyebrow">Agendamento</div>
            <h2 className="cl-serif">Sua consulta está a uma mensagem de distância</h2>
            <p>Entre em contato pelo WhatsApp e receba os horários disponíveis em minutos.</p>
            <a href={whatsapp} className="cl-btn">{c.ctaLabel}</a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="cl-footer">
        <div className="cl-wrap">
          <div className="cl-foot-grid">
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
          <div className="cl-foot-bottom">
            <span>© {new Date().getFullYear()} {c.businessName}</span>
            <span>Site criado com HARPIA</span>
          </div>
        </div>
      </footer>
    </>
  )
}
