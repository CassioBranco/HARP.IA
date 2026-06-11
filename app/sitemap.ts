import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://harp-ia.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ]

  if (!hasSupabaseEnv()) return base

  try {
    const supabase = await createServerClient()

    // Páginas de sites publicados
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, updated_at, sites!inner(domain, status)')
      .eq('sites.status', 'published')
      .eq('published', true)

    const pageEntries: MetadataRoute.Sitemap = (pages ?? [])
      .filter((p: { sites: unknown }) => {
        const site = p.sites as { domain?: string; status?: string } | null
        return site?.domain
      })
      .map((p: { slug: string; updated_at: string; sites: unknown }) => {
        const site = p.sites as { domain: string }
        const base_url = `https://${site.domain}`
        return {
          url: p.slug === 'home' ? base_url : `${base_url}/${p.slug}`,
          lastModified: new Date(p.updated_at ?? Date.now()),
          changeFrequency: 'monthly' as const,
          priority: p.slug === 'home' ? 0.9 : 0.7,
        }
      })

    // Blog posts publicados
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, published_at, sites!inner(domain, status)')
      .eq('status', 'published')
      .eq('sites.status', 'published')

    const postEntries: MetadataRoute.Sitemap = (posts ?? [])
      .filter((p: { sites: unknown }) => {
        const site = p.sites as { domain?: string } | null
        return site?.domain
      })
      .map((p: { slug: string; published_at: string; sites: unknown }) => {
        const site = p.sites as { domain: string }
        return {
          url: `https://${site.domain}/blog/${p.slug}`,
          lastModified: new Date(p.published_at ?? Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }
      })

    return [...base, ...pageEntries, ...postEntries]
  } catch {
    return base
  }
}
