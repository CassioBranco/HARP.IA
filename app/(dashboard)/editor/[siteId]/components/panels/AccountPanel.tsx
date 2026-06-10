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

  if (loading) return (
    <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
      Carregando...
    </div>
  )

  if (!data) return null

  const isTrial = !!data.trial_ends_at && new Date(data.trial_ends_at) > new Date()
  const trialDaysLeft = data.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86_400_000))
    : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conta</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* Plano atual */}
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plano atual</p>
              <p className="text-lg font-black text-foreground">{PLAN_LABELS[data.plan] ?? data.plan}</p>
            </div>
            <span className="text-sm font-bold text-primary">{PLAN_PRICES[data.plan] ?? ''}</span>
          </div>

          {isTrial && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 mb-3">
              <p className="text-[11px] font-semibold text-yellow-700">
                Trial ativo — {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
              </p>
            </div>
          )}

          {data.plan !== 'agency' && (
            <a
              href="/settings/billing"
              className="block w-full rounded-lg border-2 border-primary py-2 text-center text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors"
            >
              Fazer upgrade →
            </a>
          )}
        </div>

        {/* Uso mensal */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Uso este mês</p>
          {data.usage.map(item => (
            <div key={item.resource} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-semibold text-foreground">
                  {RESOURCE_LABELS[item.resource] ?? item.resource}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.count}{item.limit ? ` / ${item.limit}` : ''}
                </p>
              </div>
              {item.limit && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.count / item.limit >= 0.9
                        ? 'bg-red-500'
                        : item.count / item.limit >= 0.7
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, (item.count / item.limit) * 100)}%` }}
                  />
                </div>
              )}
              {!item.limit && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/4 rounded-full bg-primary/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="flex flex-col gap-1.5">
          <a href="/settings/billing" className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors">
            <span className="text-[12px] font-semibold text-foreground">Faturamento e plano</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
          <a href="/settings/profile" className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors">
            <span className="text-[12px] font-semibold text-foreground">Meu perfil</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
          <a href="/settings/team" className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors">
            <span className="text-[12px] font-semibold text-foreground">Equipe</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
      </div>
    </div>
  )
}
