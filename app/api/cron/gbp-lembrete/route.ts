// ============================================================
// ANCOREO — GET /api/cron/gbp-lembrete · o aviso semanal do post do Google.
//
// Item 5.6 do MVP. O calendário (5.3) marca a data; esta rota é quem
// bate na porta quando a data chega e o post continua parado.
//
// Três decisões que valem mais que o código:
//
// 1. Só avisa quem tem post ATRASADO ou marcado PRA HOJE. Quem está em
//    dia não recebe nada. Lembrete que chega toda semana sem motivo
//    ensina o dono a apagar sem ler, e aí o aviso que importava some
//    junto.
// 2. Um e-mail por conta a cada 20 horas, no máximo. A trava mora no
//    audit_logs, não na memória do processo: em serverless não existe
//    "o processo anterior", e cron que repete manda o mesmo e-mail duas
//    vezes.
// 3. Sem RESEND_API_KEY a rota não é erro: responde que está dormente e
//    não mexe em nada. O módulo de e-mail inteiro é assim.
//
// Nada aqui publica no Google. Continua sendo o dono que cola.
//
// O cron do vercel.json bate aqui TODO DIA às 12h UTC (9h de Brasília),
// e não uma vez por semana. A data marcada de um post pode cair em
// qualquer dia; quem decide se sai e-mail é a regra acima, não o
// calendário do cron. Rodar diário é o que faz o aviso "é hoje" chegar
// no dia certo. Quem segura a repetição é a janela de 20 horas.
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveOwnerEmail } from '@/lib/auth/owner'
import { isEmailConfigured, sendEmail } from '@/lib/email/resend'
import { buildGbpLembreteEmail, type PostDoLembrete } from '@/lib/email/gbp-lembrete'
import { paraDataISO } from '@/lib/seo/gbp-calendar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ACAO = 'gbp_lembrete_enviado'
const JANELA_HORAS = 20

// A Vercel manda `Authorization: Bearer $CRON_SECRET` nas rotas de cron.
// Sem o segredo configurado a rota fica fechada: uma URL que dispara
// e-mail pra base inteira não pode ficar aberta na internet.
function autorizado(req: NextRequest): boolean {
  const segredo = process.env.CRON_SECRET
  if (!segredo) return false
  const header = req.headers.get('authorization') ?? ''
  return header === `Bearer ${segredo}`
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: true, dormente: true, motivo: 'RESEND_API_KEY ausente' })
  }

  // ?seco=1 monta tudo e não envia. Serve pra conferir a lista de quem
  // receberia antes de soltar o primeiro disparo de verdade.
  const seco = req.nextUrl.searchParams.get('seco') === '1'

  const admin = createAdminClient()
  const hoje = new Date()
  const hojeISO = paraDataISO(hoje)

  // Só os posts que já venceram: o resto do calendário não é assunto de hoje.
  const { data: vencidos, error } = await admin
    .from('gbp_posts')
    .select('site_id, content, scheduled_for, published_at')
    .is('published_at', null)
    .not('scheduled_for', 'is', null)
    .lte('scheduled_for', hojeISO)

  if (error) {
    return NextResponse.json({ error: 'falha ao ler os posts', detail: error.message }, { status: 500 })
  }

  const porSite = new Map<string, PostDoLembrete[]>()
  for (const p of vencidos ?? []) {
    const sid = p.site_id as string | null
    if (!sid) continue
    const lista = porSite.get(sid) ?? []
    lista.push({
      scheduled_for: p.scheduled_for as string | null,
      published_at: null,
      content: p.content as string | null,
    })
    porSite.set(sid, lista)
  }

  const base = (process.env.NEXT_PUBLIC_APP_URL || 'https://ancoreo.com.br').replace(/\/$/, '')
  const resultado = { candidatos: porSite.size, enviados: 0, pulados: 0, falhas: 0 }

  // Array.from em vez de iterar o Map direto: o target do tsconfig deste
  // repo não deixa percorrer Map com for..of.
  for (const [siteId, posts] of Array.from(porSite.entries())) {
    try {
      const { data: site } = await admin
        .from('sites').select('tenant_id, domain').eq('id', siteId).maybeSingle()
      const tenantId = site?.tenant_id as string | undefined
      if (!tenantId) { resultado.pulados++; continue }

      // Trava de repetição: se já saiu aviso pra esta conta na janela,
      // não sai outro, mesmo que o cron dispare de novo.
      const desde = new Date(Date.now() - JANELA_HORAS * 3600_000).toISOString()
      const { count: jaAvisado } = await admin
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('action', ACAO)
        .gte('created_at', desde)
      if ((jaAvisado ?? 0) > 0) { resultado.pulados++; continue }

      const { data: prof } = await admin
        .from('onboarding_profiles').select('business_name').eq('site_id', siteId).maybeSingle()

      const email = buildGbpLembreteEmail({
        businessName: prof?.business_name as string | null,
        siteDomain: site?.domain as string | null,
        painelUrl: `${base}/gbp`,
        posts,
        hoje,
      })
      if (!email) { resultado.pulados++; continue }

      const para = await resolveOwnerEmail(admin, tenantId)
      if (!para) { resultado.pulados++; continue }

      if (seco) { resultado.enviados++; continue }

      const envio = await sendEmail({ to: para, subject: email.subject, html: email.html })
      if (!envio.sent) { resultado.falhas++; continue }

      resultado.enviados++
      await admin.from('audit_logs').insert({
        tenant_id: tenantId,
        action: ACAO,
        entity_type: 'site',
        entity_id: siteId,
        metadata: { assunto: email.subject, vencidos: posts.length },
      })
    } catch {
      // Uma conta com problema não pode calar o aviso das outras.
      resultado.falhas++
    }
  }

  return NextResponse.json({ ok: true, seco, ...resultado })
}
