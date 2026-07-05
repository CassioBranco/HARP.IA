import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentProvider } from '@/lib/ecommerce/payments'
import { resolveOwnerEmail } from '@/lib/auth/owner'
import { isEmailConfigured, sendEmail } from '@/lib/email/resend'
import { buildOrderEmail } from '@/lib/email/notifications'

// Webhook do provedor de pagamento → atualiza o status do pedido.
// Atualiza via admin (sem sessão). Responde 200 sempre que processou (evita
// retries infinitos do provedor). external_reference = nosso order id.
// Origem validada dentro de handleWebhook (x-signature HMAC do Mercado Pago,
// com MERCADOPAGO_WEBHOOK_SECRET); notificação forjada é ignorada e cai no
// ramo "ignored"/status nulo, sem tocar em orders.
export const runtime = 'nodejs'

export async function POST(req: Request) {
  let result
  try {
    result = await getPaymentProvider().handleWebhook(req)
  } catch {
    return new Response('ignored', { status: 200 })
  }

  if (result.orderRef && result.status) {
    const admin = createAdminClient()
    // .neq no status atual torna o update idempotente: um retry do provedor com
    // o mesmo status não conta como transição. .select devolve a linha só quando
    // houve mudança real — é o que evita e-mail duplicado de "pedido pago".
    const { data: updated } = await admin
      .from('orders')
      .update({
        status: result.status,
        ...(result.providerRef ? { provider_ref: result.providerRef } : {}),
        ...(result.paymentMethod ? { payment_method: result.paymentMethod } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', result.orderRef)
      .neq('status', result.status)
      .select('id, tenant_id, site_id, total_cents, currency, customer_name')
      .maybeSingle()

    // Avisa o dono só quando o pedido VIRA pago (transição real). Dormente até
    // RESEND_API_KEY existir; nunca quebra o 200 devolvido ao provedor.
    if (updated && result.status === 'paid' && isEmailConfigured()) {
      try {
        const ownerEmail = await resolveOwnerEmail(admin, updated.tenant_id as string)
        if (ownerEmail) {
          const { data: site } = await admin
            .from('sites').select('domain').eq('id', updated.site_id as string).maybeSingle()
          const { subject, html } = buildOrderEmail({
            siteDomain: (site?.domain as string | null) ?? null,
            customerName: updated.customer_name as string | null,
            totalCents: (updated.total_cents as number) ?? 0,
            currency: (updated.currency as string) ?? 'BRL',
            orderId: updated.id as string,
          })
          await sendEmail({ to: ownerEmail, subject, html })
        }
      } catch { /* notificação nunca quebra o webhook */ }
    }
  }

  return new Response('ok', { status: 200 })
}
