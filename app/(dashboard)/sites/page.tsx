// ============================================================
// HARPIA — /sites = "Meus sites" (Fase 5). Visual = protótipo dashboard.html.
// Server component: dados reais (sites do tenant + onboarding).
// ============================================================
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { getPalette } from '@/lib/templates/palettes'

export const dynamic = 'force-dynamic'

type SiteRow = {
  id: string
  domain: string | null
  preset: string | null
  niche: string | null
  palette: { colors?: string[] } | null
  status: 'draft' | 'published' | 'archived'
  created_at: string
}

type OnboardingRow = {
  completeness_score: number
  business_name: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function shade(hex: string, f = 0.45): string {
  const h = hex.replace('#', '')
  if (h.length < 6) return hex
  const n = [0, 2, 4].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - f)))
  return '#' + n.map(x => x.toString(16).padStart(2, '0')).join('')
}

// Gradiente da capa do card, derivado da paleta/nicho (sem assets do protótipo).
function thumbStyle(site: SiteRow): React.CSSProperties {
  const fromPalette = site.palette?.colors?.[0]
  const base = fromPalette ?? getPalette(site.niche ?? site.preset ?? 'servicos', 0).primary
  return { backgroundImage: `linear-gradient(150deg, ${base}, ${shade(base)})` }
}

export default async function SitesPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="glass" style={{ padding: '1.4rem', color: '#fcd581' }}>
        Variáveis de ambiente Supabase não configuradas. Preencha <code>.env.local</code>.
      </div>
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [sitesRes, onboardingRes] = await Promise.all([
    supabase
      .from('sites')
      .select('id, domain, preset, niche, palette, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('onboarding_profiles')
      .select('completeness_score, business_name')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const sites = (sitesRes.data ?? []) as SiteRow[]
  const profile = onboardingRes.data as OnboardingRow | null
  const hasSites = sites.length > 0
  const businessName = profile?.business_name
  const greeting = businessName ? `Olá, ${businessName.split(' ')[0]} 👋` : 'Bem-vindo 👋'

  return (
    <>
      <div className="topbar">
        <div>
          <h1>{greeting}</h1>
          <div className="sub">
            {hasSites
              ? `Você tem ${sites.length} site${sites.length > 1 ? 's' : ''} no seu painel`
              : 'Crie seu primeiro site abaixo'}
          </div>
        </div>
        {hasSites && (
          <Link className="btn lg" href="/onboarding"><i className="ph-fill ph-plus" /> Novo site</Link>
        )}
      </div>

      {/* Banner onboarding incompleto */}
      {profile && profile.completeness_score < 70 && (
        <div className="banner">
          <span className="ic"><i className="ph-fill ph-warning" /></span>
          <div>
            <b>Onboarding em {profile.completeness_score}%</b>
            <p>Precisa de 70% para gerar o site. Faltam {70 - profile.completeness_score}%.</p>
          </div>
          <Link className="btn amber sm" href="/onboarding">Continuar</Link>
        </div>
      )}

      {!hasSites ? (
        <div className="empty-hero">
          <div className="bigic"><i className="ph-fill ph-globe-hemisphere-west" /></div>
          <h2>Seu primeiro site está a 10 minutos</h2>
          <p>Responda algumas perguntas sobre o negócio. A IA escreve todos os textos otimizados para SEO, GEO e AEO. Você só escolhe o visual e publica.</p>
          <Link className="btn lg" href="/onboarding"><i className="ph-fill ph-rocket-launch" /> Criar meu site agora</Link>
        </div>
      ) : (
        <div className="grid">
          {sites.map(site => {
            const published = site.status === 'published'
            const draft = site.status === 'draft'
            return (
              <article className="glass sitecard" key={site.id}>
                <div className="thumb" style={thumbStyle(site)}>
                  {published ? (
                    <span className="badge ok"><i className="ph-fill ph-check-circle" /> Publicado</span>
                  ) : draft ? (
                    <span className="badge warn"><i className="ph-fill ph-pencil" /> Rascunho</span>
                  ) : (
                    <span className="badge muted"><i className="ph-fill ph-archive" /> Arquivado</span>
                  )}
                  <b>{businessName ?? site.domain ?? 'Meu site'}</b>
                </div>
                <div className="body">
                  <div className="row1">
                    <span className="dom">{site.domain ?? 'Domínio não configurado'}</span>
                  </div>
                  <div className="acts">
                    <Link className="btn glass sm" href={`/editor/${site.id}`}>
                      <i className="ph-fill ph-pencil-simple" /> Editar
                    </Link>
                    {published ? (
                      <Link className="btn glass sm" href={`/preview/${site.id}`}>
                        <i className="ph-fill ph-arrow-square-out" /> Abrir
                      </Link>
                    ) : (
                      <Link className="btn sm" href={`/editor/${site.id}`}>
                        <i className="ph-fill ph-rocket-launch" /> Publicar
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            )
          })}

          <Link className="newcard" href="/onboarding">
            <span className="plus"><i className="ph-fill ph-plus" /></span>
            <span style={{ fontWeight: 600 }}>Criar novo site</span>
          </Link>
        </div>
      )}
    </>
  )
}
