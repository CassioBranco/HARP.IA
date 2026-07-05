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
  /** Colunas de migrations ainda não aplicadas — podem não existir no banco. */
  cover_image: string | null
  updated_at: string | null
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
  // select('*') tolera colunas de migrations não aplicadas (cover_image,
  // updated_at): listar coluna ausente erraria a query inteira.
  const { data } = await admin
    .from('blog_posts')
    .select('*')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (!data) return null
  const r = data as Record<string, unknown>
  return {
    id: r.id as string,
    title: (r.title as string) ?? '',
    slug: (r.slug as string) ?? '',
    content: (r.content as string | null) ?? null,
    meta_description: (r.meta_description as string | null) ?? null,
    schema_faq: Array.isArray(r.schema_faq) ? (r.schema_faq as PublishedPost['schema_faq']) : null,
    published_at: (r.published_at as string | null) ?? null,
    site_id: r.site_id as string,
    cover_image: typeof r.cover_image === 'string' ? r.cover_image : null,
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : null,
  }
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
