// ============================================================
// ANCOREO — /metrics. Visual = protótipo painel/metrics.html (port honesto).
// Anéis SEO/GEO/AEO + "o que melhorar" = dados REAIS (/api/score).
// Visitas = REAIS, da nossa própria telemetria (analytics_events / site_view).
// Ranking de keywords segue "em breve" (depende do Search Console).
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getSiteVisits } from '@/lib/analytics/queries'
import { getScoreHistory } from '@/lib/score/history'
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
  let siteStatus = ''
  if (tenantId) {
    const { data: site } = await supabase
      .from('sites')
      .select('id, domain, status')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    siteId = site?.id ?? ''
    domain = site?.domain ?? ''
    siteStatus = (site?.status as string) ?? ''
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

  // ── Presença local + sitemap (tolerante a coluna/tabela ausente) ──
  // Perfil de negócio (gpe + campos disponíveis). Nunca deixa a página 500:
  // qualquer erro/coluna faltando vira campo vazio.
  let gpeModo = ''
  let gpeLink = ''
  let businessName = ''
  let city = ''
  try {
    const { data: prof } = await supabase
      .from('onboarding_profiles')
      .select('gpe_modo, gpe_link, business_name, city')
      .eq('site_id', siteId)
      .maybeSingle()
    gpeModo = (prof?.gpe_modo as string) ?? ''
    gpeLink = (prof?.gpe_link as string) ?? ''
    businessName = (prof?.business_name as string) ?? ''
    city = (prof?.city as string) ?? ''
  } catch { /* coluna/tabela ausente — degrada pra vazio */ }

  // Datas dos posts do Google (alimenta cadência + item "post nos últimos 14d").
  let gbpPostDates: string[] = []
  try {
    const { data: gbpRows } = await supabase
      .from('gbp_posts')
      .select('created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
    gbpPostDates = (gbpRows ?? []).map(r => r.created_at as string).filter(Boolean)
  } catch { /* tabela ausente — sem posts */ }

  // Contagens do sitemap: MESMA lógica de app/sitemap.ts (só quando publicado).
  // Páginas publicadas + artigos publicados = o que entra no sitemap.xml.
  let sitemapPages = 0
  let sitemapPosts = 0
  if (siteStatus === 'published') {
    try {
      const [{ count: pagesCount }, { count: postsCount }] = await Promise.all([
        supabase
          .from('pages')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', siteId)
          .eq('published', true),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', siteId)
          .eq('status', 'published'),
      ])
      sitemapPages = pagesCount ?? 0
      sitemapPosts = postsCount ?? 0
    } catch { /* mantém 0 */ }
  }

  // siteId aqui já veio de uma query com RLS pelo tenant do usuário logado,
  // então é seguro passar pros leitores admin abaixo.
  // Visitas (30d) e histórico do score (90d) em paralelo: nenhum depende do outro.
  // O histórico devolve [] enquanto a migration score_snapshots não for aplicada.
  const [visits, scoreHistory] = await Promise.all([
    getSiteVisits(siteId, 30),
    getScoreHistory(siteId, 90),
  ])

  return (
    <MetricsView
      visits={visits}
      scoreHistory={scoreHistory}
      siteId={siteId}
      domain={domain || 'seu site'}
      posts={posts}
      siteStatus={siteStatus}
      gpeModo={gpeModo}
      gpeLink={gpeLink}
      businessName={businessName}
      city={city}
      gbpPostDates={gbpPostDates}
      sitemapPages={sitemapPages}
      sitemapPosts={sitemapPosts}
    />
  )
}
