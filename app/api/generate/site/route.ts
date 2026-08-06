import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, totalTokens, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt, serializeProfile } from '@/lib/prompts/loader'
import { deepSanitize } from '@/lib/text/sanitize'
import type { SupabaseClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
// Geração de site completo dura ~90s — acima do timeout antigo de 60s (cliente
// via erro). 300s cobre a folga. Requer Vercel Pro + Fluid Compute LIGADO no
// dashboard do projeto (sem Fluid, o teto do plano corta antes). Ação: Cássio.
export const maxDuration = 300

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

  // Sem chave de IA no ambiente: falha limpa ANTES de registrar a geração.
  // (evita 500 cru + linha presa em 'running' que ainda contava na quota diária)
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Geração de IA indisponível: a chave da API não está configurada no servidor.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
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
Gere o conteúdo do site para o perfil de negócio abaixo.
Retorne SOMENTE um JSON com a estrutura indicada — nada além do JSON.

PERFIL (única fonte de verdade — tudo que você escrever precisa sair DAQUI):
${serializeProfile(profile)}

════════════════════════════════════════════════════════════════════
REGRA DE FATOS (inegociável — vale mais que qualquer outra regra abaixo):
- Escreva APENAS com base no que está no PERFIL acima.
- É PROIBIDO inventar: números, anos de experiência, preços, garantias,
  prêmios, certificações, credenciais, nomes de clientes, depoimentos,
  datas, estatísticas ou qualquer fato que não esteja explícito no perfil.
- Faltou a informação para um campo? NÃO preencha com suposição. Faça:
    (a) deixe um marcador entre colchetes para o cliente completar depois,
        ex: "[Adicione aqui os anos de experiência]"; OU
    (b) omita o campo (null / string vazia) quando ele for opcional.
- NUNCA gere depoimentos de clientes. O array "testimonials" é SEMPRE []
  (vazio). O cliente vai cadastrar os depoimentos reais dele no editor.
- Prefira um texto curto e verdadeiro a um texto longo e inventado.
  Se o perfil é enxuto, o conteúdo é enxuto. Não encha linguiça.
════════════════════════════════════════════════════════════════════

ESTRUTURA DE SAÍDA (JSON):
{
  "hero": {
    "headline": "string — o que o negócio faz + cidade (só cite a cidade se ela estiver no perfil), máx 60 chars",
    "sub": "string — proposta de valor em 1-2 frases baseada no que o perfil descreve, sem gerundismo",
    "cta_label": "string — verbo de posse, ex: Quero Agendar",
    "cta_phone": "string — telefone do perfil, ou string vazia se não houver"
  },
  "about": {
    "title": "string — H2 autossuficiente",
    "body": "string — texto sobre o negócio usando SÓ fatos do perfil. Onde faltar fato, use um marcador [ ] em vez de inventar. Mencione a cidade se ela estiver no perfil.",
    "credential": "string com a credencial APENAS se estiver no perfil, senão null"
  },
  "services": [
    { "name": "string — nome do serviço (do perfil)", "description": "string — descrição curta e factual; se o perfil só deu o nome, descreva de forma honesta e genérica SEM inventar preço, prazo, técnica ou garantia específica", "icon": "emoji" }
  ],
  "testimonials": [],
  "faq": [
    { "question": "string — pergunta real que o cliente faria", "answer": "string — resposta baseada em fato do perfil. Se responder com verdade exigir uma info que não está no perfil, escreva '[Complete: ...]' descrevendo o que o cliente precisa informar, em vez de inventar" }
  ],
  "meta": {
    "title": "string — keyword + cidade + nome do negócio, máx 60 chars",
    "description": "string — 120-155 chars, inclui keyword + cidade + CTA suave",
    "keywords": ["string"]
  }
}

REGRAS DE FORMATO:
- "testimonials" SEMPRE vazio ([]). Nunca preencha.
- "faq": gere 6 perguntas úteis. As perguntas podem ser genéricas do setor,
  mas as RESPOSTAS seguem a REGRA DE FATOS (marcador quando faltar dado).
- hero.headline: cite a cidade só se ela existir no perfil.
- Zero em-dashes, zero gerundismo, zero "no mundo atual".
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

        if (parsed) parsed = deepSanitize(parsed)

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
        let saveError: string | null = null
        if (parsed) {
          saveError = await saveSections(supabase as unknown as SupabaseClient, site_id, tenantId, parsed)
        } else {
          saveError = 'A IA não retornou um JSON válido. Tente gerar novamente.'
        }

        if (saveError) {
          await supabase.from('ia_generations').update({ status: 'failed' }).eq('id', generationId)
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: `Conteúdo gerado mas não salvo: ${saveError}` })}\n\n`))
        } else {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true, generation_id: generationId })}\n\n`))
        }
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
// tenant_id é obrigatório: a RLS de pages/sections exige
// tenant_id = auth_tenant_id() no WITH CHECK do INSERT. Sem ele o
// insert é rejeitado silenciosamente e o site fica vazio.
// Retorna null em sucesso, ou a mensagem de erro pra rota reportar.
async function saveSections(
  supabase: SupabaseClient,
  siteId: string,
  tenantId: string,
  content: Record<string, unknown>
): Promise<string | null> {
  // Garante que a página home existe
  const { data: page, error: pageErr } = await supabase
    .from('pages')
    .upsert({ site_id: siteId, tenant_id: tenantId, slug: 'home', intent: 'transacional', published: false }, { onConflict: 'site_id,slug' })
    .select('id')
    .single()

  if (pageErr) return pageErr.message
  if (!page?.id) return 'Não foi possível criar a página.'

  const pageId = page.id
  const sections = [
    { section_type: 'hero',         order_index: 0, content: content.hero },
    { section_type: 'about',        order_index: 1, content: content.about },
    { section_type: 'services',     order_index: 2, content: { items: content.services } },
    // Depoimento é o único bloco que a IA não escreve: nasce vazio e só o dono
    // preenche, no editor, com depoimento de gente que existe. O prompt já pede
    // [], mas o que garante isso é esta linha — instrução de prompt é pedido,
    // não trava. Publicar depoimento inventado é propaganda enganosa no nome do
    // cliente, então a trava fica no servidor.
    { section_type: 'testimonials', order_index: 3, content: { items: [] } },
    { section_type: 'faq',          order_index: 4, content: { items: content.faq } },
    { section_type: 'meta',         order_index: 5, content: content.meta },
  ]

  for (const s of sections) {
    const { error: secErr } = await supabase.from('sections').upsert(
      { page_id: pageId, tenant_id: tenantId, ...s },
      { onConflict: 'page_id,section_type' }
    )
    if (secErr) return secErr.message
  }

  // Atualiza meta da página
  const meta = content.meta as { title?: string; description?: string } | undefined
  if (meta) {
    await supabase.from('pages').update({
      title: meta.title,
      meta_description: meta.description,
    }).eq('id', pageId)
  }

  return null
}
