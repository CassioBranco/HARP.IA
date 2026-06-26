// Seletor de gateway. Hoje só Mercado Pago; quando entrar Stripe (ACP/Instant
// Checkout), é adicionar o adaptador e escolher aqui — nada mais muda.

import type { PaymentProvider } from './types'
import { mercadoPagoProvider } from './mercadopago'

export function getPaymentProvider(): PaymentProvider {
  // Futuro: ler de env/config por tenant. Por ora, único provedor.
  return mercadoPagoProvider
}

export function isPaymentConfigured(): boolean {
  return getPaymentProvider().isConfigured()
}

export * from './types'
