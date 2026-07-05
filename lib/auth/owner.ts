// ============================================================
// Resolve o e-mail do DONO da conta (role='owner') de um tenant.
// O `users` referencia auth.users e não guarda e-mail; o e-mail de login mora
// no Supabase Auth, lido via service_role (admin.auth.admin.getUserById).
// Usado pelas notificações transacionais (lead/agendamento/pedido) pra saber
// pra quem avisar. Tolerante: qualquer falha → null (a notificação só não sai).
// ============================================================
import type { createAdminClient } from '@/lib/supabase/admin'

type Admin = ReturnType<typeof createAdminClient>

export async function resolveOwnerEmail(admin: Admin, tenantId: string): Promise<string | null> {
  if (!tenantId) return null

  const { data: owner } = await admin
    .from('users')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('role', 'owner')
    .maybeSingle()

  const ownerId = owner?.id as string | undefined
  if (!ownerId) return null

  const { data, error } = await admin.auth.admin.getUserById(ownerId)
  if (error) return null
  return data.user?.email ?? null
}
