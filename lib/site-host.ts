// ============================================================
// ANCOREO — Quem é o PAINEL e quem é SITE DE CLIENTE
// Usado pelo middleware (decide rewrite pra /[domain]) e pela rota
// /api/track (decide se a visita é do painel ou do site publicado).
// Sem dependência de Node — roda no edge runtime do middleware.
// ============================================================

// Domínio canônico do app quando NEXT_PUBLIC_APP_URL não está setada.
// Fallback de segurança: sem isso, esquecer a env faria o domínio principal
// ser tratado como site de cliente e quebraria o painel inteiro.
export const APP_URL_DEFAULT = 'https://ancoreo.com.br'

export function appHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL || APP_URL_DEFAULT
  try {
    return new URL(raw).hostname.toLowerCase()
  } catch {
    return null // env malformada — cai pros outros checks
  }
}

/** Só o hostname, sem porta, minúsculo. */
export function bareHost(host: string): string {
  return (host.split(':')[0] ?? '').toLowerCase()
}

/**
 * Hosts que pertencem ao PAINEL (app admin). Qualquer outro host é tratado
 * como domínio de um site publicado.
 */
export function isAppHost(host: string): boolean {
  const h = bareHost(host)
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
