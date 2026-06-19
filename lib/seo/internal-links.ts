// ============================================================
// Grafo de links internos — AEO Regra 7 (nenhuma página órfã).
// Toda página/artigo precisa receber >=2 links internos.
// Estratégia MVP: a home é o hub. Cada artigo linka pra home e a home
// linka pra cada artigo; artigos formam um anel (post[i] -> post[i+1])
// pra cada um receber >=2 links de entrada (home + artigo anterior).
// Idempotente: usa o UNIQUE(source,target) da tabela com upsert ignore.
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'

type NodeType = 'page' | 'blog_post'
type GraphNode = { type: NodeType; id: string; title: string }
type LinkRow = {
  tenant_id: string
  site_id: string
  source_type: NodeType
  source_id: string
  target_type: NodeType
  target_id: string
  anchor_text: string
  auto_created: boolean
}

export type InternalLinksResult = {
  created: number
  orphans: { type: NodeType; id: string; title: string; inbound: number }[]
}

/**
 * Garante o grafo mínimo de links internos de um site publicado.
 * Cria os links que faltam (auto_created=true) e devolve quem ainda
 * ficaria com < 2 links de entrada (órfão) pra alertar o cliente.
 */
export async function ensureInternalLinks(
  supabase: SupabaseClient,
  args: { tenantId: string; siteId: string },
): Promise<InternalLinksResult> {
  const { tenantId, siteId } = args

  // Nós do grafo: páginas publicadas + artigos publicados.
  const [{ data: pages }, { data: posts }] = await Promise.all([
    supabase
      .from('pages')
      .select('id, slug, title')
      .eq('site_id', siteId)
      .eq('published', true),
    supabase
      .from('blog_posts')
      .select('id, title')
      .eq('site_id', siteId)
      .eq('status', 'published'),
  ])

  const pageNodes: GraphNode[] = (pages ?? []).map(p => ({
    type: 'page',
    id: p.id as string,
    title: (p.title as string) ?? (p.slug as string),
  }))
  const postNodes: GraphNode[] = (posts ?? []).map(p => ({
    type: 'blog_post',
    id: p.id as string,
    title: (p.title as string) ?? 'Artigo',
  }))

  const home = pageNodes.find(n => (pages ?? []).some(p => p.id === n.id && p.slug === 'home')) ?? pageNodes[0]
  const desired: LinkRow[] = []

  const mk = (source: GraphNode, target: GraphNode): LinkRow => ({
    tenant_id: tenantId,
    site_id: siteId,
    source_type: source.type,
    source_id: source.id,
    target_type: target.type,
    target_id: target.id,
    anchor_text: target.title.slice(0, 120),
    auto_created: true,
  })

  if (home) {
    for (const post of postNodes) {
      desired.push(mk(home, post)) // home -> artigo
      desired.push(mk(post, home)) // artigo -> home
    }
    // anel entre artigos: cada artigo recebe um 2º link de entrada
    if (postNodes.length >= 2) {
      for (let i = 0; i < postNodes.length; i++) {
        const current = postNodes[i]
        const next = postNodes[(i + 1) % postNodes.length]
        if (current && next) desired.push(mk(current, next))
      }
    }
  }

  let created = 0
  if (desired.length > 0) {
    // upsert idempotente — onConflict no UNIQUE(source_type,source_id,target_type,target_id)
    const { data, error } = await supabase
      .from('internal_links')
      .upsert(desired, {
        onConflict: 'source_type,source_id,target_type,target_id',
        ignoreDuplicates: true,
      })
      .select('id')
    if (!error) created = data?.length ?? 0
  }

  // Contagem de links de entrada por nó (após criação) pra detectar órfãos.
  const orphans = await findOrphans(supabase, siteId, [...pageNodes, ...postNodes], home?.id)
  return { created, orphans }
}

/** Quem recebe < 2 links internos de entrada (exceto a home, que é o hub). */
async function findOrphans(
  supabase: SupabaseClient,
  siteId: string,
  nodes: GraphNode[],
  homeId: string | undefined,
): Promise<InternalLinksResult['orphans']> {
  const { data: links } = await supabase
    .from('internal_links')
    .select('target_type, target_id')
    .eq('site_id', siteId)

  const inbound = new Map<string, number>()
  for (const l of links ?? []) {
    const key = `${l.target_type}:${l.target_id}`
    inbound.set(key, (inbound.get(key) ?? 0) + 1)
  }

  return nodes
    .filter(n => n.id !== homeId) // home é hub, não precisa de inbound
    .map(n => ({ ...n, inbound: inbound.get(`${n.type}:${n.id}`) ?? 0 }))
    .filter(n => n.inbound < 2)
}
