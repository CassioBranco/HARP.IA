import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { getPalette } from '@/lib/templates/palettes'
import { getExampleContent } from '@/lib/templates/example-content'
import SiteTemplate from '@/components/templates/SiteTemplate'
import type { Metadata } from 'next'

type Props = { params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  if (!hasSupabaseEnv()) return {}

  const supabase = await createServerClient()
  const { data: site } = await supabase
    .from('sites')
    .select('preset')
    .eq('domain', domain)
    .eq('status', 'published')
    .maybeSingle()

  if (!site) return { title: domain }

  const content = getExampleContent(site.preset ?? 'servicos')
  return {
    title: content.businessName,
    description: content.tagline,
  }
}

export default async function PublishedSitePage({ params }: Props) {
  const { domain } = await params

  // Domínios internos do painel — nunca renderizar como site de cliente
  const RESERVED = ['localhost', 'harp-ia.vercel.app', 'vercel.app']
  if (RESERVED.some(r => domain.includes(r))) notFound()

  if (!hasSupabaseEnv()) notFound()

  const supabase = await createServerClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, preset, palette_index, status')
    .eq('domain', domain)
    .eq('status', 'published')
    .maybeSingle()

  if (!site) notFound()

  const preset = site.preset ?? 'servicos'
  const palette = getPalette(preset, site.palette_index ?? 0)
  const content = getExampleContent(preset)

  return <SiteTemplate content={content} palette={palette} />
}
