// Tipos do módulo E-commerce (Fase E1). Espelham as tabelas de
// supabase/migrations/20260626130000_ecommerce_catalog.sql.

export type Availability = 'in_stock' | 'out_of_stock' | 'preorder'
export type Condition = 'new' | 'used' | 'refurbished'
export type ProductStatus = 'draft' | 'published'

export interface ProductFaqItem {
  question: string
  answer: string
}

export interface ProductImage {
  url: string
  alt: string
  position: number
}

export interface Product {
  id: string
  tenant_id: string
  site_id: string
  collection_id: string | null
  slug: string
  name: string
  short_answer: string | null
  description: string | null
  specs: Record<string, string>
  faq: ProductFaqItem[]
  price_cents: number
  currency: string
  availability: Availability
  condition: Condition
  sku: string | null
  gtin: string | null
  brand: string | null
  category: string | null
  rating_avg: number | null
  rating_count: number
  status: ProductStatus
  created_at: string
  updated_at: string
}

// Produto + imagens, como vem das queries da vitrine pública.
export interface ProductWithImages extends Product {
  images: ProductImage[]
}

export interface Collection {
  id: string
  tenant_id: string
  site_id: string
  name: string
  slug: string
  description: string | null
  position: number
  created_at: string
}

// Conteúdo que a IA gera para um produto (output do /api/ai/product).
export interface GeneratedProductContent {
  short_answer: string
  description: string
  specs: Record<string, string>
  faq: ProductFaqItem[]
}
