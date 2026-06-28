import type { ProductWithImages } from '@/lib/ecommerce/types'
import { brl } from '@/lib/ecommerce/format'

// Página de produto (PDP). mode = 'checkout' (vende no site) ou 'catalogo'
// (fecha pelo WhatsApp) — vem do loja_modo do onboarding. Cores/fonte das CSS
// vars do StoreShell. O carrinho/checkout interativo (ilha client) entra depois;
// aqui o CTA já mostra o caminho certo por modo. ponytail: sem JS no esqueleto.
const AVAIL_LABEL: Record<string, string> = {
  in_stock: 'Em estoque',
  out_of_stock: 'Esgotado',
  preorder: 'Pré-venda',
}

function waLink(whatsapp: string, productName: string): string {
  const d = whatsapp.replace(/\D/g, '')
  const num = d.startsWith('55') ? d : `55${d}`
  return `https://wa.me/${num}?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${productName}`)}`
}

export default function ProductDetail({
  product, mode, whatsapp,
}: {
  product: ProductWithImages
  mode: 'checkout' | 'catalogo'
  whatsapp?: string | null
}) {
  const main = product.images[0]
  const specs = Object.entries(product.specs ?? {}).filter(([, v]) => typeof v === 'string' && v.trim())
  const wa = whatsapp ? waLink(whatsapp, product.name) : null

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem', lineHeight: 1.6 }}>
      <a href="/loja" style={{ fontSize: 14, color: 'var(--st-muted)', textDecoration: 'none' }}>← Voltar à loja</a>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {main ? <img src={main.url} alt={main.alt || product.name} style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} />
            : <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--st-surface)', borderRadius: 12 }} />}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {product.images.slice(1).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img.url} alt={img.alt || product.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: 28, margin: '0 0 .5rem', fontFamily: 'var(--st-font-h, inherit)', color: 'var(--st-text)' }}>{product.name}</h1>
          {product.short_answer && <p style={{ fontSize: 17, color: 'var(--st-text)', marginTop: 0 }}>{product.short_answer}</p>}
          <p style={{ fontSize: 26, fontWeight: 700, margin: '1rem 0 .25rem', color: 'var(--st-primary)' }}>{brl(product.price_cents, product.currency)}</p>
          <p style={{ fontSize: 14, color: 'var(--st-muted)', marginTop: 0 }}>{AVAIL_LABEL[product.availability] ?? product.availability}</p>

          {mode === 'catalogo'
            ? (wa
                ? <a href={wa} style={{ display: 'inline-block', marginTop: '1rem', padding: '.85rem 1.6rem', fontSize: 16, fontWeight: 600, borderRadius: 8, background: 'var(--st-primary)', color: 'var(--st-bg)', textDecoration: 'none' }}>Comprar pelo WhatsApp</a>
                : <span style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--st-muted)' }}>Contato indisponível</span>)
            : <button disabled style={{ marginTop: '1rem', padding: '.85rem 1.6rem', fontSize: 16, fontWeight: 600, borderRadius: 8, border: 'none', background: 'var(--st-surface)', color: 'var(--st-muted)', cursor: 'not-allowed' }}>Comprar (em breve)</button>}
        </div>
      </div>

      {product.description && (
        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--st-font-h, inherit)' }}>Descrição</h2>
          {product.description.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
        </section>
      )}

      {specs.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--st-font-h, inherit)' }}>Especificações</h2>
          <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 520 }}>
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k}>
                  <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', borderBottom: '1px solid var(--st-surface)', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{k}</th>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid var(--st-surface)' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {product.faq.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--st-font-h, inherit)' }}>Perguntas frequentes</h2>
          {product.faq.map((f, i) => (
            <details key={i} style={{ borderBottom: '1px solid var(--st-surface)', padding: '8px 0' }}>
              <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{f.question}</summary>
              <p style={{ margin: '.5rem 0 0', color: 'var(--st-text)' }}>{f.answer}</p>
            </details>
          ))}
        </section>
      )}
    </main>
  )
}
