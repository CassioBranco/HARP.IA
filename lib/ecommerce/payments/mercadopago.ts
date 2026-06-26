// Adaptador Mercado Pago — Checkout Pro (redirecionado).
// Liga sozinho quando MERCADOPAGO_ACCESS_TOKEN existir no ambiente; sem a
// chave, createCheckout falha graciosamente (PaymentNotConfiguredError).
// Doc: https://www.mercadopago.com.br/developers (Checkout Pro / preferences)

import {
  type PaymentProvider,
  type CheckoutRequest,
  type CheckoutSession,
  type WebhookResult,
  type OrderStatus,
  PaymentNotConfiguredError,
} from './types'

const MP_API = 'https://api.mercadopago.com'

function token(): string | null {
  return process.env.MERCADOPAGO_ACCESS_TOKEN ?? null
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://harp-ia.vercel.app'
}

// status do pagamento no MP → nosso status de pedido
function mapStatus(mp: string | undefined): OrderStatus | null {
  switch (mp) {
    case 'approved': return 'paid'
    case 'authorized': return 'paid'
    case 'refunded': return 'refunded'
    case 'charged_back': return 'refunded'
    case 'cancelled': return 'canceled'
    case 'rejected': return 'failed'
    case 'pending': return 'pending'
    case 'in_process': return 'pending'
    default: return null
  }
}

export const mercadoPagoProvider: PaymentProvider = {
  id: 'mercadopago',

  isConfigured() {
    return Boolean(token())
  },

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const t = token()
    if (!t) throw new PaymentNotConfiguredError('mercadopago')

    const body = {
      items: req.items.map((i, idx) => ({
        id: String(idx),
        title: i.title,
        quantity: i.quantity,
        currency_id: req.currency,
        unit_price: i.unit_price_cents / 100, // MP usa unidades, não centavos
      })),
      external_reference: req.orderId,
      notification_url: `${appUrl()}/api/checkout/webhook`,
      back_urls: {
        success: `https://${req.domain}/?pago=sucesso`,
        pending: `https://${req.domain}/?pago=pendente`,
        failure: `https://${req.domain}/?pago=falha`,
      },
      auto_return: 'approved',
      ...(req.customer?.email ? { payer: { email: req.customer.email, name: req.customer.name ?? undefined } } : {}),
    }

    const res = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`Mercado Pago: falha ao criar checkout (${res.status}) ${detail.slice(0, 200)}`)
    }
    const data = await res.json() as { id?: string; init_point?: string }
    if (!data.init_point || !data.id) throw new Error('Mercado Pago: resposta sem init_point')
    return { url: data.init_point, providerRef: data.id }
  },

  // MP notifica com {type|topic: 'payment', data.id|id}. Buscamos o pagamento
  // pra ler o status real e o external_reference (nosso order id).
  async handleWebhook(req: Request): Promise<WebhookResult> {
    const t = token()
    if (!t) return { orderRef: null, status: null }

    const url = new URL(req.url)
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const type = (body.type as string) ?? (body.topic as string) ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
    if (type && type !== 'payment') return { orderRef: null, status: null }

    const data = body.data as { id?: string } | undefined
    const paymentId = data?.id ?? (body.id as string | undefined) ?? url.searchParams.get('data.id') ?? url.searchParams.get('id')
    if (!paymentId) return { orderRef: null, status: null }

    const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
    if (!res.ok) return { orderRef: null, status: null }
    const pay = await res.json() as {
      status?: string
      external_reference?: string
      payment_method_id?: string
    }
    return {
      orderRef: pay.external_reference ?? null,
      providerRef: String(paymentId),
      status: mapStatus(pay.status),
      paymentMethod: pay.payment_method_id ?? null,
    }
  },
}
