// NV4 — GET /api/partners/suggestions?site_id= — candidatos a parceiro
// ranqueados por afinidade (partner-match). Client de SESSÃO (RLS):
// partner_optin_discover deixa ler o diretório dos outros tenants.
//
// Segurança: auth + ownership do site_id. Tolera migration ausente (retorna
// lista vazia, nunca 500).
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { loadPartnerSuggestions } from '@/lib/seo/partner-match'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return bad('unauthorized', 401)

  const siteId = (req.nextUrl.searchParams.get('site_id') ?? '').trim()
  if (!UUID_RE.test(siteId)) return bad('invalid_site')

  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = me?.tenant_id as string | undefined
  if (!tenantId) return bad('no_tenant', 403)

  // OWNERSHIP: o site tem que ser do tenant logado.
  const { data: site } = await supabase
    .from('sites')
    .select('id, tenant_id')
    .eq('id', siteId)
    .maybeSingle()
  if (!site || site.tenant_id !== tenantId) return bad('forbidden', 403)

  const { self, candidates } = await loadPartnerSuggestions(supabase, { tenantId, siteId })

  return NextResponse.json({
    ok: true,
    optedIn: Boolean(self),
    candidates: candidates.slice(0, 20).map(c => ({
      site_id: c.siteId,
      segment: c.segment,
      blurb: c.blurb,
      score: Math.round(c.score * 100),
    })),
  })
}
