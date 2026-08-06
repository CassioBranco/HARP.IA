import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasSupabaseEnv } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteContent } from '@/lib/templates/build-site-content'
import { getPublishedProductsByDomain } from '@/lib/ecommerce/products'
import SiteShell from '@/components/site/SiteShell'
import ProductGrid from '@/components/store/ProductGrid'
import SiteAnalytics from '../SiteAnalytics'

// Vitrine pública (catálogo). Usa o esqueleto de loja (StoreShell), que veste
// a paleta/fonte/marca do template do cliente.
type Props = { params: Promise<{ domain: string }> }

const RESERVED = ['localhost', 'ancoreo.vercel.app', 'vercel.app']

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
    <SiteShell
      palette={built.palette}
      businessName={built.content.businessName}
      logoUrl={built.content.logoUrl}
      fontPair={built.fontPair}
      nav={{ label: 'Loja', href: '/loja' }}
    >
      <SiteAnalytics kind="loja" />
      <ProductGrid products={products} />
    </SiteShell>
  )
}
