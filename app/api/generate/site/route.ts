import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, totalTokens, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt, serializeProfile } from '@/lib/prompts/loader'
import type { SupabaseClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  // ── Auth ──────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Não autorizado', { status: 401 })
  }

  // ── Tenant + plano ────────────────────────────────────────
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenants(plan)')
    .eq('id', user.id)
    .single()

  if (!userData?.tenant_id) {
    return new Response('Tenant não encontrado', { status: 403 })
  }

  const tenantId = userData.tenant_id

  // ── Body ──────────────────────────────────────────────────
  const { site_id } = await req.json() as { site_id: string }
  if (!site_id) {
    return new Response('site_id obrigatório', { status: 400 })
  }

  // ── Perfil do onboarding ──────────────────────────────────
  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('*')
    .eq('site_id', site_id)
    .eq('tenant_id', tenantId)
    .single()

  if (!profile) {
    return new Response('Perfil de onboarding não encontrado', { status: 404 })
  }

  // ── Guardrail Nível 1: completeness ≥ 70% ─────────────────
  if ((profile.completeness_score ?? 0) < 70) {
    return new Response(
      JSON.stringify({ error: 'Perfil incompleto. Complete pelo menos 70% do onboarding.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── Quota diária (anti-abuso) ─────────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  const { data: quota } = await supabase
    .from('plan_quotas')
    .select('hard_cap_daily')
    .eq('plan', (userData.tenants as unknown as { plan: string } | null)?.plan ?? 'starter')
    .eq('resource', 'site_generation')
    .single()

  const { count: usedToday } = await supabase
    .from('ia_generations')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('agent', 'onboarding')
    .gte('created_at', `${today}T00:00:00Z`)

  if (quota?.hard_cap_daily && (usedToday ?? 0) >= quota.hard_cap_daily) {
    return new Response(
      JSON.stringify({ error: 'Limite diário atingido. Tente novamente amanhã.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── Registra geração (status=running) ─────────────────────
  const { data: generation } = await supabase
    .from('ia_generations')
    .insert({
      tenant_id: tenantId,
      site_id,
      agent: 'onboarding',
      input_data: profile,
      status: 'running',
    })
    .select('id')
    .single()

  const generationId = generation?.id

  // ── Monta prompts ─────────────────────────────────────────
  let systemPrompt: string
  try {
    systemPrompt = await buildSystemPrompt('onboarding', profile.niche ?? undefined, profile.objetivo ?? undefined)
  } catch {
    await supabase
      .from('ia_generations')
      .update({ status: 'failed' })
      .eq('id', generationId)
    return new Response('Prompts não configurados. Contate o suporte.', { status: 500 })
  }

  const userPrompt = `
Gere o conteúdo completo do site para o seguinte perfil de negócio.
Retorne um JSON com a estrutura abaixo — nada além do JSON.

PERFIL:
${serializeProfile(profile)}

ESTRUTURA DE SAÍDA (JSON):
{
  "hero": {
    "headline": "string — keyword primária + cidade, máx 60 chars",
    "sub": "string — proposta de valor em 1-2 frases, sem gerundismo",
    "cta_label": "string — verbo de posse, ex: Quero Agendar",
    "cta_phone": "string"
  },
  "about": {
    "title": "string — H2 autossuficiente",
    "body": "string — 2-3 parágrafos, cidade mencionada ≥2x",
    "credential": "string | null"
  },
  "services": [
    { "name": "string", "description": "string — 2-3 linhas", "icon": "emoji" }
  ],
  "testimonials": [
    { "name": "string", "text": "string", "rating": 5 }
  ],
  "faq": [
    { "question": "string — pergunta que o cliente real faria", "answer": "string — resposta direta, 2-4 linhas" }
  ],
  "meta": {
    "title": "string — keyword + cidade + nome do negócio, máx 60 chars",
    "description": "string — 120-155 chars, inclui keyword + cidade + CTA suave",
    "keywords": ["string"]
  }
}

REGRAS:
- faq deve ter EXATAMENTE 6 perguntas (AEO obrigatório)
- hero.headline deve conter a keyword primária e a cidade
- Nunca inventar dados — use apenas o que está no perfil
- Zero em-dashes, zero gerundismo, zero "no mundo atual"
- Tom: ${profile.tone ?? 'profissional e acolhedor'}
`.trim()

  // ── SSE streaming ─────────────────────────────────────────
  const anthropic = getAnthropicClient()
  const startedAt = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      let fullText = ''

      try {
        const anthropicStream = anthropic.messages.stream({
          model: MODELS.generate,
          max_tokens: 4096,
          system: cachedSystem(systemPrompt),
          messages: [{ role: 'user', content: userPrompt }],
        })

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const text = chunk.delta.text
            fullText += text
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        // ── Pós-geração: parse + salva sections ───────────────
        let parsed: Record<string, unknown> | null = null
        try {
          const jsonMatch = fullText.match(/\{[\s\S]*\}/)
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
        } catch { /* ignora parse error — salva raw */ }

        const durationMs = Date.now() - startedAt
        const finalMessage = await anthropicStream.finalMessage()

        const cacheRead = finalMessage.usage.cache_read_input_tokens ?? 0
        if (cacheRead > 0) console.log(`[generate/site] cache hit: ${cacheRead} tokens lidos do cache`)

        await supabase.from('ia_generations').update({
          status: 'done',
          output_data: parsed ?? { raw: fullText },
          tokens_used: totalTokens(finalMessage.usage),
          duration_ms: durationMs,
          prompt_snapshot: systemPrompt.slice(0, 2000),
        }).eq('id', generationId)

        // Salva seções na tabela sections se o parse funcionou
        if (parsed) {
          await saveSections(supabase as unknown as SupabaseClient, site_id, parsed)
        }

        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true, generation_id: generationId })}\n\n`))
      } catch (err) {
        const friendly = friendlyAIError(err)
        console.error('[generate/site] falha na geração:', err)
        await supabase.from('ia_generations').update({ status: 'failed' }).eq('id', generationId)
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: friendly.message })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// ── Salva conteúdo gerado nas sections da página home ─────
async function saveSections(
  supabase: SupabaseClient,
  siteId: string,
  content: Record<string, unknown>
) {
  // Garante que a página home existe
  const { data: page } = await supabase
    .from('pages')
    .upsert({ site_id: siteId, slug: 'home', intent: 'transacional', published: false }, { onConflict: 'site_id,slug' })
    .select('id')
    .single()

  if (!page?.id) return

  const pageId = page.id
  const sections = [
    { section_type: 'hero',         order_index: 0, content: content.hero },
    { section_type: 'about',        order_index: 1, content: content.about },
    { section_type: 'services',     order_index: 2, content: { items: content.services } },
    { section_type: 'testimonials', order_index: 3, content: { items: content.testimonials } },
    { section_type: 'faq',          order_index: 4, content: { items: content.faq } },
    { section_type: 'meta',         order_index: 5, content: content.meta },
  ]

  for (const s of sections) {
    await supabase.from('sections').upsert(
      { page_id: pageId, ...s },
      { onConflict: 'page_id,section_type' }
    )
  }

  // Atualiza meta da página
  const meta = content.meta as { title?: string; description?: string } | undefined
  if (meta) {
    await supabase.from('pages').update({
      title: meta.title,
      meta_description: meta.description,
    }).eq('id', pageId)
  }
}
