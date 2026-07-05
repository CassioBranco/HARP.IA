// NV4 — Liga/desliga o opt-in do site do dono no programa de Parcerias e
// grava segment/keywords/blurb. Client de SESSÃO (respeita RLS): a policy
// partner_optin_own só deixa o dono escrever o próprio tenant.
//
// Segurança: auth obrigatória + OWNERSHIP do site (o site_id tem que
// pertencer ao tenant logado; a RLS de `sites` já recorta, mas conferimos
// explicitamente). Tolera migration ausente (partner_optin) sem 500.
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { extractKeywords } from '@/lib/seo/triangulation'
import { isMissingRelation } from '@/lib/seo/partner-match'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return bad('unauthorized', 401)

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return bad('invalid_json')
  }

  const siteId = typeof payload.site_id === 'string' ? payload.site_id.trim() : ''
  if (!UUID_RE.test(siteId)) return bad('invalid_site')
  const enabled = payload.enabled !== false // default liga
  const blurb = typeof payload.blurb === 'string' ? payload.blurb.trim().slice(0, 280) : null

  // tenant do usuário
  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = me?.tenant_id as string | undefined
  if (!tenantId) return bad('no_tenant', 403)

  // OWNERSHIP: o site precisa ser do tenant logado (RLS de sites recorta;
  // conferimos aqui pra devolver 403 explícito em vez de gravar errado).
  const { data: site } = await supabase
    .from('sites')
    .select('id, tenant_id')
    .eq('id', siteId)
    .maybeSingle()
  if (!site || site.tenant_id !== tenantId) return bad('forbidden', 403)

  // segment do onboarding + keywords precomputadas dos posts publicados.
  const { data: prof } = await supabase
    .from('onboarding_profiles')
    .select('segment, business_name')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const segment = (prof?.segment as string | null) ?? null

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, meta_description')
    .eq('site_id', siteId)
    .eq('status', 'published')

  const kwSet = new Set<string>()
  if (segment) extractKeywords(segment, null).forEach(w => kwSet.add(w))
  if (prof?.business_name) extractKeywords(String(prof.business_name), null).forEach(w => kwSet.add(w))
  for (const p of posts ?? []) {
    extractKeywords(String(p.title ?? ''), (p.meta_description as string | null) ?? null).forEach(w => kwSet.add(w))
  }
  const keywords = Array.from(kwSet).slice(0, 60)

  try {
    // upsert por site_id (partner_optin.site_id é UNIQUE)
    const { error } = await supabase
      .from('partner_optin')
      .upsert(
        {
          tenant_id: tenantId,
          site_id: siteId,
          enabled,
          segment,
          keywords,
          blurb,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'site_id' },
      )
    if (error) {
      if (isMissingRelation(error)) return bad('feature_unavailable', 503)
      return bad('save_failed', 500)
    }
  } catch (err) {
    if (isMissingRelation(err)) return bad('feature_unavailable', 503)
    return bad('save_failed', 500)
  }

  return NextResponse.json({ ok: true, enabled, keywords_count: keywords.length })
}
