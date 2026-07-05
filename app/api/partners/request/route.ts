// NV4 — POST /api/partners/request — inicia um anel de 3.
// O dono (A) escolhe um alvo (B); o sistema sugere o terceiro (C = mais afim
// de ambos). Cria partner_rings status='forming' com a_accepted=true e dispara
// convites (partner_requests) pra B e C. Client de SESSÃO (RLS).
//
// Segurança: auth + OWNERSHIP do from_site (tem que ser do tenant logado).
// A RLS de partner_requests exige from_tenant_id = auth_tenant_id() no INSERT,
// então só criamos convites em nome do próprio tenant. Tolera migration ausente.
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadPartnerSuggestions, pickThird, isMissingRelation } from '@/lib/seo/partner-match'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return bad('unauthorized', 401)

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return bad('invalid_json')
  }

  const fromSite = typeof payload.site_id === 'string' ? payload.site_id.trim() : ''
  const targetSite = typeof payload.target_site_id === 'string' ? payload.target_site_id.trim() : ''
  const thirdSite = typeof payload.third_site_id === 'string' ? payload.third_site_id.trim() : ''
  const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, 400) : null
  if (!UUID_RE.test(fromSite)) return bad('invalid_site')
  if (!UUID_RE.test(targetSite)) return bad('invalid_target')
  if (fromSite === targetSite) return bad('same_site')

  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = me?.tenant_id as string | undefined
  if (!tenantId) return bad('no_tenant', 403)

  // OWNERSHIP do from_site.
  const { data: mySite } = await supabase
    .from('sites')
    .select('id, tenant_id')
    .eq('id', fromSite)
    .maybeSingle()
  if (!mySite || mySite.tenant_id !== tenantId) return bad('forbidden', 403)

  // Carrega diretório (RLS discover) pra resolver os perfis de B e C e validar
  // que estão no programa (enabled). Também garante que não re-convidamos.
  const { self, candidates } = await loadPartnerSuggestions(supabase, { tenantId, siteId: fromSite })
  if (!self) return bad('not_opted_in', 409)

  const target = candidates.find(c => c.siteId === targetSite)
  if (!target) return bad('target_unavailable', 409)

  // Terceiro: usa o passado pelo client se válido; senão sugere o mais afim de ambos.
  let third = thirdSite && UUID_RE.test(thirdSite)
    ? candidates.find(c => c.siteId === thirdSite) ?? null
    : null
  if (!third) {
    third = pickThird(self, target, candidates, new Set([targetSite]))
  }
  if (!third) return bad('no_third_available', 409)
  if (third.tenantId === target.tenantId || third.tenantId === tenantId) return bad('no_third_available', 409)

  // Escritas via admin: a RLS de partner_rings/partner_requests é SELECT-only.
  // A rota já autorizou (dono do from_site + alvos válidos do diretório opt-in)
  // e todos os valores são controlados aqui — service_role é seguro.
  const admin = createAdminClient()
  try {
    // Cria o anel forming — A é o iniciador (a_accepted=true).
    const { data: ring, error: ringErr } = await admin
      .from('partner_rings')
      .insert({
        status: 'forming',
        site_a: self.siteId, tenant_a: tenantId,
        site_b: target.siteId, tenant_b: target.tenantId,
        site_c: third.siteId, tenant_c: third.tenantId,
        a_accepted: true,
        b_accepted: false,
        c_accepted: false,
      })
      .select('id')
      .single()
    if (ringErr || !ring) {
      if (isMissingRelation(ringErr)) return bad('feature_unavailable', 503)
      return bad('ring_failed', 500)
    }

    // Convites pra B e pra C (from = eu, enforçado pela RLS WITH CHECK).
    const { error: reqErr } = await admin.from('partner_requests').insert([
      {
        ring_id: ring.id,
        from_tenant_id: tenantId, from_site_id: self.siteId,
        to_tenant_id: target.tenantId, to_site_id: target.siteId,
        status: 'pending', message,
      },
      {
        ring_id: ring.id,
        from_tenant_id: tenantId, from_site_id: self.siteId,
        to_tenant_id: third.tenantId, to_site_id: third.siteId,
        status: 'pending', message,
      },
    ])
    if (reqErr) return bad('invite_failed', 500)

    return NextResponse.json({ ok: true, ring_id: ring.id, invited: [target.siteId, third.siteId] })
  } catch (err) {
    if (isMissingRelation(err)) return bad('feature_unavailable', 503)
    return bad('ring_failed', 500)
  }
}
