// ============================================================
// ANCOREO — /metrics. Visual = protótipo painel/metrics.html (port honesto).
// Anéis SEO/GEO/AEO + "o que melhorar" = dados REAIS (/api/score).
// Visitas e ranking de keywords = "em breve" (sem GA4/Search Console no beta).
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import MetricsView from './MetricsView'

export const dynamic = 'force-dynamic'

export default async function MetricsPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id as string | undefined

  let siteId = ''
  let domain = ''
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
  }

  if (!siteId) {
    return (
      <>
        <div className="topbar"><div><h1>Painel</h1><div className="sub">como você está aparecendo</div></div></div>
        <div className="glass empty">
          <i className="ph-duotone ph-chart-line-up" />
          Publique um site primeiro — o score de SEO, GEO e AEO aparece aqui.
        </div>
      </>
    )
  }

  // Artigos do blog do site — alimenta as métricas de conteúdo + o calendário.
  const { data: postRows } = await supabase
    .from('blog_posts')
    .select('title, status, created_at, published_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  const posts = (postRows ?? []).map(p => ({
    title: p.title as string,
    status: p.status as 'draft' | 'review' | 'published',
    created_at: p.created_at as string,
    published_at: (p.published_at as string | null) ?? null,
  }))

  return <MetricsView siteId={siteId} domain={domain || 'seu site'} posts={posts} />
}
