// Recebe o lead do LeadCaptureBar (visitante ANÔNIMO do site publicado —
// sem auth). Valida site + campos na fronteira e grava em `leads` via
// service_role. Não existe policy de INSERT pra anon: este route handler
// é o ÚNICO caminho de escrita público (mesmo padrão de /api/booking).

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { tooManyRecent } from '@/lib/net/rate-limit'
import { resolveOwnerEmail } from '@/lib/auth/owner'
import { isEmailConfigured, sendEmail } from '@/lib/email/resend'
import { buildLeadEmail } from '@/lib/email/notifications'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

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
  const email = str('email').slice(0, 160).toLowerCase()
  const phone = str('phone').replace(/\D/g, '')
  const interest = str('interest').slice(0, 120)
  const source = str('source').slice(0, 300)

  // ── Validação na fronteira de confiança ──
  if (!UUID_RE.test(siteId)) return bad('invalid_site')
  if (name.length < 2) return bad('invalid_name')
  if (email && !EMAIL_RE.test(email)) return bad('invalid_email')
  if (phone && (phone.length < 8 || phone.length > 15)) return bad('invalid_phone')
  // "e-mail e/ou telefone": pelo menos UM contato válido é obrigatório.
  if (!email && !phone) return bad('missing_contact')

  const admin = createAdminClient()

  // Site precisa existir, estar publicado e com a captura de leads LIGADA —
  // barreira contra POST forjado pra sites que não pediram o formulário.
  const { data: site } = await admin
    .from('sites')
    .select('id, tenant_id, status, leads_enabled, domain')
    .eq('id', siteId)
    .maybeSingle()

  if (!site) return bad('site_not_found', 404)
  if (!site.leads_enabled || site.status !== 'published') return bad('leads_disabled', 403)

  // Anti-flood: teto de envios por site numa janela curta (visitante anônimo).
  if (await tooManyRecent(admin, { table: 'leads', siteId: site.id as string, windowSec: 60, max: 12 })) {
    return bad('rate_limited', 429)
  }

  const { error } = await admin.from('leads').insert({
    tenant_id: site.tenant_id,
    site_id: site.id,
    name,
    email: email || null,
    phone: phone || null,
    interest: interest || null,
    source: source || null,
    status: 'new',
  })

  if (error) return bad('insert_failed', 500)

  // Notifica o dono por e-mail. Dormente até RESEND_API_KEY existir — quando
  // desligado nem resolve o dono (custo zero). Nunca quebra o recebimento.
  try {
    if (isEmailConfigured()) {
      const ownerEmail = await resolveOwnerEmail(admin, site.tenant_id as string)
      if (ownerEmail) {
        const { subject, html } = buildLeadEmail({
          siteDomain: site.domain as string | null,
          name, email: email || null, phone: phone || null, interest: interest || null,
        })
        await sendEmail({ to: ownerEmail, subject, html, replyTo: email || undefined })
      }
    }
  } catch { /* notificação nunca bloqueia o lead */ }

  return NextResponse.json({ ok: true })
}
