import Link from 'next/link'
import type { PublishedPost } from '@/lib/blog/posts'

// Corpo do artigo. Cores/fonte das CSS vars do SiteShell (--st-*), então veste
// qualquer template. O conteúdo HTML já passou pelo gate de publicação.
export default function BlogArticle({ post }: { post: PublishedPost }) {
  return (
    <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '2rem', lineHeight: 1.2, margin: '0 0 24px', color: 'var(--st-primary)', fontFamily: 'var(--st-font-h, inherit)' }}>
        {post.title}
      </h1>

      <div
        className="ancoreo-article-body"
        dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
      />

      <p style={{ marginTop: 56 }}>
        <Link href="/blog" style={{ color: 'var(--st-primary)', fontWeight: 600, textDecoration: 'none' }}>
          ← Ver todos os artigos
        </Link>
      </p>
    </article>
  )
}
