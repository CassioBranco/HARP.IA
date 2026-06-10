import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS } from '@/lib/claude/client'
import { buildSystemPrompt } from '@/lib/prompts/loader'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { site_id, section_type, niche } = await req.json() as {
    site_id: string
    section_type: string
    niche: string
  }

  if (!site_id || !section_type) {
    return Response.json({ error: 'site_id e section_type são obrigatórios' }, { status: 400 })
  }

  // Carrega o perfil e conteúdo atual
  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('*')
    .eq('site_id', site_id)
    .single()

  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('site_id', site_id)
    .eq('slug', 'home')
    .single()

  if (!page?.id) {
    return Response.json({ error: 'Página não encontrada' }, { status: 404 })
  }

  const { data: section } = await supabase
    .from('sections')
    .select('content')
    .eq('page_id', page.id)
    .eq('section_type', section_type)
    .single()

  const systemPrompt = await buildSystemPrompt('onboarding', niche).catch(() => null)
  if (!systemPrompt) {
    return Response.json({ error: 'Prompts não configurados' }, { status: 500 })
  }

  const userPrompt = `Reescreva APENAS a seção "${section_type}" do site.
Perfil do negócio:
${JSON.stringify(profile ?? {}, null, 2)}

Conteúdo atual da seção (melhorar, não substituir por completo sem razão):
${JSON.stringify(section?.content ?? {}, null, 2)}

Retorne APENAS um JSON com a mesma estrutura da seção "${section_type}", melhorada.
Regras: keyword primária nos primeiros 100 chars, cidade 2x por 200 palavras, zero gerundismo, zero em-dash, CTA com verbo de posse.`

  const anthropic = getAnthropicClient()
  const message = await anthropic.messages.create({
    model: MODELS.generate,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let content: Record<string, unknown> | null = null
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) content = JSON.parse(match[0])
  } catch { /* ignora */ }

  return Response.json({ content })
}
