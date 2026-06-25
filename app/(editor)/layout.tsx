// ============================================================
// ANCOREO — Layout do editor (tela cheia, sem o shell do painel).
// Fica num route group próprio pra NÃO herdar a sidebar do (dashboard)
// (evita o "chrome dobrado"). Faz o guard de auth no servidor.
// ============================================================
import { redirect } from 'next/navigation'
import { hasSupabaseEnv } from '@/lib/env'
import { createServerClient } from '@/lib/supabase/server'
import { FONT_PAIRS } from '@/lib/templates/fonts'

import '@phosphor-icons/web/fill'
import '@phosphor-icons/web/duotone'
import '../(dashboard)/painel.css'
import './editor.css'

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (hasSupabaseEnv()) {
    const supabase = await createServerClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) redirect('/login')
  }
  return (
    <>
      {/* Carrega as fontes dos 6 pares pra que os tiles do painel de Fontes
          mostrem cada tipografia na sua própria letra. */}
      {FONT_PAIRS.map(fp => (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link key={fp.id} rel="stylesheet" href={fp.href} />
      ))}
      {children}
    </>
  )
}
