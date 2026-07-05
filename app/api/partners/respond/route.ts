// NV4 — POST /api/partners/respond — aceita/recusa um convite de anel.
// SÓ o destinatário (to_tenant_id) pode responder. Ao aceitar, marca o flag
// do anel (a/b/c_accepted) conforme a posição do respondente. Quando os 3
// aceitam, o anel vira 'active' e dispara a injeção dos backlinks.
//
// Segurança:
//  • auth + o respondente PRECISA ser o to_tenant_id do convite (a RLS de
//    partner_requests deixa ambas as pontas LEREM, mas a regra de "só o
//    destinatário responde" é enforçada AQUI, no código).
//  • Cliente de sessão pra ler/atualizar convite e anel (RLS de membro).
//  • O ÚNICO uso de admin client é a injeção pós-active, e só depois de o
//    injectRingBacklinks revalidar (com o próprio admin) que o anel está
//    active com os 3 aceites — ver lib/seo/partner-inject.ts.
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { injectRingBacklinks } from '@/lib/seo/partner-inject'
import { isMissingRelation } from '@/lib/seo/partner-match'

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

  const requestId = typeof payload.request_id === 'string' ? payload.request_id.trim() : ''
  const accept = payload.accept === true
  const decline = payload.accept === false
  if (!UUID_RE.test(requestId)) return bad('invalid_request')
  if (!accept && !decline) return bad('missing_decision')

  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = me?.tenant_id as string | undefined
  if (!tenantId) return bad('no_tenant', 403)

  try {
    // Carrega o convite (RLS deixa ver como parte). Confere destinatário.
    const { data: invite, error: invErr } = await supabase
      .from('partner_requests')
      .select('id, ring_id, to_tenant_id, status')
      .eq('id', requestId)
      .maybeSingle()
    if (invErr && isMissingRelation(invErr)) return bad('feature_unavailable', 503)
    if (!invite) return bad('not_found', 404)

    // ── SÓ o destinatário responde ──
    if (invite.to_tenant_id !== tenantId) return bad('forbidden', 403)
    if (invite.status !== 'pending') return bad('already_responded', 409)

    // Escritas via admin: a RLS de partner_requests/partner_rings é SELECT-only
    // (impede forjar aceite). A autorização está AQUI: só o destinatário chega
    // até este ponto, e cada flag setado é o da posição do próprio respondente.
    const admin = createAdminClient()

    const newStatus = accept ? 'accepted' : 'declined'
    const { error: updErr } = await admin
      .from('partner_requests')
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('status', 'pending') // guarda contra corrida
    if (updErr) return bad('update_failed', 500)

    // Recusa: dissolve o anel (não faz sentido meio-anel) — best effort.
    if (decline) {
      if (invite.ring_id) {
        await admin.from('partner_rings').update({ status: 'dissolved' }).eq('id', invite.ring_id)
        await admin
          .from('partner_requests')
          .update({ status: 'cancelled' })
          .eq('ring_id', invite.ring_id)
          .eq('status', 'pending')
      }
      return NextResponse.json({ ok: true, status: 'declined', ring: 'dissolved' })
    }

    // Aceite: marca o flag do anel conforme a posição do respondente.
    if (!invite.ring_id) return NextResponse.json({ ok: true, status: 'accepted' })

    const { data: ring } = await admin
      .from('partner_rings')
      .select('id, status, tenant_a, tenant_b, tenant_c, a_accepted, b_accepted, c_accepted')
      .eq('id', invite.ring_id)
      .maybeSingle()
    if (!ring) return NextResponse.json({ ok: true, status: 'accepted' })

    const patch: Record<string, boolean> = {}
    if (ring.tenant_a === tenantId) patch.a_accepted = true
    else if (ring.tenant_b === tenantId) patch.b_accepted = true
    else if (ring.tenant_c === tenantId) patch.c_accepted = true

    const a = ring.a_accepted || patch.a_accepted === true
    const b = ring.b_accepted || patch.b_accepted === true
    const c = ring.c_accepted || patch.c_accepted === true
    const allAccepted = a && b && c

    await admin
      .from('partner_rings')
      .update({
        ...patch,
        ...(allAccepted ? { status: 'active', activated_at: new Date().toISOString() } : {}),
      })
      .eq('id', ring.id)

    // ── Fechou o anel: injeta os backlinks cross-tenant. ──
    // Admin client JUSTIFICADO: escreve no blog dos 3 tenants, algo que a RLS
    // de sessão bloqueia. injectRingBacklinks REVALIDA (com o admin) que o anel
    // está active + 3 aceites ANTES de escrever — a autorização é o opt-in +
    // aceite explícito dos 3. Nunca é chamado sem o allAccepted acima.
    let injection = null
    if (allAccepted) {
      try {
        injection = await injectRingBacklinks(admin, ring.id)
      } catch {
        // A injeção pode ser reprocessada; o anel já está active e registrado.
        injection = { activated: true, linksPlanned: 0, linksRendered: 0, reason: 'injection_deferred' }
      }
    }

    return NextResponse.json({ ok: true, status: 'accepted', ringActive: allAccepted, injection })
  } catch (err) {
    if (isMissingRelation(err)) return bad('feature_unavailable', 503)
    return bad('respond_failed', 500)
  }
}
