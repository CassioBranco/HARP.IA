// ============================================================
// Publicação de ARTIGO de blog (server-side, com gate AEO).
// Human-in-the-Loop: disparado pelo clique explícito em "Publicar".
// Valida (Regras 3/4), publica, e garante o grafo de links internos
// (Regra 7) — pra o artigo novo não nascer órfão.
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateBlogPostForPublish } from '@/lib/seo/validator'
import { ensureInternalLinks } from '@/lib/seo/internal-links'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { post_id } = await req.json() as { post_id?: string }
  if (!post_id) return Response.json({ error: 'post_id obrigatório' }, { status: 400 })

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()

  // RLS garante que só volta se o artigo for do tenant do usuário.
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, site_id, title, content, meta_description')
    .eq('id', post_id)
    .maybeSingle()

  if (!post) return Response.json({ error: 'Artigo não encontrado ou sem acesso' }, { status: 404 })

  // ── Gate AEO (Regras 3/4) — erro bloqueia; aviso só informa ─────────────────
  const validation = validateBlogPostForPublish({
    title: post.title as string,
    content: (post.content as string) ?? '',
    metaDescription: post.meta_description as string | null,
  })
  if (!validation.ok) {
    return Response.json({
      error: 'O artigo não passou na validação. Corrija antes de publicar.',
      validation,
    }, { status: 422 })
  }

  const { error: upErr } = await supabase
    .from('blog_posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', post_id)

  if (upErr) return Response.json({ error: upErr.message }, { status: 500 })

  // AEO Regra 7 — religa o grafo de links internos incluindo o artigo novo.
  let internalLinks: Awaited<ReturnType<typeof ensureInternalLinks>> | null = null
  if (userData?.tenant_id) {
    internalLinks = await ensureInternalLinks(supabase, {
      tenantId: userData.tenant_id,
      siteId: post.site_id as string,
    }).catch(() => null)
  }

  await supabase.from('audit_logs').insert({
    tenant_id: userData?.tenant_id,
    user_id: user.id,
    action: 'blog_post_published',
    entity_type: 'blog_post',
    entity_id: post_id,
    metadata: {
      warnings: validation.warnings,
      internal_links_created: internalLinks?.created ?? 0,
      orphans: internalLinks?.orphans?.length ?? 0,
    },
  })

  return Response.json({
    ok: true,
    warnings: validation.warnings,
    orphans: internalLinks?.orphans ?? [],
  })
}
