// ============================================================
// ANCOREO — /agendamentos. Solicitações de horário vindas do
// BookingWidget do site publicado. Server component: carrega o site
// do tenant + solicitações reais (RLS tenant_isolation faz o recorte).
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AgendamentosList, { type BookingRow } from './AgendamentosList'

export const dynamic = 'force-dynamic'

export default async function AgendamentosPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id as string | undefined

  // Site mais recente do tenant (mesmo padrão de /metrics e /blog)
  let siteId = ''
  let domain = ''
  let bookingEnabled = false
  if (tenantId) {
    const { data: site } = await supabase
      .from('sites')
      .select('id, domain, booking_enabled')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    siteId = site?.id ?? ''
    domain = site?.domain ?? ''
    bookingEnabled = Boolean(site?.booking_enabled)
  }

  if (!siteId) {
    return (
      <>
        <div className="topbar"><div><h1>Agendamentos</h1><div className="sub">solicitações de horário do seu site</div></div></div>
        <div className="glass empty">
          <i className="ph-duotone ph-calendar-check" />
          Publique um site primeiro — as solicitações de agendamento aparecem aqui.
        </div>
      </>
    )
  }

  const { data: rows } = await supabase
    .from('booking_requests')
    .select('id, name, phone, service, preferred_date, preferred_time, note, status, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  const requests: BookingRow[] = (rows ?? []).map(r => ({
    id: r.id as string,
    name: r.name as string,
    phone: r.phone as string,
    service: (r.service as string | null) ?? null,
    preferred_date: r.preferred_date as string,
    preferred_time: r.preferred_time as string,
    note: (r.note as string | null) ?? null,
    status: r.status as BookingRow['status'],
    created_at: r.created_at as string,
  }))

  const subtitle = domain ? `${domain} · quem pediu horário com você` : 'quem pediu horário com você'

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Agendamentos</h1>
          <div className="sub">{subtitle}</div>
        </div>
      </div>

      {!bookingEnabled && (
        <div className="glass" style={{ padding: '.8rem 1rem', marginBottom: '1rem', fontSize: '.85rem' }}>
          O widget de agendamento está <b>desativado</b> no seu site. Ative na aba
          {' '}<b>Agenda</b> do <a href="/editor" style={{ color: 'inherit', textDecoration: 'underline' }}>editor</a> pra receber novas solicitações.
        </div>
      )}

      <AgendamentosList requests={requests} />
    </>
  )
}
