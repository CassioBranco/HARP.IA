import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

const templateCSS = `
@import url('https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;700;800&family=Oswald:wght@700&display=swap');

:root{
  --serif:'PT Serif',Georgia,serif;
  --font-body:'Work Sans',system-ui,sans-serif;
  --font-accent:'Oswald',system-ui,sans-serif;
  --line:color-mix(in srgb,var(--st) 16%,var(--sb));
  --rule:var(--st);
}
.mag-root *{box-sizing:border-box;}
.mag-root{margin:0;font-family:var(--font-body);color:var(--st);background:var(--sb);-webkit-font-smoothing:antialiased;line-height:1.6;}
.mag-root img{display:block;max-width:100%;}
.mag-root a{text-decoration:none;color:inherit;}

/* masthead */
.mag-mast{border-bottom:3px double var(--rule);}
.mag-mast .mag-top{display:flex;justify-content:space-between;align-items:center;font-size:.76rem;color:var(--sm);padding:.5rem 2rem;border-bottom:1px solid var(--line);text-transform:uppercase;letter-spacing:.08em;}
.mag-mast .mag-title{text-align:center;padding:1.4rem 2rem 1.1rem;}
.mag-mast .mag-title-name{font-family:var(--serif);font-size:clamp(2.2rem,5.5vw,3.6rem);font-weight:700;letter-spacing:.01em;display:block;}
.mag-mast .mag-tagline{margin:.35rem 0 0;color:var(--sm);font-size:.85rem;font-style:italic;}
.mag-navbar{display:flex;justify-content:center;gap:1.8rem;padding:.7rem 2rem;border-top:1px solid var(--line);font-family:var(--font-body);font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;flex-wrap:wrap;}
.mag-navbar a:hover,.mag-navbar a.on{color:var(--sp);}

.mag-wrap{max-width:1200px;margin:0 auto;padding:0 2rem;}
.mag-tag{display:inline-block;font-family:var(--font-accent);font-size:.68rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--sa);}
.mag-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:var(--sp);color:#fff;padding:.85rem 1.6rem;border-radius:3px;font-weight:700;font-size:.9rem;}

/* feature destaque */
.mag-feature{display:grid;grid-template-columns:1.5fr 1fr;gap:2.5rem;padding:2.5rem 0;border-bottom:1px solid var(--line);align-items:start;}
.mag-feature .mag-main img{aspect-ratio:16/9;object-fit:cover;width:100%;margin-bottom:1rem;}
.mag-feature .mag-main h2{font-family:var(--serif);font-size:clamp(1.8rem,3.5vw,2.9rem);line-height:1.12;margin:.5rem 0 .8rem;font-weight:700;}
.mag-feature .mag-main h2 a:hover{color:var(--sp);}
.mag-feature .mag-main p{color:var(--sm);font-size:1.08rem;line-height:1.65;margin:0 0 .8rem;}
.mag-feature .mag-main .mag-by{font-family:var(--font-body);font-size:.82rem;color:var(--sm);}
.mag-feature .mag-main .mag-by b{color:var(--st);}
.mag-side h3{font-family:var(--serif);font-size:1.15rem;border-bottom:2px solid var(--rule);padding-bottom:.4rem;margin:0 0 1rem;}
.mag-side .mag-item{display:grid;grid-template-columns:auto 1fr;gap:.9rem;padding:.8rem 0;border-bottom:1px solid var(--line);}
.mag-side .mag-item .mag-num{font-family:var(--serif);font-size:1.5rem;font-weight:700;color:var(--ss);line-height:1;}
.mag-side .mag-item h4{font-family:var(--serif);font-size:1rem;line-height:1.25;margin:0;font-weight:700;}
.mag-side .mag-item:hover h4{color:var(--sp);}
.mag-side .mag-item .mag-by{font-family:var(--font-body);font-size:.72rem;color:var(--sm);margin-top:.2rem;}

/* layout principal */
.mag-layout{display:grid;grid-template-columns:2.2fr 1fr;gap:3rem;}
.mag-articles{display:grid;grid-template-columns:1fr 1fr;gap:2rem;}
.mag-art{padding-bottom:1.5rem;border-bottom:1px solid var(--line);}
.mag-art img{aspect-ratio:3/2;object-fit:cover;width:100%;margin-bottom:.8rem;}
.mag-art h3{font-family:var(--serif);font-size:1.3rem;line-height:1.22;margin:.4rem 0 .4rem;font-weight:700;}
.mag-art:hover h3{color:var(--sp);}
.mag-art p{color:var(--sm);font-size:.9rem;line-height:1.55;margin:0 0 .4rem;}
.mag-art .mag-by{font-family:var(--font-body);font-size:.76rem;color:var(--sm);}

/* sidebar serviços */
.mag-aside .mag-svc-box{border:1px solid var(--line);padding:1.4rem;margin-bottom:1.5rem;}
.mag-aside .mag-svc-box.mag-solid{background:var(--sp);color:#fff;border:none;}
.mag-svc-box h3{font-family:var(--serif);font-size:1.15rem;margin:0 0 1rem;padding-bottom:.4rem;border-bottom:2px solid currentColor;font-weight:700;}
.mag-svc-item{display:flex;gap:.7rem;padding:.7rem 0;border-bottom:1px solid var(--line);align-items:baseline;font-size:.92rem;}
.mag-svc-item:last-child{border-bottom:0;}
.mag-svc-item b{font-weight:700;}
.mag-svc-item span{color:var(--sm);display:block;font-size:.78rem;}
.mag-box-cta{text-align:center;}
.mag-box-cta p{margin:0 0 1rem;font-size:.92rem;opacity:.9;line-height:1.5;}
.mag-box-cta .mag-wa{display:block;background:#fff;color:var(--sp);padding:.8rem;border-radius:4px;font-weight:800;}
.mag-ad{background:var(--sf);border:1px dashed var(--line);padding:1.5rem;text-align:center;}
.mag-ad .mag-ad-label{display:block;margin-bottom:.6rem;color:var(--sm);}
.mag-ad .mag-stat{font-family:var(--serif);font-size:2.4rem;font-weight:700;color:var(--sp);}
.mag-ad p{font-size:.85rem;color:var(--sm);margin:.3rem 0 0;}

/* faixa especialidades/serviços */
.mag-specs{background:var(--sf);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.mag-specs-inner{padding:2.5rem 2rem;}
.mag-specs-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:var(--line);}
.mag-specs-grid.mag-col4{grid-template-columns:repeat(4,1fr);}
.mag-specs-grid.mag-col3{grid-template-columns:repeat(3,1fr);}
.mag-spec{background:var(--sb);padding:1.4rem 1rem;text-align:center;}
.mag-spec .mag-ic{font-size:1.6rem;}
.mag-spec .mag-n{font-family:var(--serif);font-weight:700;font-size:.95rem;margin-top:.4rem;}

.mag-block{padding:3.5rem 0;}
.mag-sec-label{font-family:var(--serif);font-size:1.4rem;border-bottom:2px solid var(--rule);padding-bottom:.5rem;margin:0 0 1.6rem;font-weight:700;display:flex;justify-content:space-between;align-items:baseline;}
.mag-sec-label .mag-more{font-family:var(--font-body);font-size:.8rem;font-weight:700;color:var(--sp);text-transform:uppercase;letter-spacing:.05em;}

/* faq */
.mag-faq{max-width:820px;}
.mag-faq details{border-bottom:1px solid var(--line);}
.mag-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:1.2rem;align-items:center;padding:1.2rem 0;font-family:var(--serif);font-size:1.15rem;font-weight:700;}
.mag-faq summary::-webkit-details-marker{display:none;}
.mag-faq summary::after{content:'+';color:var(--sp);font-size:1.4rem;font-weight:300;flex-shrink:0;}
.mag-faq details[open] summary::after{transform:rotate(45deg);}
.mag-faq details p{color:var(--sm);line-height:1.7;margin:0 0 1.3rem;padding-right:2rem;}

/* footer */
.mag-footer{border-top:3px double var(--rule);padding:2.5rem 0;}
.mag-foot-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2.5rem;margin-bottom:2rem;}
.mag-foot-grid h4{font-family:var(--serif);font-size:1.05rem;margin:0 0 .8rem;font-weight:700;}
.mag-foot-grid p,.mag-foot-grid a{display:block;margin:0 0 .45rem;line-height:1.6;color:var(--sm);font-size:.88rem;}
.mag-foot-grid a:hover{color:var(--sp);}
.mag-foot-bottom{border-top:1px solid var(--line);padding-top:1.4rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;font-size:.8rem;color:var(--sm);}

@media(max-width:880px){
  .mag-wrap{padding:0 1.4rem;}
  .mag-feature{grid-template-columns:1fr;}
  .mag-layout{grid-template-columns:1fr;gap:2.5rem;}
  .mag-articles{grid-template-columns:1fr;}
  .mag-specs-grid{grid-template-columns:1fr 1fr 1fr!important;}
  .mag-foot-grid{grid-template-columns:1fr 1fr;gap:1.6rem;}
}
`

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MagazineLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`
  const posts = c.blogPosts ?? []
  const services = c.services ?? []

  // Determine grid cols class for specs
  const specsCols = services.length >= 6 ? '' : services.length >= 4 ? 'mag-col4' : 'mag-col3'

  return (
    <div className="mag-root">
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) + templateCSS }} />

      {/* MASTHEAD */}
      <header className="mag-mast">
        <div className="mag-top">
          <span>{c.city}/{c.state} · {formatDate()}</span>
          <span>{c.ctaPhone}</span>
        </div>
        <div className="mag-title">
          <a className="mag-title-name" href={href('/')}>{c.businessName}</a>
          <p className="mag-tagline">{c.tagline}</p>
        </div>
        <nav className="mag-navbar">
          <a href={href('/')} className="on">Início</a>
          <a href="#prevencao">Conteúdo</a>
          <a href="#especialidades">Especialidades</a>
          <a href="#blog">Blog</a>
          <a href="#duvidas">Dúvidas</a>
          <a href={href(whatsapp)}>Agendar</a>
        </nav>
      </header>

      <main>
        <div className="mag-wrap">
          {/* FEATURE DESTAQUE */}
          {posts.length > 0 && (
            <section className="mag-feature">
              <div className="mag-main">
                <span className="mag-tag">Capa · {posts[0]?.title?.split(' ')[0] ?? 'Destaque'}</span>
                <a href={href('#')}>
                  <img
                    src={posts[0]?.image ?? `https://picsum.photos/seed/${c.businessName}/900/510`}
                    alt={posts[0]?.title ?? c.businessName}
                  />
                </a>
                <h2>
                  <a href={href('#')}>{posts[0]?.title}</a>
                </h2>
                <p>{posts[0]?.excerpt}</p>
                <div className="mag-by">
                  Por <b>{c.businessName}</b> · {posts[0]?.date ? new Date(posts[0].date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} · 6 min de leitura
                </div>
              </div>
              <div className="mag-side">
                <h3>As mais lidas</h3>
                {posts.slice(1, 5).map((post, i) => (
                  <a key={i} className="mag-item" href={href('#')}>
                    <span className="mag-num">{i + 1}</span>
                    <div>
                      <h4>{post.title}</h4>
                      <div className="mag-by">{c.businessName}</div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* LAYOUT PRINCIPAL: artigos + serviços sidebar */}
          <div className="mag-layout mag-block">
            <section id="prevencao">
              <div className="mag-sec-label">
                Conteúdo &amp; Serviços <a className="mag-more" href={href('#')}>Ver tudo →</a>
              </div>
              <div className="mag-articles">
                {posts.slice(0, 4).map((post, i) => (
                  <article key={i} className="mag-art">
                    <img
                      src={post.image}
                      alt={post.title}
                    />
                    <span className="mag-tag">{post.title.split(' ').slice(0, 2).join(' ')}</span>
                    <h3><a href={href('#')}>{post.title}</a></h3>
                    <p>{post.excerpt}</p>
                    <div className="mag-by">{c.businessName} · 6 min</div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="mag-aside">
              <div className="mag-svc-box">
                <h3>Nossos serviços</h3>
                {services.map((svc, i) => (
                  <div key={i} className="mag-svc-item">
                    <div>
                      <b>{svc.name}</b>
                      <span>{svc.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mag-ad">
                <span className="mag-ad-label">Em números</span>
                <div className="mag-stat">{c.yearsExperience}+</div>
                <p>anos de experiência em {c.city}</p>
              </div>

              <div className="mag-svc-box mag-solid mag-box-cta" style={{ marginTop: '1.5rem' }}>
                <h3>{c.ctaLabel}</h3>
                <p>Atendimento em {c.city}. Fale com a gente.</p>
                <a href={href(whatsapp)} className="mag-wa">
                  &#128172; Agendar no WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>

        {/* FAIXA DE ESPECIALIDADES */}
        <section className="mag-specs" id="especialidades">
          <div className="mag-wrap">
            <div className="mag-specs-inner">
              <div className="mag-sec-label" style={{ border: 0, justifyContent: 'center', marginBottom: '1.5rem' }}>
                Especialidades em {c.city}
              </div>
              <div className={`mag-specs-grid ${specsCols}`}>
                {services.map((svc, i) => (
                  <div key={i} className="mag-spec">
                    <div className="mag-ic">{svc.icon}</div>
                    <div className="mag-n">{svc.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mag-block mag-wrap" id="duvidas">
          <div className="mag-sec-label">Perguntas frequentes</div>
          <div className="mag-faq">
            {(c.faqs ?? []).map((faq, i) => (
              <details key={i}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mag-footer" id="contato">
        <div className="mag-wrap">
          <div className="mag-foot-grid">
            <div>
              <h4>{c.businessName}</h4>
              <p>{c.address}</p>
              <p>{c.ctaPhone} · {c.email}</p>
            </div>
            <div>
              <h4>Horários</h4>
              <p>Seg–Sex · 8h às 18h</p>
              <p>Sábado · consultar</p>
            </div>
            <div>
              <h4>Serviços</h4>
              {services.slice(0, 3).map((svc, i) => (
                <a key={i} href={href('#')}>{svc.name}</a>
              ))}
            </div>
            <div>
              <h4>Localização</h4>
              <p>{c.city}/{c.state}</p>
              {c.credential && <p>{c.credential}</p>}
            </div>
          </div>
          <div className="mag-foot-bottom">
            <span>© {new Date().getFullYear()} {c.businessName}</span>
            <span>Site criado com HARPIA</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
