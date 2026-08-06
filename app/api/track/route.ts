// Ingestão de telemetria de funil. Recebe eventos do client (allowlist),
// anexa um session_id pseudônimo (cookie httpOnly) e — best-effort — o tenant
// da conta logada. Grava via service_role. NUNCA bloqueia o fluxo do usuário.
//
// LGPD: não guarda IP nem user-agent cru; só uma classe grossa de device.
// Respeita opt-out (cookie aco_no_track). Ver migration analytics_events.

import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { ANALYTICS_EVENT_SET } from '@/lib/analytics/events'
import { bareHost, isAppHost } from '@/lib/site-host'

export const runtime = 'nodejs'

function deviceFromUA(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tablet'
  if (/Mobi|Android|iPhone|iPod|Opera Mini|IEMobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

// Mantém só escalares e limita tamanho/quantidade — barreira anti-PII acidental.
function sanitizeProps(input: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  if (!input || typeof input !== 'object') return out
  let n = 0
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (n >= 20) break
    if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; n++ }
    else if (typeof v === 'string') { out[k] = v.slice(0, 120); n++ }
  }
  return out
}

export async function POST(req: NextRequest) {
  // opt-out (defesa em profundidade — o client também checa)
  if (req.cookies.get('aco_no_track')?.value === '1') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  let payload: { event?: unknown; path?: unknown; props?: unknown }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const event = typeof payload.event === 'string' ? payload.event : ''
  if (!ANALYTICS_EVENT_SET.has(event)) {
    return NextResponse.json({ ok: false, error: 'unknown_event' }, { status: 400 })
  }

  const props = sanitizeProps(payload.props)
  const step = props.step !== undefined ? String(props.step) : null
  const path = typeof payload.path === 'string' ? payload.path.slice(0, 200) : null
  const device = deviceFromUA(req.headers.get('user-agent') ?? '')

  // session id pseudônimo (cookie httpOnly; nunca legível por JS/terceiros)
  let sid = req.cookies.get('aco_sid')?.value ?? ''
  const setSid = !sid
  if (!sid) sid = crypto.randomUUID()

  const host = req.headers.get('host') ?? ''
  const fromClientSite = host !== '' && !isAppHost(host)

  // Coerência origem x evento: site_view só existe no site publicado; os eventos
  // de funil só existem no painel. Sem esta trava, um visitante do site de um
  // cliente conseguiria injetar evento de onboarding e sujar o funil do produto.
  // (Em dev, host=localhost conta como painel, então site_view local é ignorado.)
  if (fromClientSite !== (event === 'site_view')) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  let tenantId: string | null = null

  if (fromClientSite) {
    // Visita ao SITE PUBLICADO de um cliente. O dono do evento vem do Host da
    // requisição, nunca do corpo: assim ninguém consegue inflar (ou sujar) o
    // número de outro cliente mandando props forjadas pro /api/track.
    // O middleware não reescreve /api, então o Host aqui é o domínio real.
    try {
      const admin = createAdminClient()
      const domain = bareHost(host)
      const { data: site } = await admin
        .from('sites')
        .select('id, tenant_id')
        .eq('domain', domain)
        .eq('status', 'published')
        .maybeSingle()
      if (!site) {
        // Host desconhecido: descarta em vez de gravar visita órfã.
        return NextResponse.json({ ok: true, skipped: true })
      }
      tenantId = (site.tenant_id as string | null) ?? null
      // Chaves de identidade são sempre do servidor: apaga o que veio do corpo
      // antes de gravar, pra não sobrar um "tenant_id" falso dentro do props.
      delete props.site_id
      delete props.tenant_id
      props.site_id = site.id as string
      props.domain = domain
    } catch {
      return NextResponse.json({ ok: true, skipped: true })
    }
  } else {
    // Painel: tenant da conta logada — best-effort, nunca bloqueia.
    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
        tenantId = (data?.tenant_id as string | null) ?? null
      }
    } catch {
      /* visitante anônimo — segue sem tenant */
    }
  }

  try {
    const admin = createAdminClient()
    await admin.from('analytics_events').insert({
      event, session_id: sid, tenant_id: tenantId, step, path, device, props,
    })
  } catch {
    /* telemetria é best-effort — não propaga erro pro usuário */
  }

  const res = NextResponse.json({ ok: true })
  if (setSid) {
    res.cookies.set('aco_sid', sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return res
}
