import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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

  // Gera domínio padrão se não tiver
  const domain = site.domain ?? `${site_id.slice(0, 8)}.harp-ia.com`

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

  // Log de auditoria
  await supabase.from('audit_logs').insert({
    tenant_id: userData?.tenant_id,
    user_id: user.id,
    action: 'site_published',
    entity_type: 'site',
    entity_id: site_id,
    metadata: { domain, niche: site.niche, template: site.template },
  })

  return Response.json({ ok: true, domain })
}
