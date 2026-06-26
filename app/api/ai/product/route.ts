import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, totalTokens, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt } from '@/lib/prompts/loader'
import { deepSanitize } from '@/lib/text/sanitize'

export const runtime = 'nodejs'
// Geração de descrição pode passar de 60s. Requer Fluid Compute (ver generate/site).
export const maxDuration = 120

export async function POST(req: NextRequest) {
  const started = Date.now()
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { product_id, facts } = await req.json() as { product_id: string; facts?: string }
  if (!product_id) return Response.json({ error: 'product_id é obrigatório' }, { status: 400 })

  // tenant_id é obrigatório pela RLS — sem ele o update é bloqueado em silêncio.
  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = me?.tenant_id
  if (!tenantId) return Response.json({ error: 'Tenant não encontrado' }, { status: 403 })

  // Produto (a RLS já garante que só vem se for do tenant do usuário).
  const { data: product } = await supabase
    .from('products')
    .select('id, site_id, name, specs, brand, category')
    .eq('id', product_id)
    .single()
  if (!product) return Response.json({ error: 'Produto não encontrado' }, { status: 404 })

  // Contexto do negócio (nicho/objetivo afinam o vocabulário do prompt).
  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('business_name, niche, objetivo, city, tone')
    .eq('site_id', product.site_id)
    .maybeSingle()

  const systemPrompt = await buildSystemPrompt('product', profile?.niche, profile?.objetivo ?? undefined).catch(() => null)
  if (!systemPrompt) return Response.json({ error: 'Prompts não configurados' }, { status: 500 })

  const userPrompt = `Gere o conteúdo de PÁGINA DE PRODUTO para o item abaixo.

NEGÓCIO: ${profile?.business_name ?? '[NÃO INFORMADO]'}${profile?.city ? ` — ${profile.city}` : ''}
PRODUTO: ${product.name}
${product.brand ? `MARCA: ${product.brand}\n` : ''}${product.category ? `CATEGORIA: ${product.category}\n` : ''}FATOS FORNECIDOS PELO LOJISTA:
${facts?.trim() || '[NENHUM fato extra — use só o nome e não invente specs]'}

Retorne JSON com exatamente: short_answer, description, specs, faq. Nada além do JSON.`

  const anthropic = getAnthropicClient()
  let message
  try {
    message = await anthropic.messages.create({
      model: MODELS.generate,
      max_tokens: 2048,
      system: cachedSystem(systemPrompt),
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (err) {
    const f = friendlyAIError(err)
    return Response.json({ error: f.message }, { status: f.status })
  }

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let parsed: Record<string, unknown> | null = null
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
  } catch { /* ignora */ }
  if (parsed) parsed = deepSanitize(parsed)

  if (parsed) {
    await supabase
      .from('products')
      .update({
        short_answer: typeof parsed.short_answer === 'string' ? parsed.short_answer : null,
        description: typeof parsed.description === 'string' ? parsed.description : null,
        specs: parsed.specs && typeof parsed.specs === 'object' ? parsed.specs : {},
        faq: Array.isArray(parsed.faq) ? parsed.faq : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)

    // Observabilidade (mesmo registro dos outros agentes).
    await supabase.from('ia_generations').insert({
      tenant_id: tenantId,
      site_id: product.site_id,
      agent: 'product',
      tokens_used: totalTokens(message.usage),
      duration_ms: Date.now() - started,
      status: 'done',
    })
  }

  return Response.json({ content: parsed, raw: parsed ? undefined : text })
}
