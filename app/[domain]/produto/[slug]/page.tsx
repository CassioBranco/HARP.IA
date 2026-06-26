import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasSupabaseEnv } from '@/lib/env'
import { getPublishedProductBySlug } from '@/lib/ecommerce/products'
import { buildProductJsonLd, buildProductFaqJsonLd } from '@/lib/ecommerce/product-jsonld'

// Visual funcional/mínimo. O acabamento de marca é do Claude Design (E1: back).
type Props = { params: Promise<{ domain: string; slug: string }> }

const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']

function brl(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`
  }
}

const AVAIL_LABEL: Record<string, string> = {
  in_stock: 'Em estoque',
  out_of_stock: 'Esgotado',
  preorder: 'Pré-venda',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params
  if (!hasSupabaseEnv() || RESERVED.some(r => domain.includes(r))) return {}

  const product = await getPublishedProductBySlug(domain, slug)
  if (!product) return {}

  const description = product.short_answer ?? product.description?.slice(0, 155) ?? product.name
  const url = `https://${domain}/produto/${slug}`
  const image = product.images[0]?.url

  return {
    title: `${product.name}`,
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

  const jsonLd = buildProductJsonLd(product, domain)
  const faqJsonLd = buildProductFaqJsonLd(product)
  const main = product.images[0]
  const specs = Object.entries(product.specs ?? {}).filter(([, v]) => typeof v === 'string' && v.trim())

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
        <a href="/loja" style={{ fontSize: 14, color: '#555' }}>← Voltar à loja</a>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2rem', marginTop: '1rem' }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {main ? <img src={main.url} alt={main.alt || product.name} style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} />
              : <div style={{ width: '100%', aspectRatio: '1/1', background: '#f0f0f0', borderRadius: 12 }} />}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {product.images.slice(1).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img.url} alt={img.alt || product.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 style={{ fontSize: 28, margin: '0 0 .5rem' }}>{product.name}</h1>
            {product.short_answer && <p style={{ fontSize: 17, color: '#333', marginTop: 0 }}>{product.short_answer}</p>}
            <p style={{ fontSize: 26, fontWeight: 700, margin: '1rem 0 .25rem' }}>{brl(product.price_cents, product.currency)}</p>
            <p style={{ fontSize: 14, color: product.availability === 'in_stock' ? '#137333' : '#a00', marginTop: 0 }}>
              {AVAIL_LABEL[product.availability] ?? product.availability}
            </p>
            {/* CTA de compra liga na Fase E2 (checkout Mercado Pago). */}
            <button disabled style={{ marginTop: '1rem', padding: '.8rem 1.5rem', fontSize: 16, borderRadius: 8, border: 'none', background: '#ccc', color: '#666', cursor: 'not-allowed' }}>
              Comprar (em breve)
            </button>
          </div>
        </div>

        {product.description && (
          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: 20 }}>Descrição</h2>
            {product.description.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </section>
        )}

        {specs.length > 0 && (
          <section style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: 20 }}>Especificações</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 520 }}>
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k}>
                    <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', borderBottom: '1px solid #eee', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{k}</th>
                    <td style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {product.faq.length > 0 && (
          <section style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: 20 }}>Perguntas frequentes</h2>
            {product.faq.map((f, i) => (
              <details key={i} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{f.question}</summary>
                <p style={{ margin: '.5rem 0 0' }}>{f.answer}</p>
              </details>
            ))}
          </section>
        )}
      </main>
    </>
  )
}
