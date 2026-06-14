'use server'

// ============================================================
// HARPIA — Server actions de Configurações (aba Conta).
// Salva dados do perfil no onboarding_profiles do tenant (RLS protege).
// ============================================================

import { createServerClient } from '@/lib/supabase/server'

export interface SaveResult {
  ok: boolean
  error?: string
}

export async function saveAccount(input: {
  businessName: string
  city: string
}): Promise<SaveResult> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  if (!userData?.tenant_id) return { ok: false, error: 'tenant_not_found' }

  // Perfil mais recente do tenant
  const { data: prof } = await supabase
    .from('onboarding_profiles')
    .select('id')
    .eq('tenant_id', userData.tenant_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!prof?.id) return { ok: false, error: 'profile_not_found' }

  const { error } = await supabase
    .from('onboarding_profiles')
    .update({ business_name: input.businessName, city: input.city })
    .eq('id', prof.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
