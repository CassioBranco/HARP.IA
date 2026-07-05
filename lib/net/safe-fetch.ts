// ============================================================
// Guard anti-SSRF + fetch seguro.
// Usado onde o SERVIDOR busca URLs que vêm de conteúdo do usuário
// (ex.: verificador de links do site). Bloqueia loopback, redes
// privadas, link-local e o endpoint de metadados da cloud
// (169.254.169.254) — inclusive quando um host público REDIRECIONA
// pra um endereço interno (valida cada hop).
// ============================================================
import { lookup } from 'node:dns/promises'

export class SsrfBlockedError extends Error {
  constructor(reason: string) {
    super(`ssrf_blocked:${reason}`)
    this.name = 'SsrfBlocked'
  }
}

export function isSsrfBlocked(e: unknown): boolean {
  return e instanceof Error && e.name === 'SsrfBlocked'
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost', 'localhost.localdomain', 'ip6-localhost', 'ip6-loopback',
])

/** IPv4 privado/reservado/loopback/link-local + metadados de cloud. */
function isBlockedIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true
  const a = parts[0]!, b = parts[1]! // length===4 garantido acima
  if (a === 0) return true                            // 0.0.0.0/8
  if (a === 10) return true                           // 10/8 privado
  if (a === 127) return true                          // loopback
  if (a === 169 && b === 254) return true             // link-local + metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true    // 172.16/12 privado
  if (a === 192 && b === 168) return true             // 192.168/16 privado
  if (a === 100 && b >= 64 && b <= 127) return true   // CGNAT 100.64/10
  if (a >= 224) return true                           // multicast/reservado
  return false
}

/** IPv6 loopback/link-local/unique-local + IPv4-mapeado. */
function isBlockedIpv6(ip: string): boolean {
  const s = (ip.split('%')[0] ?? '').toLowerCase() // remove zone id (%eth0)
  if (s === '::1' || s === '::') return true                 // loopback / unspecified
  if (s.startsWith('fe80')) return true                      // link-local
  if (s.startsWith('fc') || s.startsWith('fd')) return true  // unique local fc00::/7
  const mapped = s.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)     // ::ffff:a.b.c.d
  if (mapped?.[1]) return isBlockedIpv4(mapped[1])
  return false
}

function ipKind(host: string): 'v4' | 'v6' | null {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return 'v4'
  if (host.includes(':')) return 'v6'
  return null
}

function isBlockedAddress(ip: string): boolean {
  return ipKind(ip) === 'v6' ? isBlockedIpv6(ip) : isBlockedIpv4(ip)
}

/**
 * Valida que a URL aponta pra um destino público. Lança SsrfBlockedError
 * se o esquema não for http(s), se o host for um IP interno, ou se um NOME
 * resolver (DNS) pra qualquer endereço interno. Devolve a URL parseada.
 */
export async function assertUrlIsPublic(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new SsrfBlockedError('url_invalida')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SsrfBlockedError('esquema_bloqueado')
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '') // tira colchetes de IPv6
  if (BLOCKED_HOSTNAMES.has(host)) throw new SsrfBlockedError('host_bloqueado')

  if (ipKind(host)) {
    if (isBlockedAddress(host)) throw new SsrfBlockedError('ip_interno')
    return url
  }

  // Nome: resolve e bloqueia se QUALQUER endereço for interno.
  let addrs: { address: string }[]
  try {
    addrs = await lookup(host, { all: true })
  } catch {
    throw new SsrfBlockedError('dns_falhou')
  }
  if (addrs.length === 0) throw new SsrfBlockedError('dns_vazio')
  for (const a of addrs) {
    if (isBlockedAddress(a.address)) throw new SsrfBlockedError('resolve_interno')
  }
  return url
}

export type SafeFetchInit = {
  method?: 'HEAD' | 'GET'
  timeoutMs?: number
  headers?: Record<string, string>
  maxRedirects?: number
}

/**
 * fetch que valida a URL inicial E cada redirecionamento contra o guard SSRF.
 * redirect:'manual' + validação por hop — um host público não consegue
 * redirecionar o servidor pra um endereço interno.
 */
export async function safeFetch(rawUrl: string, init: SafeFetchInit = {}): Promise<Response> {
  const { method = 'GET', timeoutMs = 5000, headers = {}, maxRedirects = 5 } = init
  let current = rawUrl

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertUrlIsPublic(current)

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    let res: Response
    try {
      res = await fetch(current, { method, redirect: 'manual', signal: ctrl.signal, headers })
    } finally {
      clearTimeout(timer)
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return res
      current = new URL(loc, current).toString() // resolve relativo; validado no topo do loop
      continue
    }
    return res
  }
  throw new SsrfBlockedError('redirecionamentos_demais')
}
