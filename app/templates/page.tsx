// ============================================================
// HARPIA — /templates = tela "Escolher modelo" (v2)
// Server component: carrega o perfil de onboarding do usuário e passa
// nome/nicho/domínio/objetivo pro componente client (preview real).
// ============================================================

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { slugifyBusiness } from '../onboarding/data'
import type { Objetivo } from '@/lib/onboarding/types'
import EscolherModelo from './EscolherModelo'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  let businessName = 'Seu negócio'
  let preset = 'servicos'
  let domain = ''
  let objetivo: Objetivo | null = null

  if (userData?.tenant_id) {
    const { data: profile } = await supabase
      .from('onboarding_profiles')
      .select('business_name, niche, profissao, setor, objetivo, dominio')
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (profile) {
      businessName = profile.business_name || businessName
      // `niche` guarda o slug legado (preset de conteúdo/paleta); fallback servicos
      preset = (profile.niche as string) || 'servicos'
      objetivo = (profile.objetivo as Objetivo) ?? null
      domain = (profile.dominio as string) || ''
    }
  }

  if (!domain) {
    domain = `${slugifyBusiness(businessName)}.com.br`
  }

  return (
    <EscolherModelo
      businessName={businessName}
      preset={preset}
      domain={domain}
      objetivo={objetivo}
    />
  )
}
