// Builder compartilhado: monta o SiteContent REAL de um site a partir do banco
// (sections + onboarding_profile + imagens enviadas pelo cliente).
// Usado pelo site publicado ([domain]) e pelo preview do editor (/preview/[siteId]),
// para que o que o cliente vê no editor seja exatamente o que publica.

import type { SupabaseClient } from '@supabase/supabase-js'
import { getPalette, type PaletteColors } from '@/lib/templates/palettes'
import type { SiteContent } from '@/lib/templates/example-content'
import type { LayoutId } from '@/lib/templates/layouts'

export type BuiltSite = {
  content: SiteContent
  layout: LayoutId
  palette: PaletteColors
  fontPair: string | null
  niche: string
  status: string
  domain: string | null
}

// Paleta custom salva em sites.palette.colors[7] vence palette_index legado.
// Ordem das 7 cores = primary, secondary, accent, bg, surface, text, muted.
function resolvePalette(
  niche: string,
  paletteIndex: number,
  custom: { colors?: string[] } | null,
): PaletteColors {
  const c = custom?.colors
  if (c && c.length >= 7) {
    const [primary, secondary, accent, bg, surface, text, muted] = c
    return { primary, secondary, accent, bg, surface, text, muted } as PaletteColors
  }
  return getPalette(niche, paletteIndex) as PaletteColors
}

export async function buildSiteContent(
  supabase: SupabaseClient,
  match: { siteId?: string; domain?: string },
): Promise<BuiltSite | null> {
  let query = supabase
    .from('sites')
    .select('id, niche, template, palette_index, palette, font_pair, status, domain')

  query = match.siteId
    ? query.eq('id', match.siteId)
    : query.eq('domain', match.domain ?? '').eq('status', 'published')

  const { data: site } = await query.maybeSingle()
  if (!site) return null

  const [{ data: page }, { data: profile }, { data: images }] = await Promise.all([
    supabase
      .from('pages')
      .select('id, title, meta_description')
      .eq('site_id', site.id)
      .eq('slug', 'home')
      .maybeSingle(),
    supabase
      .from('onboarding_profiles')
      .select('business_name, city, state, credentials, years_experience, services, tone, logo_url, favicon_url, social_links, gpe_modo, gpe_link, gbp_place_id')
      .eq('site_id', site.id)
      .maybeSingle(),
    supabase
      .from('images')
      .select('webp_url, alt_text, created_at')
      .eq('site_id', site.id)
      .order('created_at', { ascending: false }),
  ])

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

  // Ponto focal salvo no editor (percentuais 0-100). Vira string CSS p/ object-position.
  // Default centro (50% 50%) — compatível com seções antigas que só têm a URL.
  const posToCss = (p?: { x?: number; y?: number } | null): string =>
    `${Math.max(0, Math.min(100, p?.x ?? 50))}% ${Math.max(0, Math.min(100, p?.y ?? 50))}%`

  const hero  = sectionMap['hero']   as { headline?: string; sub?: string; cta_label?: string; cta_phone?: string; image?: string; image_pos?: { x?: number; y?: number } } | undefined
  // Telefone de conversão: o WhatsApp REAL que o cliente cadastrou (aba Marca)
  // vence o cta_phone que a IA escreveu no hero. É o que dispara o CTA de contato —
  // foco em conversão: o botão tem que cair no WhatsApp verdadeiro, não num número fictício.
  const heroPhone = hero?.cta_phone && /\d/.test(hero.cta_phone) ? hero.cta_phone : ''
  const socialLinks = (profile?.social_links ?? {}) as { whatsapp?: string }
  const clientWhats = (socialLinks.whatsapp ?? '').replace(/\D/g, '')
  const contactPhone = clientWhats || heroPhone
  const about = sectionMap['about']  as { title?: string; body?: string; credential?: string; image?: string; image_pos?: { x?: number; y?: number } } | undefined
  const svcs  = sectionMap['services'] as { items?: { name: string; description: string; icon?: string }[] } | undefined
  const testi = sectionMap['testimonials'] as { items?: { name: string; text: string; rating?: number }[] } | undefined
  const faqSec = sectionMap['faq']   as { items?: { question: string; answer: string }[] } | undefined

  const rawServices = svcs?.items ?? (profile?.services as { name: string; description: string; icon?: string }[] | null) ?? []

  // Imagem: a escolha manual do cliente (section.content.image) vence;
  // senão cai pras imagens enviadas (mais recentes primeiro).
  const imgs = (images ?? []) as { webp_url: string; alt_text: string | null }[]
  const heroImage = hero?.image ?? imgs[0]?.webp_url
  const aboutImage = about?.image ?? imgs[1]?.webp_url ?? imgs[0]?.webp_url

  const content: SiteContent = {
    businessName:    profile?.business_name ?? hero?.headline ?? site.domain ?? 'Seu negócio',
    tagline:         hero?.sub ?? '',
    heroHeadline:    hero?.headline ?? '',
    heroSub:         hero?.sub ?? '',
    ctaLabel:        hero?.cta_label ?? 'Falar conosco',
    ctaPhone:        contactPhone,
    about:           about?.body ?? '',
    credential:      about?.credential ?? (profile?.credentials ?? []).join(', '),
    services:        rawServices.map(s => ({ name: s.name, description: s.description, icon: s.icon ?? '⭐' })),
    testimonials:    (testi?.items ?? []).map(t => ({ name: t.name, text: t.text, rating: t.rating ?? 5 })),
    faqs:            faqSec?.items ?? [],
    city:            profile?.city ?? '',
    state:           profile?.state ?? '',
    address:         '',
    whatsapp:        contactPhone,
    email:           '',
    schemaType:      site.niche ?? 'servicos',
    yearsExperience: profile?.years_experience ?? 0,
    blogPosts:       [],
    ...(heroImage ? { heroImage } : {}),
    ...(aboutImage ? { aboutImage } : {}),
    heroImagePos:  posToCss(hero?.image_pos),
    aboutImagePos: posToCss(about?.image_pos),
    ...(profile?.logo_url ? { logoUrl: profile.logo_url as string } : {}),
    ...(profile?.favicon_url ? { faviconUrl: profile.favicon_url as string } : {}),
    ...(profile?.social_links ? { socials: profile.social_links as SiteContent['socials'] } : {}),
    // GBP só conta como "vinculado" quando o cliente escolheu vincular e há link.
    ...(profile?.gpe_modo === 'vincular' && profile?.gpe_link
      ? { gbpLink: profile.gpe_link as string }
      : {}),
    ...(profile?.gbp_place_id ? { gbpPlaceId: profile.gbp_place_id as string } : {}),
  }

  return {
    content,
    layout: (site.template ?? 'clean') as LayoutId,
    palette: resolvePalette(site.niche ?? 'servicos', site.palette_index ?? 0, site.palette),
    fontPair: site.font_pair ?? null,
    niche: site.niche ?? 'servicos',
    status: site.status,
    domain: site.domain,
  }
}
