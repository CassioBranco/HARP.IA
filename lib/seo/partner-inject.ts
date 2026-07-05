// ============================================================
// NV4 — Injeção do backlink cross-tenant quando um anel FECHA (active).
//
// SEGURANÇA (leia antes de mexer):
//  • Este é o ÚNICO ponto do NV4 que usa o client ADMIN (service_role, que
//    bypassa RLS). É JUSTIFICADO porque escreve no conteúdo de blog de 3
//    tenants diferentes — algo que a RLS de sessão jamais permitiria.
//  • A justificativa só vale se os 3 deram opt-in E aceitaram explicitamente.
//    Por isso a função REVALIDA, com o admin client, que o anel está `active`
//    e que os 3 flags (a/b/c _accepted) são true ANTES de escrever qualquer
//    coisa. Se qualquer condição falhar, aborta sem tocar em nada.
//  • Direção ÚNICA A→B→C→A: cada site recebe UM backlink apontando pro
//    PRÓXIMO do anel (nunca recíproco).
//
// A âncora é injetada com o mesmo injectLinks de triangulation.ts, mas o href
// é ABSOLUTO (https://<domínio do parceiro>/blog/<slug>) porque cruza sites.
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractKeywords, similarity, injectLinks } from './triangulation'

// O href do backlink cruza sites e cai em HTML renderizado com
// dangerouslySetInnerHTML no blog do parceiro. Slug e domínio são controlados
// por OUTRO tenant — validamos o charset ANTES de montar o href pra fechar
// qualquer XSS armazenado cross-tenant (defesa em profundidade, além da
// validação na escrita). Fora do padrão = não injeta, registra 'planned'.
const SAFE_DOMAIN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i
const SAFE_SLUG = /^[a-z0-9-]+$/i

type Edge = {
  fromTenant: string
  fromSite: string
  toTenant: string
  toSite: string
}

type SiteRow = { id: string; domain: string | null }
type PostRow = { id: string; slug: string; title: string; content: string; meta_description: string | null }

export type RingInjectionResult = {
  activated: boolean
  linksPlanned: number
  linksRendered: number
  reason?: string
}

/**
 * Fecha o anel: valida que está `active` com os 3 aceites e injeta UM
 * backlink contextual em cada site (A→B, B→C, C→A). Idempotente por edge:
 * se já existe partner_ring_links pra aquela aresta, pula.
 *
 * `admin` DEVE ser o client service_role (necessário pra escrever cross-tenant).
 */
export async function injectRingBacklinks(
  admin: SupabaseClient,
  ringId: string,
): Promise<RingInjectionResult> {
  // ── Revalidação de segurança com o próprio admin client ──
  const { data: ring, error: ringErr } = await admin
    .from('partner_rings')
    .select('id, status, site_a, tenant_a, site_b, tenant_b, site_c, tenant_c, a_accepted, b_accepted, c_accepted')
    .eq('id', ringId)
    .maybeSingle()

  if (ringErr || !ring) return { activated: false, linksPlanned: 0, linksRendered: 0, reason: 'ring_not_found' }
  if (ring.status !== 'active') return { activated: false, linksPlanned: 0, linksRendered: 0, reason: 'ring_not_active' }
  if (!(ring.a_accepted && ring.b_accepted && ring.c_accepted)) {
    return { activated: false, linksPlanned: 0, linksRendered: 0, reason: 'not_all_accepted' }
  }

  // Direção única A→B→C→A.
  const edges: Edge[] = [
    { fromTenant: ring.tenant_a as string, fromSite: ring.site_a as string, toTenant: ring.tenant_b as string, toSite: ring.site_b as string },
    { fromTenant: ring.tenant_b as string, fromSite: ring.site_b as string, toTenant: ring.tenant_c as string, toSite: ring.site_c as string },
    { fromTenant: ring.tenant_c as string, fromSite: ring.site_c as string, toTenant: ring.tenant_a as string, toSite: ring.site_a as string },
  ]

  let planned = 0
  let rendered = 0

  for (const edge of edges) {
    // Idempotência: já registrado pra essa aresta neste anel? Pula.
    const { data: existing } = await admin
      .from('partner_ring_links')
      .select('id')
      .eq('ring_id', ringId)
      .eq('from_site_id', edge.fromSite)
      .eq('to_site_id', edge.toSite)
      .maybeSingle()
    if (existing) continue

    // Domínio do site de DESTINO (o backlink cruza sites → href absoluto).
    const { data: toSite } = await admin
      .from('sites')
      .select('id, domain')
      .eq('id', edge.toSite)
      .maybeSingle<SiteRow>()

    // Posts publicados das duas pontas pra escolher a melhor âncora.
    const { data: fromPosts } = await admin
      .from('blog_posts')
      .select('id, slug, title, content, meta_description')
      .eq('site_id', edge.fromSite)
      .eq('status', 'published')

    const { data: toPosts } = await admin
      .from('blog_posts')
      .select('id, slug, title, content, meta_description')
      .eq('site_id', edge.toSite)
      .eq('status', 'published')

    const fromList = (fromPosts ?? []) as PostRow[]
    const toList = (toPosts ?? []) as PostRow[]

    // Alvo: post publicado mais recente/relevante do site de destino.
    // Origem: post do meu site mais afim do alvo (melhor casamento de âncora).
    if (fromList.length === 0 || toList.length === 0 || !toSite?.domain || !SAFE_DOMAIN.test(toSite.domain)) {
      // Sem material pra injetar agora — registra o plano, injeção fica pendente.
      await admin.from('partner_ring_links').insert({
        ring_id: ringId,
        from_tenant_id: edge.fromTenant,
        from_site_id: edge.fromSite,
        to_tenant_id: edge.toTenant,
        to_site_id: edge.toSite,
        post_id: null,
        anchor_text: null,
        status: 'planned',
      })
      planned++
      continue
    }

    // Escolhe (postOrigem, postAlvo) com maior afinidade de keywords.
    let best: { from: PostRow; to: PostRow; score: number } | null = null
    const toKw = new Map(toList.map(t => [t.id, extractKeywords(t.title, t.meta_description)]))
    for (const f of fromList) {
      const fKw = extractKeywords(f.title, f.meta_description)
      for (const t of toList) {
        const s = similarity(fKw, toKw.get(t.id)!)
        if (!best || s > best.score) best = { from: f, to: t, score: s }
      }
    }
    if (!best || !SAFE_SLUG.test(best.to.slug)) {
      // Sem par afim OU slug do parceiro fora do charset seguro (não arrisca o
      // href cross-site). Registra o plano pra retry/auditoria e segue.
      await admin.from('partner_ring_links').insert({
        ring_id: ringId,
        from_tenant_id: edge.fromTenant,
        from_site_id: edge.fromSite,
        to_tenant_id: edge.toTenant,
        to_site_id: edge.toSite,
        post_id: null,
        anchor_text: null,
        status: 'planned',
      })
      planned++
      continue
    }

    const targetHref = `https://${toSite.domain}/blog/${best.to.slug}`
    const targetKw = extractKeywords(best.to.title, best.to.meta_description)
    // keyword de âncora = palavra do alvo presente no conteúdo de origem
    const anchorKeyword =
      Array.from(targetKw).find(w => best!.from.content.toLowerCase().includes(w)) ?? null

    const result = injectLinks(best.from.content, [
      { slug: best.to.slug, anchor: best.to.title, keyword: anchorKeyword },
    ])

    // injectLinks usa href relativo /blog/<slug>; aqui o backlink é
    // cross-site, então trocamos TODAS as ocorrências pela URL absoluta do
    // parceiro (inline e/ou "Leia também"). split/join = replace global sem regex.
    const finalContent = result.content.split(`href="/blog/${best.to.slug}"`).join(`href="${targetHref}" rel="noopener"`)

    const changed = finalContent !== best.from.content
    if (changed) {
      const { error: upErr } = await admin
        .from('blog_posts')
        .update({ content: finalContent })
        .eq('id', best.from.id)
      if (upErr) {
        // registra como planned pra retry futuro, não perde o rastro
        await admin.from('partner_ring_links').insert({
          ring_id: ringId,
          from_tenant_id: edge.fromTenant,
          from_site_id: edge.fromSite,
          to_tenant_id: edge.toTenant,
          to_site_id: edge.toSite,
          post_id: best.from.id,
          anchor_text: best.to.title.slice(0, 160),
          status: 'planned',
        })
        planned++
        continue
      }
    }

    await admin.from('partner_ring_links').insert({
      ring_id: ringId,
      from_tenant_id: edge.fromTenant,
      from_site_id: edge.fromSite,
      to_tenant_id: edge.toTenant,
      to_site_id: edge.toSite,
      post_id: best.from.id,
      anchor_text: best.to.title.slice(0, 160),
      status: changed ? 'rendered' : 'planned',
    })
    if (changed) rendered++
    else planned++
  }

  return { activated: true, linksPlanned: planned, linksRendered: rendered }
}
