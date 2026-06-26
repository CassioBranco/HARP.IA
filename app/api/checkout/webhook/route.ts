import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentProvider } from '@/lib/ecommerce/payments'

// Webhook do provedor de pagamento → atualiza o status do pedido.
// Atualiza via admin (sem sessão). Responde 200 sempre que processou (evita
// retries infinitos do provedor). external_reference = nosso order id.
// TODO(E2): validar assinatura do webhook (x-signature do Mercado Pago).
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
    await admin
      .from('orders')
      .update({
        status: result.status,
        ...(result.providerRef ? { provider_ref: result.providerRef } : {}),
        ...(result.paymentMethod ? { payment_method: result.paymentMethod } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', result.orderRef)
  }

  return new Response('ok', { status: 200 })
}
