'use server'

// ============================================================
// HARPIA — Server actions do onboarding v2
// O front (protótipo) chama saveOnboardingProfile() debounced a cada
// mudança. A persistência, auth e cálculo de completude vivem aqui.
// ============================================================

import { createServerClient } from '@/lib/supabase/server'
import {
  type OnboardingProfileInput,
  type SaveResult,
  COMPLETENESS_FIELDS,
} from './types'

// Completude 0–100: % dos campos-chave preenchidos. Libera geração ≥ 70%.
function calcCompleteness(input: OnboardingProfileInput): number {
  const total = COMPLETENESS_FIELDS.length
  let filled = 0
  for (const key of COMPLETENESS_FIELDS) {
    const v = input[key]
    if (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== '') {
      filled++
    }
  }
  return Math.round((filled / total) * 100)
}

// Remove chaves undefined pra não sobrescrever colunas no update parcial.
function pruneUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k as keyof T] = v as T[keyof T]
  }
  return out
}

/**
 * Salva (cria ou atualiza) o perfil de onboarding do usuário logado.
 * Passe `id` quando já souber o perfil; senão, reaproveita o mais recente
 * ou cria um novo. Retorna o id e a completude pra UI mostrar o medidor.
 */
export async function saveOnboardingProfile(
  input: OnboardingProfileInput & { id?: string }
): Promise<SaveResult> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id ?? null

  const { id, ...fields } = input
  const completeness = calcCompleteness(fields)

  const payload = {
    ...pruneUndefined(fields as Record<string, unknown>),
    tenant_id: tenantId,
    completeness_score: completeness,
    updated_at: new Date().toISOString(),
  }

  // 1. id conhecido → update direto
  if (id) {
    const { error } = await supabase
      .from('onboarding_profiles')
      .update(payload)
      .eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true, id, completeness }
  }

  // 2. sem id → reaproveita o perfil mais recente do usuário (RLS garante posse)
  const { data: existing } = await supabase
    .from('onboarding_profiles')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)

  if (existing && existing.length > 0 && existing[0]) {
    const eid = existing[0].id as string
    const { error } = await supabase
      .from('onboarding_profiles')
      .update(payload)
      .eq('id', eid)
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: eid, completeness }
  }

  // 3. nenhum perfil ainda → cria
  const { data: inserted, error } = await supabase
    .from('onboarding_profiles')
    .insert(payload)
    .select('id')
    .single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, id: inserted.id as string, completeness }
}

export interface StartGenerationResult {
  ok: boolean
  site_id?: string
  error?: string
}

/**
 * Tela 7 — "Gerar meu site". Cria o site (a partir do objetivo/segmento +
 * paleta do perfil), vincula o perfil e devolve o site_id. O front então
 * abre o stream SSE em POST /api/generate/site com esse site_id.
 * Guardrail: completude ≥ 70%.
 */
export async function createSiteFromProfile(): Promise<StartGenerationResult> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenants(sites_allowed)')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id
  if (!tenantId) return { ok: false, error: 'tenant_not_found' }

  // Perfil mais recente do usuário
  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('id, site_id, profissao, niche, setor, completeness_score, paleta')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!profile) return { ok: false, error: 'profile_not_found' }
  if ((profile.completeness_score ?? 0) < 70) {
    return { ok: false, error: 'incomplete' }
  }

  // Já tem site vinculado → reaproveita (idempotente, não conta no limite)
  if (profile.site_id) return { ok: true, site_id: profile.site_id as string }

  // Regra de negócio: 1 site por assinatura (+ add-ons em sites_allowed).
  // Pré-checagem pra dar mensagem amigável; o trigger no banco é a trava real.
  const allowed = (userData?.tenants as unknown as { sites_allowed?: number } | null)?.sites_allowed ?? 1
  const { count: siteCount } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
  if ((siteCount ?? 0) >= allowed) {
    return { ok: false, error: 'site_limit' }
  }

  const presetKey = profile.profissao ?? profile.niche ?? profile.setor ?? 'generico'

  const { data: site, error: siteErr } = await supabase
    .from('sites')
    .insert({
      tenant_id: tenantId,
      preset: presetKey,
      niche: presetKey,
      palette_index: 0,
      template: 'Clean',
      status: 'draft',
    })
    .select('id')
    .single()

  if (siteErr || !site) {
    // Trigger do banco bloqueou por limite de assinatura
    if (siteErr?.message?.includes('site_limit_reached')) {
      return { ok: false, error: 'site_limit' }
    }
    return { ok: false, error: siteErr?.message ?? 'site_create_failed' }
  }

  await supabase
    .from('onboarding_profiles')
    .update({ site_id: site.id })
    .eq('id', profile.id)

  return { ok: true, site_id: site.id as string }
}

export interface CreateSiteWithModelInput {
  layout: string                 // slug do modelo (clean, bold, ...). Vira sites.template
  paletteName?: string | null    // nome legível ("Teal", "Personalizada", "Original")
  colors?: string[] | null       // [sp,ss,sa,sb,sf,st,sm]; null = default do template
  group?: string | null          // grupo da paleta (Frias/Quentes/...), só p/ registro
}

export interface CreateSiteWithModelResult {
  ok: boolean
  site_id?: string
  error?: string
}

/**
 * Tela "escolher-modelo" — cria o site com o modelo (layout) e a paleta
 * escolhidos, vincula o perfil de onboarding e devolve o site_id pro editor.
 * Respeita a regra de 1 site por assinatura (trigger no banco é a trava real).
 * Idempotente: se o perfil já tem site, reaproveita e só atualiza modelo/paleta.
 */
export async function createSiteWithModel(
  input: CreateSiteWithModelInput
): Promise<CreateSiteWithModelResult> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenants(sites_allowed)')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id
  if (!tenantId) return { ok: false, error: 'tenant_not_found' }

  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('id, site_id, profissao, niche, setor')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Paleta: guarda objeto { name, group, colors } ou null (= default do template)
  const colors = input.colors && input.colors.length >= 7 ? input.colors.slice(0, 7) : null
  const paletteJson = colors
    ? { name: input.paletteName ?? null, group: input.group ?? null, colors }
    : null
  const paletteName = input.paletteName ?? (colors ? null : 'Original')
  const template = input.layout || 'clean'

  // Perfil já tem site → atualiza modelo/paleta e reaproveita (não conta no limite)
  if (profile?.site_id) {
    const { error } = await supabase
      .from('sites')
      .update({ template, palette: paletteJson, palette_name: paletteName })
      .eq('id', profile.site_id)
      .eq('tenant_id', tenantId)
    if (error) return { ok: false, error: error.message }
    return { ok: true, site_id: profile.site_id as string }
  }

  // Regra de negócio: 1 site por assinatura (+ add-ons em sites_allowed).
  const allowed = (userData?.tenants as unknown as { sites_allowed?: number } | null)?.sites_allowed ?? 1
  const { count: siteCount } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
  if ((siteCount ?? 0) >= allowed) {
    return { ok: false, error: 'site_limit' }
  }

  const presetKey = profile?.profissao ?? profile?.niche ?? profile?.setor ?? 'servicos'

  const { data: site, error: siteErr } = await supabase
    .from('sites')
    .insert({
      tenant_id: tenantId,
      preset: presetKey,
      niche: presetKey,
      palette_index: 0,
      palette: paletteJson,
      palette_name: paletteName,
      template,
      status: 'draft',
    })
    .select('id')
    .single()

  if (siteErr || !site) {
    if (siteErr?.message?.includes('site_limit_reached')) {
      return { ok: false, error: 'site_limit' }
    }
    return { ok: false, error: siteErr?.message ?? 'site_create_failed' }
  }

  if (profile?.id) {
    await supabase
      .from('onboarding_profiles')
      .update({ site_id: site.id })
      .eq('id', profile.id)
  }

  return { ok: true, site_id: site.id as string }
}
