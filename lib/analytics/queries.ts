// ============================================================
// ANCOREO — Leitura de analytics_events
// Server-only. A tabela tem RLS ligada e NENHUMA policy: nem o dono logado
// lê direto do banco, só o service_role. Por isso estas funções usam o admin
// client — e por isso o siteId TEM que vir de uma query já protegida por RLS
// (é o caso de /metrics, que resolve o site pelo tenant do usuário logado).
// Nunca aceite siteId vindo do cliente sem checar a dona antes.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin'

export type VisitPoint = { date: string; visits: number }

export type SiteVisits = {
  total: number
  sessions: number
  daily: VisitPoint[]
  devices: { mobile: number; tablet: number; desktop: number }
  /** visitas por tipo de página (home, blog, post, loja, produto) */
  kinds: Record<string, number>
  /** total do período anterior de mesmo tamanho — base da variação % */
  previousTotal: number
  days: number
}

const EMPTY = (days: number): SiteVisits => ({
  total: 0, sessions: 0, daily: [], previousTotal: 0, days,
  devices: { mobile: 0, tablet: 0, desktop: 0 },
  kinds: {},
})

/** YYYY-MM-DD em UTC (mesma base pro eixo do gráfico e pro agrupamento). */
function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

/**
 * Visitas do site publicado nos últimos `days` dias, mais o mesmo período
 * anterior (pra calcular variação). Agrega em memória: no beta o volume é
 * baixo e isso evita depender de RPC/view. Se um dia crescer, virar view.
 */
export async function getSiteVisits(siteId: string, days = 30): Promise<SiteVisits> {
  if (!siteId) return EMPTY(days)

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return EMPTY(days) // sem service_role no ambiente — painel mostra zero, não quebra
  }

  const now = Date.now()
  const startCurrent = new Date(now - days * 86400_000)
  const startPrevious = new Date(now - 2 * days * 86400_000)

  const { data, error } = await admin
    .from('analytics_events')
    .select('created_at, session_id, device, props')
    .eq('event', 'site_view')
    .eq('props->>site_id', siteId)
    .gte('created_at', startPrevious.toISOString())
    .order('created_at', { ascending: true })
    .limit(20000)

  if (error || !data) return EMPTY(days)

  const out = EMPTY(days)
  const sessions = new Set<string>()
  const perDay = new Map<string, number>()
  const cutoff = startCurrent.toISOString()

  for (const row of data) {
    const createdAt = row.created_at as string
    if (createdAt < cutoff) { out.previousTotal++; continue }

    out.total++
    if (row.session_id) sessions.add(row.session_id as string)

    const day = dayKey(createdAt)
    perDay.set(day, (perDay.get(day) ?? 0) + 1)

    const device = row.device as 'mobile' | 'tablet' | 'desktop' | null
    if (device && device in out.devices) out.devices[device]++

    const kind = (row.props as { kind?: string } | null)?.kind
    if (kind) out.kinds[kind] = (out.kinds[kind] ?? 0) + 1
  }

  // Série com todos os dias do período, inclusive os zerados (senão o gráfico
  // "pula" dias sem visita e dá impressão errada de constância).
  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(new Date(now - i * 86400_000).toISOString())
    out.daily.push({ date, visits: perDay.get(date) ?? 0 })
  }

  out.sessions = sessions.size
  return out
}
