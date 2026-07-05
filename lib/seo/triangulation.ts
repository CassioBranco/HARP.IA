// ============================================================
// Triangulação de hyperlinks entre artigos — evolução da Regra 7.
// O ensureInternalLinks (internal-links.ts) garante o grafo MÍNIMO
// (hub home + anel) como metadado. Este módulo cria os links
// CONTEXTUAIS DE VERDADE, dentro do HTML dos artigos:
//
//  1. agrupa artigos do site em clusters por afinidade de palavras
//     (título + meta description, sem stopwords PT-BR);
//  2. planeja 2–4 links de saída por artigo — padrão hub & spoke +
//     triângulos de cluster (A→B→C→A fecha ciclo; par mais afim
//     ganha link bidirecional);
//  3. injeta as âncoras no conteúdo: preferindo parágrafo que já
//     menciona o assunto do alvo (âncora natural inline); se não
//     houver menção, cai num bloco "Leia também" no fim do artigo.
//
// Núcleo 100% puro (testável sem banco); triangulateSiteArticles é
// o wrapper que lê/escreve blog_posts + internal_links. Idempotente:
// nunca duplica link pro mesmo alvo (checa href já presente).
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'

// ── Tipos ────────────────────────────────────────────────────
export type ArticleNode = {
  id: string
  slug: string
  title: string
  meta: string | null
  content: string
}

export type PlannedLink = {
  sourceId: string
  targetId: string
  anchor: string          // texto da âncora
  keyword: string | null  // palavra que casa no conteúdo (null = só Leia também)
  kind: 'triangle' | 'cluster' | 'related'
}

export type TriangulationResult = {
  planned: number
  injectedInline: number
  injectedReadMore: number
  updatedArticles: number
}

// ── Núcleo puro: keywords ────────────────────────────────────
const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'para', 'pra', 'com', 'sem',
  'que', 'qual', 'quais', 'como', 'quando', 'onde', 'porque', 'e', 'ou', 'mas', 'se',
  'seu', 'sua', 'seus', 'suas', 'este', 'esta', 'isso', 'esse', 'essa', 'aquele',
  'ao', 'aos', 'à', 'às', 'é', 'são', 'ser', 'ter', 'tem', 'já', 'não', 'sim', 'mais',
  'menos', 'muito', 'pouco', 'todo', 'toda', 'todos', 'todas', 'você', 'voce', 'nós',
  'guia', 'dicas', 'dica', 'sobre', 'entre', 'até', 'ate', 'depois', 'antes', 'saiba',
  'conheça', 'conheca', 'veja', 'confira', 'melhor', 'melhores', 'completo', 'completa',
])

/** Normaliza pra comparação: minúsculas, sem acento. (Reusado pelo score.) */
export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Palavras significativas (≥4 chars, sem stopword) de título+meta. */
export function extractKeywords(title: string, meta: string | null): Set<string> {
  const words = norm(`${title} ${meta ?? ''}`)
    .replace(/[^a-z0-9à-ú\s-]/gi, ' ')
    .split(/[\s-]+/)
    .filter(w => w.length >= 4 && !STOPWORDS.has(w))
  return new Set(words)
}

/** Similaridade Jaccard entre dois conjuntos de palavras. */
export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  a.forEach(w => { if (b.has(w)) inter++ })
  return inter / (a.size + b.size - inter)
}

// ── Núcleo puro: plano de links ──────────────────────────────
const MAX_OUT = 4   // máx. links de saída por artigo
const MIN_OUT = 2   // alvo mínimo (quando houver artigos suficientes)
const CLUSTER_THRESHOLD = 0.12 // afinidade mínima pra "mesmo cluster"

/**
 * Planeja os links contextuais do site inteiro.
 * Clusters = componentes conexos por similaridade ≥ threshold.
 * Dentro do cluster: anel (fecha triângulo em grupos de 3+) +
 * bidirecional no par mais afim. Artigos fora de cluster recebem
 * os N mais próximos como 'related' (pra ninguém ficar sem saída).
 */
export function planLinks(articles: ArticleNode[]): PlannedLink[] {
  if (articles.length < 2) return []

  const kw = new Map(articles.map(a => [a.id, extractKeywords(a.title, a.meta)]))
  const sim = (x: ArticleNode, y: ArticleNode) => similarity(kw.get(x.id)!, kw.get(y.id)!)

  // componentes conexos por união simples
  const parent = new Map(articles.map(a => [a.id, a.id]))
  const find = (i: string): string => {
    let r = i
    while (parent.get(r) !== r) r = parent.get(r)!
    parent.set(i, r)
    return r
  }
  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const a = articles[i]!, b = articles[j]!
      if (sim(a, b) >= CLUSTER_THRESHOLD) parent.set(find(a.id), find(b.id))
    }
  }
  const clusters = new Map<string, ArticleNode[]>()
  for (const a of articles) {
    const root = find(a.id)
    clusters.set(root, [...(clusters.get(root) ?? []), a])
  }

  const links: PlannedLink[] = []
  const outCount = new Map(articles.map(a => [a.id, 0]))
  const seen = new Set<string>() // "src>tgt"

  const push = (src: ArticleNode, tgt: ArticleNode, kind: PlannedLink['kind']) => {
    const key = `${src.id}>${tgt.id}`
    if (src.id === tgt.id || seen.has(key)) return
    if ((outCount.get(src.id) ?? 0) >= MAX_OUT) return
    // âncora natural = keyword compartilhada mais longa presente no conteúdo do src
    const shared = Array.from(kw.get(tgt.id)!)
      .filter(w => kw.get(src.id)!.has(w) || norm(src.content).includes(w))
      .sort((a, b) => b.length - a.length)
    const keyword = shared.find(w => norm(src.content).includes(w)) ?? null
    links.push({ sourceId: src.id, targetId: tgt.id, anchor: tgt.title, keyword, kind })
    seen.add(key)
    outCount.set(src.id, (outCount.get(src.id) ?? 0) + 1)
  }

  for (const members of Array.from(clusters.values())) {
    if (members.length >= 3) {
      // anel fecha o ciclo (triângulo quando 3; polígono quando mais)
      for (let i = 0; i < members.length; i++) {
        push(members[i]!, members[(i + 1) % members.length]!, 'triangle')
      }
      // par mais afim do cluster vira bidirecional
      let best: [ArticleNode, ArticleNode, number] | null = null
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const s = sim(members[i]!, members[j]!)
          if (!best || s > best[2]) best = [members[i]!, members[j]!, s]
        }
      }
      if (best) { push(best[0], best[1], 'cluster'); push(best[1], best[0], 'cluster') }
    } else if (members.length === 2) {
      push(members[0]!, members[1]!, 'cluster')
      push(members[1]!, members[0]!, 'cluster')
    }
  }

  // completa até MIN_OUT com os mais próximos fora do cluster
  for (const a of articles) {
    if ((outCount.get(a.id) ?? 0) >= MIN_OUT) continue
    const ranked = articles
      .filter(b => b.id !== a.id)
      .map(b => [b, sim(a, b)] as const)
      .sort((x, y) => y[1] - x[1])
    for (const [b] of ranked) {
      if ((outCount.get(a.id) ?? 0) >= MIN_OUT) break
      push(a, b, 'related')
    }
  }

  return links
}

// ── Núcleo puro: injeção no HTML ─────────────────────────────
export type InjectionResult = { content: string; inline: number; readMore: number }

/**
 * Injeta os links planejados no HTML do artigo de origem.
 * - Se o alvo já está linkado (href presente), pula (idempotente).
 * - Tenta inline: 1ª ocorrência da keyword em trecho de texto FORA
 *   de tag/anchor/heading — envolve com <a>.
 * - Sem match: acumula no bloco "Leia também" (criado/mesclado no fim).
 */
export function injectLinks(
  content: string,
  links: { slug: string; anchor: string; keyword: string | null }[],
): InjectionResult {
  let html = content
  let inline = 0
  const pending: { slug: string; anchor: string }[] = []

  for (const link of links) {
    const href = `/blog/${link.slug}`
    if (html.includes(`href="${href}"`) || html.includes(`href='${href}'`)) continue

    let placed = false
    if (link.keyword) {
      // procura a keyword em texto puro entre '>' e '<' — tenta TODAS as
      // ocorrências até achar uma fora de heading e fora de <a>…</a>
      const re = new RegExp(`(>[^<]*?)\\b(${escapeRe(link.keyword)}[a-zà-ú]*)\\b`, 'gi')
      let m: RegExpExecArray | null
      while (!placed && (m = re.exec(html)) !== null) {
        const before = html.slice(0, m.index)
        const lastOpenA = before.lastIndexOf('<a')
        const lastCloseA = before.lastIndexOf('</a>')
        const lastOpenH = Math.max(before.lastIndexOf('<h1'), before.lastIndexOf('<h2'), before.lastIndexOf('<h3'))
        const lastCloseH = Math.max(before.lastIndexOf('</h1>'), before.lastIndexOf('</h2>'), before.lastIndexOf('</h3>'))
        const insideA = lastOpenA > lastCloseA
        const insideH = lastOpenH > lastCloseH
        if (!insideA && !insideH) {
          const start = m.index + m[1]!.length
          const word = m[2]!
          html = `${html.slice(0, start)}<a href="${href}">${word}</a>${html.slice(start + word.length)}`
          inline++
          placed = true
        }
      }
    }
    if (!placed) pending.push({ slug: link.slug, anchor: link.anchor })
  }

  if (pending.length > 0) {
    const items = pending
      .map(p => `<li><a href="/blog/${p.slug}">${escapeHtml(p.anchor)}</a></li>`)
      .join('')
    const marker = '<ul data-leia-tambem>'
    if (html.includes(marker)) {
      html = html.replace(marker, `${marker}${items}`)
    } else {
      html += `\n<h2>Leia também</h2>\n${marker}${items}</ul>`
    }
  }

  return { content: html, inline, readMore: pending.length }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── Wrapper com banco ────────────────────────────────────────
/**
 * Triangula TODOS os artigos publicados de um site: planeja, injeta
 * no conteúdo e registra o grafo em internal_links. Site inteiro e
 * idempotente — serve tanto pro artigo novo (no publish) quanto de
 * backfill pros antigos.
 */
export async function triangulateSiteArticles(
  supabase: SupabaseClient,
  args: { tenantId: string; siteId: string },
): Promise<TriangulationResult> {
  const { tenantId, siteId } = args

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, content, meta_description')
    .eq('site_id', siteId)
    .eq('status', 'published')

  const articles: ArticleNode[] = (posts ?? [])
    .filter(p => p.slug && p.title)
    .map(p => ({
      id: p.id as string,
      slug: p.slug as string,
      title: p.title as string,
      meta: (p.meta_description as string) ?? null,
      content: (p.content as string) ?? '',
    }))

  const plan = planLinks(articles)
  const bySlug = new Map(articles.map(a => [a.id, a]))

  let injectedInline = 0
  let injectedReadMore = 0
  let updatedArticles = 0

  // agrupa plano por artigo de origem e injeta uma vez só
  const bySource = new Map<string, PlannedLink[]>()
  for (const l of plan) bySource.set(l.sourceId, [...(bySource.get(l.sourceId) ?? []), l])

  for (const [sourceId, links] of Array.from(bySource.entries())) {
    const src = bySlug.get(sourceId)
    if (!src || !src.content) continue
    const result = injectLinks(
      src.content,
      links.map(l => ({
        slug: bySlug.get(l.targetId)!.slug,
        anchor: l.anchor,
        keyword: l.keyword,
      })),
    )
    if (result.content !== src.content) {
      const { error } = await supabase
        .from('blog_posts')
        .update({ content: result.content })
        .eq('id', sourceId)
      if (!error) {
        injectedInline += result.inline
        injectedReadMore += result.readMore
        updatedArticles++
      }
    }
  }

  // registra o grafo (colunas existentes da tabela — kind/context vêm
  // na migration 20260702, escrita mas ainda não aplicada)
  if (plan.length > 0) {
    const rows = plan.map(l => ({
      tenant_id: tenantId,
      site_id: siteId,
      source_type: 'blog_post',
      source_id: l.sourceId,
      target_type: 'blog_post',
      target_id: l.targetId,
      anchor_text: l.anchor.slice(0, 120),
      auto_created: true,
    }))
    await supabase
      .from('internal_links')
      .upsert(rows, {
        onConflict: 'source_type,source_id,target_type,target_id',
        ignoreDuplicates: true,
      })
  }

  return { planned: plan.length, injectedInline, injectedReadMore, updatedArticles }
}
