import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasSupabaseEnv } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteContent } from '@/lib/templates/build-site-content'
import { getPublishedProductBySlug, getLojaModo } from '@/lib/ecommerce/products'
import { buildProductJsonLd, buildProductFaqJsonLd } from '@/lib/ecommerce/product-jsonld'
import SiteShell from '@/components/site/SiteShell'
import ProductDetail from '@/components/store/ProductDetail'
import { jsonLdScript } from '@/lib/seo/jsonld'

// Página de produto (PDP) pública. Esqueleto de loja (StoreShell) + JSON-LD
// Product/Offer/FAQ. O visual veste a paleta/fonte do template do cliente.
type Props = { params: Promise<{ domain: string; slug: string }> }

const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params
  if (!hasSupabaseEnv() || RESERVED.some(r => domain.includes(r))) return {}

  const product = await getPublishedProductBySlug(domain, slug)
  if (!product) return {}

  const description = product.short_answer ?? product.description?.slice(0, 155) ?? product.name
  const url = `https://${domain}/produto/${slug}`
  const image = product.images[0]?.url

  return {
    title: product.name,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { domain, slug } = await params
  if (RESERVED.some(r => domain.includes(r))) notFound()
  if (!hasSupabaseEnv()) notFound()

  const product = await getPublishedProductBySlug(domain, slug)
  if (!product) notFound()

  const [built, mode] = await Promise.all([
    buildSiteContent(createAdminClient(), { domain }),
    getLojaModo(domain),
  ])
  if (!built) notFound()

  const jsonLd = buildProductJsonLd(product, domain)
  const faqJsonLd = buildProductFaqJsonLd(product)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }} />
      )}
      <SiteShell
        palette={built.palette}
        businessName={built.content.businessName}
        logoUrl={built.content.logoUrl}
        fontPair={built.fontPair}
        nav={{ label: 'Loja', href: '/loja' }}
      >
        <ProductDetail product={product} mode={mode} whatsapp={built.content.whatsapp} />
      </SiteShell>
    </>
  )
}
