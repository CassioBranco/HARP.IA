import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { getPalette } from '@/lib/templates/palettes'
import LayoutRenderer from '@/components/templates/LayoutRenderer'
import type { LayoutId } from '@/lib/templates/layouts'
import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
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

  return {
    title: page?.title ?? domain,
    description: page?.meta_description ?? undefined,
    robots: { index: true, follow: true },
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

  // Busca site + perfil de onboarding em paralelo
  const { data: site } = await supabase
    .from('sites')
    .select('id, niche, template, palette_index, status, domain')
    .eq('domain', domain)
    .eq('status', 'published')
    .maybeSingle()

  if (!site) notFound()

  const [{ data: page }, { data: profile }] = await Promise.all([
    supabase
      .from('pages')
      .select('id, title, meta_description')
      .eq('site_id', site.id)
      .eq('slug', 'home')
      .single(),
    supabase
      .from('onboarding_profiles')
      .select('business_name, city, state, phone, credentials, years_experience, services, tone')
      .eq('site_id', site.id)
      .single(),
  ])

  // Busca sections
  const { data: sections } = page?.id
    ? await supabase
        .from('sections')
        .select('section_type, content')
        .eq('page_id', page.id)
        .order('order_index')
    : { data: [] }

  const sectionMap = (sections ?? []).reduce<Record<string, unknown>>((acc, s) => {
    acc[s.section_type] = s.content
    return acc
  }, {})

  // Monta SiteContent a partir das sections reais
  const hero   = sectionMap['hero']   as { headline?: string; sub?: string; cta_label?: string; cta_phone?: string } | undefined
  const about  = sectionMap['about']  as { title?: string; body?: string; credential?: string } | undefined
  const svcs   = sectionMap['services'] as { items?: { name: string; description: string; icon?: string }[] } | undefined
  const testi  = sectionMap['testimonials'] as { items?: { name: string; text: string; rating?: number }[] } | undefined
  const faqSec = sectionMap['faq']    as { items?: { question: string; answer: string }[] } | undefined
  const meta   = sectionMap['meta']   as { title?: string; description?: string; keywords?: string[] } | undefined

  const rawServices = svcs?.items ?? (profile?.services as { name: string; description: string; icon?: string }[] | null) ?? []
  const content: SiteContent = {
    businessName:    profile?.business_name ?? hero?.headline ?? domain,
    tagline:         hero?.sub ?? '',
    heroHeadline:    hero?.headline ?? '',
    heroSub:         hero?.sub ?? '',
    ctaLabel:        hero?.cta_label ?? 'Falar conosco',
    ctaPhone:        hero?.cta_phone ?? '',
    about:           about?.body ?? '',
    credential:      about?.credential ?? (profile?.credentials ?? []).join(', '),
    services:        rawServices.map(s => ({ name: s.name, description: s.description, icon: s.icon ?? '⭐' })),
    testimonials:    (testi?.items ?? []).map(t => ({ name: t.name, text: t.text, rating: t.rating ?? 5 })),
    faqs:            faqSec?.items ?? [],
    city:            profile?.city ?? '',
    state:           '',
    address:         '',
    whatsapp:        profile?.phone ?? '',
    email:           '',
    schemaType:      site.niche ?? 'servicos',
    yearsExperience: profile?.years_experience ?? 0,
    blogPosts:       [],
  }

  const palette = getPalette(site.niche ?? 'servicos', site.palette_index ?? 0) as PaletteColors
  const layout = (site.template ?? 'clean') as LayoutId

  const { base: jsonLd, faqSchema } = buildJsonLd(site, content, profile)

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

      <LayoutRenderer layout={layout} c={content} p={palette} preview={false} />
    </>
  )
}
