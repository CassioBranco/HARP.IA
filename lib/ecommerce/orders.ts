'use server'

// Checkout + pedidos (E2). O comprador é anônimo: startCheckout roda server-side
// via admin client. REGRA DE OURO: o preço vem SEMPRE do banco (produto publicado),
// nunca do que o cliente enviar — o cliente só manda product_id + quantidade.

import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { getPaymentProvider, PaymentNotConfiguredError } from '@/lib/ecommerce/payments'
import type { CheckoutLineItem } from '@/lib/ecommerce/payments/types'

export interface CartItemInput {
  product_id: string
  quantity: number
}

export interface StartCheckoutInput {
  domain: string
  items: CartItemInput[]
  customer?: { name?: string; email?: string; phone?: string }
}

export interface StartCheckoutResult {
  ok: boolean
  order_id?: string
  url?: string
  error?: string
}

function qty(n: unknown): number {
  const v = Math.floor(Number(n))
  if (!Number.isFinite(v) || v < 1) return 1
  return Math.min(v, 99)
}

export async function startCheckout(input: StartCheckoutInput): Promise<StartCheckoutResult> {
  if (!input?.domain || !Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: 'carrinho vazio' }
  }
  const admin = createAdminClient()

  // 1. Site publicado pelo domínio → tenant + site.
  const { data: site } = await admin
    .from('sites')
    .select('id, tenant_id')
    .eq('domain', input.domain)
    .eq('status', 'published')
    .maybeSingle()
  if (!site) return { ok: false, error: 'loja não encontrada' }

  // 2. Produtos publicados (preço autoritativo do banco).
  const ids = Array.from(new Set(input.items.map(i => i.product_id)))
  const { data: products } = await admin
    .from('products')
    .select('id, name, price_cents, currency, status')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .in('id', ids)
  const byId = new Map((products ?? []).map(p => [p.id as string, p]))

  // 3. Monta itens com snapshot de preço; rejeita produto indisponível.
  const currency = (products?.[0]?.currency as string) ?? 'BRL'
  const lineItems: CheckoutLineItem[] = []
  const orderItemsRows: Record<string, unknown>[] = []
  let subtotal = 0
  for (const item of input.items) {
    const p = byId.get(item.product_id)
    if (!p) return { ok: false, error: 'produto indisponível no carrinho' }
    const q = qty(item.quantity)
    const unit = p.price_cents as number
    const line = unit * q
    subtotal += line
    lineItems.push({ title: p.name as string, quantity: q, unit_price_cents: unit })
    orderItemsRows.push({
      tenant_id: site.tenant_id,
      product_id: p.id,
      name_snapshot: p.name,
      unit_price_cents: unit,
      quantity: q,
      line_total_cents: line,
    })
  }

  // 4. Cria o pedido (pending) + itens.
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      tenant_id: site.tenant_id,
      site_id: site.id,
      status: 'pending',
      subtotal_cents: subtotal,
      total_cents: subtotal,
      currency,
      customer_name: input.customer?.name ?? null,
      customer_email: input.customer?.email ?? null,
      customer_phone: input.customer?.phone ?? null,
      provider: getPaymentProvider().id,
    })
    .select('id')
    .single()
  if (orderErr || !order) return { ok: false, error: orderErr?.message ?? 'falha ao criar pedido' }

  const orderId = order.id as string
  await admin.from('order_items').insert(orderItemsRows.map(r => ({ ...r, order_id: orderId })))

  // 5. Cria o checkout no provedor.
  try {
    const session = await getPaymentProvider().createCheckout({
      orderId,
      currency,
      items: lineItems,
      domain: input.domain,
      customer: input.customer,
    })
    await admin.from('orders').update({ provider_ref: session.providerRef, updated_at: new Date().toISOString() }).eq('id', orderId)
    return { ok: true, order_id: orderId, url: session.url }
  } catch (e) {
    if (e instanceof PaymentNotConfiguredError) {
      // Pedido fica registrado como pending; só falta ligar a chave do gateway.
      return { ok: false, order_id: orderId, error: 'payment_not_configured' }
    }
    return { ok: false, order_id: orderId, error: e instanceof Error ? e.message : 'falha no checkout' }
  }
}

// ── Painel do dono (RLS por tenant) ─────────────────────────
export interface OrderRow {
  id: string
  status: string
  total_cents: number
  currency: string
  customer_name: string | null
  customer_email: string | null
  provider: string | null
  created_at: string
}

export async function listOrdersForSite(siteId: string): Promise<OrderRow[]> {
  if (!siteId) return []
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('orders')
    .select('id, status, total_cents, currency, customer_name, customer_email, provider, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
  return (data ?? []) as OrderRow[]
}
