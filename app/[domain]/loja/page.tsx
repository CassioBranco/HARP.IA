import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasSupabaseEnv } from '@/lib/env'
import { getPublishedProductsByDomain } from '@/lib/ecommerce/products'

// Catálogo público (funcional). Visual de marca = Claude Design depois.
type Props = { params: Promise<{ domain: string }> }

const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']

function brl(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`
  }
}

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

  const products = await getPublishedProductsByDomain(domain)

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, marginBottom: '1.5rem' }}>Loja</h1>

      {products.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhum produto publicado ainda.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {products.map(p => {
            const img = p.images[0]
            return (
              <a key={p.id} href={`/produto/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', display: 'block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {img ? <img src={img.url} alt={img.alt || p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', aspectRatio: '1/1', background: '#f0f0f0' }} />}
                <div style={{ padding: '.8rem 1rem' }}>
                  <h2 style={{ fontSize: 16, margin: '0 0 .25rem' }}>{p.name}</h2>
                  {p.short_answer && <p style={{ fontSize: 13, color: '#666', margin: '0 0 .5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.short_answer}</p>}
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{brl(p.price_cents, p.currency)}</p>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}
