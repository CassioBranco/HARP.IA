import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt } from '@/lib/prompts/loader'
import { deepSanitize } from '@/lib/text/sanitize'
import { createAdminClient } from '@/lib/supabase/admin'
import { ingestKnowledge, retrieveKnowledge, knowledgeBlock } from '@/lib/rag/knowledge'

export const runtime = 'nodejs'
// Artigo de 800-1200 palavras pode passar de 60s. Requer Fluid Compute (ver generate/site).
export const maxDuration = 180

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { site_id, keyword } = await req.json() as { site_id: string; keyword: string }
  if (!site_id || !keyword) {
    return Response.json({ error: 'site_id e keyword são obrigatórios' }, { status: 400 })
  }

  // Posse: a RLS de sites só retorna o site se for do tenant do usuário.
  // Sem isso, qualquer logado dispararia geração (custo de API) em site alheio.
  const { data: ownSite } = await supabase.from('sites').select('id').eq('id', site_id).maybeSingle()
  if (!ownSite) return Response.json({ error: 'Site não encontrado ou sem acesso' }, { status: 403 })

  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('tenant_id,business_name,city,niche,tone,keywords_primary,conhecimento,differentials,cases')
    .eq('site_id', site_id)
    .single()

  const city = profile?.city ?? 'Brasil'
  const niche = profile?.niche ?? 'servicos'
  const businessName = profile?.business_name ?? ''
  const tone = profile?.tone ?? 'profissional e acolhedor'

  // ── RAG: usa o conhecimento REAL do cliente (E-E-A-T do onboarding) ──────────
  // Ingere (idempotente) e recupera os trechos mais relevantes pro tema do artigo.
  // Falha graciosa: se faltar OPENAI_API_KEY ou der erro, segue sem RAG.
  let knowledge = ''
  const tenantId = profile?.tenant_id as string | undefined
  if (tenantId) {
    try {
      const admin = createAdminClient()
      const conhecimento = Array.isArray(profile?.conhecimento)
        ? (profile!.conhecimento as { resposta?: string }[]).map(c => c?.resposta ?? '')
        : []
      const items = [...conhecimento, profile?.differentials ?? '', profile?.cases ?? '']
        .map(s => (s ?? '').trim())
        .filter(Boolean)
      if (items.length) await ingestKnowledge(admin, { tenantId, items, source: 'onboarding' })
      const chunks = await retrieveKnowledge(admin, { tenantId, query: keyword, k: 5 })
      knowledge = knowledgeBlock(chunks)
    } catch { /* RAG é melhoria, não bloqueia a geração */ }
  }

  const systemPrompt = await buildSystemPrompt('blog', niche).catch(() => `
Você é um especialista em SEO/GEO/AEO. Escreva artigos de blog em português brasileiro, sem gerundismo, sem em-dash, com H2 autossuficiente, FAQ de 6 perguntas obrigatórias, e keywords locais.
`.trim())

  const userPrompt = `Escreva um artigo de blog completo sobre: "${keyword}"

Negócio: ${businessName} | Nicho: ${niche} | Cidade: ${city} | Tom: ${tone}
${knowledge}

Estrutura obrigatória:
1. H1: keyword + cidade (máx 60 chars)
2. Intro direta (2-3 frases, sem "No mundo atual" ou gerundismo)
3. 3-5 seções H2 (cada H2 = resposta autossuficiente na primeira linha)
4. FAQ com EXATAMENTE 6 perguntas + respostas diretas (2-4 linhas cada)
5. CTA final com verbo de posse

Retorne JSON:
{
  "title": "H1 com keyword + cidade",
  "meta_description": "120-155 chars com keyword + cidade + CTA suave",
  "content": "HTML completo do artigo",
  "schema_faq": [{"question":"","answer":""}]
}

Nada além do JSON.`

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

  return Response.json(parsed ? deepSanitize(parsed) : { error: 'Falha ao parsear resposta da IA', raw: text })
}
