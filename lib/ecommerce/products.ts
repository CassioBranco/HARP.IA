// Leitura da vitrine PÚBLICA (catálogo, página de produto, feed).
//
// Por que admin client: as páginas públicas são servidas a visitantes ANÔNIMOS
// e a RLS multi-tenant (tenant_isolation) só libera o dono logado. Em vez de
// abrir policy de leitura pública (mexer na segurança existente), lemos via
// service_role e filtramos status='published' explicitamente no código.
// É seguro: só dado de produto PUBLICADO de site PUBLICADO é exposto — que é,
// por definição, conteúdo público de vitrine. A chave service_role nunca vai
// ao browser (isto roda só no servidor).

import { createAdminClient } from '@/lib/supabase/admin'
import type { ProductWithImages, Collection } from '@/lib/ecommerce/types'

const PRODUCT_SELECT =
  'id, tenant_id, site_id, collection_id, slug, name, short_answer, description, specs, faq, ' +
  'price_cents, currency, availability, condition, sku, gtin, brand, category, ' +
  'rating_avg, rating_count, status, created_at, updated_at, ' +
  'images:product_images(url, alt, position)'

function sortImages(p: ProductWithImages): ProductWithImages {
  return { ...p, images: (p.images ?? []).slice().sort((a, b) => a.position - b.position) }
}

// site_id de um domínio publicado (ou null se não existe/não publicado).
async function publishedSiteId(domain: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('sites')
    .select('id')
    .eq('domain', domain)
    .eq('status', 'published')
    .maybeSingle()
  return (data as { id: string } | null)?.id ?? null
}

// Catálogo: todos os produtos publicados de uma loja (por domínio).
export async function getPublishedProductsByDomain(domain: string): Promise<ProductWithImages[]> {
  const siteId = await publishedSiteId(domain)
  if (!siteId) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return ((data ?? []) as unknown as ProductWithImages[]).map(sortImages)
}

// Página de produto: 1 produto publicado por (domínio, slug).
export async function getPublishedProductBySlug(
  domain: string,
  slug: string,
): Promise<ProductWithImages | null> {
  const siteId = await publishedSiteId(domain)
  if (!siteId) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!data) return null
  return sortImages(data as unknown as ProductWithImages)
}

// Coleções publicadas de uma loja (para agrupar a vitrine).
export async function getCollectionsByDomain(domain: string): Promise<Collection[]> {
  const siteId = await publishedSiteId(domain)
  if (!siteId) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('collections')
    .select('id, tenant_id, site_id, name, slug, description, position, created_at')
    .eq('site_id', siteId)
    .order('position', { ascending: true })

  return (data ?? []) as Collection[]
}

// Modo da loja (checkout vs catálogo) do site publicado, lido do onboarding.
export async function getLojaModo(domain: string): Promise<'checkout' | 'catalogo'> {
  const siteId = await publishedSiteId(domain)
  if (!siteId) return 'catalogo'
  const admin = createAdminClient()
  const { data } = await admin
    .from('onboarding_profiles')
    .select('loja_modo')
    .eq('site_id', siteId)
    .maybeSingle()
  return (data as { loja_modo?: string } | null)?.loja_modo === 'checkout' ? 'checkout' : 'catalogo'
}
