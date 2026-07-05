// ============================================================
// Verificador de links quebrados — site publicado do cliente.
//
// Escaneia o conteúdo real do site (sections JSONB das páginas +
// HTML dos artigos do blog), extrai todos os <a href> / URLs e
// verifica cada um:
//
//  - link INTERNO (/, /blog/slug, /produto/slug…) → resolvido
//    contra o conjunto de rotas que existem de fato no banco
//    (determinístico, funciona até com site em rascunho);
//  - link EXTERNO (https://…) → fetch HEAD com fallback pra GET
//    (alguns servidores bloqueiam HEAD), timeout curto por link
//    e concorrência limitada — um link lento não trava o resto.
//
// Núcleo 100% puro + fetch nativo; nada persiste no banco. Roda
// sob demanda via GET /api/score/[siteId]/links.
// ============================================================

import { safeFetch, isSsrfBlocked } from '@/lib/net/safe-fetch'

// ── Tipos ────────────────────────────────────────────────────
export type ExtractedLink = {
  url: string   // href cru, como aparece no conteúdo
  page: string  // rótulo da página onde o link aparece (ex.: '/', '/blog/meu-post')
}

export type BrokenLink = {
  url: string
  page: string
  type: 'internal' | 'external'
  status: number | null // HTTP status (null = erro de rede/timeout/rota inexistente)
  error: string | null  // descrição curta do problema
}

export type LinkCheckReport = {
  pagesScanned: string[]
  totalLinks: number       // links verificáveis encontrados (após filtrar tel:, mailto:, #…)
  internalChecked: number
  externalChecked: number  // URLs externas ÚNICAS verificadas via HTTP
  broken: BrokenLink[]
  checkedAt: string
}

export const DEFAULT_TIMEOUT_MS = 5000
export const DEFAULT_CONCURRENCY = 5

// ── Extração: HTML (<a href>) ────────────────────────────────
/** Extrai todos os href de <a> num HTML (aspas simples ou duplas). */
export function extractLinksFromHtml(html: string): string[] {
  const out: string[] = []
  const re = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const href = (m[1] ?? m[2] ?? '').trim()
    if (href) out.push(href)
  }
  return out
}

// ── Extração: JSONB das sections ─────────────────────────────
const URL_KEY = /(href|url|link)/i

/**
 * Varre um JSON (content das sections) coletando strings que são
 * links: qualquer http(s)://… e caminhos absolutos ('/…') quando a
 * chave sugere link (href/url/link) — evita capturar slugs soltos.
 */
export function extractUrlsFromJson(value: unknown, keyHint = ''): string[] {
  if (typeof value === 'string') {
    const s = value.trim()
    if (/^https?:\/\//i.test(s)) return [s]
    if (s.startsWith('/') && URL_KEY.test(keyHint)) return [s]
    return []
  }
  if (Array.isArray(value)) {
    return value.flatMap(v => extractUrlsFromJson(v, keyHint))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([k, v]) => extractUrlsFromJson(v, k))
  }
  return []
}

// ── Classificação ────────────────────────────────────────────
export type ClassifiedLink =
  | { kind: 'skip' }
  | { kind: 'internal'; path: string }
  | { kind: 'external'; url: string }

const SKIP_SCHEMES = /^(mailto:|tel:|sms:|javascript:|data:|whatsapp:)/i

/** Normaliza caminho interno: remove query/hash e barra final (exceto raiz). */
export function normalizePath(path: string): string {
  let p = path.split(/[?#]/)[0] ?? ''
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p === '' ? '/' : p
}

function sameHost(hostname: string, siteDomain: string): boolean {
  const h = hostname.toLowerCase()
  const d = siteDomain.toLowerCase()
  return h === d || h === `www.${d}` || `www.${h}` === d
}

/**
 * Classifica um href cru: ignorável (âncora, tel:, mailto:…),
 * interno (caminho do próprio site) ou externo (URL absoluta).
 */
export function classifyLink(raw: string, siteDomain: string | null): ClassifiedLink {
  const href = raw.trim()
  if (!href || href.startsWith('#') || SKIP_SCHEMES.test(href)) return { kind: 'skip' }

  const absolute = href.startsWith('//') ? `https:${href}` : href
  if (/^https?:\/\//i.test(absolute)) {
    let parsed: URL
    try {
      parsed = new URL(absolute)
    } catch {
      return { kind: 'skip' } // href malformado não é verificável via HTTP
    }
    if (siteDomain && sameHost(parsed.hostname, siteDomain)) {
      return { kind: 'internal', path: normalizePath(parsed.pathname) }
    }
    return { kind: 'external', url: parsed.toString() }
  }

  if (href.startsWith('/')) return { kind: 'internal', path: normalizePath(href) }

  // Relativo sem barra (raro no conteúdo gerado) — trata como interno na raiz.
  return { kind: 'internal', path: normalizePath(`/${href}`) }
}

// ── Verificação HTTP (externos) ──────────────────────────────
export type UrlCheck = { ok: boolean; status: number | null; error: string | null }

const CHECKER_UA = 'ANCOREO-LinkChecker/1.0 (verificador de links; +https://ancoreo.com.br)'
const CHECKER_HEADERS = { 'User-Agent': CHECKER_UA, Accept: '*/*' }

function isAbort(e: unknown): boolean {
  return e instanceof Error && e.name === 'AbortError'
}

function errMsg(e: unknown): string {
  if (e instanceof Error) {
    const cause = (e as { cause?: { code?: string } }).cause
    return cause?.code ?? e.message ?? 'erro de rede'
  }
  return 'erro de rede'
}

/**
 * Verifica uma URL: HEAD primeiro; se o servidor não suporta/bloqueia
 * HEAD (405/501/403 ou erro), tenta GET uma vez. Timeout e erro de
 * rede contam como quebrado. Passa pelo safeFetch (guard anti-SSRF):
 * host interno / redirecionamento pra endereço interno é bloqueado, não
 * buscado — reportado como quebrado com motivo claro.
 */
export async function checkUrl(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<UrlCheck> {
  try {
    const res = await safeFetch(url, { method: 'HEAD', timeoutMs, headers: CHECKER_HEADERS })
    if (res.status < 400) return { ok: true, status: res.status, error: null }
    // 405/501 = HEAD não suportado; 403 costuma ser firewall anti-HEAD — reconfere com GET
    if (res.status !== 405 && res.status !== 501 && res.status !== 403) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` }
    }
  } catch (e) {
    if (isSsrfBlocked(e)) return { ok: false, status: null, error: 'endereço interno bloqueado' }
    if (isAbort(e)) return { ok: false, status: null, error: `timeout (${timeoutMs / 1000}s)` }
    // erro de rede no HEAD — ainda tenta GET (alguns hosts derrubam só o HEAD)
  }

  try {
    const res = await safeFetch(url, { method: 'GET', timeoutMs, headers: CHECKER_HEADERS })
    return {
      ok: res.status < 400,
      status: res.status,
      error: res.status >= 400 ? `HTTP ${res.status}` : null,
    }
  } catch (e) {
    if (isSsrfBlocked(e)) return { ok: false, status: null, error: 'endereço interno bloqueado' }
    if (isAbort(e)) return { ok: false, status: null, error: `timeout (${timeoutMs / 1000}s)` }
    return { ok: false, status: null, error: errMsg(e) }
  }
}

// ── Concorrência limitada ────────────────────────────────────
/** map assíncrono com no máximo `limit` execuções simultâneas. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i] as T)
    }
  })
  await Promise.all(workers)
  return results
}

// ── Orquestração ─────────────────────────────────────────────
export type CheckSiteLinksInput = {
  links: ExtractedLink[]
  siteDomain: string | null
  /** Caminhos internos que existem de fato (já normalizados): '/', '/blog', '/blog/slug'… */
  knownInternalPaths: Set<string>
  timeoutMs?: number
  concurrency?: number
}

/**
 * Verifica todos os links extraídos de um site.
 * Internos: resolvidos contra knownInternalPaths (sem HTTP).
 * Externos: deduplicados por URL e verificados em paralelo limitado.
 */
export async function checkSiteLinks(input: CheckSiteLinksInput): Promise<LinkCheckReport> {
  const {
    links,
    siteDomain,
    knownInternalPaths,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    concurrency = DEFAULT_CONCURRENCY,
  } = input

  const broken: BrokenLink[] = []
  const internal: { link: ExtractedLink; path: string }[] = []
  const external: { link: ExtractedLink; url: string }[] = []

  for (const link of links) {
    const c = classifyLink(link.url, siteDomain)
    if (c.kind === 'internal') internal.push({ link, path: c.path })
    else if (c.kind === 'external') external.push({ link, url: c.url })
  }

  // Internos: existência da rota no próprio site
  for (const { link, path } of internal) {
    if (!knownInternalPaths.has(path)) {
      broken.push({
        url: link.url,
        page: link.page,
        type: 'internal',
        status: null,
        error: 'página interna inexistente',
      })
    }
  }

  // Externos: verifica cada URL única uma vez só
  const uniqueUrls = Array.from(new Set(external.map(e => e.url)))
  const checks = await mapWithConcurrency(uniqueUrls, concurrency, url => checkUrl(url, timeoutMs))
  const byUrl = new Map<string, UrlCheck>()
  uniqueUrls.forEach((url, i) => {
    const check = checks[i]
    if (check) byUrl.set(url, check)
  })

  for (const { link, url } of external) {
    const check = byUrl.get(url)
    if (check && !check.ok) {
      broken.push({
        url: link.url,
        page: link.page,
        type: 'external',
        status: check.status,
        error: check.error,
      })
    }
  }

  return {
    pagesScanned: Array.from(new Set(links.map(l => l.page))),
    totalLinks: internal.length + external.length,
    internalChecked: internal.length,
    externalChecked: uniqueUrls.length,
    broken,
    checkedAt: new Date().toISOString(),
  }
}
