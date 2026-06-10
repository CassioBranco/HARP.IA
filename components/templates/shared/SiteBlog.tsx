import type { SiteContent } from '@/lib/templates/example-content'

type Props = {
  c: SiteContent
  dark?: boolean
  compact?: boolean
}

function formatDate(dateStr: string) {
  const [y = 2024, m = 1, d = 1] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function SiteBlog({ c, dark = false, compact = false }: Props) {
  const posts = c.blogPosts?.slice(0, 3) ?? []
  if (posts.length === 0) return null

  const bg = dark ? 'var(--sp)' : 'var(--sb)'
  const titleColor = dark ? '#fff' : 'var(--st)'
  const mutedColor = dark ? 'rgba(255,255,255,0.7)' : 'var(--sm)'
  const cardBg = dark ? 'rgba(255,255,255,0.08)' : 'var(--sf)'
  const border = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'

  return (
    <section style={{ padding: compact ? '3rem 1.5rem' : '5rem 1.5rem', backgroundColor: bg }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            {/* AEO Regra 3: H2 autossuficiente */}
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: titleColor, marginBottom: '0.5rem' }}>
              Conteúdo e dicas de {c.city}
            </h2>
            <p style={{ color: mutedColor, fontSize: '0.95rem' }}>Artigos escritos por especialistas para ajudar você a tomar a melhor decisão.</p>
          </div>
          <a href="#" style={{ color: 'var(--sa)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Ver todos os artigos →
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {posts.map((post, i) => (
            <article key={i} style={{ backgroundColor: cardBg, borderRadius: '1rem', overflow: 'hidden', border: `1px solid ${border}`, display: 'flex', flexDirection: 'column' }}>
              <img
                src={post.image}
                alt={post.title}
                width={600}
                height={400}
                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--sa)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {formatDate(post.date)}
                </p>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: titleColor, lineHeight: 1.4, marginBottom: '0.625rem', flex: 1 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: mutedColor, lineHeight: 1.65, marginBottom: '1rem' }}>
                  {post.excerpt}
                </p>
                <a href={`/blog/${post.slug}`} style={{ color: 'var(--sp)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                  Ler artigo →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
