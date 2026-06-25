// ============================================================
// ANCOREO — /blog (Fase 4). Visual = protótipo painel/blog.html.
// Server component: carrega o site do tenant + artigos reais + cota do plano.
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import BlogList, { type BlogPostRow } from './BlogList'

export const dynamic = 'force-dynamic'

// Limite mensal de posts por plano (CLAUDE.md §3). null = ilimitado (fair use).
const BLOG_LIMIT: Record<string, number | null> = {
  starter: 4,
  pro: 20,
  agency: null,
}

export default async function BlogPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenants(plan)')
    .eq('id', user.id)
    .single()

  const tenantId = userData?.tenant_id as string | undefined
  const t = userData?.tenants as { plan?: string } | { plan?: string }[] | null
  const plan = (Array.isArray(t) ? t[0]?.plan : t?.plan) ?? 'starter'

  // Site mais recente do tenant (blog é por site)
  let siteId = ''
  let domain = ''
  if (tenantId) {
    const { data: site } = await supabase
      .from('sites')
      .select('id, domain')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    siteId = site?.id ?? ''
    domain = site?.domain ?? ''
  }

  // Artigos do site
  let posts: BlogPostRow[] = []
  if (siteId) {
    const { data: rows } = await supabase
      .from('blog_posts')
      .select('id, title, status, intent, created_at, published_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
    posts = (rows ?? []).map(r => ({
      id: r.id,
      title: r.title,
      status: r.status,
      intent: r.intent,
      created_at: r.created_at,
      published_at: r.published_at,
      ai: r.status === 'review', // rascunho da IA aguardando revisão
    }))
  }

  const publishedCount = posts.filter(p => p.status === 'published').length
  const limit = BLOG_LIMIT[plan] ?? null
  // Posts gerados neste mês (aprox. = todos do mês corrente)
  const monthStart = new Date()
  monthStart.setDate(1)
  const usedThisMonth = posts.filter(p => new Date(p.created_at) >= monthStart).length
  const remainingLabel =
    limit === null ? 'ilimitado' : `${Math.max(0, limit - usedThisMonth)} de ${limit}`

  const newHref = siteId ? '/blog/new' : '/sites'
  const subtitle = domain ? `${domain} · conteúdo que faz você aparecer` : 'conteúdo que faz você aparecer'

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Blog</h1>
          <div className="sub">{subtitle}</div>
        </div>
        <a className="btn lg" href={newHref}><i className="ph-fill ph-plus" /> Novo artigo</a>
      </div>

      <div className="ai-banner">
        <span className="ic"><i className="ph-fill ph-magic-wand" /></span>
        <div>
          <b>Deixe a IA escrever por você</b>
          <p>Com base no seu conhecimento de especialista, a IA gera artigos otimizados pra SEO, GEO e AEO.</p>
        </div>
        <a className="btn" href={newHref}><i className="ph-fill ph-sparkle" /> Gerar artigo com IA</a>
      </div>

      <div className="stats">
        <div className="glass stat">
          <span className="si"><i className="ph-fill ph-article" /></span>
          <div><div className="n">{publishedCount}</div><div className="l">artigos publicados</div></div>
        </div>
        <div className="glass stat">
          <span className="si"><i className="ph-fill ph-files" /></span>
          <div><div className="n">{posts.length}</div><div className="l">artigos no total</div></div>
        </div>
        <div className="glass stat">
          <span className="si"><i className="ph-fill ph-calendar-check" /></span>
          <div><div className="n">{remainingLabel}</div><div className="l">artigos restantes no plano</div></div>
        </div>
      </div>

      <BlogList posts={posts} />
    </>
  )
}
