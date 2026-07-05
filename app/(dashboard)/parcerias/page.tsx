// ============================================================
// NV4 — /parcerias. Programa de troca de backlinks ENTRE clientes em anéis
// de 3 (A→B→C→A, direção única). Server component: carrega o site do tenant,
// o estado de opt-in, sugestões ranqueadas, convites recebidos e anéis ativos
// (tudo via RLS de sessão). TODA query nova é tolerante à migration ausente:
// se as tabelas partner_* ainda não existem, a página abre em estado vazio
// (nunca 500), igual o NV3 tolerou a coluna faq.
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { loadPartnerSuggestions, isMissingRelation } from '@/lib/seo/partner-match'
import ParceriasClient, {
  type OptinState,
  type Suggestion,
  type ReceivedInvite,
  type RingCard,
} from './ParceriasClient'

export const dynamic = 'force-dynamic'

export default async function ParceriasPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
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

  if (!siteId || !tenantId) {
    return (
      <>
        <div className="topbar"><div><h1>Parcerias</h1><div className="sub">troca de links entre sites parceiros</div></div></div>
        <div className="glass empty">
          <i className="ph-duotone ph-handshake" />
          Publique um site primeiro — as parcerias ligam o blog do seu site ao de outros clientes.
        </div>
      </>
    )
  }

  // Estado inicial, tudo tolerante à migration ausente.
  let optin: OptinState = { optedIn: false, enabled: false, blurb: '' }
  let suggestions: Suggestion[] = []
  const received: ReceivedInvite[] = []
  const rings: RingCard[] = []

  try {
    const { data: mine } = await supabase
      .from('partner_optin')
      .select('enabled, blurb')
      .eq('site_id', siteId)
      .maybeSingle()
    if (mine) optin = { optedIn: true, enabled: Boolean(mine.enabled), blurb: (mine.blurb as string | null) ?? '' }
  } catch { /* tabela ausente → mantém default */ }

  // Sugestões (só faz sentido se opt-in). loadPartnerSuggestions já é tolerante.
  if (optin.optedIn) {
    const { candidates } = await loadPartnerSuggestions(supabase, { tenantId, siteId })
    suggestions = candidates.slice(0, 12).map(c => ({
      siteId: c.siteId,
      segment: c.segment,
      blurb: c.blurb,
      score: Math.round(c.score * 100),
    }))
  }

  // Convites recebidos (pendentes) + anéis onde sou membro.
  try {
    const { data: invRows, error: invErr } = await supabase
      .from('partner_requests')
      .select('id, ring_id, from_site_id, message, status, created_at')
      .eq('to_tenant_id', tenantId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (!(invErr && isMissingRelation(invErr))) {
      for (const r of invRows ?? []) {
        received.push({
          id: r.id as string,
          fromSiteId: r.from_site_id as string,
          message: (r.message as string | null) ?? null,
          createdAt: r.created_at as string,
        })
      }
    }

    const { data: ringRows, error: ringErr } = await supabase
      .from('partner_rings')
      .select('id, status, site_a, tenant_a, site_b, tenant_b, site_c, tenant_c, a_accepted, b_accepted, c_accepted, created_at')
      .neq('status', 'dissolved')
      .order('created_at', { ascending: false })
    if (!(ringErr && isMissingRelation(ringErr))) {
      for (const r of ringRows ?? []) {
        const accepted = [r.a_accepted, r.b_accepted, r.c_accepted].filter(Boolean).length
        rings.push({
          id: r.id as string,
          status: r.status as RingCard['status'],
          acceptedCount: accepted,
          createdAt: r.created_at as string,
        })
      }
    }
  } catch { /* tabelas ausentes → listas vazias */ }

  return (
    <ParceriasClient
      siteId={siteId}
      domain={domain}
      optin={optin}
      suggestions={suggestions}
      received={received}
      rings={rings}
    />
  )
}
