// Abstração de pagamento ("tomada padrão"). Trocar/adicionar gateway = trocar
// o adaptador, sem mexer em carrinho/pedidos/vitrine. O Mercado Pago é o
// primeiro adaptador; Stripe (e o ACP/Instant Checkout do ChatGPT) entram depois.

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded'

export interface CheckoutLineItem {
  title: string
  quantity: number
  unit_price_cents: number
}

export interface CheckoutRequest {
  orderId: string            // vira external_reference no provedor
  currency: string
  items: CheckoutLineItem[]
  domain: string             // host público da loja (para as back_urls)
  customer?: { name?: string | null; email?: string | null }
}

export interface CheckoutSession {
  url: string                // para onde redirecionar o comprador
  providerRef: string        // id da preference/sessão no provedor
}

// Resultado de processar um webhook do provedor.
export interface WebhookResult {
  orderRef: string | null    // external_reference (= nosso order id)
  providerRef?: string | null
  status: OrderStatus | null // null = ignorar (notificação irrelevante)
  paymentMethod?: string | null
}

export interface PaymentProvider {
  readonly id: string
  isConfigured(): boolean
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>
  handleWebhook(req: Request): Promise<WebhookResult>
}

export class PaymentNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`Pagamento (${provider}) não configurado. Falta a chave de API.`)
    this.name = 'PaymentNotConfiguredError'
  }
}
