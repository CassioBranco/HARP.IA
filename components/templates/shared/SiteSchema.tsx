import type { SiteContent } from '@/lib/templates/example-content'
import { jsonLdScript } from '@/lib/seo/jsonld'

export default function SiteSchema({ c, preview }: { c: SiteContent; preview: boolean }) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': c.schemaType,
    name: c.businessName,
    description: c.tagline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: c.city,
      addressRegion: c.state,
      addressCountry: 'BR',
    },
    telephone: c.ctaPhone,
    email: c.email,
    url: preview ? undefined : `https://${c.businessName.toLowerCase().replace(/\s+/g, '-')}.com.br`,
    areaServed: { '@type': 'City', name: c.city },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(baseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema) }} />
    </>
  )
}
