import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import SiteNav from '../shared/SiteNav'
import SiteFAQ from '../shared/SiteFAQ'
import SiteCTA from '../shared/SiteCTA'
import SiteFooter from '../shared/SiteFooter'
import SiteSchema from '../shared/SiteSchema'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

function formatDate(dateStr: string) {
  const [y = 2024, m = 1, d = 1] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function MagazineLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, vim pelo site.`
  const posts = c.blogPosts ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        {/* NAV com indicador de conteúdo */}
        <nav style={{ backgroundColor: 'var(--sp)', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{c.businessName}</span>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {['Conteúdo', 'Serviços', 'Sobre', 'Blog', 'Contato'].map(item => (
                <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>{item}</a>
              ))}
              <a href={href(whatsapp)} style={{ backgroundColor: 'var(--sa)', color: '#fff', padding: '0.45rem 1.1rem', borderRadius: '0.4rem', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                {c.ctaLabel}
              </a>
            </div>
          </div>
        </nav>

        {/* DESTAQUE EDITORIAL — artigo featured + 2 secundários */}
        <section style={{ padding: '3rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              {/* Featured */}
              {posts[0] && (
                <div style={{ borderRadius: '1rem', overflow: 'hidden', position: 'relative', minHeight: '400px', cursor: 'pointer' }}>
                  <img src={posts[0].image} alt={posts[0].title} width={800} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.8) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, padding: '2rem' }}>
                    <span style={{ backgroundColor: 'var(--sa)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Destaque
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.75rem', lineHeight: 1.3 }}>{posts[0].title}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{formatDate(posts[0].date)}</p>
                  </div>
                </div>
              )}
              {/* 2 menores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.slice(1, 3).map((post, i) => (
                  <div key={i} style={{ borderRadius: '0.875rem', overflow: 'hidden', display: 'flex', gap: '1rem', backgroundColor: 'var(--sf)', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                    <img src={post.image} alt={post.title} width={120} height={100} style={{ width: '110px', height: '100%', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                    <div style={{ padding: '0.875rem 0.875rem 0.875rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ color: 'var(--sa)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{formatDate(post.date)}</p>
                      <p style={{ fontWeight: 700, color: 'var(--st)', fontSize: '0.9rem', lineHeight: 1.4 }}>{post.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SERVIÇOS sidebar-style + ABOUT */}
        <section style={{ padding: '3rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            {/* Serviços */}
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--st)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--sp)' }}>
                Nossos serviços em {c.city}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {c.services.map((svc, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '0.875rem', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{svc.icon}</div>
                    <h3 style={{ fontWeight: 700, color: 'var(--sp)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{svc.name}</h3>
                    <p style={{ color: 'var(--sm)', fontSize: '0.825rem', lineHeight: 1.65 }}>{svc.description}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Sobre — compacto */}
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--st)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--sp)' }}>
                Sobre nós
              </h2>
              <img src={c.aboutImage} alt={c.businessName} width={400} height={250} style={{ width: '100%', borderRadius: '0.875rem', objectFit: 'cover', marginBottom: '1rem', display: 'block', aspectRatio: '4/3' }} />
              <p style={{ color: 'var(--sm)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '1rem' }}>{c.about}</p>
              {c.credential && <p style={{ color: 'var(--sp)', fontWeight: 600, fontSize: '0.8rem' }}>🏅 {c.credential}</p>}
              <a href={href(whatsapp)} style={{ display: 'block', marginTop: '1.25rem', backgroundColor: 'var(--sp)', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>
                {c.ctaLabel} →
              </a>
            </div>
          </div>
        </section>

        {/* GRADE DE ARTIGOS */}
        <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--st)', paddingBottom: '0.5rem', borderBottom: '2px solid var(--sp)', display: 'inline-block' }}>
                Mais conteúdo
              </h2>
              <a href="#" style={{ color: 'var(--sa)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Ver todos →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {posts.map((post, i) => (
                <article key={i} style={{ borderRadius: '0.875rem', overflow: 'hidden', backgroundColor: 'var(--sf)', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                  <img src={post.image} alt={post.title} width={400} height={220} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '1.25rem' }}>
                    <p style={{ color: 'var(--sa)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{formatDate(post.date)}</p>
                    <h3 style={{ fontWeight: 700, color: 'var(--st)', fontSize: '0.95rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>{post.title}</h3>
                    <p style={{ color: 'var(--sm)', fontSize: '0.825rem', lineHeight: 1.6 }}>{post.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--st)', marginBottom: '2rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--sp)', display: 'inline-block' }}>
              O que dizem nossos clientes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sb)', borderRadius: '0.875rem', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <p style={{ color: 'var(--sa)', fontSize: '1rem', marginBottom: '0.625rem' }}>{'★'.repeat(t.rating)}</p>
                  <p style={{ color: 'var(--sm)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.875rem' }}>"{t.text}"</p>
                  <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--sp)' }}>— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteFAQ c={c} />
        <SiteCTA c={c} preview={preview} variant="minimal" />
        <SiteFooter c={c} />
      </div>
    </>
  )
}
