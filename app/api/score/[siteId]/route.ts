import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { saveScoreSnapshot } from '@/lib/score/history'
import { buildSiteScores, type DimensionKey } from '@/lib/seo/site-score'
import type { PageSection } from '@/lib/seo/score'

export const runtime = 'nodejs'

// A régua NÃO mora aqui. Esta rota só busca os sinais no banco e chama
// lib/seo/site-score — a mesma função que a barra do editor usa. Enquanto
// existiam duas implementações, o mesmo site tirava notas diferentes no
// editor e no painel, e nenhuma das duas significava nada pro cliente.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { data: site } = await supabase
    .from('sites')
    .select('id,domain,status,tenant_id')
    .eq('id', siteId)
    .single()

  if (!site) return Response.json({ error: 'Site não encontrado' }, { status: 404 })

  const [{ data: page }, { data: profile }, { count: internalLinks }, { count: postsPublicados }] =
    await Promise.all([
      supabase
        .from('pages')
        .select('id, title, meta_description')
        .eq('site_id', siteId)
        .eq('slug', 'home')
        .maybeSingle(),
      supabase
        .from('onboarding_profiles')
        .select('city, credentials, registro_profissional, years_experience')
        .eq('site_id', siteId)
        .maybeSingle(),
      supabase
        .from('internal_links')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', siteId),
      supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .eq('status', 'published'),
    ])

  const { data: sections } = page?.id
    ? await supabase
        .from('sections')
        .select('section_type, content')
        .eq('page_id', page.id)
        .order('order_index')
    : { data: [] }

  // Registro de conselho vale como credencial: já vem composto do onboarding
  // ("CRO 123456"). Sem ele, cai na lista livre de credentials.
  const credential =
    (profile?.registro_profissional as string | null) ??
    ((profile?.credentials as string[] | null) ?? []).join(', ')

  const scores = buildSiteScores({
    title: (page?.title as string | null) ?? '',
    metaDescription: (page?.meta_description as string | null) ?? '',
    sections: (sections ?? []) as PageSection[],
    hasLinkTargets: (postsPublicados ?? 0) > 0,
    internalLinks: internalLinks ?? 0,
    published: site.status === 'published',
    city: (profile?.city as string | null) ?? '',
    credential,
    yearsExperience: (profile?.years_experience as number | null) ?? 0,
  })

  const dim = (k: DimensionKey) => scores.dimensions.find(d => d.key === k)?.score ?? 0

  // O painel lista "o que melhorar" a partir dos checks reprovados — mesmos
  // ids, mesmos rótulos e mesmo texto de correção que o editor mostra.
  const rules = scores.dimensions.flatMap(d =>
    d.checks.map(c => ({
      rule_key: c.id,
      description: c.label,
      pillar: d.key,
      fix: c.fix ?? '',
      score: c.ok ? 100 : 0,
      passed: c.ok,
    })),
  )

  const overall = scores.overall
  const seo = dim('seo')
  const geo = dim('geo')
  const aeo = dim('aeo')
  const eeat = dim('eeat')

  // Congela o ponto de hoje no histórico. O site veio de uma query com RLS,
  // então o tenant_id aqui é o do dono de verdade. Não bloqueia a resposta.
  await saveScoreSnapshot({
    siteId,
    tenantId: (site.tenant_id as string | null) ?? '',
    overall, seo, geo, aeo, eeat,
    failing: rules.filter(r => !r.passed).map(r => r.rule_key),
  })

  return Response.json({
    overall,
    seo,
    geo,
    aeo,
    eeat,
    rules,
    calculated_at: new Date().toISOString(),
  })
}
