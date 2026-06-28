import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasSupabaseEnv } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteContent } from '@/lib/templates/build-site-content'
import { getPublishedProductsByDomain } from '@/lib/ecommerce/products'
import StoreShell from '@/components/store/StoreShell'
import ProductGrid from '@/components/store/ProductGrid'

// Vitrine pública (catálogo). Usa o esqueleto de loja (StoreShell), que veste
// a paleta/fonte/marca do template do cliente.
type Props = { params: Promise<{ domain: string }> }

const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  if (RESERVED.some(r => domain.includes(r))) return {}
  return {
    title: 'Loja',
    robots: { index: true, follow: true },
    alternates: { canonical: `https://${domain}/loja` },
  }
}

export default async function StorefrontPage({ params }: Props) {
  const { domain } = await params
  if (RESERVED.some(r => domain.includes(r))) notFound()
  if (!hasSupabaseEnv()) notFound()

  const built = await buildSiteContent(createAdminClient(), { domain })
  if (!built) notFound()
  const products = await getPublishedProductsByDomain(domain)

  return (
    <StoreShell
      palette={built.palette}
      businessName={built.content.businessName}
      logoUrl={built.content.logoUrl}
      fontPair={built.fontPair}
    >
      <ProductGrid products={products} />
    </StoreShell>
  )
}
