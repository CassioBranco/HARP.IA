import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Hosts que pertencem ao PAINEL (app admin). Qualquer outro host é tratado
// como domínio de um site publicado e é reescrito pra rota /[domain].
function isAppHost(host: string): boolean {
  const h = (host.split(':')[0] ?? '').toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1') return true
  if (h.endsWith('.vercel.app')) return true // previews + harp-ia.vercel.app
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    try {
      if (h === new URL(appUrl).hostname.toLowerCase()) return true
    } catch { /* env malformada — ignora */ }
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
