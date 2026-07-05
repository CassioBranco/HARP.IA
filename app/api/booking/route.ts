// Recebe a solicitação de agendamento do BookingWidget (visitante ANÔNIMO
// do site publicado — sem auth). Valida site + campos na fronteira e grava
// em booking_requests via service_role. Não existe policy de INSERT pra anon:
// este route handler é o ÚNICO caminho de escrita público (padrão orders).

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { tooManyRecent } from '@/lib/net/rate-limit'
import { resolveOwnerEmail } from '@/lib/auth/owner'
import { isEmailConfigured, sendEmail } from '@/lib/email/resend'
import { buildBookingEmail } from '@/lib/email/notifications'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return bad('invalid_json')
  }

  const str = (k: string) => (typeof payload[k] === 'string' ? (payload[k] as string).trim() : '')

  const siteId = str('site_id')
  const name = str('name').slice(0, 120)
  const phone = str('phone').replace(/\D/g, '')
  const service = str('service').slice(0, 120)
  const note = str('note').slice(0, 500)
  const preferredDate = str('preferred_date')
  const preferredTime = str('preferred_time')

  // ── Validação na fronteira de confiança ──
  if (!UUID_RE.test(siteId)) return bad('invalid_site')
  if (name.length < 2) return bad('invalid_name')
  if (phone.length < 8 || phone.length > 15) return bad('invalid_phone')
  if (!DATE_RE.test(preferredDate)) return bad('invalid_date')
  if (!TIME_RE.test(preferredTime)) return bad('invalid_time')

  // Data preferida precisa ser válida e não estar no passado (hoje vale).
  const parsed = new Date(`${preferredDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return bad('invalid_date')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (parsed.getTime() < today.getTime()) return bad('past_date')

  const admin = createAdminClient()

  // Site precisa existir, estar publicado e com o agendamento LIGADO —
  // barreira contra POST forjado pra sites que não pediram o widget.
  const { data: site } = await admin
    .from('sites')
    .select('id, tenant_id, status, booking_enabled, domain')
    .eq('id', siteId)
    .maybeSingle()

  if (!site) return bad('site_not_found', 404)
  if (!site.booking_enabled || site.status !== 'published') return bad('booking_disabled', 403)

  // Anti-flood: teto de solicitações por site numa janela curta.
  if (await tooManyRecent(admin, { table: 'booking_requests', siteId: site.id as string, windowSec: 60, max: 12 })) {
    return bad('rate_limited', 429)
  }

  const { error } = await admin.from('booking_requests').insert({
    tenant_id: site.tenant_id,
    site_id: site.id,
    name,
    phone,
    service: service || null,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    note: note || null,
    status: 'pending',
  })

  if (error) return bad('insert_failed', 500)

  // Notifica o dono por e-mail. Dormente até RESEND_API_KEY existir. Nunca
  // quebra o recebimento da solicitação.
  try {
    if (isEmailConfigured()) {
      const ownerEmail = await resolveOwnerEmail(admin, site.tenant_id as string)
      if (ownerEmail) {
        const { subject, html } = buildBookingEmail({
          siteDomain: site.domain as string | null,
          name, phone, service: service || null,
          preferredDate, preferredTime, note: note || null,
        })
        await sendEmail({ to: ownerEmail, subject, html })
      }
    }
  } catch { /* notificação nunca bloqueia a solicitação */ }

  return NextResponse.json({ ok: true })
}
