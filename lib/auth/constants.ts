export const DASHBOARD_PATHS = [
  '/onboarding',
  '/sites',
  '/editor',
  '/blog',
  '/settings',
] as const

export const AUTH_ONLY_PATHS = ['/login', '/signup', '/reset'] as const

export function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

/** Rotas só para visitante — usuário logado é redirecionado para /sites */
export function isAuthPath(pathname: string): boolean {
  if (pathname.startsWith('/reset/update')) {
    return false
  }
  return AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}
