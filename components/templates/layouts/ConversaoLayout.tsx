import type { SiteContent } from '@/lib/templates/example-content'
import SiteBrand from '../shared/SiteBrand'
import type { PaletteColors } from '@/lib/templates/palettes'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

const templateCSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;700;800&family=Figtree:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

:root {
  --font-heading: 'Bricolage Grotesque', system-ui, sans-serif;
  --font-body: 'Figtree', system-ui, sans-serif;
  --font-accent: 'JetBrains Mono', monospace;
  --wa: #25D366;
  --green: #16A34A;
  --green-bg: #ECFDF3;
  --green-br: #BBF7D0;
  --red: #DC2626;
  --red-bg: #FEF2F2;
  --red-br: #FECACA;
  --line: color-mix(in srgb, var(--st) 12%, var(--sb));
}

.cv * { box-sizing: border-box; }
.cv { font-family: var(--font-body); color: var(--st); background: var(--sb); min-height: 100vh; -webkit-font-smoothing: antialiased; line-height: 1.6; }
.cv h1, .cv h2, .cv h3 { font-family: var(--font-heading); }
.cv img { display: block; max-width: 100%; }
.cv a { text-decoration: none; color: inherit; }
.cv .wrap { max-width: 1080px; margin: 0 auto; padding: 0 1.5rem; }

/* buttons */
.cv .wa { display: inline-flex; align-items: center; justify-content: center; gap: .6rem; background: var(--wa); color: #fff; padding: 1.1rem 2.2rem; border-radius: 12px; font-weight: 800; font-size: 1.1rem; box-shadow: 0 10px 26px color-mix(in srgb, var(--wa) 40%, transparent); transition: transform .15s ease, box-shadow .15s ease; }
.cv .wa:hover { transform: translateY(-2px); box-shadow: 0 14px 32px color-mix(in srgb, var(--wa) 50%, transparent); }
.cv .wa.big { width: 100%; max-width: 480px; padding: 1.35rem; font-size: 1.25rem; }
.cv .call { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: var(--sa); color: #fff; padding: 1.1rem 2rem; border-radius: 12px; font-weight: 800; font-size: 1.05rem; transition: filter .15s ease, transform .15s ease; }
.cv .call:hover { filter: brightness(1.07); transform: translateY(-2px); }

/* alertbar */
.cv .alertbar { background: var(--sa); color: #fff; text-align: center; font-size: .9rem; font-weight: 700; padding: .55rem 1rem; font-family: var(--font-heading); }
.cv .alertbar .blink { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #fff; margin-right: .5rem; animation: cv-pulse 1.4s infinite; vertical-align: middle; }
@keyframes cv-pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }

/* nav */
.cv nav.site { border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--sb); z-index: 40; }
.cv nav.site .wrap { display: flex; align-items: center; justify-content: space-between; padding: .9rem 1.5rem; }
.cv .brand { font-family: var(--font-heading); font-weight: 800; font-size: 1.3rem; color: var(--sp); display: inline-flex; align-items: center; gap: .5rem; }
.cv .phone { display: inline-flex; align-items: center; gap: .5rem; font-weight: 800; font-size: 1.05rem; color: var(--sp); font-family: var(--font-heading); }

/* hero */
.cv .hero { background: linear-gradient(180deg, var(--sf), var(--sb)); border-bottom: 1px solid var(--line); }
.cv .hero .wrap { display: grid; grid-template-columns: 1.25fr .75fr; gap: 3rem; align-items: center; padding: 3rem 1.5rem 3.5rem; }
.cv .badge-row { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.3rem; }
.cv .badge { display: inline-flex; align-items: center; gap: .4rem; font-size: .8rem; font-weight: 700; padding: .4rem .8rem; border-radius: 999px; background: var(--sb); border: 1px solid var(--line); color: var(--st); font-family: var(--font-body); }
.cv .hero h1 { font-size: clamp(2.1rem, 4.6vw, 3.3rem); line-height: 1.08; margin: 0 0 1.1rem; letter-spacing: -0.02em; font-weight: 800; }
.cv .hero h1 em { font-style: normal; color: var(--sa); }
.cv .hero .sub { font-size: 1.18rem; color: var(--sm); max-width: 34rem; margin: 0 0 1.8rem; line-height: 1.55; }
.cv .hero-cta { display: flex; gap: .8rem; flex-wrap: wrap; }
.cv .reassure { margin-top: 1.2rem; display: flex; gap: 1.3rem; flex-wrap: wrap; color: var(--sm); font-size: .88rem; font-weight: 600; }
.cv .reassure span { display: inline-flex; align-items: center; gap: .4rem; }
.cv .reassure .tick { color: var(--green); }

/* quote card */
.cv .quote-card { background: var(--sp); color: #fff; border-radius: 20px; padding: 1.8rem; box-shadow: 0 20px 50px color-mix(in srgb, var(--sp) 35%, transparent); }
.cv .quote-card h3 { margin: 0 0 1rem; font-size: 1.15rem; display: flex; align-items: center; gap: .5rem; font-family: var(--font-heading); }
.cv .quote-card .price-row { display: flex; align-items: baseline; justify-content: space-between; padding: .7rem 0; border-bottom: 1px solid rgb(255 255 255 / .15); font-size: .95rem; }
.cv .quote-card .price-row b { font-family: var(--font-accent); }
.cv .quote-card .note { font-size: .78rem; color: rgb(255 255 255 / .65); margin: .9rem 0 1.1rem; }
.cv .quote-card .wa { width: 100%; }

/* trustbar */
.cv .trustbar { background: var(--st); color: #fff; }
.cv .trustbar .wrap { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 1.6rem 1.5rem; text-align: center; }
.cv .trustbar .n { font-family: var(--font-accent); font-size: 1.6rem; font-weight: 800; color: #fff; display: inline-flex; align-items: center; gap: .4rem; }
.cv .trustbar .l { font-size: .78rem; color: rgb(255 255 255 / .7); margin-top: .2rem; font-family: var(--font-body); }

/* section */
.cv section.block { padding: 4.5rem 0; }
.cv .blk-title { text-align: center; font-size: clamp(1.7rem, 3vw, 2.3rem); margin: 0 0 2.4rem; font-weight: 800; letter-spacing: -0.01em; }

/* problema x solução */
.cv .ps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.cv .col { border-radius: 18px; padding: 1.9rem; }
.cv .col.prob { background: var(--red-bg); border: 1px solid var(--red-br); }
.cv .col.sol { background: var(--green-bg); border: 1px solid var(--green-br); }
.cv .col h3 { display: flex; align-items: center; gap: .6rem; font-size: 1.2rem; margin: 0 0 1.2rem; font-family: var(--font-heading); }
.cv .col.prob h3 { color: var(--red); }
.cv .col.sol h3 { color: var(--green); }
.cv .col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .9rem; }
.cv .col li { display: flex; gap: .7rem; font-size: 1rem; line-height: 1.5; align-items: flex-start; }
.cv .col.prob li .icon { color: var(--red); flex-shrink: 0; margin-top: .1rem; }
.cv .col.sol li .icon { color: var(--green); flex-shrink: 0; margin-top: .1rem; }

/* serviços */
.cv .svc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.cv .svc { border: 1px solid var(--line); border-radius: 14px; padding: 1.4rem; text-align: center; transition: border-color .2s, transform .2s; background: var(--sb); }
.cv .svc:hover { border-color: var(--sa); transform: translateY(-3px); }
.cv .svc .svc-icon { font-size: 2rem; color: var(--sp); }
.cv .svc h3 { font-size: 1rem; margin: .7rem 0 .3rem; font-weight: 700; font-family: var(--font-heading); }
.cv .svc p { font-size: .85rem; color: var(--sm); margin: 0; line-height: 1.5; }

/* passos */
.cv .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.cv .step { text-align: center; padding: 1.2rem; }
.cv .step .n { width: 46px; height: 46px; border-radius: 50%; background: var(--sa); color: #fff; font-family: var(--font-heading); font-weight: 800; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
.cv .step h3 { font-size: 1.1rem; margin: 0 0 .4rem; font-weight: 700; font-family: var(--font-heading); }
.cv .step p { color: var(--sm); font-size: .92rem; line-height: 1.55; margin: 0; }

/* reviews */
.cv .reviews { background: var(--sf); }
.cv .reviews .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
.cv .review { background: var(--sb); border: 1px solid var(--line); border-radius: 14px; padding: 1.4rem; }
.cv .review .stars { color: var(--sa); font-size: .95rem; letter-spacing: 1px; }
.cv .review p { font-size: .92rem; line-height: 1.6; margin: .7rem 0 .8rem; }
.cv .review .who { font-size: .82rem; color: var(--sm); font-weight: 600; display: flex; align-items: center; gap: .4rem; }
.cv .review .who .chk { color: var(--green); }

/* coverage */
.cv .coverage { background: var(--sp); color: #fff; text-align: center; }
.cv .coverage .wrap { padding: 3rem 1.5rem; }
.cv .coverage h2 { font-size: clamp(1.5rem, 2.6vw, 2rem); margin: 0 0 .8rem; font-weight: 800; font-family: var(--font-heading); }
.cv .coverage p { color: rgb(255 255 255 / .8); margin: 0 auto 1.4rem; max-width: 40rem; }
.cv .areas { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: center; }
.cv .areas span { background: rgb(255 255 255 / .12); border-radius: 999px; padding: .4rem .9rem; font-size: .85rem; font-weight: 600; }

/* final cta */
.cv .final { text-align: center; }
.cv .final h2 { font-size: clamp(2rem, 4vw, 3rem); margin: 0 0 1rem; letter-spacing: -0.02em; font-weight: 800; font-family: var(--font-heading); }
.cv .final p { color: var(--sm); font-size: 1.15rem; margin: 0 0 2rem; }
.cv .final .note { margin-top: 1.1rem; font-size: .88rem; color: var(--sm); }

/* faq */
.cv .faq { max-width: 760px; margin: 0 auto; }
.cv .faq details { border: 1px solid var(--line); border-radius: 12px; margin-bottom: .8rem; overflow: hidden; background: var(--sb); }
.cv .faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 1.2rem 1.4rem; font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; }
.cv .faq summary::-webkit-details-marker { display: none; }
.cv .faq summary::after { content: '+'; color: var(--sa); font-size: 1.4rem; font-weight: 300; transition: transform .2s; flex-shrink: 0; }
.cv .faq details[open] summary::after { transform: rotate(45deg); }
.cv .faq details p { color: var(--sm); line-height: 1.7; margin: 0 1.4rem 1.2rem; }

/* blog */
.cv .post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.cv .post { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; transition: box-shadow .2s, transform .2s; background: var(--sb); }
.cv .post:hover { box-shadow: 0 12px 30px rgb(0 0 0 / .08); transform: translateY(-3px); }
.cv .post img { aspect-ratio: 16/10; object-fit: cover; width: 100%; }
.cv .post .body { padding: 1.2rem; }
.cv .post .cat { font-size: .68rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--sa); font-family: var(--font-body); }
.cv .post h3 { font-size: 1.08rem; line-height: 1.3; margin: .5rem 0 .5rem; font-weight: 700; font-family: var(--font-heading); }
.cv .post p { color: var(--sm); font-size: .88rem; line-height: 1.55; margin: 0 0 .6rem; }
.cv .post .by { font-size: .76rem; color: var(--sm); }

/* footer */
.cv footer.site { background: var(--st); color: rgb(255 255 255 / .72); }
.cv footer.site .wrap { padding: 2.5rem 1.5rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; align-items: center; }
.cv footer.site .fb { font-weight: 800; color: #fff; font-family: var(--font-heading); font-size: 1.1rem; }
.cv footer.site a { color: rgb(255 255 255 / .85); }
.cv footer.site .meta { font-size: .82rem; line-height: 1.7; }

/* sticky mobile */
.cv .sticky-cta { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; background: var(--sb); border-top: 1px solid var(--line); padding: .6rem .8rem; display: none; gap: .6rem; box-shadow: 0 -4px 20px rgb(0 0 0 / .1); }
.cv .sticky-cta .wa, .cv .sticky-cta .call { flex: 1; padding: .9rem; font-size: 1rem; border-radius: 10px; }

@media (max-width: 880px) {
  .cv .hero .wrap { grid-template-columns: 1fr; gap: 2rem; }
  .cv .trustbar .wrap { grid-template-columns: 1fr 1fr; gap: 1.4rem; }
  .cv .svc-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .cv .ps-grid, .cv .steps, .cv .reviews .grid, .cv .post-grid { grid-template-columns: 1fr; }
  .cv .sticky-cta { display: flex; }
  .cv { padding-bottom: 4.8rem; }
}
`

export default function ConversaoLayout({ c, p, preview: _preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site e quero saber mais.`
  const tel = `tel:${c.ctaPhone.replace(/\D/g, '')}`
  const stats = c.stats ?? []
  const blogPosts = c.blogPosts ?? []
  const testimonials = c.testimonials ?? []

  return (
    <div className="cv">
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) + templateCSS }} />

      {/* ALERTBAR */}
      <div className="alertbar">
        <span className="blink" />
        Atendimento disponível agora — {c.city}/{c.state}
      </div>

      {/* NAV */}
      <nav className="site">
        <div className="wrap">
          <a className="brand" href="#"><SiteBrand c={c}>{c.businessName}</SiteBrand></a>
          <a className="phone" href={tel}>{c.ctaPhone}</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div>
            <div className="badge-row">
              {c.yearsExperience > 0 && (
                <span className="badge">⚡ {c.yearsExperience} anos de experiência</span>
              )}
              <span className="badge">🕐 Atendimento rápido</span>
              <span className="badge">⭐ {c.city}/{c.state}</span>
            </div>
            <h1>{c.heroHeadline}</h1>
            <p className="sub">{c.heroSub}</p>
            <div className="hero-cta">
              <a href={whatsapp} className="wa">💬 {c.ctaLabel}</a>
              <a href={tel} className="call">📞 Ligar agora</a>
            </div>
            <div className="reassure">
              <span><span className="tick">✔</span> Orçamento na hora</span>
              <span><span className="tick">✔</span> Profissional identificado</span>
              <span><span className="tick">✔</span> Sem surpresa no preço</span>
            </div>
          </div>
          <aside className="quote-card">
            <h3>⚡ Nossos serviços</h3>
            {c.services.slice(0, 3).map((svc, i) => (
              <div className="price-row" key={i}>
                <span>{svc.name}</span>
                <b>Consulte</b>
              </div>
            ))}
            <p className="note">Valor confirmado antes de iniciar. Você aprova, a gente resolve.</p>
            <a href={whatsapp} className="wa">💬 Pedir meu orçamento</a>
          </aside>
        </div>
      </header>

      {/* TRUSTBAR */}
      <section className="trustbar" aria-label="Indicadores">
        <div className="wrap">
          {stats.length > 0 ? stats.slice(0, 4).map((s, i) => (
            <div key={i}>
              <div className="n">{s.value}</div>
              <div className="l">{s.label}</div>
            </div>
          )) : (
            <>
              <div><div className="n">{c.yearsExperience > 0 ? `+${c.yearsExperience} anos` : '24h'}</div><div className="l">de experiência</div></div>
              <div><div className="n">⭐ 4,9</div><div className="l">nota no Google</div></div>
              <div><div className="n">✅ 100%</div><div className="l">comprometimento</div></div>
              <div><div className="n">📍 {c.city}</div><div className="l">atendimento local</div></div>
            </>
          )}
        </div>
      </section>

      <main>
        {/* PROBLEMA x SOLUÇÃO */}
        {(c.problemStatement || c.solutionStatement) && (
          <section className="block ps">
            <div className="wrap">
              <h2 className="blk-title">Antes de resolver sozinho, leia isto</h2>
              <div className="ps-grid">
                <div className="col prob">
                  <h3><span>✗</span> Tentando resolver sozinho</h3>
                  <ul>
                    {(c.problemStatement ?? '').split('.').filter(Boolean).slice(0, 4).map((item, i) => (
                      <li key={i}><span className="icon">✗</span>{item.trim()}.</li>
                    ))}
                  </ul>
                </div>
                <div className="col sol">
                  <h3><span>✔</span> Com {c.businessName}</h3>
                  <ul>
                    {(c.solutionStatement ?? '').split('.').filter(Boolean).slice(0, 4).map((item, i) => (
                      <li key={i}><span className="icon">✔</span>{item.trim()}.</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SERVIÇOS */}
        {c.services.length > 0 && (
          <section className="block" style={{ background: 'var(--sf)' }}>
            <div className="wrap">
              <h2 className="blk-title">O que a gente resolve</h2>
              <div className="svc-grid" style={{ gridTemplateColumns: `repeat(${Math.min(c.services.length, 4)}, 1fr)` }}>
                {c.services.map((svc, i) => (
                  <div className="svc" key={i}>
                    <div className="svc-icon">{svc.icon}</div>
                    <h3>{svc.name}</h3>
                    <p>{svc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PASSOS */}
        <section className="block">
          <div className="wrap">
            <h2 className="blk-title">Resolver é rápido assim</h2>
            <div className="steps">
              <div className="step">
                <div className="n">1</div>
                <h3>Chama no WhatsApp</h3>
                <p>Conta o que aconteceu e manda seu endereço. Respondemos na hora.</p>
              </div>
              <div className="step">
                <div className="n">2</div>
                <h3>Confirma o preço</h3>
                <p>Passamos o valor antes de começar. Sem surpresa.</p>
              </div>
              <div className="step">
                <div className="n">3</div>
                <h3>A gente resolve</h3>
                <p>Executamos o serviço e você só paga depois de resolvido.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        {testimonials.length > 0 && (
          <section className="block reviews">
            <div className="wrap">
              <h2 className="blk-title">Quem chamou, recomenda</h2>
              <div className="grid">
                {testimonials.slice(0, 3).map((t, i) => (
                  <div className="review" key={i}>
                    <div className="stars">{'★'.repeat(t.rating ?? 5)}</div>
                    <p>"{t.text}"</p>
                    <div className="who"><span className="chk">✔</span> {t.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {c.faqs.length > 0 && (
          <section className="block">
            <div className="wrap">
              <h2 className="blk-title">Perguntas rápidas</h2>
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

        {/* BLOG */}
        {blogPosts.length > 0 && (
          <section className="block" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <h2 className="blk-title" style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)' }}>Dicas antes da emergência</h2>
              <div className="post-grid">
                {blogPosts.slice(0, 3).map((post, i) => (
                  <a className="post" href={`/blog/${post.slug}`} key={i}>
                    <img src={post.image} alt={post.title} loading="lazy" />
                    <div className="body">
                      <span className="cat">{post.excerpt?.split(' ')[0] ?? 'Dica'}</span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <span className="by">{c.businessName} · {post.date}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* COVERAGE */}
        <section className="coverage">
          <div className="wrap">
            <h2>Atendemos {c.city} e região</h2>
            <p>Equipe disponível para chegar rápido onde você estiver.</p>
            <div className="areas">
              <span>{c.city}</span>
              <span>{c.state}</span>
              <span>Região metropolitana</span>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="block final" id="contato">
          <div className="wrap">
            <h2>Não espere mais. Chama agora.</h2>
            <p>Resposta em poucos minutos. Quanto antes você chamar, mais rápido a gente resolve.</p>
            <a href={whatsapp} className="wa big">💬 {c.ctaLabel}</a>
            <div className="note">Atendimento em {c.city} e região</div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site">
        <div className="wrap">
          <div>
            <div className="fb">{c.businessName}</div>
            <div className="meta">{c.address} · <a href="/blog">Blog</a> · {c.city}/{c.state}</div>
          </div>
          <div className="meta" style={{ textAlign: 'right' }}>
            {c.ctaPhone}<br />
            Site criado com ANCOREO
          </div>
        </div>
      </footer>

      {/* STICKY CTA mobile */}
      <div className="sticky-cta">
        <a href={tel} className="call">📞 Ligar</a>
        <a href={whatsapp} className="wa">💬 WhatsApp</a>
      </div>
    </div>
  )
}
