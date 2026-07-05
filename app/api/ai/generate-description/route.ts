import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, totalTokens, friendlyAIError } from '@/lib/claude/client'
import { sanitizeText } from '@/lib/text/sanitize'

export const runtime = 'nodejs'
export const maxDuration = 30

// ─────────────────────────────────────────────────────────────────────────────
// Gera UMA descrição curta de produto/serviço para o editor (ferramenta interna
// do usuário ANCOREO, não é feature do site publicado).
//
// System prompt inline, e não via prompt_templates: é um agente utilitário sem
// contrato JSON, e o texto é estável — marcado com cache_control (cachedSystem),
// a 2ª+ geração em até 5 min lê o bloco do cache a 0,1x do custo.
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Você escreve descrições curtas de produtos e serviços para sites de pequenos negócios brasileiros.

REGRAS INEGOCIÁVEIS:
- Português do Brasil, tom direto e concreto, falando com o cliente final.
- 1 a 2 frases, entre 120 e 220 caracteres. Sem listas, sem títulos, sem markdown.
- Foque no benefício prático pro cliente, não em adjetivos vazios.
- Use SOMENTE as informações fornecidas. Não invente preço, prazo, especificação técnica nem certificação.
- Zero em-dash (—), zero gerundismo ("estaremos fazendo"), zero clichê de IA ("desbloqueie", "eleve sua experiência").
- Se a área for regulada (saúde, jurídico, financeiro), não prometa resultado.
- Responda APENAS com o texto da descrição, sem aspas em volta.`

export async function POST(req: NextRequest) {
  const started = Date.now()
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { site_id, name, keywords } = await req.json() as {
    site_id?: string
    name?: string
    keywords?: string
  }
  if (!site_id) return Response.json({ error: 'site_id é obrigatório' }, { status: 400 })

  // Limites de tamanho: entrada do usuário nunca vira prompt gigante (custo).
  const cleanName = (name ?? '').trim().slice(0, 120)
  const cleanKeywords = (keywords ?? '').trim().slice(0, 300)
  if (!cleanName && !cleanKeywords) {
    return Response.json({ error: 'Informe o nome do item ou algumas palavras-chave' }, { status: 400 })
  }

  // A RLS só retorna o site se ele pertencer ao tenant do usuário.
  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', site_id)
    .maybeSingle()
  if (!site) return Response.json({ error: 'Site não encontrado' }, { status: 404 })

  // Contexto do negócio pra afinar o vocabulário (tolerante a perfil ausente).
  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('business_name, niche, city, state, tone')
    .eq('site_id', site_id)
    .maybeSingle()

  const bizLine = [
    profile?.business_name,
    profile?.niche,
    profile?.city ? `${profile.city}${profile.state ? `/${profile.state}` : ''}` : null,
    profile?.tone ? `tom: ${profile.tone}` : null,
  ].filter(Boolean).join(' | ')

  const userPrompt = `NEGÓCIO: ${bizLine || '[sem perfil cadastrado]'}
ITEM (produto/serviço): ${cleanName || '[sem nome]'}
PALAVRAS-CHAVE DO USUÁRIO: ${cleanKeywords || '[nenhuma — use só o nome]'}

Escreva a descrição deste item para a seção de serviços/produtos do site.`

  const anthropic = getAnthropicClient()
  let message
  try {
    message = await anthropic.messages.create({
      model: MODELS.generate,
      max_tokens: 300,
      system: cachedSystem(SYSTEM_PROMPT),
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (err) {
    const f = friendlyAIError(err)
    return Response.json({ error: f.message }, { status: f.status })
  }

  const raw = message.content[0]?.type === 'text' ? message.content[0].text : ''
  const description = sanitizeText(raw.trim().replace(/^["'«]+|["'»]+$/g, '').trim())
  if (!description) {
    return Response.json({ error: 'Não foi possível gerar agora. Tente novamente.' }, { status: 500 })
  }

  // Observabilidade (mesmo registro dos outros agentes) — não bloqueia a resposta.
  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  if (me?.tenant_id) {
    await supabase.from('ia_generations').insert({
      tenant_id: me.tenant_id,
      site_id,
      agent: 'description',
      tokens_used: totalTokens(message.usage),
      duration_ms: Date.now() - started,
      status: 'done',
    })
  }

  return Response.json({ description })
}
