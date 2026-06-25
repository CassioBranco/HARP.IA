// ============================================================
// ANCOREO — /editor (sem id): atalho do menu. Redireciona pro editor do
// site mais recente do usuário, ou pra /sites se ainda não houver site.
// O editor de verdade mora em /editor/[siteId].
// ============================================================
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function EditorIndexPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (userData?.tenant_id) {
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (site?.id) redirect(`/editor/${site.id}`)
  }

  // Sem site ainda → manda criar
  redirect('/sites')
}
