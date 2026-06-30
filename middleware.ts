import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Domínio canônico do app quando NEXT_PUBLIC_APP_URL não está setada.
// Fallback de segurança: sem isso, esquecer a env faria o domínio principal
// ser tratado como site de cliente e quebraria o painel inteiro.
const APP_URL_DEFAULT = 'https://ancoreo.com.br'

function appHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL || APP_URL_DEFAULT
  try {
    return new URL(raw).hostname.toLowerCase()
  } catch {
    return null // env malformada — cai pros outros checks
  }
}

// Hosts que pertencem ao PAINEL (app admin). Qualquer outro host é tratado
// como domínio de um site publicado e é reescrito pra rota /[domain].
function isAppHost(host: string): boolean {
  const h = (host.split(':')[0] ?? '').toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1') return true
  if (h.endsWith('.vercel.app')) return true // previews + *.vercel.app
  const app = appHostname()
  if (app) {
    // apex e www do domínio do app contam como app (ex.: ancoreo.com.br e www.)
    const bare = h.startsWith('www.') ? h.slice(4) : h
    const appBare = app.startsWith('www.') ? app.slice(4) : app
    if (bare === appBare) return true
  }
  return false
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl

  // Host de site publicado (ex.: cliente.harp-ia.com, dominioproprio.com.br):
  // reescreve pra rota dinâmica /[domain], que renderiza o site real.
  // Não roda updateSession — site publicado é público, sem sessão de painel.
  if (!isAppHost(host) && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    const hostname = host.split(':')[0] ?? host
    const url = request.nextUrl.clone()
    url.pathname = `/${hostname}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // Host do painel: fluxo normal de auth.
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
