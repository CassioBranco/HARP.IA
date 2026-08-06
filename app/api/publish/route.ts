import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateSiteForPublish } from '@/lib/seo/validator'
import { ensureInternalLinks } from '@/lib/seo/internal-links'
import { resolvePublishDomain } from '@/lib/sites/domain'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { site_id } = await req.json() as { site_id: string }
  if (!site_id) return Response.json({ error: 'site_id obrigatório' }, { status: 400 })

  // Verifica posse do site
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { data: site } = await supabase
    .from('sites')
    .select('id, status, niche, template, domain')
    .eq('id', site_id)
    .eq('tenant_id', userData?.tenant_id ?? '')
    .single()

  if (!site) return Response.json({ error: 'Site não encontrado' }, { status: 404 })

  // Valida: precisa ter conteúdo gerado (seção hero no mínimo)
  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('site_id', site_id)
    .eq('slug', 'home')
    .single()

  if (!page?.id) {
    return Response.json({
      error: 'O site ainda não tem conteúdo gerado. Use a IA para gerar o conteúdo primeiro.',
    }, { status: 422 })
  }

  const { data: heroSection } = await supabase
    .from('sections')
    .select('id')
    .eq('page_id', page.id)
    .eq('section_type', 'hero')
    .single()

  if (!heroSection) {
    return Response.json({
      error: 'Conteúdo incompleto. Gere o site com IA antes de publicar.',
    }, { status: 422 })
  }

  // ── Gate do seo-validator (AEO) — erros bloqueiam a publicação ──────────────
  const validation = await validateSiteForPublish(supabase, site_id)
  if (!validation.ok) {
    return Response.json({
      error: 'O site não passou na validação de SEO/AEO. Corrija os pontos abaixo antes de publicar.',
      validation,
    }, { status: 422 })
  }

  // Domínio de publicação: mantém o já gravado; senão gera subdomínio
  // legível a partir do nome do negócio do onboarding (fallback: uuid8).
  let domain = site.domain
  if (!domain) {
    const { data: profile } = await supabase
      .from('onboarding_profiles')
      .select('business_name')
      .eq('site_id', site_id)
      .maybeSingle()
    domain = await resolvePublishDomain({
      siteId: site_id,
      businessName: profile?.business_name as string | null,
    })
  }

  // Publica: atualiza status + marca página home como published
  const [siteUpdate, pageUpdate] = await Promise.all([
    supabase
      .from('sites')
      .update({ status: 'published', domain })
      .eq('id', site_id),
    supabase
      .from('pages')
      .update({ published: true })
      .eq('id', page.id),
  ])

  if (siteUpdate.error) {
    return Response.json({ error: siteUpdate.error.message }, { status: 500 })
  }
  if (pageUpdate.error) {
    return Response.json({ error: pageUpdate.error.message }, { status: 500 })
  }

  // AEO Regra 7 — garante o grafo de links internos (nenhuma página órfã).
  // Não bloqueia a publicação; devolve avisos de órfãos pra mostrar ao cliente.
  let internalLinks: Awaited<ReturnType<typeof ensureInternalLinks>> | null = null
  if (userData?.tenant_id) {
    internalLinks = await ensureInternalLinks(supabase, {
      tenantId: userData.tenant_id,
      siteId: site_id,
    }).catch(() => null)
  }

  // Log de auditoria
  await supabase.from('audit_logs').insert({
    tenant_id: userData?.tenant_id,
    user_id: user.id,
    action: 'site_published',
    entity_type: 'site',
    entity_id: site_id,
    metadata: {
      domain,
      niche: site.niche,
      template: site.template,
      warnings: validation.warnings,
      internal_links_created: internalLinks?.created ?? 0,
      orphans: internalLinks?.orphans?.length ?? 0,
    },
  })

  return Response.json({
    ok: true,
    domain,
    url: `https://${domain}`, // link clicável pro estado pós-publicação do front
    warnings: validation.warnings,
    orphans: internalLinks?.orphans ?? [],
  })
}
