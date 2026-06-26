'use server'

// ============================================================
// ANCOREO — Server actions do e-commerce (E1): CRUD de catálogo
// O painel do lojista chama estas actions. Auth + tenant + RLS aqui;
// segue o mesmo padrão de lib/onboarding/actions.ts.
// (A leitura PÚBLICA da vitrine fica em lib/ecommerce/products.ts via admin.)
// ============================================================

import { createServerClient } from '@/lib/supabase/server'
import type {
  Availability,
  Condition,
  ProductStatus,
  ProductFaqItem,
  ProductWithImages,
  Collection,
} from '@/lib/ecommerce/types'

const AVAILABILITY: Availability[] = ['in_stock', 'out_of_stock', 'preorder']
const CONDITION: Condition[] = ['new', 'used', 'refurbished']
const STATUS: ProductStatus[] = ['draft', 'published']

export interface ActionResult {
  ok: boolean
  error?: string
}
export interface CreateResult extends ActionResult {
  id?: string
  slug?: string
}

// slug amigável a partir do nome (mantém hífens entre palavras).
function slugify(name: string): string {
  return (
    (name || 'produto')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'produto'
  )
}

function clampPrice(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0
}

// Sessão + tenant do usuário logado (null se não provisionado).
async function authedTenant() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, tenantId: null as string | null }
  const { data } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  return { supabase, tenantId: (data?.tenant_id as string | null) ?? null }
}

// slug único dentro do site (acrescenta -2, -3, ... em colisão).
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  siteId: string,
  name: string,
): Promise<string> {
  const base = slugify(name)
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('site_id', siteId)
    .like('slug', `${base}%`)
  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug))
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

// ── PRODUTOS ────────────────────────────────────────────────

export interface CreateProductInput {
  site_id: string
  name: string
  price_cents?: number
  collection_id?: string | null
  brand?: string | null
  category?: string | null
  sku?: string | null
  gtin?: string | null
  availability?: Availability
  condition?: Condition
}

export async function createProduct(input: CreateProductInput): Promise<CreateResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  if (!input.site_id || !input.name?.trim()) return { ok: false, error: 'site_id e name são obrigatórios' }

  // O site precisa ser do tenant (RLS só devolve o que é dele).
  const { data: site } = await supabase
    .from('sites').select('id').eq('id', input.site_id).maybeSingle()
  if (!site) return { ok: false, error: 'site_not_found' }

  const slug = await uniqueSlug(supabase, input.site_id, input.name)

  const { data, error } = await supabase
    .from('products')
    .insert({
      tenant_id: tenantId,
      site_id: input.site_id,
      collection_id: input.collection_id ?? null,
      slug,
      name: input.name.trim(),
      price_cents: clampPrice(input.price_cents),
      availability: AVAILABILITY.includes(input.availability as Availability) ? input.availability : 'in_stock',
      condition: CONDITION.includes(input.condition as Condition) ? input.condition : 'new',
      brand: input.brand ?? null,
      category: input.category ?? null,
      sku: input.sku ?? null,
      gtin: input.gtin ?? null,
      status: 'draft',
    })
    .select('id, slug')
    .single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, id: data.id as string, slug: data.slug as string }
}

export interface UpdateProductPatch {
  name?: string
  short_answer?: string | null
  description?: string | null
  specs?: Record<string, string>
  faq?: ProductFaqItem[]
  price_cents?: number
  currency?: string
  availability?: Availability
  condition?: Condition
  sku?: string | null
  gtin?: string | null
  brand?: string | null
  category?: string | null
  collection_id?: string | null
}

export async function updateProduct(id: string, patch: UpdateProductPatch): Promise<ActionResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  if (!id) return { ok: false, error: 'id é obrigatório' }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.name !== undefined) payload.name = patch.name.trim()
  if (patch.short_answer !== undefined) payload.short_answer = patch.short_answer
  if (patch.description !== undefined) payload.description = patch.description
  if (patch.specs !== undefined) payload.specs = patch.specs
  if (patch.faq !== undefined) payload.faq = patch.faq
  if (patch.price_cents !== undefined) payload.price_cents = clampPrice(patch.price_cents)
  if (patch.currency !== undefined) payload.currency = patch.currency
  if (patch.availability !== undefined && AVAILABILITY.includes(patch.availability)) payload.availability = patch.availability
  if (patch.condition !== undefined && CONDITION.includes(patch.condition)) payload.condition = patch.condition
  if (patch.sku !== undefined) payload.sku = patch.sku
  if (patch.gtin !== undefined) payload.gtin = patch.gtin
  if (patch.brand !== undefined) payload.brand = patch.brand
  if (patch.category !== undefined) payload.category = patch.category
  if (patch.collection_id !== undefined) payload.collection_id = patch.collection_id

  const { error } = await supabase.from('products').update(payload).eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Publicar/despublicar. Publicar exige nome + preço + ao menos a descrição-curta.
export async function setProductStatus(id: string, status: ProductStatus): Promise<ActionResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  if (!STATUS.includes(status)) return { ok: false, error: 'status inválido' }

  if (status === 'published') {
    const { data: p } = await supabase
      .from('products').select('name, price_cents, short_answer, description').eq('id', id).maybeSingle()
    if (!p) return { ok: false, error: 'product_not_found' }
    if (!p.name || (!p.short_answer && !p.description)) {
      return { ok: false, error: 'Faltam nome e descrição antes de publicar.' }
    }
  }

  const { error } = await supabase
    .from('products')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Lista do PAINEL (dono) — todos os status. RLS isola por tenant.
export async function listProductsForSite(siteId: string): Promise<ProductWithImages[]> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId || !siteId) return []
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(url, alt, position)')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
  return ((data ?? []) as unknown as ProductWithImages[]).map(p => ({
    ...p,
    images: (p.images ?? []).slice().sort((a, b) => a.position - b.position),
  }))
}

// ── IMAGENS ─────────────────────────────────────────────────
// A conversão WebP + upload usa o pipeline existente (S5); aqui só registramos
// a URL resultante + alt. position controla a ordem (0 = capa).

export async function addProductImage(
  productId: string, url: string, alt = '', position = 0,
): Promise<CreateResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  if (!productId || !url) return { ok: false, error: 'productId e url são obrigatórios' }

  // Produto precisa ser do tenant (RLS).
  const { data: prod } = await supabase.from('products').select('id').eq('id', productId).maybeSingle()
  if (!prod) return { ok: false, error: 'product_not_found' }

  const { data, error } = await supabase
    .from('product_images')
    .insert({ tenant_id: tenantId, product_id: productId, url, alt, position })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, id: data.id as string }
}

export async function removeProductImage(id: string): Promise<ActionResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ── COLEÇÕES ────────────────────────────────────────────────

export async function createCollection(
  siteId: string, name: string, description?: string | null,
): Promise<CreateResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  if (!siteId || !name?.trim()) return { ok: false, error: 'siteId e name são obrigatórios' }

  const { data: site } = await supabase.from('sites').select('id').eq('id', siteId).maybeSingle()
  if (!site) return { ok: false, error: 'site_not_found' }

  const slug = slugify(name)
  const { data, error } = await supabase
    .from('collections')
    .insert({ tenant_id: tenantId, site_id: siteId, name: name.trim(), slug, description: description ?? null })
    .select('id, slug')
    .single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, id: data.id as string, slug: data.slug as string }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId) return { ok: false, error: 'unauthenticated' }
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function listCollectionsForSite(siteId: string): Promise<Collection[]> {
  const { supabase, tenantId } = await authedTenant()
  if (!tenantId || !siteId) return []
  const { data } = await supabase
    .from('collections')
    .select('id, tenant_id, site_id, name, slug, description, position, created_at')
    .eq('site_id', siteId)
    .order('position', { ascending: true })
  return (data ?? []) as Collection[]
}
