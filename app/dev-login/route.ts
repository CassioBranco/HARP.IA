// ============================================================
// /dev-login — atalho de sessão SÓ para desenvolvimento local.
// Loga um usuário de teste sem senha (magic link gerado pelo
// service role) e redireciona pro editor/painel, pra testar sem
// refazer o processo do cliente toda vez.
//
// TRAVA DE SEGURANÇA: responde 404 fora de NODE_ENV=development.
// No build de produção (Vercel) a rota simplesmente não existe pro
// mundo — nunca cria sessão em prod.
//
// Uso:
//   /dev-login                      -> loga DEV_LOGIN_EMAIL, vai pra /sites
//   /dev-login?next=/editor/<id>    -> loga e cai direto no editor
//   /dev-login?email=<email>        -> loga outra conta de teste
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

type CookieToSet = { name: string; value: string; options: CookieOptions }

/** Só permite redirecionar pra dentro do próprio app (evita open-redirect). */
function safeNext(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw
  return '/sites'
}

export async function GET(request: NextRequest) {
  // TRAVA: fora de dev, a rota não existe.
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Supabase env ausente' }, { status: 500 })
  }

  const email =
    request.nextUrl.searchParams.get('email') || process.env.DEV_LOGIN_EMAIL
  if (!email) {
    return NextResponse.json(
      {
        error: 'Sem e-mail de teste',
        dica: 'Defina DEV_LOGIN_EMAIL no .env.local ou passe ?email=... na URL',
      },
      { status: 400 },
    )
  }

  const next = safeNext(request.nextUrl.searchParams.get('next'))

  // A resposta de redirect é o portador dos cookies de sessão: o client
  // supabase escreve os cookies NELA (mesmo padrão do middleware).
  const response = NextResponse.redirect(new URL(next, request.url))

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // 1) Service role gera um magic link (não envia e-mail nenhum, só gera o token).
  const admin = createAdminClient()
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  if (linkErr || !linkData?.properties?.hashed_token) {
    return NextResponse.json(
      { error: 'Falha ao gerar magic link', detalhe: linkErr?.message ?? 'sem token', email },
      { status: 400 },
    )
  }

  // 2) Valida o token -> cria a sessão e grava os cookies na resposta.
  const { error: otpErr } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  })
  if (otpErr) {
    return NextResponse.json(
      { error: 'Falha ao validar sessão', detalhe: otpErr.message, email },
      { status: 400 },
    )
  }

  return response
}
