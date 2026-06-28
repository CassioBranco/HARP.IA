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

type Props = { params: Promise<{ domain: string; slug: string }> }

const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']

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
    },
  }
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <SiteShell
        palette={built.palette}
        businessName={businessName}
        logoUrl={built.content.logoUrl}
        fontPair={built.fontPair}
        nav={{ label: 'Blog', href: '/blog' }}
      >
        <BlogArticle post={post} />
      </SiteShell>
    </>
  )
}
