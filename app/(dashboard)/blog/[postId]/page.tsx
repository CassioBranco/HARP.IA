// ============================================================
// HARPIA — /blog/[postId] (post-editor página cheia).
// Visual = protótipo painel/post-editor.html.
// postId === 'new' → criar artigo novo.
// Persiste só campos com lastro no banco (title/slug/content/
// meta_description/status). Capa/categoria/keywords ficam como
// UI desabilitada (sem coluna no schema) — sem inventar dados.
// ============================================================
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import PostEditor, { type PostEditorData } from './PostEditor'

export const dynamic = 'force-dynamic'

export default async function PostEditorPage({ params }: { params: { postId: string } }) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id as string | undefined
  if (!tenantId) redirect('/sites')

  // Site mais recente do tenant (blog é por site)
  const { data: site } = await supabase
    .from('sites')
    .select('id, domain')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!site?.id) redirect('/sites')
  const siteId = site.id as string
  const domain = (site.domain as string | null) ?? 'seusite.com.br'

  const isNew = params.postId === 'new'
  let post: PostEditorData = {
    id: null,
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    status: 'draft',
  }

  if (!isNew) {
    const { data: row } = await supabase
      .from('blog_posts')
      .select('id, title, slug, content, meta_description, status, site_id')
      .eq('id', params.postId)
      .maybeSingle()
    // Garante que o post é do site do tenant (RLS já protege, mas reforçamos)
    if (!row || row.site_id !== siteId) notFound()
    post = {
      id: row.id,
      title: row.title ?? '',
      slug: row.slug ?? '',
      content: row.content ?? '',
      meta_description: row.meta_description ?? '',
      status: (row.status as PostEditorData['status']) ?? 'draft',
    }
  }

  return <PostEditor siteId={siteId} tenantId={tenantId} domain={domain} initial={post} />
}
