import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt } from '@/lib/prompts/loader'
import { deepSanitize } from '@/lib/text/sanitize'

export const runtime = 'nodejs'
export const maxDuration = 60

type PostType = 'novidade' | 'oferta' | 'evento'
const TYPES: PostType[] = ['novidade', 'oferta', 'evento']

const TYPE_BRIEF: Record<PostType, string> = {
  novidade: 'Um post "Novidade": uma atualização do negócio, dica útil ou bastidor que mostra autoridade. Tom de quem entende do assunto.',
  oferta:   'Um post "Oferta": uma promoção ou condição especial. Deixe claro o benefício e um senso de oportunidade, sem exagero.',
  evento:   'Um post "Evento": uma data, ação ou novidade com começo e fim (campanha, mutirão, horário especial).',
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const body = await req.json() as { site_id?: string; post_type?: string; topic?: string }
  const siteId = body.site_id
  const postType: PostType = TYPES.includes(body.post_type as PostType) ? body.post_type as PostType : 'novidade'
  const topic = (body.topic ?? '').trim()
  if (!siteId) return Response.json({ error: 'site_id é obrigatório' }, { status: 400 })

  // tenant_id do usuário — necessário pro insert passar na RLS de gbp_posts.
  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = userData?.tenant_id as string | undefined
  if (!tenantId) return Response.json({ error: 'Conta sem tenant' }, { status: 403 })

  // Posse do site (RLS de sites só retorna o site do tenant).
  const { data: site } = await supabase
    .from('sites').select('id, domain').eq('id', siteId).maybeSingle()
  if (!site) return Response.json({ error: 'Site não encontrado ou sem acesso' }, { status: 403 })

  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('business_name, city, niche, tone, services, differentials')
    .eq('site_id', siteId)
    .maybeSingle()

  const city = profile?.city ?? 'sua cidade'
  const niche = profile?.niche ?? 'servicos'
  const businessName = profile?.business_name ?? 'o negócio'
  const tone = profile?.tone ?? 'profissional e acolhedor'
  const services = Array.isArray(profile?.services)
    ? (profile?.services as { name?: string }[]).map(s => s?.name).filter(Boolean).join(', ')
    : ''

  const systemPrompt = await buildSystemPrompt('gbp', niche).catch(() => `
Você escreve posts do Google Perfil de Empresa para negócios locais brasileiros.
Regras: português brasileiro, sem gerundismo, sem em-dash, sem "no mundo atual" nem "jornada".
A primeira frase já entrega o essencial (citável isolada). Cite a cidade ao menos uma vez.
CTA com verbo de posse. Máximo 1500 caracteres, ideal entre 150 e 300 palavras.
`.trim())

  const userPrompt = `Escreva UM post para o Google Perfil de Empresa de "${businessName}".

Tipo do post: ${TYPE_BRIEF[postType]}
Nicho: ${niche} | Cidade: ${city} | Tom: ${tone}
${services ? `Serviços: ${services}` : ''}
${profile?.differentials ? `Sobre o negócio: ${profile.differentials}` : ''}
${topic ? `Assunto pedido pelo cliente: "${topic}"` : 'Escolha um assunto relevante e útil para o cliente local.'}

Regras do post:
- Máximo 1500 caracteres (ideal 150-300 palavras).
- Primeira frase entrega o essencial e cita a cidade (${city}).
- Sem em-dash, sem gerundismo.
- Sugira um botão de ação (CTA) coerente com o tipo.

Retorne SÓ um JSON:
{
  "content": "texto do post pronto pra colar no Google",
  "cta_label": "rótulo curto do botão (ex.: Agendar, Saiba mais, Ligar)",
  "cta_url_hint": "para onde o botão deve apontar (ex.: site, WhatsApp, telefone)"
}
Nada além do JSON.`

  const anthropic = getAnthropicClient()
  let message
  try {
    message = await anthropic.messages.create({
      model: MODELS.generate,
      max_tokens: 1500,
      system: cachedSystem(systemPrompt),
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (err) {
    const f = friendlyAIError(err)
    return Response.json({ error: f.message }, { status: f.status })
  }

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let parsed: { content?: string; cta_label?: string; cta_url_hint?: string } | null = null
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
  } catch { /* ignora */ }

  if (!parsed?.content) {
    return Response.json({ error: 'Não consegui gerar o post agora. Tente de novo.' }, { status: 502 })
  }

  const clean = deepSanitize(parsed) as { content: string; cta_label?: string; cta_url_hint?: string }
  const ctaUrl = site.domain ? `https://${site.domain}` : null

  // Salva como rascunho (human-in-the-loop: cliente revisa e cola no Google).
  const { data: saved, error: insErr } = await supabase
    .from('gbp_posts')
    .insert({
      tenant_id: tenantId,
      site_id: siteId,
      post_type: postType,
      content: clean.content,
      cta_label: clean.cta_label ?? null,
      cta_url: ctaUrl,
      extra: clean.cta_url_hint ? { cta_url_hint: clean.cta_url_hint } : null,
      status: 'draft',
    })
    // status e published_at vão no retorno de propósito: sem eles o post recém
    // gerado chega no cliente sem saber que é rascunho, e a tela não sabe se
    // mostra "Já publiquei" ou o selo de publicado.
    .select('id, post_type, content, cta_label, cta_url, status, published_at, scheduled_for, created_at')
    .single()

  if (insErr) {
    return Response.json({ error: 'Post gerado, mas falhou ao salvar.', detail: insErr.message }, { status: 500 })
  }

  return Response.json({ ok: true, post: saved })
}
