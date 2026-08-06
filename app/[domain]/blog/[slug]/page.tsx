// ============================================================
// ANCOREO — artigo de blog PUBLICADO no site do cliente.
// Rota: /[domain]/blog/[slug]. Usa o esqueleto compartilhado (SiteShell) +
// BlogArticle, vestindo a paleta/fonte do template. JSON-LD Article + FAQPage.
// ============================================================
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasSupabaseEnv } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteContent } from '@/lib/templates/build-site-content'
import { getPublishedPostBySlug } from '@/lib/blog/posts'
import SiteShell from '@/components/site/SiteShell'
import BlogArticle from '@/components/blog/BlogArticle'
import SiteAnalytics from '../../SiteAnalytics'

type Props = { params: Promise<{ domain: string; slug: string }> }

const RESERVED = ['localhost', 'ancoreo.vercel.app', 'vercel.app']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params
  if (!hasSupabaseEnv() || RESERVED.some(r => domain.includes(r))) return {}

  const post = await getPublishedPostBySlug(domain, slug)
  if (!post) return {}

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
      ...(post.updated_at ? { modifiedTime: post.updated_at } : {}),
      ...(post.cover_image ? { images: [{ url: post.cover_image }] } : {}),
    },
  }
}

// JSON-LD seguro dentro de <script>: escapa "<" pra não fechar a tag.
function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

export default async function PublishedBlogPostPage({ params }: Props) {
  const { domain, slug } = await params
  if (RESERVED.some(r => domain.includes(r))) notFound()
  if (!hasSupabaseEnv()) notFound()

  const post = await getPublishedPostBySlug(domain, slug)
  if (!post) notFound()

  const built = await buildSiteContent(createAdminClient(), { domain })
  if (!built) notFound()
  const businessName = built.content.businessName

  // Article completo (GEO/SEO): image, datas, autor/publisher = negócio.
  // Tudo automático — sai do que já existe no banco, sem UI nova.
  const url = `https://${domain}/blog/${post.slug}`
  const logoUrl = built.content.logoUrl
  const publisher = {
    '@type': 'Organization',
    name: businessName,
    ...(logoUrl?.startsWith('http') ? { logo: { '@type': 'ImageObject', url: logoUrl } } : {}),
  }
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? undefined,
    url,
    inLanguage: 'pt-BR',
    ...(post.cover_image ? { image: [post.cover_image] } : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    ...(post.updated_at || post.published_at ? { dateModified: post.updated_at ?? post.published_at } : {}),
    author: { '@type': 'Organization', name: businessName },
    publisher,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  // FAQPage: só perguntas completas; 2+ pra schema não nascer pobre.
  const faqs = (Array.isArray(post.schema_faq) ? post.schema_faq : []).filter(
    f => (f?.question ?? '').trim().length > 0 && (f?.answer ?? '').trim().length > 0,
  )
  const faqJsonLd = faqs.length >= 2 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
      )}
      <SiteShell
        palette={built.palette}
        businessName={businessName}
        logoUrl={built.content.logoUrl}
        fontPair={built.fontPair}
        nav={{ label: 'Blog', href: '/blog' }}
      >
        <SiteAnalytics kind="post" />
        <BlogArticle post={post} />
      </SiteShell>
    </>
  )
}
