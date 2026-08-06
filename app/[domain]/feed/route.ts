import { hasSupabaseEnv } from '@/lib/env'
import { getPublishedProductsByDomain } from '@/lib/ecommerce/products'
import { productUrl } from '@/lib/ecommerce/product-jsonld'

// Feed de produto (JSONL / NDJSON) — base p/ Google Merchant Center e o feed
// do ChatGPT Shopping. 1 produto por linha. A submissão real ao ChatGPT/Merchant
// é E3; aqui geramos o feed legível por máquina.
export const runtime = 'nodejs'

const RESERVED = ['localhost', 'ancoreo.vercel.app', 'vercel.app']

const AVAIL_FEED: Record<string, string> = {
  in_stock: 'in stock',
  out_of_stock: 'out of stock',
  preorder: 'preorder',
}

type Ctx = { params: Promise<{ domain: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  const { domain } = await ctx.params
  if (RESERVED.some(r => domain.includes(r)) || !hasSupabaseEnv()) {
    return new Response('Not found', { status: 404 })
  }

  const products = await getPublishedProductsByDomain(domain)

  const lines = products.map(p => JSON.stringify({
    id: p.id,
    title: p.name,
    description: p.short_answer ?? p.description ?? p.name,
    link: productUrl(domain, p.slug),
    image_link: p.images[0]?.url ?? '',
    availability: AVAIL_FEED[p.availability] ?? 'in stock',
    price: `${(p.price_cents / 100).toFixed(2)} ${p.currency}`,
    condition: p.condition,
    ...(p.brand ? { brand: p.brand } : {}),
    ...(p.gtin ? { gtin: p.gtin } : {}),
  }))

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
