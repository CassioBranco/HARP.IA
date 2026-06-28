import Link from 'next/link'
import type { ProductWithImages } from '@/lib/ecommerce/types'
import { brl } from '@/lib/ecommerce/format'

// Vitrine: grade de produtos. Cores/fonte vêm das CSS vars do StoreShell, então
// se adapta a qualquer template automaticamente.
export default function ProductGrid({ products }: { products: ProductWithImages[] }) {
  if (products.length === 0) {
    return <p style={{ padding: '2rem 1.5rem', color: 'var(--st-muted)' }}>Nenhum produto publicado ainda.</p>
  }
  return (
    <div style={{
      maxWidth: 1100, margin: '0 auto', padding: '1.5rem',
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem',
    }}>
      {products.map(p => {
        const img = p.images[0]
        return (
          <Link key={p.id} href={`/produto/${p.slug}`} style={{
            textDecoration: 'none', color: 'var(--st-text)', background: 'var(--st-surface)',
            borderRadius: 12, overflow: 'hidden', display: 'block', border: '1px solid var(--st-surface)',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {img ? <img src={img.url} alt={img.alt || p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
              : <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--st-bg)' }} />}
            <div style={{ padding: '.8rem 1rem' }}>
              <h2 style={{ fontSize: 16, margin: '0 0 .25rem', fontFamily: 'var(--st-font-h, inherit)' }}>{p.name}</h2>
              {p.short_answer && (
                <p style={{ fontSize: 13, color: 'var(--st-muted)', margin: '0 0 .5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.short_answer}
                </p>
              )}
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--st-primary)' }}>{brl(p.price_cents, p.currency)}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
