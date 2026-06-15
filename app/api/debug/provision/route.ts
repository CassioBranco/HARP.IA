import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// ROTA TEMPORÁRIA DE DIAGNÓSTICO — remover depois de resolver.
// Diz se a SUPABASE_SERVICE_ROLE_KEY está correta sem expor o segredo.
// Protegida por token na query (?t=harpia-debug-2026).
// ============================================================

export const dynamic = 'force-dynamic'

function fingerprint(key: string | undefined) {
  if (!key) return { present: false }
  return {
    present: true,
    length: key.length,
    prefix: key.slice(0, 6),       // 'eyJhbG' (JWT) | 'sb_sec' | 'sb_pub'
    suffix: key.slice(-4),
    isJwt: key.startsWith('eyJ'),
    isNewSecret: key.startsWith('sb_secret'),
    isNewPublishable: key.startsWith('sb_publishable'),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('t') !== 'harpia-debug-2026') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const report: Record<string, unknown> = {
    url_present: !!url,
    url_host: url ? new URL(url).host : null,
    service_role_key: fingerprint(serviceKey),
    anon_key: fingerprint(anonKey),
    service_equals_anon: !!serviceKey && serviceKey === anonKey,
  }

  // Testa de verdade: o admin client consegue LER e CONTAR users?
  if (url && serviceKey) {
    try {
      const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { count, error } = await admin
        .from('users')
        .select('*', { count: 'exact', head: true })
      report.users_read = error
        ? { ok: false, code: error.code, message: error.message }
        : { ok: true, count }

      // Também testa tenants (onde o provisionamento insere primeiro)
      const { error: tErr } = await admin
        .from('tenants')
        .select('*', { count: 'exact', head: true })
      report.tenants_read = tErr
        ? { ok: false, code: tErr.code, message: tErr.message }
        : { ok: true }
    } catch (e) {
      report.admin_client_error = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json(report, { status: 200 })
}
