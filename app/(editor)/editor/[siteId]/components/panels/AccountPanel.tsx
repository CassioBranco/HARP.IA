'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type AccountData = {
  plan: string
  trial_ends_at: string | null
  usage: { resource: string; count: number; limit: number | null }[]
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
}

const PLAN_PRICES: Record<string, string> = {
  starter: 'R$97/mês',
  pro: 'R$197/mês',
  agency: 'R$297/mês',
}

const RESOURCE_LABELS: Record<string, string> = {
  blog_post: 'Posts de blog',
  site_generation: 'Gerações de site',
  gbp_post: 'Posts GBP',
  audit_run: 'Auditorias',
  translation: 'Traduções',
}

export default function AccountPanel() {
  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id, tenants(plan,trial_ends_at)')
        .eq('id', user.id)
        .single()

      if (!userData?.tenant_id) { setLoading(false); return }

      const tenant = userData.tenants as unknown as { plan: string; trial_ends_at: string | null } | null
      const plan = tenant?.plan ?? 'starter'
      const trial_ends_at = tenant?.trial_ends_at ?? null

      const periodStart = new Date()
      periodStart.setDate(1)
      const periodKey = periodStart.toISOString().slice(0, 10)

      const { data: usageRows } = await supabase
        .from('tenant_usage')
        .select('resource,count')
        .eq('tenant_id', userData.tenant_id)
        .eq('period_start', periodKey)

      const { data: quotaRows } = await supabase
        .from('plan_quotas')
        .select('resource,monthly_limit')
        .eq('plan', plan)

      const quotaMap: Record<string, number | null> = {}
      for (const q of quotaRows ?? []) quotaMap[q.resource] = q.monthly_limit

      const usage = Object.keys(RESOURCE_LABELS).map(resource => ({
        resource,
        count: (usageRows ?? []).find(u => u.resource === resource)?.count ?? 0,
        limit: quotaMap[resource] ?? null,
      }))

      setData({ plan, trial_ends_at, usage })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="ed-scroll"><p className="ed-saving">Carregando…</p></div>
  if (!data) return null

  const isTrial = !!data.trial_ends_at && new Date(data.trial_ends_at) > new Date()
  const trialDaysLeft = data.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86_400_000))
    : 0

  return (
    <>
      <div className="ed-ph"><h2>Conta</h2></div>

      <div className="ed-scroll">

        {/* Plano atual */}
        <div className="ed-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.7rem' }}>
            <div>
              <p className="ed-cap">Plano atual</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>
                {PLAN_LABELS[data.plan] ?? data.plan}
              </p>
            </div>
            <span style={{ fontWeight: 700, color: '#8fc0ff' }}>{PLAN_PRICES[data.plan] ?? ''}</span>
          </div>

          {isTrial && (
            <p className="badge warn" style={{ marginBottom: '.7rem' }}>
              Trial ativo — {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
            </p>
          )}

          {data.plan !== 'agency' && (
            <a href="/settings/billing" className="btn glass block sm">Fazer upgrade →</a>
          )}
        </div>

        {/* Uso mensal */}
        <p className="ed-cap">Uso este mês</p>
        {data.usage.map(item => {
          const ratio = item.limit ? item.count / item.limit : 0.25
          const cls = !item.limit ? '' : ratio >= 0.9 ? 'full' : ratio >= 0.7 ? 'warn' : ''
          return (
            <div key={item.resource} className="ed-card" style={{ padding: '.7rem .85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                <span style={{ fontSize: '.8rem', fontWeight: 600 }}>{RESOURCE_LABELS[item.resource] ?? item.resource}</span>
                <span className="mt">{item.count}{item.limit ? ` / ${item.limit}` : ''}</span>
              </div>
              <div className="ed-usebar">
                <i className={cls} style={{ width: item.limit ? `${Math.min(100, ratio * 100)}%` : '25%' }} />
              </div>
            </div>
          )
        })}

        {/* Links */}
        <a href="/settings/billing" className="ed-link">Faturamento e plano <span>›</span></a>
        <a href="/settings/profile" className="ed-link">Meu perfil <span>›</span></a>
        <a href="/settings/team" className="ed-link">Equipe <span>›</span></a>
      </div>
    </>
  )
}
