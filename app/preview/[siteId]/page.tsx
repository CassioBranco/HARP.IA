import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { buildSiteContent } from '@/lib/templates/build-site-content'
import LayoutRenderer from '@/components/templates/LayoutRenderer'
import PreviewBridge from './PreviewBridge'
import Link from 'next/link'

type Props = {
  params: Promise<{ siteId: string }>
  searchParams: Promise<{ chrome?: string; v?: string }>
}

export const dynamic = 'force-dynamic'

export default async function PreviewPage({ params, searchParams }: Props) {
  const { siteId } = await params
  const { chrome = '1' } = await searchParams

  if (!hasSupabaseEnv()) {
    return <p style={{ padding: '2rem', color: '#dc2626' }}>Env não configurada.</p>
  }

  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const built = await buildSiteContent(supabase, { siteId })
  if (!built) notFound()

  const showChrome = chrome !== '0'

  return (
    <>
      {showChrome && (
        <>
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
              backgroundColor: '#0f172a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 1.25rem', height: '44px', fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: '#10b981' }}>ANCOREO</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Pré-visualização do site</span>
            </div>
            <Link
              href="/sites"
              style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.25rem 0.875rem', borderRadius: '0.375rem', fontWeight: 600, textDecoration: 'none', fontSize: '0.8rem' }}
            >
              ← Voltar ao painel
            </Link>
          </div>
          <div style={{ height: '44px' }} />
        </>
      )}

      <LayoutRenderer
        layout={built.layout}
        c={built.content}
        p={built.palette}
        fontPair={built.fontPair}
        sections={built.sections}
        preview
      />

      {/* Modo editor (sem chrome): clicar no preview abre a aba certa de edição */}
      {!showChrome && <PreviewBridge />}
    </>
  )
}
