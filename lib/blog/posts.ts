// Leitura pública de posts do blog (artigo + lista). Admin client filtrando
// status='published' — mesmo padrão da vitrine (RLS só libera o dono logado).
import { createAdminClient } from '@/lib/supabase/admin'
import { publishedSiteId } from '@/lib/ecommerce/products'

export type PublishedPost = {
  id: string
  title: string
  slug: string
  content: string | null
  meta_description: string | null
  schema_faq: { question: string; answer: string }[] | null
  published_at: string | null
  site_id: string
}

export type PostListItem = {
  title: string
  slug: string
  meta_description: string | null
  published_at: string | null
}

export async function getPublishedPostBySlug(domain: string, slug: string): Promise<PublishedPost | null> {
  const siteId = await publishedSiteId(domain)
  if (!siteId) return null
  const admin = createAdminClient()
  const { data } = await admin
    .from('blog_posts')
    .select('id, title, slug, content, meta_description, schema_faq, published_at, site_id')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  return (data as PublishedPost | null) ?? null
}

export async function getPublishedPostsByDomain(domain: string): Promise<PostListItem[]> {
  const siteId = await publishedSiteId(domain)
  if (!siteId) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('blog_posts')
    .select('title, slug, meta_description, published_at')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
  return (data ?? []) as PostListItem[]
}
