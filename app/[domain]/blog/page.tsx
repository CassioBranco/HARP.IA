// Lista pública de artigos do blog. Rota: /[domain]/blog. Hub de links internos
// (ajuda SEO/AEO) + esqueleto compartilhado vestindo o template do cliente.
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasSupabaseEnv } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteContent } from '@/lib/templates/build-site-content'
import { getPublishedPostsByDomain } from '@/lib/blog/posts'
import SiteShell from '@/components/site/SiteShell'
import BlogList from '@/components/blog/BlogList'
import SiteAnalytics from '../SiteAnalytics'

type Props = { params: Promise<{ domain: string }> }

const RESERVED = ['localhost', 'ancoreo.vercel.app', 'vercel.app']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  if (RESERVED.some(r => domain.includes(r))) return {}
  return {
    title: 'Blog',
    robots: { index: true, follow: true },
    alternates: { canonical: `https://${domain}/blog` },
  }
}

export default async function BlogIndexPage({ params }: Props) {
  const { domain } = await params
  if (RESERVED.some(r => domain.includes(r))) notFound()
  if (!hasSupabaseEnv()) notFound()

  const built = await buildSiteContent(createAdminClient(), { domain })
  if (!built) notFound()
  const posts = await getPublishedPostsByDomain(domain)

  return (
    <SiteShell
      palette={built.palette}
      businessName={built.content.businessName}
      logoUrl={built.content.logoUrl}
      fontPair={built.fontPair}
      nav={{ label: 'Blog', href: '/blog' }}
    >
      <SiteAnalytics kind="blog" />
      <BlogList posts={posts} />
    </SiteShell>
  )
}
