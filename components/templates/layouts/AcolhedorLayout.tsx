import type { SiteContent } from '@/lib/templates/example-content'
import SiteBrand from '../shared/SiteBrand'
import type { PaletteColors } from '@/lib/templates/palettes'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

const templateCSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Caveat:wght@400;600&display=swap');

:root {
  --serif: 'Lora', Georgia, serif;
  --font-heading: 'Newsreader', Georgia, serif;
  --font-body: 'Lora', Georgia, serif;
  --font-accent: 'Caveat', cursive;
  --line: color-mix(in srgb, var(--st) 12%, var(--sb));
}

.ac * { box-sizing: border-box; }
.ac { font-family: var(--serif); color: var(--st); background: var(--sb); min-height: 100vh; -webkit-font-smoothing: antialiased; line-height: 1.7; }
.ac img { display: block; max-width: 100%; }
.ac a { text-decoration: none; color: inherit; }
.ac .wrap { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
.ac .narrow { max-width: 720px; margin: 0 auto; }
.ac .kicker { font-family: var(--font-body); font-size: .72rem; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--sp); }
.ac .btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: var(--sp); color: #fff; padding: .95rem 2rem; border-radius: 999px; font-weight: 600; font-size: 1rem; font-family: var(--serif); transition: background .2s ease; }
.ac .btn:hover { background: color-mix(in srgb, var(--sp) 82%, black); }
.ac .btn-out { background: transparent; color: var(--st); border: 1px solid var(--sp); }
.ac .btn-out:hover { background: var(--sf); }

/* nav */
.ac nav.site { border-bottom: 1px solid var(--line); }
.ac nav.site .wrap { display: flex; align-items: center; justify-content: space-between; padding-top: 1.8rem; padding-bottom: 1.8rem; }
.ac .brand { font-size: 1.4rem; font-weight: 600; letter-spacing: -0.01em; font-family: var(--font-heading); }
.ac .brand em { font-style: normal; color: var(--sp); }
.ac .nav-links { display: flex; gap: 2.2rem; align-items: center; font-size: 1rem; color: var(--sm); }
.ac .nav-links a:not(.btn):hover { color: var(--st); }

/* hero */
.ac .hero { text-align: center; padding: 3.5rem 0 5rem; }
.ac .avatar { width: 104px; height: 104px; border-radius: 50%; margin: 0 auto 1.8rem; object-fit: cover; box-shadow: 0 10px 30px color-mix(in srgb, var(--sp) 35%, transparent); border: 4px solid var(--sb); }
.ac .hero h1 { font-size: clamp(2.4rem, 4.6vw, 3.7rem); line-height: 1.18; margin: 1.2rem auto 1.4rem; max-width: 18ch; font-weight: 600; letter-spacing: -0.01em; font-family: var(--font-heading); }
.ac .hero > .wrap > p { font-size: 1.25rem; color: var(--sm); max-width: 36rem; margin: 0 auto 2.4rem; }
.ac .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

/* band image */
.ac .band-img { width: 100%; aspect-ratio: 21/8; object-fit: cover; }

/* section */
.ac section.block { padding: 6rem 0; }
.ac .head { text-align: center; margin-bottom: 3.5rem; }
.ac .head h2 { font-size: clamp(1.9rem, 3.2vw, 2.6rem); font-weight: 600; margin: .9rem 0 1rem; letter-spacing: -0.01em; font-family: var(--font-heading); }
.ac .head p { color: var(--sm); font-size: 1.12rem; max-width: 36rem; margin: 0 auto; }

/* history */
.ac .history { background: var(--sf); }
.ac .history h2 { font-size: clamp(1.9rem, 3.2vw, 2.6rem); text-align: center; margin: 0 0 2rem; font-weight: 600; font-family: var(--font-heading); }
.ac .history p { font-size: 1.2rem; line-height: 1.9; color: color-mix(in srgb, var(--st) 88%, var(--sm)); margin: 0 0 1.5rem; }
.ac .history p:first-of-type::first-letter { font-size: 3.6rem; float: left; line-height: .82; padding: .1em .12em 0 0; color: var(--sp); font-weight: 600; }
.ac .history .sign { margin-top: 2rem; font-size: 1.35rem; color: var(--sm); font-family: var(--font-accent); }
.ac .history .sign b { color: var(--st); display: block; font-size: 1.25rem; font-family: var(--font-accent); }

/* team */
.ac .team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5rem; text-align: center; }
.ac .member img { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem; box-shadow: 0 8px 24px color-mix(in srgb, var(--sp) 25%, transparent); }
.ac .member h3 { font-size: 1.2rem; margin: 0 0 .2rem; font-weight: 600; font-family: var(--font-heading); }
.ac .member .spec { color: var(--sp); font-size: .95rem; }

/* values */
.ac .values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
.ac .value { text-align: center; }
.ac .value .ic { font-size: 2.2rem; }
.ac .value h3 { font-size: 1.3rem; margin: .8rem 0 .5rem; font-weight: 600; font-family: var(--font-heading); }
.ac .value p { color: var(--sm); font-size: 1rem; line-height: 1.65; margin: 0; }

/* testimonial */
.ac .testi { background: var(--sp); color: #fff; }
.ac .testi .narrow { padding: 5.5rem 2rem; text-align: center; }
.ac .testi blockquote { font-size: clamp(1.5rem, 3.2vw, 2.3rem); line-height: 1.5; font-weight: 500; margin: 1.4rem 0 1.6rem; font-family: var(--font-heading); font-style: italic; }
.ac .testi cite { font-family: var(--font-accent); font-style: normal; color: rgb(255 255 255 / .85); font-size: 1.25rem; }
.ac .testi .av { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin: 0 auto; border: 3px solid rgb(255 255 255 / .4); }

/* cta */
.ac .cta { text-align: center; padding: 6rem 0; }
.ac .cta h2 { font-size: clamp(1.9rem, 3.2vw, 2.7rem); margin: .8rem 0 1rem; font-weight: 600; font-family: var(--font-heading); }
.ac .cta p { color: var(--sm); font-size: 1.18rem; margin: 0 0 2.2rem; }

/* blog */
.ac .post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
.ac .post img { aspect-ratio: 3/2; object-fit: cover; border-radius: 16px; width: 100%; margin-bottom: 1.1rem; }
.ac .post .cat { font-family: var(--font-body); font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--sa); }
.ac .post h3 { font-size: 1.3rem; line-height: 1.3; margin: .5rem 0 .5rem; font-weight: 600; font-family: var(--font-heading); }
.ac .post:hover h3 { color: var(--sp); }
.ac .post p { color: var(--sm); font-size: .98rem; line-height: 1.6; margin: 0 0 .7rem; }
.ac .post .by { font-family: var(--font-body); font-size: .8rem; color: var(--sm); }

/* faq */
.ac .faq { max-width: 760px; margin: 0 auto; }
.ac .faq details { border-bottom: 1px solid var(--line); }
.ac .faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 1.5rem; align-items: center; padding: 1.4rem 0; font-size: 1.18rem; font-weight: 600; font-family: var(--font-heading); }
.ac .faq summary::-webkit-details-marker { display: none; }
.ac .faq summary::after { content: '+'; color: var(--sp); font-size: 1.5rem; font-weight: 300; transition: transform .2s; flex-shrink: 0; }
.ac .faq details[open] summary::after { transform: rotate(45deg); }
.ac .faq details p { color: var(--sm); line-height: 1.8; margin: 0 0 1.4rem; padding-right: 2.5rem; }

/* footer */
.ac footer.site { border-top: 1px solid var(--line); padding: 3.5rem 0 2.5rem; background: var(--sf); }
.ac .foot-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem; }
.ac .foot-grid h4 { font-family: var(--font-body); font-size: .72rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--sp); margin: 0 0 1rem; }
.ac .foot-grid p, .ac .foot-grid a { display: block; margin: 0 0 .5rem; line-height: 1.6; color: var(--sm); font-size: .95rem; }
.ac .foot-grid a:hover { color: var(--st); }
.ac .foot-bottom { border-top: 1px solid var(--line); padding-top: 1.6rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: .85rem; color: var(--sm); }

@media (max-width: 880px) {
  .ac .wrap { padding: 0 1.4rem; }
  .ac .nav-links a:not(.btn) { display: none; }
  .ac section.block { padding: 4rem 0; }
  .ac .team { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .ac .values { grid-template-columns: 1fr; gap: 2rem; }
  .ac .post-grid { grid-template-columns: 1fr; }
  .ac .foot-grid { grid-template-columns: 1fr; gap: 1.8rem; }
}
`

export default function AcolhedorLayout({ c, p, preview: _preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site e quero saber mais.`
  const tel = `tel:${c.ctaPhone.replace(/\D/g, '')}`
  const featured = c.testimonials?.[0]
  const team = c.team ?? []
  const blogPosts = c.blogPosts ?? []

  return (
    <div className="ac">
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) + templateCSS }} />

      {/* NAV */}
      <nav className="site">
        <div className="wrap">
          <a className="brand" href="#"><SiteBrand c={c}>{c.businessName.split(' ')[0]} <em>{c.businessName.split(' ').slice(1).join(' ')}</em></SiteBrand></a>
          <div className="nav-links">
            <a href="#historia">Nossa história</a>
            <a href="#equipe">Equipe</a>
            {blogPosts.length > 0 && <a href="#blog">Blog</a>}
            <a href="#duvidas">Dúvidas</a>
            <a className="btn" href={whatsapp} style={{ padding: '.6rem 1.5rem', fontSize: '.95rem' }}>Agendar</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          {c.heroImage && (
            <img
              className="avatar"
              src={c.heroImage}
              alt={`${c.businessName}, ${c.city}/${c.state}`}
            />
          )}
          <span className="kicker">{c.tagline || `${c.city}/${c.state}`}</span>
          <h1>{c.heroHeadline}</h1>
          <p>{c.heroSub}</p>
          <div className="hero-cta">
            <a href={whatsapp} className="btn">{c.ctaLabel}</a>
            <a href="#historia" className="btn btn-out">Nossa história</a>
          </div>
        </div>
      </header>

      {/* BAND IMAGE */}
      {c.aboutImage && (
        <img
          className="band-img"
          src={c.aboutImage}
          alt={`Ambiente de atendimento — ${c.businessName}`}
          loading="lazy"
        />
      )}

      <main>
        {/* HISTÓRIA */}
        <section className="block history" id="historia">
          <div className="wrap narrow">
            <h2>Nossa história</h2>
            <p>{c.about}</p>
            {c.yearsExperience > 0 && (
              <p>
                Com {c.yearsExperience} anos de experiência em {c.city}, construímos uma trajetória baseada em resultados reais e atendimento humano. Cada cliente que passa por aqui é tratado como prioridade, porque acreditamos que cuidar é o motivo de existir.
              </p>
            )}
            <div className="sign">
              com carinho,
              <b>{c.businessName}{c.credential ? ` · ${c.credential}` : ''}</b>
            </div>
          </div>
        </section>

        {/* VALORES */}
        <section className="block" id="valores">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Como cuidamos</span>
              <h2>O que a gente não abre mão</h2>
            </div>
            <div className="values">
              <div className="value">
                <div className="ic">🤝</div>
                <h3>Tempo de ouvir</h3>
                <p>Atendimento sem pressa para entender você por inteiro, sem relógio em cima.</p>
              </div>
              <div className="value">
                <div className="ic">🌿</div>
                <h3>Cuidado contínuo</h3>
                <p>Histórico completo compartilhado entre os profissionais. Você nunca recomeça do zero.</p>
              </div>
              <div className="value">
                <div className="ic">❤️</div>
                <h3>Acolhimento real</h3>
                <p>Da recepção ao atendimento, um ambiente pensado para você se sentir em casa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* EQUIPE */}
        {team.length > 0 && (
          <section className="block" id="equipe" style={{ background: 'var(--sf)' }}>
            <div className="wrap">
              <div className="head">
                <span className="kicker">Quem vai te receber</span>
                <h2>Pessoas que escolheram cuidar de gente</h2>
              </div>
              <div className="team">
                {team.map((member, i) => (
                  <div className="member" key={i}>
                    <img src={member.image} alt={member.name} />
                    <h3>{member.name}</h3>
                    <div className="spec">{member.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SERVIÇOS */}
        {c.services.length > 0 && (
          <section className="block" id="servicos">
            <div className="wrap">
              <div className="head">
                <span className="kicker">O que fazemos</span>
                <h2>Como podemos ajudar você em {c.city}</h2>
              </div>
              <div className="values" style={{ gridTemplateColumns: `repeat(${Math.min(c.services.length, 3)}, 1fr)` }}>
                {c.services.map((svc, i) => (
                  <div className="value" key={i}>
                    <div className="ic">{svc.icon}</div>
                    <h3>{svc.name}</h3>
                    <p>{svc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DEPOIMENTO EMOCIONAL */}
        {featured && (
          <section className="testi">
            <div className="narrow">
              <img className="av" src={`https://picsum.photos/seed/av-${featured.name}/120/120`} alt={featured.name} />
              <blockquote>"{featured.text}"</blockquote>
              <cite>{featured.name}</cite>
            </div>
          </section>
        )}

        {/* BLOG */}
        {blogPosts.length > 0 && (
          <section className="block" id="blog">
            <div className="wrap">
              <div className="head">
                <span className="kicker">Blog · Saúde em dia</span>
                <h2>Conversas sobre cuidar de você</h2>
              </div>
              <div className="post-grid">
                {blogPosts.slice(0, 3).map((post, i) => (
                  <a className="post" href={`/blog/${post.slug}`} key={i}>
                    <img src={post.image} alt={post.title} loading="lazy" />
                    <span className="cat">{post.excerpt?.split(' ')[0] ?? 'Artigo'}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <span className="by">{c.businessName} · {post.date}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {c.faqs.length > 0 && (
          <section className="block" id="duvidas" style={{ background: 'var(--sf)' }}>
            <div className="wrap">
              <div className="head">
                <span className="kicker">Dúvidas frequentes</span>
                <h2>Perguntas que a gente mais ouve</h2>
              </div>
              <div className="faq">
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

        {/* CTA FINAL */}
        <section className="cta" id="contato">
          <div className="wrap narrow">
            <span className="kicker">Vamos conversar</span>
            <h2>O primeiro passo pode ser hoje</h2>
            <p>Sem compromisso. A primeira conversa é só pra gente se conhecer e cuidar de você do jeito certo.</p>
            <a href={whatsapp} className="btn">Falar com a gente no WhatsApp</a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <h4>{c.businessName}</h4>
              <p>{c.address}</p>
              <p>{c.ctaPhone} · {c.email}</p>
            </div>
            <div>
              <h4>Localização</h4>
              <p>{c.city}/{c.state}</p>
              {c.yearsExperience > 0 && <p>{c.yearsExperience} anos de experiência</p>}
            </div>
            <div>
              <h4>Navegue</h4>
              <a href="#historia">Nossa história</a>
              <a href="#equipe">Equipe</a>
              <a href="#duvidas">Dúvidas</a>
              <a href="#contato">Contato</a>
            </div>
            <div>
              <h4>Responsável</h4>
              <p>{c.businessName}</p>
              {c.credential && <p>{c.credential}</p>}
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} {c.businessName} · {c.city}/{c.state}</span>
            <span>Site criado com HARPIA</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
