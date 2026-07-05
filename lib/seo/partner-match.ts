// ============================================================
// NV4 — Matching de PARCEIROS (triangulação de backlinks ENTRE clientes).
//
// Distinto de triangulation.ts (que liga artigos DO MESMO site). Aqui a
// afinidade é entre SITES de tenants DIFERENTES, calculada sobre as
// keywords/segment precomputados em partner_optin. Reutiliza extractKeywords
// e similarity de triangulation.ts — NÃO reimplementa similaridade.
//
// A leitura dos candidatos usa o client de SESSÃO (respeita RLS): a policy
// partner_optin_discover deixa ver os opt-ins habilitados dos outros tenants.
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractKeywords, similarity } from './triangulation'

// Perfil de um site no diretório de parceiros (linha de partner_optin).
export type PartnerProfile = {
  siteId: string
  tenantId: string
  segment: string | null
  keywords: string[]
  blurb: string | null
}

export type PartnerCandidate = PartnerProfile & {
  score: number // afinidade Jaccard [0..1], desc
}

/** Conjunto de keywords de um perfil (keywords[] + palavras do segment). */
function profileKeywords(p: Pick<PartnerProfile, 'keywords' | 'segment'>): Set<string> {
  const set = new Set<string>()
  for (const k of p.keywords ?? []) {
    const w = k.trim().toLowerCase()
    if (w) set.add(w)
  }
  // segment entra como texto livre passado pelo mesmo extrator (sem stopwords)
  if (p.segment) extractKeywords(p.segment, null).forEach(w => set.add(w))
  return set
}

/**
 * Ranqueia candidatos a parceiro pelo score de afinidade com `self`.
 * EXCLUI o próprio site e qualquer site em `excludeSiteIds` (parceiros já
 * ativos / já convidados). Score desc; empate mantém ordem estável.
 * Núcleo puro (testável sem banco).
 */
export function rankPartners(
  self: Pick<PartnerProfile, 'siteId' | 'keywords' | 'segment'>,
  candidates: PartnerProfile[],
  excludeSiteIds: Set<string> = new Set(),
): PartnerCandidate[] {
  const selfKw = profileKeywords(self)
  return candidates
    .filter(c => c.siteId !== self.siteId && !excludeSiteIds.has(c.siteId))
    .map(c => ({ ...c, score: similarity(selfKw, profileKeywords(c)) }))
    .sort((a, b) => b.score - a.score)
}

/**
 * Escolhe o TERCEIRO membro do anel: o candidato mais afim de AMBOS
 * (self=A e target=B), pra o triângulo fechar com boa relevância nos 3.
 * Combina os dois scores pela média (equilibra as duas pontas). Exclui A e B
 * e os já-excluídos. Retorna null se não sobrar ninguém.
 * Núcleo puro.
 */
export function pickThird(
  self: Pick<PartnerProfile, 'siteId' | 'keywords' | 'segment'>,
  target: Pick<PartnerProfile, 'siteId' | 'keywords' | 'segment'>,
  candidates: PartnerProfile[],
  excludeSiteIds: Set<string> = new Set(),
): PartnerCandidate | null {
  const selfKw = profileKeywords(self)
  const targetKw = profileKeywords(target)
  const exclude = new Set(excludeSiteIds)
  exclude.add(self.siteId)
  exclude.add(target.siteId)

  let best: PartnerCandidate | null = null
  for (const c of candidates) {
    if (exclude.has(c.siteId)) continue
    const kw = profileKeywords(c)
    const score = (similarity(selfKw, kw) + similarity(targetKw, kw)) / 2
    if (!best || score > best.score) best = { ...c, score }
  }
  return best
}

// ── Wrapper com banco (client de SESSÃO, respeita RLS) ──────────────────
export type RingPlan = {
  a: PartnerProfile // iniciador (dono logado)
  b: PartnerProfile // alvo escolhido
  c: PartnerCandidate // terceiro sugerido (mais afim de ambos)
}

/**
 * Lê o próprio opt-in + o diretório de parceiros descobríveis e devolve:
 *  - o perfil do próprio site (`self`);
 *  - candidatos ranqueados por afinidade (score desc), já excluindo o próprio
 *    site, os parceiros de anéis ativos e alvos já convidados/pendentes.
 *
 * Degrada sem quebrar se a migration não estiver aplicada (tabela ausente):
 * retorna estado vazio em vez de estourar 500.
 */
export async function loadPartnerSuggestions(
  supabase: SupabaseClient,
  args: { tenantId: string; siteId: string },
): Promise<{ self: PartnerProfile | null; candidates: PartnerCandidate[] }> {
  const { tenantId, siteId } = args

  try {
    // Perfil próprio (o dono lê o próprio via partner_optin_own).
    const { data: mineRow, error: mineErr } = await supabase
      .from('partner_optin')
      .select('site_id, tenant_id, segment, keywords, blurb')
      .eq('site_id', siteId)
      .maybeSingle()
    if (mineErr && isMissingRelation(mineErr)) return { self: null, candidates: [] }

    const self: PartnerProfile | null = mineRow
      ? {
          siteId: mineRow.site_id as string,
          tenantId: mineRow.tenant_id as string,
          segment: (mineRow.segment as string | null) ?? null,
          keywords: (mineRow.keywords as string[] | null) ?? [],
          blurb: (mineRow.blurb as string | null) ?? null,
        }
      : null

    if (!self) return { self: null, candidates: [] }

    // Diretório descobrível (partner_optin_discover: enabled = true).
    const { data: dirRows, error: dirErr } = await supabase
      .from('partner_optin')
      .select('site_id, tenant_id, segment, keywords, blurb')
      .eq('enabled', true)
    if (dirErr && isMissingRelation(dirErr)) return { self, candidates: [] }

    const candidates: PartnerProfile[] = (dirRows ?? [])
      .filter(r => r.tenant_id !== tenantId) // nunca sugere o próprio tenant
      .map(r => ({
        siteId: r.site_id as string,
        tenantId: r.tenant_id as string,
        segment: (r.segment as string | null) ?? null,
        keywords: (r.keywords as string[] | null) ?? [],
        blurb: (r.blurb as string | null) ?? null,
      }))

    // Exclusão: parceiros de anéis (qualquer status não-dissolvido) + convites
    // pendentes/aceitos partindo de mim (não re-sugerir quem já está no fluxo).
    const exclude = new Set<string>()

    const { data: rings, error: ringsErr } = await supabase
      .from('partner_rings')
      .select('site_a, site_b, site_c, tenant_a, tenant_b, tenant_c, status')
      .neq('status', 'dissolved')
    if (!(ringsErr && isMissingRelation(ringsErr))) {
      for (const r of rings ?? []) {
        // se EU sou membro deste anel, excluo os outros 2 sites
        const members = [
          { site: r.site_a as string, tenant: r.tenant_a as string },
          { site: r.site_b as string, tenant: r.tenant_b as string },
          { site: r.site_c as string, tenant: r.tenant_c as string },
        ]
        if (members.some(m => m.tenant === tenantId)) {
          for (const m of members) if (m.tenant !== tenantId) exclude.add(m.site)
        }
      }
    }

    const { data: reqs, error: reqErr } = await supabase
      .from('partner_requests')
      .select('to_site_id, from_tenant_id, status')
      .eq('from_tenant_id', tenantId)
      .in('status', ['pending', 'accepted'])
    if (!(reqErr && isMissingRelation(reqErr))) {
      for (const q of reqs ?? []) exclude.add(q.to_site_id as string)
    }

    return { self, candidates: rankPartners(self, candidates, exclude) }
  } catch {
    // Qualquer falha inesperada (inclui tabela ausente) → estado vazio.
    return { self: null, candidates: [] }
  }
}

/** Erro Postgres/PostgREST de "relation does not exist" (migration ausente). */
export function isMissingRelation(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null
  if (!e) return false
  // 42P01 = undefined_table (Postgres); PostgREST costuma mandar na message.
  return e.code === '42P01' || /does not exist|could not find the table|schema cache/i.test(e.message ?? '')
}
