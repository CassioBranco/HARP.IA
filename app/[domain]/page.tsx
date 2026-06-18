import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { buildSiteContent } from '@/lib/templates/build-site-content'
import LayoutRenderer from '@/components/templates/LayoutRenderer'
import type { SiteContent } from '@/lib/templates/example-content'
import type { Metadata } from 'next'

type Props = { params: Promise<{ domain: string }> }

const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']

// ── Schema JSON-LD por nicho (AEO Regra 2) ──────────────────────────────────
function buildJsonLd(site: {
  niche: string | null
  domain: string
}, content: SiteContent, profile: {
  business_name?: string | null
  city?: string | null
  state?: string | null
  phone?: string | null
  credentials?: string[] | null
  years_experience?: number | null
} | null) {
  const schemaTypeMap: Record<string, string> = {
    clinica:       'HealthcareBusiness',
    odontologia:   'Dentist',
    fisioterapia:  'HealthcareBusiness',
    veterinaria:   'VeterinaryCare',
    advocacia:     'LegalService',
    contabilidade: 'AccountingService',
    psicologia:    'MentalHealthBusiness',
    imobiliaria:   'RealEstateAgent',
    restaurante:   'Restaurant',
    salao:         'BeautySalon',
    escola:        'EducationalOrganization',
    servicos:      'LocalBusiness',
    institucional: 'Organization',
    landing:       'WebPage',
  }

  const schemaType = schemaTypeMap[site.niche ?? 'servicos'] ?? 'LocalBusiness'
  const city = profile?.city ?? ''
  const state = profile?.state ?? 'SP'

  const base = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: content.businessName,
    description: content.tagline,
    url: `https://${site.domain}`,
    address: city ? {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: state,
      addressCountry: 'BR',
    } : undefined,
    telephone: profile?.phone ?? undefined,
    areaServed: city ? { '@type': 'City', name: city } : undefined,
    // Vínculo com o Google Perfil de Empresa: diz ao Google/IAs que este site
    // é o mesmo negócio verificado no Maps (sinal forte de SEO local).
    sameAs: content.gbpLink ? [content.gbpLink] : undefined,
    hasMap: content.gbpLink ?? undefined,
  }

  const faqItems = (content.faqs ?? []).slice(0, 6)
  const faqSchema = faqItems.length >= 6 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f: { question: string; answer: string }) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  return { base, faqSchema }
}

// ── Metadata dinâmica ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  if (!hasSupabaseEnv() || RESERVED.some(r => domain.includes(r))) return {}

  const supabase = await createServerClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, niche, status')
    .eq('domain', domain)
    .eq('status', 'published')
    .maybeSingle()

  if (!site) return { title: domain }

  const { data: page } = await supabase
    .from('pages')
    .select('title, meta_description')
    .eq('site_id', site.id)
    .eq('slug', 'home')
    .single()

  // Favicon do cliente (gerado no upload da logo)
  const { data: prof } = await supabase
    .from('onboarding_profiles')
    .select('favicon_url')
    .eq('site_id', site.id)
    .maybeSingle()
  const favicon = (prof as { favicon_url?: string } | null)?.favicon_url

  return {
    title: page?.title ?? domain,
    description: page?.meta_description ?? undefined,
    robots: { index: true, follow: true },
    ...(favicon ? { icons: { icon: favicon, shortcut: favicon, apple: favicon } } : {}),
    alternates: { canonical: `https://${domain}` },
    openGraph: {
      title: page?.title ?? domain,
      description: page?.meta_description ?? undefined,
      url: `https://${domain}`,
      type: 'website',
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function PublishedSitePage({ params }: Props) {
  const { domain } = await params

  if (RESERVED.some(r => domain.includes(r))) notFound()
  if (!hasSupabaseEnv()) notFound()

  const supabase = await createServerClient()

  const built = await buildSiteContent(supabase, { domain })
  if (!built) notFound()

  const { content, layout, palette, fontPair } = built

  // Perfil mínimo para o JSON-LD, derivado do conteúdo já montado.
  const jsonLdProfile = {
    business_name: content.businessName,
    city: content.city,
    state: content.state,
    phone: content.whatsapp,
    credentials: content.credential ? content.credential.split(',').map(s => s.trim()) : [],
    years_experience: content.yearsExperience,
  }

  const { base: jsonLd, faqSchema } = buildJsonLd({ niche: built.niche, domain }, content, jsonLdProfile)

  return (
    <>
      {/* JSON-LD — AEO Regra 2 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <LayoutRenderer layout={layout} c={content} p={palette} fontPair={fontPair} preview={false} />
    </>
  )
}
