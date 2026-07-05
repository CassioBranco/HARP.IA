import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, totalTokens, friendlyAIError } from '@/lib/claude/client'
import { deepSanitize } from '@/lib/text/sanitize'

export const runtime = 'nodejs'
export const maxDuration = 60

// ─────────────────────────────────────────────────────────────────────────────
// Gera a FAQ estruturada (3-5 perguntas) a partir do CONTEÚDO do próprio
// artigo — bloco "Perguntas frequentes" do editor de posts (AEO/GEO).
// Mesmo padrão do generate-description: auth + ownership via RLS + registro
// em ia_generations. System estável marcado com cache_control (cachedSystem).
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Você cria seções de Perguntas Frequentes (FAQ) para artigos de blog de pequenos negócios brasileiros. A FAQ vira schema FAQPage e é o canal mais direto de o negócio aparecer em respostas de IA.

REGRAS INEGOCIÁVEIS:
- Gere de 3 a 5 perguntas que um cliente real faria sobre o tema do artigo.
- Responda usando SOMENTE informações presentes no artigo. Não invente preço, prazo, especificação nem certificação.
- Pergunta curta e direta, terminando em "?".
- Resposta com 2 a 4 frases, autossuficiente: a primeira frase já responde.
- Português do Brasil. Zero em-dash (—), zero gerundismo, zero clichê de IA.
- Não repita pergunta que o artigo já responde em heading de FAQ existente.
- Sem HTML, sem markdown, texto puro.
- Responda APENAS com JSON válido: [{"question":"...","answer":"..."}]`

type FaqItem = { question: string; answer: string }

/** Rede de segurança: FAQ é conteúdo não-confiável — nunca carrega HTML. */
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function POST(req: NextRequest) {
  const started = Date.now()
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { post_id } = await req.json() as { post_id?: string }
  if (!post_id) return Response.json({ error: 'post_id é obrigatório' }, { status: 400 })

  // Ownership: a RLS de blog_posts só retorna o post se for do tenant do usuário.
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, site_id, title, content')
    .eq('id', post_id)
    .maybeSingle()
  if (!post) return Response.json({ error: 'Artigo não encontrado ou sem acesso' }, { status: 404 })

  const title = ((post.title as string) ?? '').trim().slice(0, 160)
  // Texto visível do artigo, com teto de tamanho (custo de prompt controlado)
  const body = stripTags((post.content as string) ?? '').slice(0, 9000)
  if (body.length < 200) {
    return Response.json({ error: 'Escreva o artigo antes de gerar a FAQ (conteúdo muito curto).' }, { status: 400 })
  }

  const userPrompt = `ARTIGO: ${title || '[sem título]'}

CONTEÚDO:
${body}

Crie a FAQ deste artigo (3 a 5 perguntas). Retorne só o JSON.`

  const anthropic = getAnthropicClient()
  let message
  try {
    message = await anthropic.messages.create({
      model: MODELS.generate,
      max_tokens: 1200,
      system: cachedSystem(SYSTEM_PROMPT),
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (err) {
    const f = friendlyAIError(err)
    return Response.json({ error: f.message }, { status: f.status })
  }

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let parsed: unknown = null
  try {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) parsed = JSON.parse(match[0])
  } catch { /* ignora — valida abaixo */ }

  // Valida a forma e sanitiza: strings puras, sem tags, com limites de tamanho.
  const faq: FaqItem[] = (Array.isArray(parsed) ? parsed : [])
    .map(it => ({
      question: stripTags(String((it as FaqItem)?.question ?? '')).slice(0, 180),
      answer: stripTags(String((it as FaqItem)?.answer ?? '')).slice(0, 700),
    }))
    .filter(it => it.question.length > 0 && it.answer.length > 0)
    .slice(0, 5)

  if (faq.length === 0) {
    return Response.json({ error: 'Não foi possível gerar a FAQ agora. Tente novamente.' }, { status: 500 })
  }

  // Observabilidade (mesmo registro dos outros agentes) — não bloqueia a resposta.
  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  if (me?.tenant_id) {
    await supabase.from('ia_generations').insert({
      tenant_id: me.tenant_id,
      site_id: post.site_id,
      agent: 'faq',
      tokens_used: totalTokens(message.usage),
      duration_ms: Date.now() - started,
      status: 'done',
    })
  }

  return Response.json({ faq: deepSanitize(faq) })
}
