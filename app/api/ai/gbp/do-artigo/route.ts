// ============================================================
// ANCOREO — POST /api/ai/gbp/do-artigo
//
// O artigo que acabou de ser publicado vira UM post do Google que
// aponta pra ele. Chamado sozinho, logo depois do publish do blog.
//
// O nome interno é "isca" e não "resumo" por um motivo prático: se o
// post do perfil contar a história inteira, o leitor termina de ler
// ali e não abre o site. O perfil fica ativo, o artigo fica sem
// visita, e o artigo é onde mora o SEO. Então o post conta UMA coisa
// do artigo, e o resto é o botão.
//
// Duas travas de cadência, ambas em lib/seo/blog-para-gpe.ts:
// - a isca nunca CRIA vaga no calendário, só ocupa uma que já existe
//   (o mês continua com 4 posts, não 8);
// - republicar o mesmo artigo não gera uma segunda isca.
//
// Como sempre no pilar 5: nada é publicado no Google por aqui. O
// texto fica no painel esperando o dono colar.
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, cachedSystem, friendlyAIError } from '@/lib/claude/client'
import { buildSystemPrompt } from '@/lib/prompts/loader'
import { deepSanitize } from '@/lib/text/sanitize'
import {
  escolherVagaDaIsca,
  extrairTextoDoArtigo,
  jaTemIscaDoArtigo,
  urlDoArtigo,
  type PostNaAgenda,
} from '@/lib/seo/blog-para-gpe'
import type { GbpPostType } from '@/lib/seo/gbp-calendar'

export const runtime = 'nodejs'
export const maxDuration = 60

const CAMPOS = 'id, post_type, content, cta_label, cta_url, status, published_at, scheduled_for, created_at, extra'

/** Lê o id do artigo de origem gravado em gbp_posts.extra. */
function origemBlogId(extra: unknown): string | null {
  if (!extra || typeof extra !== 'object') return null
  const o = (extra as { origem?: { blog_post_id?: unknown } }).origem
  return typeof o?.blog_post_id === 'string' ? o.blog_post_id : null
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const body = await req.json().catch(() => null) as { blog_post_id?: string } | null
  const blogPostId = body?.blog_post_id
  if (!blogPostId) return Response.json({ error: 'blog_post_id é obrigatório' }, { status: 400 })

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = userData?.tenant_id as string | undefined
  if (!tenantId) return Response.json({ error: 'Conta sem tenant' }, { status: 403 })

  // RLS de blog_posts só devolve artigo do tenant, então isto é a posse.
  const { data: artigo } = await supabase
    .from('blog_posts')
    .select('id, site_id, title, slug, content, status')
    .eq('id', blogPostId)
    .maybeSingle()
  if (!artigo) return Response.json({ error: 'Artigo não encontrado ou sem acesso' }, { status: 404 })

  // Só depois de publicado. Antes disso o endereço não existe, e um
  // post do Google com botão pra página 404 é pior que post nenhum.
  if (artigo.status !== 'published') {
    return Response.json({ error: 'O artigo precisa estar publicado antes de virar post do Google.' }, { status: 409 })
  }

  const siteId = artigo.site_id as string
  const { data: site } = await supabase
    .from('sites').select('id, domain').eq('id', siteId).maybeSingle()

  const url = urlDoArtigo(site?.domain as string | null, artigo.slug as string | null)
  if (!url) {
    return Response.json({
      error: 'Publique o site antes: sem endereço no ar, o botão do post não teria pra onde apontar.',
    }, { status: 409 })
  }

  // Agenda atual: decide a vaga e evita isca repetida do mesmo artigo.
  const { data: agendaBruta } = await supabase
    .from('gbp_posts')
    .select('id, post_type, scheduled_for, published_at, extra')
    .eq('site_id', siteId)

  const agenda: (PostNaAgenda & { origemBlogId: string | null })[] = (agendaBruta ?? []).map((p) => {
    const origem = origemBlogId(p.extra)
    return {
      id: p.id as string,
      scheduled_for: p.scheduled_for as string | null,
      published_at: p.published_at as string | null,
      post_type: p.post_type as string | null,
      deBlog: origem !== null,
      origemBlogId: origem,
    }
  })

  if (jaTemIscaDoArtigo(agenda, blogPostId)) {
    return Response.json({ ok: true, ja_existia: true, motivo: 'Este artigo já tem um post do Google.' })
  }

  const vaga = escolherVagaDaIsca(agenda)

  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('business_name, city, niche, tone')
    .eq('site_id', siteId)
    .maybeSingle()

  const city = profile?.city ?? 'sua cidade'
  const niche = profile?.niche ?? 'servicos'
  const businessName = profile?.business_name ?? 'o negócio'
  const tone = profile?.tone ?? 'profissional e acolhedor'

  const systemPrompt = await buildSystemPrompt('gbp', niche).catch(() => `
Você escreve posts do Google Perfil de Empresa para negócios locais brasileiros.
Regras: português brasileiro, sem gerundismo, sem em-dash, sem "no mundo atual" nem "jornada".
A primeira frase já entrega o essencial (citável isolada). Cite a cidade ao menos uma vez.
`.trim())

  const userPrompt = `Escreva UM post curto para o Google Perfil de Empresa de "${businessName}", a partir de um artigo que acabou de ir ao ar no site do negócio.

Artigo: "${artigo.title}"
Trecho do artigo:
"""
${extrairTextoDoArtigo(artigo.content as string | null)}
"""

Nicho: ${niche} | Cidade: ${city} | Tom: ${tone}

A regra que manda em todas as outras: este post NÃO é um resumo do artigo.

Escolha UMA informação concreta e útil que está no artigo (um número, um prazo, um erro que as pessoas cometem, uma comparação, um sinal de alerta) e conte só ela. Quem ler o post precisa terminar sabendo algo que não sabia E querendo o resto. Se o post responder por inteiro a pergunta principal do artigo, ninguém clica, e o artigo foi escrito à toa.

Regras de forma:
- Entre 400 e 700 caracteres. É metade de um post normal, de propósito.
- A primeira frase entrega a informação escolhida e cita ${city}. Ela aparece sozinha na busca, antes do "ler mais".
- Não escreva "confira no nosso blog", "leia o artigo completo", "saiba mais no site" nem variação disso. O botão já faz esse trabalho e a frase só ocupa espaço.
- Sem em-dash, sem gerundismo.

Retorne SÓ um JSON:
{
  "content": "texto do post pronto pra colar no Google",
  "gancho": "a informação que você escolheu, em até 6 palavras"
}
Nada além do JSON.`

  const anthropic = getAnthropicClient()
  let message
  try {
    message = await anthropic.messages.create({
      model: MODELS.generate,
      max_tokens: 1200,
      system: cachedSystem(systemPrompt),
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (err) {
    const f = friendlyAIError(err)
    return Response.json({ error: f.message }, { status: f.status })
  }

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let parsed: { content?: string; gancho?: string } | null = null
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
  } catch { /* tratado abaixo */ }

  if (!parsed?.content) {
    return Response.json({ error: 'Não consegui montar o post do Google agora. Você pode gerar um pelo painel.' }, { status: 502 })
  }

  const limpo = deepSanitize(parsed) as { content: string; gancho?: string }

  // 'Saiba mais' é fixo e não vem do modelo: é o único botão do Google
  // que faz sentido pra um artigo, e ele TEM que apontar pro artigo.
  const { data: salvo, error: insErr } = await supabase
    .from('gbp_posts')
    .insert({
      tenant_id: tenantId,
      site_id: siteId,
      post_type: 'novidade' as GbpPostType,
      content: limpo.content,
      cta_label: 'Saiba mais',
      cta_url: url,
      scheduled_for: vaga.tipo === 'sem-data' ? null : vaga.data,
      status: 'draft',
      extra: {
        origem: { tipo: 'blog', blog_post_id: blogPostId, titulo: artigo.title, url },
        gancho: limpo.gancho ?? null,
      },
    })
    .select(CAMPOS)
    .single()

  if (insErr) {
    return Response.json({ error: 'Post escrito, mas falhou ao salvar.', detail: insErr.message }, { status: 500 })
  }

  // A troca vem DEPOIS do insert: se o insert falhasse antes, o post
  // genérico teria perdido a data sem nada tomar o lugar dele. Se esta
  // parte falhar, o pior caso é duas terças com post no mesmo dia, que
  // o dono vê na tela e resolve — nada some.
  let cedeu: string | null = null
  if (vaga.tipo === 'troca') {
    const { error: upErr } = await supabase
      .from('gbp_posts')
      .update({ scheduled_for: null })
      .eq('id', vaga.cedeuId)
      .is('published_at', null)
    if (!upErr) cedeu = vaga.cedeuId
  }

  return Response.json({ ok: true, post: salvo, vaga: vaga.tipo, cedeu })
}
