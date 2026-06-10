import type { SiteContent } from '@/lib/templates/example-content'

// AEO Regra 4: FAQ ≥6 + FAQPage schema (schema gerado no SiteSchema.tsx)
export default function SiteFAQ({ c, dark = false }: { c: SiteContent; dark?: boolean }) {
  const bg = dark ? 'var(--sp)' : 'var(--sf)'
  const titleColor = dark ? '#fff' : 'var(--st)'
  const mutedColor = dark ? 'rgba(255,255,255,0.7)' : 'var(--sm)'
  const itemBg = dark ? 'rgba(255,255,255,0.08)' : 'var(--sb)'
  const borderColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'

  return (
    <section style={{ padding: '5rem 1.5rem', backgroundColor: bg }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* AEO Regra 3: H2 autossuficiente — primeira frase é a resposta direta */}
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: titleColor, textAlign: 'center', marginBottom: '0.75rem' }}>
          Perguntas frequentes sobre {c.businessName}
        </h2>
        <p style={{ color: mutedColor, textAlign: 'center', marginBottom: '3rem', fontSize: '1rem' }}>
          Tire suas dúvidas sobre nossos serviços em {c.city}.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {c.faqs.map((faq, i) => (
            <details key={i} style={{ backgroundColor: itemBg, borderRadius: '0.75rem', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
              <summary style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: titleColor, cursor: 'pointer', fontSize: '1rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                {faq.question}
                <span style={{ color: 'var(--sa)', fontSize: '1.4rem', fontWeight: 300, flexShrink: 0, lineHeight: 1 }}>+</span>
              </summary>
              <p style={{ padding: '0 1.5rem 1.25rem', color: mutedColor, lineHeight: 1.75, fontSize: '0.95rem', margin: 0 }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
