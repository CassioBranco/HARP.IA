import Link from 'next/link'
import type { PostListItem } from '@/lib/blog/posts'

// Lista de artigos (página /blog). Hub de links internos — ajuda SEO e
// navegação. Cores/fonte das CSS vars do SiteShell.
export default function BlogList({ posts }: { posts: PostListItem[] }) {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: '1.9rem', margin: '0 0 1.5rem', color: 'var(--st-text)', fontFamily: 'var(--st-font-h, inherit)' }}>Blog</h1>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--st-muted)' }}>Nenhum artigo publicado ainda.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.25rem' }}>
          {posts.map(p => (
            <li key={p.slug} style={{ borderBottom: '1px solid var(--st-surface)', paddingBottom: '1.25rem' }}>
              <Link href={`/blog/${p.slug}`} style={{ textDecoration: 'none', color: 'var(--st-text)' }}>
                <h2 style={{ fontSize: '1.2rem', margin: '0 0 .35rem', color: 'var(--st-primary)', fontFamily: 'var(--st-font-h, inherit)' }}>{p.title}</h2>
                {p.meta_description && <p style={{ fontSize: 14, color: 'var(--st-muted)', margin: 0, lineHeight: 1.5 }}>{p.meta_description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
