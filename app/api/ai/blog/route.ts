import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS } from '@/lib/claude/client'
import { buildSystemPrompt } from '@/lib/prompts/loader'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { site_id, keyword } = await req.json() as { site_id: string; keyword: string }
  if (!site_id || !keyword) {
    return Response.json({ error: 'site_id e keyword são obrigatórios' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('business_name,city,niche,tone,keywords_primary')
    .eq('site_id', site_id)
    .single()

  const city = profile?.city ?? 'Brasil'
  const niche = profile?.niche ?? 'servicos'
  const businessName = profile?.business_name ?? ''
  const tone = profile?.tone ?? 'profissional e acolhedor'

  const systemPrompt = await buildSystemPrompt('blog', niche).catch(() => `
Você é um especialista em SEO/GEO/AEO. Escreva artigos de blog em português brasileiro, sem gerundismo, sem em-dash, com H2 autossuficiente, FAQ de 6 perguntas obrigatórias, e keywords locais.
`.trim())

  const userPrompt = `Escreva um artigo de blog completo sobre: "${keyword}"

Negócio: ${businessName} | Nicho: ${niche} | Cidade: ${city} | Tom: ${tone}

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
  const message = await anthropic.messages.create({
    model: MODELS.generate,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let parsed: Record<string, unknown> | null = null
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
  } catch { /* ignora */ }

  return Response.json(parsed ?? { error: 'Falha ao parsear resposta da IA', raw: text })
}
