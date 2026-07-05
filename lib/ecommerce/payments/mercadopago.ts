// Adaptador Mercado Pago — Checkout Pro (redirecionado).
// Liga sozinho quando MERCADOPAGO_ACCESS_TOKEN existir no ambiente; sem a
// chave, createCheckout falha graciosamente (PaymentNotConfiguredError).
// Doc: https://www.mercadopago.com.br/developers (Checkout Pro / preferences)

import { createHmac, timingSafeEqual } from 'crypto'
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

// Segredo da assinatura do webhook (painel MP → Webhooks → "Chave secreta").
// Diferente do access token. Sem ele não dá pra validar a origem.
function webhookSecret(): string | null {
  return process.env.MERCADOPAGO_WEBHOOK_SECRET ?? null
}

// Valida o header x-signature do Mercado Pago (HMAC-SHA256), confirmando que a
// notificação veio mesmo do MP e não foi forjada.
// Manifesto: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
// Doc: mercadopago.com.br/developers → Notificações/Webhooks → validação de origem.
// Retorna:
//   'valid'        assinatura confere
//   'invalid'      assinatura ausente/errada → descartar a notificação
//   'unconfigured' sem segredo no ambiente → não dá pra validar; o re-fetch
//                  autenticado do pagamento ainda protege o status real.
function verifyMpSignature(req: Request, url: URL): 'valid' | 'invalid' | 'unconfigured' {
  const secret = webhookSecret()
  if (!secret) return 'unconfigured'

  const sigHeader = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id') ?? ''
  if (!sigHeader) return 'invalid'

  // x-signature vem como "ts=1699000000,v1=<hex>"
  const parts: Record<string, string> = {}
  for (const kv of sigHeader.split(',')) {
    const idx = kv.indexOf('=')
    if (idx === -1) continue
    parts[kv.slice(0, idx).trim()] = kv.slice(idx + 1).trim()
  }
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return 'invalid'

  // data.id da query; se alfanumérico, MP exige minúsculas no manifesto.
  const rawId = url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? ''
  const dataId = /^[0-9]+$/.test(rawId) ? rawId : rawId.toLowerCase()

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  // Comparação timing-safe; buffers de tamanho diferente = inválido.
  let a: Buffer, b: Buffer
  try {
    a = Buffer.from(expected, 'hex')
    b = Buffer.from(v1, 'hex')
  } catch {
    return 'invalid'
  }
  if (a.length !== b.length || a.length === 0) return 'invalid'
  return timingSafeEqual(a, b) ? 'valid' : 'invalid'
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://ancoreo.com.br'
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

    // Origem: descarta notificação forjada antes de qualquer processamento.
    // Sem segredo configurado, seguimos — o re-fetch autenticado abaixo lê o
    // status real do pagamento na API do MP, então não dá pra "marcar pago"
    // um pedido sem um pagamento aprovado de verdade apontando pra ele.
    const sig = verifyMpSignature(req, url)
    if (sig === 'invalid') {
      console.warn('[mercadopago] webhook com x-signature inválida — ignorado')
      return { orderRef: null, status: null }
    }

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const type = (body.type as string) ?? (body.topic as string) ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
    if (type && type !== 'payment') return { orderRef: null, status: null }

    const data = body.data as { id?: string } | undefined
    // Fonte de verdade = o data.id da QUERY (o valor coberto pela assinatura
    // HMAC validada acima). Body só como fallback quando a query não trouxe o
    // id. Evita assinar um id e buscar outro (replay com body.data.id trocado).
    const paymentId = url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? data?.id ?? (body.id as string | undefined)
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
