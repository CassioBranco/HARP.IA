// ============================================================
// ANCOREO — /leads. Contatos capturados pelo LeadCaptureBar do site
// publicado. Server component: carrega o site do tenant + leads reais
// (RLS tenant_isolation faz o recorte). Mesmo padrão de /agendamentos.
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import LeadsList, { type LeadRow } from './LeadsList'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id as string | undefined

  // Site mais recente do tenant (mesmo padrão de /metrics e /agendamentos)
  let siteId = ''
  let domain = ''
  let leadsEnabled = false
  if (tenantId) {
    const { data: site } = await supabase
      .from('sites')
      .select('id, domain, leads_enabled')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    siteId = site?.id ?? ''
    domain = site?.domain ?? ''
    leadsEnabled = Boolean(site?.leads_enabled)
  }

  if (!siteId) {
    return (
      <>
        <div className="topbar"><div><h1>Leads</h1><div className="sub">contatos capturados no seu site</div></div></div>
        <div className="glass empty">
          <i className="ph-duotone ph-envelope-simple" />
          Publique um site primeiro — os contatos capturados aparecem aqui.
        </div>
      </>
    )
  }

  const { data: rows } = await supabase
    .from('leads')
    .select('id, name, email, phone, interest, source, status, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  const leads: LeadRow[] = (rows ?? []).map(r => ({
    id: r.id as string,
    name: r.name as string,
    email: (r.email as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    interest: (r.interest as string | null) ?? null,
    source: (r.source as string | null) ?? null,
    status: r.status as LeadRow['status'],
    created_at: r.created_at as string,
  }))

  const subtitle = domain ? `${domain} · quem deixou contato com você` : 'quem deixou contato com você'

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Leads</h1>
          <div className="sub">{subtitle}</div>
        </div>
      </div>

      {!leadsEnabled && (
        <div className="glass" style={{ padding: '.8rem 1rem', marginBottom: '1rem', fontSize: '.85rem' }}>
          A captura de leads está <b>desativada</b> no seu site. Ative na aba
          {' '}<b>Leads</b> do <a href="/editor" style={{ color: 'inherit', textDecoration: 'underline' }}>editor</a> pra receber novos contatos.
        </div>
      )}

      <LeadsList leads={leads} />
    </>
  )
}
