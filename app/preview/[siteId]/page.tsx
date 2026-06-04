import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { getPalette } from '@/lib/templates/palettes'
import { getExampleContent } from '@/lib/templates/example-content'
import SiteTemplate from '@/components/templates/SiteTemplate'
import Link from 'next/link'

type Props = { params: Promise<{ siteId: string }> }

export default async function PreviewPage({ params }: Props) {
  const { siteId } = await params

  if (!hasSupabaseEnv()) {
    return <p className="p-8 text-destructive">Env não configurada.</p>
  }

  const supabase = await createServerClient()

  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca o site
  const { data: site } = await supabase
    .from('sites')
    .select('id, preset, palette_index, status, domain')
    .eq('id', siteId)
    .maybeSingle()

  if (!site) notFound()

  const preset = site.preset ?? 'servicos'
  const paletteIndex = site.palette_index ?? 0
  const palette = getPalette(preset, paletteIndex)
  const content = getExampleContent(preset)

  return (
    <>
      {/* Barra de preview — não aparece no site publicado real */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          backgroundColor: '#0f172a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem', height: '44px', fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: '#10b981' }}>HARPIA</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Pré-visualização do site</span>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {preset}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            Conteúdo de exemplo — a IA preenche o real após o onboarding
          </span>
          <Link
            href="/sites"
            style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.25rem 0.875rem', borderRadius: '0.375rem', fontWeight: 600, textDecoration: 'none', fontSize: '0.8rem' }}
          >
            ← Voltar ao painel
          </Link>
        </div>
      </div>

      {/* Espaçador para compensar a barra fixa */}
      <div style={{ height: '44px' }} />

      <SiteTemplate content={content} palette={palette} preview />
    </>
  )
}
