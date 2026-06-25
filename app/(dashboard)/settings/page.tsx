// ============================================================
// ANCOREO — /settings (Fase 5). Visual = protótipo settings.html.
// Server component: carrega dados reais (conta, plano, uso) e injeta no client.
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import SettingsClient, { type SettingsData } from './SettingsClient'

export const dynamic = 'force-dynamic'

const BLOG_LIMIT: Record<string, number | null> = { starter: 4, pro: 20, agency: null }
const SITES_ALLOWED: Record<string, number> = { starter: 1, pro: 3, agency: 999 }

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenants(plan)')
    .eq('id', user.id)
    .single()

  const tenantId = userData?.tenant_id as string | undefined
  const t = userData?.tenants as { plan?: string } | { plan?: string }[] | null
  const tenant = Array.isArray(t) ? t[0] : t
  const plan = tenant?.plan ?? 'starter'

  let businessName = ''
  let city = ''
  let sitesUsed = 0
  let blogUsed = 0

  if (tenantId) {
    const [profRes, sitesRes] = await Promise.all([
      supabase
        .from('onboarding_profiles')
        .select('business_name, city')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('sites')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId),
    ])
    businessName = profRes.data?.business_name ?? ''
    city = profRes.data?.city ?? ''
    sitesUsed = sitesRes.count ?? (sitesRes.data?.length ?? 0)

    // Artigos gerados neste mês (todos os sites do tenant)
    const siteIds = (sitesRes.data ?? []).map(s => s.id)
    if (siteIds.length) {
      const monthStart = new Date()
      monthStart.setDate(1)
      const { count } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .in('site_id', siteIds)
        .gte('created_at', monthStart.toISOString())
      blogUsed = count ?? 0
    }
  }

  const data: SettingsData = {
    email: user.email ?? '',
    businessName,
    city,
    plan,
    sitesUsed,
    sitesAllowed: SITES_ALLOWED[plan] ?? 1,
    blogUsed,
    blogLimit: BLOG_LIMIT[plan] ?? null,
  }

  return (
    <div className="settings-main">
      <SettingsClient data={data} />
    </div>
  )
}
