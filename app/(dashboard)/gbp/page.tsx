// ============================================================
// ANCOREO — /gbp · Posts do Google Perfil de Empresa (Nível 2).
// A IA escreve o rascunho; o cliente copia e cola no perfil dele.
// Server component: carrega o site do tenant + posts já gerados.
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import GbpClient, { type GbpPostRow } from './GbpClient'

export const dynamic = 'force-dynamic'

export default async function GbpPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = userData?.tenant_id as string | undefined

  let siteId = ''
  let domain = ''
  let gpeLink = ''
  let gpeModo = ''
  let buscaAlternativa = ''
  if (tenantId) {
    const { data: site } = await supabase
      .from('sites')
      .select('id, domain')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    siteId = site?.id ?? ''
    domain = site?.domain ?? ''

    if (siteId) {
      const { data: prof } = await supabase
        .from('onboarding_profiles')
        .select('gpe_link, gpe_modo, business_name, city')
        .eq('site_id', siteId)
        .maybeSingle()
      gpeLink = (prof?.gpe_link as string) ?? ''
      gpeModo = (prof?.gpe_modo as string) ?? ''
      // Quando o link colado não traz nome nem place_id (é o caso do
      // encurtador que não abriu), o mapa de conferência ainda precisa
      // mostrar alguma coisa. "Nome do negócio + cidade" é o melhor palpite
      // que a gente já tem guardado, e é exatamente o que o dono digitaria.
      buscaAlternativa = [prof?.business_name, prof?.city]
        .filter((s) => typeof s === 'string' && s.trim())
        .join(' ')
        .trim()
    }
  }

  let posts: GbpPostRow[] = []
  if (siteId) {
    // Ordena por data agendada, do mais próximo pro mais distante, e só
    // depois pelos avulsos recentes. O que vence primeiro tem que aparecer
    // primeiro: numa lista por created_at, o post de hoje some no meio do mês.
    const { data: rows } = await supabase
      .from('gbp_posts')
      .select('id, post_type, content, cta_label, cta_url, status, published_at, scheduled_for, created_at')
      .eq('site_id', siteId)
      .order('scheduled_for', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    posts = (rows ?? []) as GbpPostRow[]
  }

  const subtitle = domain ? `${domain} · apareça na busca local do Google` : 'apareça na busca local do Google'

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Google Perfil de Empresa</h1>
          <div className="sub">{subtitle}</div>
        </div>
      </div>

      <GbpClient
        siteId={siteId}
        gpeConnected={gpeModo === 'vincular' && !!gpeLink}
        gpeLink={gpeLink}
        buscaAlternativa={buscaAlternativa}
        initialPosts={posts}
      />
    </>
  )
}
