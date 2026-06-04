import { NextResponse } from 'next/server'
import { ensureTenantProfile } from '@/lib/auth/provision'
import { createServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Sessão inválida ou expirada' },
      { status: 401 }
    )
  }

  const displayName =
    (typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null) ??
    user.email ??
    'Minha conta'

  try {
    const result = await ensureTenantProfile(user.id, displayName)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar perfil'
    return NextResponse.json(
      { error: 'PROVISION_FAILED', message },
      { status: 500 }
    )
  }
}
