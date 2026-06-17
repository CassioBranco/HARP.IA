import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt, serializeProfile } from '@/lib/prompts/loader'
import type { SupabaseClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { site_id, niche } = await req.json() as { site_id: string; niche: string }
  if (!site_id) return Response.json({ error: 'site_id é obrigatório' }, { status: 400 })

  // tenant_id é obrigatório pela RLS de pages/sections — sem ele o upsert é
  // bloqueado em silêncio e a regeneração não grava nada (bug do "Página toda").
  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = me?.tenant_id
  if (!tenantId) return Response.json({ error: 'Tenant não encontrado' }, { status: 403 })

  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('*')
    .eq('site_id', site_id)
    .single()

  if (!profile) return Response.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const systemPrompt = await buildSystemPrompt('onboarding', niche ?? profile.niche, profile.objetivo ?? undefined).catch(() => null)
  if (!systemPrompt) return Response.json({ error: 'Prompts não configurados' }, { status: 500 })

  const userPrompt = `Regenere o conteúdo completo do site com base no perfil abaixo.

PERFIL:
${serializeProfile(profile)}

Retorne JSON com exatamente esta estrutura:
{
  "hero": { "headline": "", "sub": "", "cta_label": "", "cta_phone": "" },
  "about": { "title": "", "body": "", "credential": null },
  "services": [{ "name": "", "description": "", "icon": "emoji" }],
  "testimonials": [{ "name": "", "text": "", "rating": 5 }],
  "faq": [{ "question": "", "answer": "" }],
  "meta": { "title": "", "description": "", "keywords": [] }
}

faq deve ter EXATAMENTE 6 perguntas. Nada além do JSON.`

  const anthropic = getAnthropicClient()
  let message
  try {
    message = await anthropic.messages.create({
      model: MODELS.generate,
      max_tokens: 4096,
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

  if (parsed) {
    // Salva sections atualizadas
    const { data: page } = await supabase
      .from('pages')
      .upsert({ site_id, tenant_id: tenantId, slug: 'home', intent: 'transacional', published: false }, { onConflict: 'site_id,slug' })
      .select('id')
      .single()

    if (page?.id) {
      const sections = [
        { section_type: 'hero',         order_index: 0, content: parsed.hero },
        { section_type: 'about',        order_index: 1, content: parsed.about },
        { section_type: 'services',     order_index: 2, content: { items: parsed.services } },
        { section_type: 'testimonials', order_index: 3, content: { items: parsed.testimonials } },
        { section_type: 'faq',          order_index: 4, content: { items: parsed.faq } },
        { section_type: 'meta',         order_index: 5, content: parsed.meta },
      ]
      for (const s of sections) {
        await (supabase as unknown as SupabaseClient)
          .from('sections')
          .upsert({ page_id: page.id, tenant_id: tenantId, ...s }, { onConflict: 'page_id,section_type' })
      }
    }
  }

  return Response.json({ content: parsed, raw: parsed ? undefined : text })
}
