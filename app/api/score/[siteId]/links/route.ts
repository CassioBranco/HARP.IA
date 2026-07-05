// ============================================================
// GET /api/score/[siteId]/links — verificador de links quebrados.
// Monta a lista de links do site (sections das páginas + HTML dos
// artigos do blog), verifica internos contra as rotas reais do
// banco e externos via HTTP (HEAD→GET, timeout 5s, concorrência 5).
// Sob demanda, nada persiste. Auth do dono via RLS (mesmo padrão
// do /api/score/[siteId]).
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  checkSiteLinks,
  extractLinksFromHtml,
  extractUrlsFromJson,
  type ExtractedLink,
} from '@/lib/seo/link-checker'

export const runtime = 'nodejs'
export const maxDuration = 60 // links externos lentos não podem estourar o padrão de 10s

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  // RLS (tenant_isolation) garante que só o dono enxerga o site
  const { data: site } = await supabase
    .from('sites')
    .select('id, domain, status')
    .eq('id', siteId)
    .maybeSingle()
  if (!site) return Response.json({ error: 'Site não encontrado' }, { status: 404 })

  // ── Estrutura real do site (páginas, sections, blog, produtos) ──
  const { data: pages } = await supabase
    .from('pages')
    .select('id, slug')
    .eq('site_id', siteId)
  const pageIds = (pages ?? []).map(p => p.id as string)

  const { data: sections } = pageIds.length > 0
    ? await supabase
        .from('sections')
        .select('page_id, section_type, content')
        .in('page_id', pageIds)
    : { data: [] as { page_id: string; section_type: string; content: unknown }[] }

  const [{ data: posts }, { data: products }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, title, content, status')
      .eq('site_id', siteId),
    supabase
      .from('products')
      .select('slug, status')
      .eq('site_id', siteId),
  ])

  // ── Rotas internas que existem de fato ──────────────────────
  const knownInternalPaths = new Set<string>(['/', '/blog', '/loja'])
  for (const p of pages ?? []) {
    const slug = p.slug as string
    knownInternalPaths.add(slug === 'home' ? '/' : `/${slug}`)
  }
  for (const post of posts ?? []) {
    if (post.status === 'published' && post.slug) knownInternalPaths.add(`/blog/${post.slug}`)
  }
  for (const prod of products ?? []) {
    if (prod.status === 'published' && prod.slug) knownInternalPaths.add(`/produto/${prod.slug}`)
  }

  // ── Extrai os links de cada "página" (fonte de conteúdo) ────
  const pageLabelById = new Map<string, string>(
    (pages ?? []).map(p => [p.id as string, (p.slug as string) === 'home' ? '/' : `/${p.slug}`])
  )

  const links: ExtractedLink[] = []

  // sections JSONB (hero, footer, socials, ctas…)
  for (const s of sections ?? []) {
    const page = pageLabelById.get(s.page_id as string) ?? '/'
    for (const url of extractUrlsFromJson(s.content)) {
      links.push({ url, page })
    }
  }

  // HTML dos artigos do blog (inclui rascunhos — melhor achar o link
  // quebrado ANTES de publicar; o rótulo marca o status)
  for (const post of posts ?? []) {
    if (!post.content || !post.slug) continue
    const page = post.status === 'published'
      ? `/blog/${post.slug}`
      : `/blog/${post.slug} (rascunho)`
    for (const url of extractLinksFromHtml(post.content as string)) {
      links.push({ url, page })
    }
  }

  const report = await checkSiteLinks({
    links,
    siteDomain: (site.domain as string | null) ?? null,
    knownInternalPaths,
  })

  return Response.json({
    site_id: siteId,
    domain: site.domain,
    pages_scanned: report.pagesScanned,
    total_links: report.totalLinks,
    internal_checked: report.internalChecked,
    external_checked: report.externalChecked,
    broken_count: report.broken.length,
    broken: report.broken,
    checked_at: report.checkedAt,
  })
}
