import { createAdminClient } from '@/lib/supabase/admin'

const TRIAL_DAYS = 7

export async function ensureTenantProfile(
  userId: string,
  displayName: string
): Promise<{ tenantId: string; created: boolean }> {
  const admin = createAdminClient()

  const { data: existing, error: fetchError } = await admin
    .from('users')
    .select('tenant_id')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (existing?.tenant_id) {
    return { tenantId: existing.tenant_id, created: false }
  }

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)

  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({
      name: displayName.trim() || 'Minha conta',
      plan: 'starter',
      trial_ends_at: trialEndsAt.toISOString(),
    })
    .select('id')
    .single()

  if (tenantError || !tenant) {
    throw new Error(tenantError?.message ?? 'Failed to create tenant')
  }

  const { error: userError } = await admin.from('users').insert({
    id: userId,
    tenant_id: tenant.id,
    role: 'owner',
  })

  if (userError) {
    await admin.from('tenants').delete().eq('id', tenant.id)
    throw new Error(userError.message)
  }

  return { tenantId: tenant.id, created: true }
}
