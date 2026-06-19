// ============================================================
// HARPIA — artigo de blog PUBLICADO no site do cliente.
// Rota: /[domain]/blog/[slug] — exatamente a URL que o sitemap
// já anuncia ao Google (antes caía em 404).
// Renderiza o HTML do artigo + JSON-LD Article + FAQPage (AEO
// Regra 2/4), no header/paleta do próprio site (coerência visual).
// ============================================================
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { buildSiteContent } from '@/lib/templates/build-site-content'

type Props = { params: Promise<{ domain: string; slug: string }> }

const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']

type PublishedPost = {
  id: string
  title: string
  slug: string
  content: string | null
  meta_description: string | null
  schema_faq: { question: string; answer: string }[] | null
  published_at: string | null
  site_id: string
}

// Resolve o site publicado + o artigo publicado pelo slug.
async function loadPost(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  domain: string,
  slug: string,
): Promise<{ post: PublishedPost; siteId: string } | null> {
  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('domain', domain)
    .eq('status', 'published')
    .maybeSingle()
  if (!site) return null

  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content, meta_description, schema_faq, published_at, site_id')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (!post) return null

  return { post: post as PublishedPost, siteId: site.id as string }
}

// ── Metadata dinâmica ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params
  if (!hasSupabaseEnv() || RESERVED.some(r => domain.includes(r))) return {}

  const supabase = await createServerClient()
  const loaded = await loadPost(supabase, domain, slug)
  if (!loaded) return {}

  const { post } = loaded
  const url = `https://${domain}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.meta_description ?? undefined,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.meta_description ?? undefined,
      url,
      type: 'article',
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function PublishedBlogPostPage({ params }: Props) {
  const { domain, slug } = await params

  if (RESERVED.some(r => domain.includes(r))) notFound()
  if (!hasSupabaseEnv()) notFound()

  const supabase = await createServerClient()

  const loaded = await loadPost(supabase, domain, slug)
  if (!loaded) notFound()
  const { post } = loaded

  // Header/paleta do próprio site, pra o artigo não parecer página solta.
  const built = await buildSiteContent(supabase, { domain })
  const palette = built?.palette
  const businessName = built?.content.businessName ?? domain
  const logoUrl = built?.content.logoUrl

  // FAQ schema (AEO Regra 4) — só quando o artigo realmente tem FAQ.
  const faqs = Array.isArray(post.schema_faq) ? post.schema_faq : []
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? undefined,
    url: `https://${domain}/blog/${post.slug}`,
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    author: { '@type': 'Organization', name: businessName },
    publisher: { '@type': 'Organization', name: businessName },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://${domain}/blog/${post.slug}` },
  }
  const faqJsonLd = faqs.length >= 6 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  const cssVars = palette ? {
    '--art-primary': palette.primary,
    '--art-bg': palette.bg,
    '--art-surface': palette.surface,
    '--art-text': palette.text,
    '--art-muted': palette.muted,
  } as React.CSSProperties : {}

  return (
    <div style={cssVars}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <main
        style={{
          background: palette?.bg ?? '#fff',
          color: palette?.text ?? '#1a1a1a',
          minHeight: '100vh',
        }}
      >
        {/* Header simples — volta pra home do site (link interno, Regra 7) */}
        <header
          style={{
            borderBottom: `1px solid ${palette?.muted ?? '#e5e5e5'}33`,
            padding: '20px 24px',
          }}
        >
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
          >
            {logoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logoUrl} alt={businessName} style={{ height: 32, width: 'auto' }} />
              : null}
            <span>{businessName}</span>
          </Link>
        </header>

        <article
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '48px 24px 80px',
            lineHeight: 1.7,
          }}
        >
          <h1 style={{ fontSize: '2rem', lineHeight: 1.2, margin: '0 0 24px', color: palette?.primary ?? 'inherit' }}>
            {post.title}
          </h1>

          {/* Conteúdo do artigo — HTML gerado pela IA e já validado no gate de publicação */}
          <div
            className="harpia-article-body"
            dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
          />

          <p style={{ marginTop: 56 }}>
            <Link href="/" style={{ color: palette?.primary ?? 'inherit', fontWeight: 600 }}>
              ← Voltar para {businessName}
            </Link>
          </p>
        </article>
      </main>
    </div>
  )
}
