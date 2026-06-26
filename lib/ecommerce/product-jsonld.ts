// JSON-LD de produto (AEO/GEO). Schema.org Product + Offer (+ AggregateRating
// quando houver) + FAQPage. Valores de availability/condition usam as URLs ISO
// exatas que o Google exige — nunca "yes"/"available".

import type { ProductWithImages } from '@/lib/ecommerce/types'

const AVAILABILITY_URL: Record<string, string> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
}

const CONDITION_URL: Record<string, string> = {
  new: 'https://schema.org/NewCondition',
  used: 'https://schema.org/UsedCondition',
  refurbished: 'https://schema.org/RefurbishedCondition',
}

function priceString(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function productUrl(domain: string, slug: string): string {
  return `https://${domain}/produto/${slug}`
}

// Schema Product + Offer. `domain` é o host público do site.
export function buildProductJsonLd(product: ProductWithImages, domain: string) {
  const url = productUrl(domain, product.slug)
  const images = (product.images ?? []).map(i => i.url).filter(Boolean)

  const additionalProperty = Object.entries(product.specs ?? {})
    .filter(([, v]) => typeof v === 'string' && v.trim() !== '')
    .map(([name, value]) => ({ '@type': 'PropertyValue', name, value }))

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_answer ?? product.description ?? product.name,
    url,
    ...(images.length ? { image: images } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.gtin ? { gtin: product.gtin } : {}),
    ...(product.category ? { category: product.category } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
    offers: {
      '@type': 'Offer',
      price: priceString(product.price_cents),
      priceCurrency: product.currency,
      availability: AVAILABILITY_URL[product.availability] ?? AVAILABILITY_URL.in_stock,
      itemCondition: CONDITION_URL[product.condition] ?? CONDITION_URL.new,
      url,
    },
  }

  // AggregateRating só quando houver avaliações reais (E3).
  if (product.rating_avg != null && product.rating_count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating_avg,
      reviewCount: product.rating_count,
    }
  }

  return jsonLd
}

// FAQPage a partir do faq do produto (null se vazio).
export function buildProductFaqJsonLd(product: ProductWithImages) {
  const items = (product.faq ?? []).filter(f => f?.question && f?.answer)
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}
