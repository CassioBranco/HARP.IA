// ============================================================
// ANCOREO — "Prepare meu mês" no Google Perfil de Empresa (item 5.3).
//
// Por que existe: gerar um post avulso depende do dono lembrar de
// pedir. Quem não lembra não posta, e a cadência mostrou exatamente
// isso. Aqui o mês inteiro sai de uma vez, com uma data por post.
//
// UMA chamada ao modelo escreve os quatro. Não é economia: escrever
// os quatro juntos é o que permite pedir que eles NÃO se repitam
// entre si. Quatro chamadas independentes produzem quatro variações
// do mesmo post, porque cada uma vê o mesmo negócio e nenhuma vê as
// outras.
//
// Nada é publicado automaticamente. A data é um compromisso com o
// dono; quem cola no Google continua sendo ele.
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt } from '@/lib/prompts/loader'
import { deepSanitize } from '@/lib/text/sanitize'
import { POSTS_POR_MES, proximasDatas, tipoDaPosicao, type GbpPostType } from '@/lib/seo/gbp-calendar'

export const runtime = 'nodejs'
// Quatro posts numa tacada passa dos 60s do avulso.
export const maxDuration = 120

const BRIEF: Record<GbpPostType, string> = {
  novidade: 'Novidade: uma dica útil, um bastidor ou uma atualização do negócio. Tom de quem entende do assunto.',
  oferta:   'Oferta: uma promoção ou condição especial. Benefício claro, oportunidade real, sem exagero.',
  evento:   'Evento: algo com começo e fim (campanha, mutirão, horário especial, data comemorativa).',
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const body = await req.json().catch(() => null) as { site_id?: string } | null
  const siteId = body?.site_id
  if (!siteId) return Response.json({ error: 'site_id é obrigatório' }, { status: 400 })

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = userData?.tenant_id as string | undefined
  if (!tenantId) return Response.json({ error: 'Conta sem tenant' }, { status: 403 })

  // RLS de sites só devolve o site do tenant, então isto também é a
  // checagem de posse.
  const { data: site } = await supabase
    .from('sites').select('id, domain').eq('id', siteId).maybeSingle()
  if (!site) return Response.json({ error: 'Site não encontrado ou sem acesso' }, { status: 403 })

  // Mês já montado não é remontado por engano: dois cliques no botão
  // deixariam oito posts na agenda e o dono sem saber qual é qual.
  const hojeISO = new Date().toISOString().slice(0, 10)
  const { count: jaAgendados } = await supabase
    .from('gbp_posts')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .is('published_at', null)
    .gte('scheduled_for', hojeISO)
  if ((jaAgendados ?? 0) > 0) {
    return Response.json({
      error: 'Você já tem posts agendados à frente. Publique ou apague os que estão na agenda antes de montar um mês novo.',
    }, { status: 409 })
  }

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

  // data e tipo andam juntos por posição: o prompt descreve a agenda nessa
  // ordem e o insert grava nessa ordem, então separar em dois arrays só
  // criaria chance de desencontro.
  const slots = proximasDatas(new Date(), POSTS_POR_MES)
    .map((data, i) => ({ data, tipo: tipoDaPosicao(i) }))

  const systemPrompt = await buildSystemPrompt('gbp', niche).catch(() => `
Você escreve posts do Google Perfil de Empresa para negócios locais brasileiros.
Regras: português brasileiro, sem gerundismo, sem em-dash, sem "no mundo atual" nem "jornada".
A primeira frase já entrega o essencial (citável isolada). Cite a cidade ao menos uma vez.
CTA com verbo de posse. Máximo 1500 caracteres, ideal entre 150 e 300 palavras.
`.trim())

  const agenda = slots.map((s, i) => {
    const quando = new Date(s.data + 'T12:00:00')
      .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    return `${i + 1}. ${quando}: ${BRIEF[s.tipo]}`
  }).join('\n')

  const userPrompt = `Escreva ${POSTS_POR_MES} posts para o Google Perfil de Empresa de "${businessName}", um por semana do próximo mês.

Nicho: ${niche} | Cidade: ${city} | Tom: ${tone}
${services ? `Serviços: ${services}` : ''}
${profile?.differentials ? `Sobre o negócio: ${profile.differentials}` : ''}

Agenda do mês (respeite a ordem e o tipo de cada um):
${agenda}

Regras de cada post:
- Máximo 1500 caracteres (ideal 150 a 300 palavras).
- Primeira frase entrega o essencial e cita ${city}.
- Sem em-dash, sem gerundismo.
- Um botão de ação coerente com o tipo.

Regra do conjunto, a mais importante: os ${POSTS_POR_MES} posts vão sair no mesmo
perfil em semanas seguidas. Cada um trata de um assunto DIFERENTE do negócio.
Nada de quatro variações do mesmo texto com palavras trocadas.

Retorne SÓ um JSON:
{
  "posts": [
    { "content": "texto pronto pra colar", "cta_label": "rótulo curto do botão", "cta_url_hint": "para onde o botão aponta" }
  ]
}
Exatamente ${POSTS_POR_MES} itens, na ordem da agenda. Nada além do JSON.`

  const anthropic = getAnthropicClient()
  let message
  try {
    message = await anthropic.messages.create({
      model: MODELS.generate,
      max_tokens: 6000,
      system: cachedSystem(systemPrompt),
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (err) {
    const f = friendlyAIError(err)
    return Response.json({ error: f.message }, { status: f.status })
  }

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let parsed: { posts?: { content?: string; cta_label?: string; cta_url_hint?: string }[] } | null = null
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
  } catch { /* trata abaixo */ }

  const brutos = (parsed?.posts ?? []).filter(p => (p?.content ?? '').trim())
  if (brutos.length === 0) {
    return Response.json({ error: 'Não consegui montar o mês agora. Tente de novo.' }, { status: 502 })
  }

  // Se o modelo devolveu menos que o pedido, agenda o que veio em vez de
  // falhar tudo: três posts com data valem mais que um erro na tela.
  const ctaUrl = site.domain ? `https://${site.domain}` : null
  const linhas = slots.slice(0, brutos.length).map((slot, i) => {
    const limpo = deepSanitize(brutos[i]) as { content: string; cta_label?: string; cta_url_hint?: string }
    return {
      tenant_id: tenantId,
      site_id: siteId,
      post_type: slot.tipo,
      content: limpo.content,
      cta_label: limpo.cta_label ?? null,
      cta_url: ctaUrl,
      extra: limpo.cta_url_hint ? { cta_url_hint: limpo.cta_url_hint } : null,
      status: 'draft' as const,
      scheduled_for: slot.data,
    }
  })

  const { data: saved, error: insErr } = await supabase
    .from('gbp_posts')
    .insert(linhas)
    .select('id, post_type, content, cta_label, cta_url, status, published_at, scheduled_for, created_at')

  if (insErr) {
    return Response.json({ error: 'Posts escritos, mas falhou ao salvar.', detail: insErr.message }, { status: 500 })
  }

  return Response.json({ ok: true, posts: saved ?? [], faltaram: POSTS_POR_MES - linhas.length })
}
