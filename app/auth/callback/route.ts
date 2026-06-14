import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ensureTenantProfile } from '@/lib/auth/provision'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/sites'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_failed`
      )
    }
    // Provisiona tenant + users pra quem entra pela primeira vez (ex.: Google
    // OAuth não passa pelo signup, então precisa garantir o perfil aqui).
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const displayName =
          (typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : null) ?? user.email ?? 'Minha conta'
        await ensureTenantProfile(user.id, displayName)
      }
    } catch {
      // não trava o login se o provisionamento falhar; o painel tolera dados ausentes
    }
  }

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/sites'
  return NextResponse.redirect(`${origin}${safeNext}`)
}
