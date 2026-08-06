// ============================================================
// ANCOREO — Domínio de publicação do site do cliente
// Gera o subdomínio legível (nome-do-negocio.ancoreo.com.br) na hora
// de publicar, no lugar do antigo fallback de UUID. A escolha de
// domínio próprio feita no onboarding (dominio_modo='tenho'/'proprio')
// continua registrada em onboarding_profiles e será ligada pela futura
// tela de Domínio/DNS; até lá todo site publica no subdomínio grátis,
// que resolve pelo wildcard *.ancoreo.com.br.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin'

export const PUBLISH_ROOT = 'ancoreo.com.br'

// Subdomínios que nunca podem virar site de cliente: colidem com o app,
// com convenções de infra/e-mail ou com a lista RESERVED da rota pública.
const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'api', 'painel', 'admin', 'mail', 'smtp', 'ftp', 'ns1', 'ns2',
  'blog', 'ajuda', 'suporte', 'status', 'cdn', 'assets', 'static', 'preview',
  'dev', 'staging', 'teste', 'localhost', 'ancoreo', 'vercel',
])

const MAX_SLUG = 32

// Conectivos que não podem sobrar na ponta do subdomínio depois do corte
// (ex.: "cleanup-higienizacao-e" -> "cleanup-higienizacao").
const TRAILING_STOPWORDS = new Set([
  'e', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'para', 'por', 'com',
])

/**
 * "Clínica Sorriso & Cia" -> "clinica-sorriso-cia" (DNS-safe).
 * Corta em limite de palavra: nome comprido vira prefixo legível, nunca
 * uma palavra partida no meio ("...impermeabilizac").
 */
export function slugifyBusinessName(name: string): string {
  const full = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let words = full.split('-').filter(Boolean)
  if (full.length > MAX_SLUG) {
    const kept: string[] = []
    let len = 0
    for (const w of words) {
      const next = len === 0 ? w.length : len + 1 + w.length
      if (next > MAX_SLUG) break
      kept.push(w)
      len = next
    }
    // Primeira palavra já maior que o limite: aí sim corta ela mesma.
    words = kept.length > 0 ? kept : [words[0]!.slice(0, MAX_SLUG)]
  }
  while (words.length > 1 && TRAILING_STOPWORDS.has(words[words.length - 1]!)) {
    words.pop()
  }
  return words.join('-')
}

/**
 * Devolve um domínio de publicação livre pro site: slug do nome do negócio;
 * se ocupado, tenta slug-2, slug-3…; último recurso é o prefixo do UUID
 * (comportamento antigo, mantido só como fallback). A checagem de ocupação
 * cruza TODOS os tenants, por isso usa o admin client — a RLS esconderia os
 * domínios alheios e a verificação passaria em falso. A trava real contra
 * corrida entre dois publishes simultâneos é o índice único sites_domain_key.
 */
export async function resolvePublishDomain(opts: {
  siteId: string
  businessName?: string | null
}): Promise<string> {
  const uuidFallback = `${opts.siteId.slice(0, 8)}.${PUBLISH_ROOT}`
  const base = slugifyBusinessName(opts.businessName ?? '')
  if (base.length < 3 || RESERVED_SUBDOMAINS.has(base)) return uuidFallback

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return uuidFallback // sem service_role no ambiente — degrada pro UUID
  }

  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`
    const domain = `${candidate}.${PUBLISH_ROOT}`
    const { data, error } = await admin
      .from('sites')
      .select('id')
      .eq('domain', domain)
      .maybeSingle()
    if (error) return uuidFallback
    if (!data || data.id === opts.siteId) return domain
  }
  return uuidFallback
}
