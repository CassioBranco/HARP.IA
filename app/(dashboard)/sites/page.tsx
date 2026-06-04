import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

type SiteRow = {
  id: string
  domain: string | null
  preset: string | null
  palette_index: number
  status: 'draft' | 'published' | 'archived'
  created_at: string
}

type OnboardingRow = {
  completeness_score: number
  business_name: string | null
  niche: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRESET_LABELS: Record<string, string> = {
  advocacia:     'Advocacia',
  contabilidade: 'Contabilidade',
  psicologia:    'Psicologia',
  clinica:       'Clínica',
  odontologia:   'Odontologia',
  fisioterapia:  'Fisioterapia',
  veterinaria:   'Veterinária',
  imobiliaria:   'Imobiliária',
  restaurante:   'Restaurante',
  salao:         'Salão',
  escola:        'Escola',
  servicos:      'Serviços',
  institucional: 'Institucional',
  landing:       'Landing Page',
}

const PRESET_ICONS: Record<string, string> = {
  advocacia:     '⚖️',
  contabilidade: '📊',
  psicologia:    '🧠',
  clinica:       '🏥',
  odontologia:   '🦷',
  fisioterapia:  '🏃',
  veterinaria:   '🐾',
  imobiliaria:   '🏠',
  restaurante:   '🍽️',
  salao:         '✂️',
  escola:        '🎓',
  servicos:      '🔧',
  institucional: '🏢',
  landing:       '🚀',
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Rascunho',  cls: 'bg-muted text-muted-foreground' },
  published: { label: 'Publicado', cls: 'bg-primary/10 text-primary' },
  archived:  { label: 'Arquivado', cls: 'bg-destructive/10 text-destructive' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Componentes
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-primary bg-primary/10' :
    score >= 50 ? 'text-accent-foreground bg-accent/15' :
    'text-muted-foreground bg-muted'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {score}%
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
        🌐
      </div>
      <h2 className="font-heading mb-2 text-2xl font-bold text-foreground">
        Seu primeiro site está a 10 minutos
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Responda 6 perguntas sobre o negócio. A IA escreve todos os textos
        otimizados para SEO, GEO e AEO. Você só escolhe o visual e publica.
      </p>
      <Link
        href="/onboarding"
        className="rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        Criar meu site agora
      </Link>
      <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-left">
        {[
          { icon: '⚡', title: '10 minutos', desc: 'Do zero ao site pronto' },
          { icon: '🎯', title: 'SEO nativo', desc: 'Google + IA generativas' },
          { icon: '✍️', title: 'Zero escrita', desc: 'A IA faz os textos' },
        ].map(item => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-2xl">{item.icon}</div>
            <div className="text-sm font-semibold text-foreground">{item.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OnboardingBanner({ profile }: { profile: OnboardingRow }) {
  if (profile.completeness_score >= 70) return null
  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/8 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Onboarding incompleto — {profile.completeness_score}%
          </p>
          <p className="text-xs text-muted-foreground">
            Precisa de 70% para gerar o site. Faltam {70 - profile.completeness_score}%.
          </p>
        </div>
      </div>
      <Link
        href="/onboarding"
        className="shrink-0 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90"
      >
        Continuar onboarding
      </Link>
    </div>
  )
}

function SiteCard({ site }: { site: SiteRow }) {
  const status =
    STATUS_LABELS[site.status] ??
    ({ label: 'Rascunho', cls: 'bg-muted text-muted-foreground' } as const)
  const icon = site.preset ? (PRESET_ICONS[site.preset] ?? '🌐') : '🌐'
  const label = site.preset ? (PRESET_LABELS[site.preset] ?? site.preset) : 'Site'

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Preview placeholder */}
      <div className="flex h-36 items-center justify-center rounded-t-xl bg-muted/60 text-5xl">
        {icon}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-heading text-sm font-semibold text-foreground leading-tight">
            {site.domain ?? 'Domínio não configurado'}
          </h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>
            {status.label}
          </span>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">
          {label} · criado em {formatDate(site.created_at)}
        </p>

        {/* Ações */}
        <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
          <Link
            href={`/editor?site=${site.id}`}
            className="flex-1 rounded-md border border-border py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Editar
          </Link>
          <Link
            href={`/blog?site=${site.id}`}
            className="flex-1 rounded-md border border-border py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Blog
          </Link>
          <Link
            href={`/preview/${site.id}`}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            title="Pré-visualizar site"
          >
            👁
          </Link>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function SitesPage() {
  // Auth check
  if (!hasSupabaseEnv()) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Variáveis de ambiente Supabase não configuradas. Preencha <code>.env.local</code>.
      </div>
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca sites e onboarding em paralelo
  const [sitesRes, onboardingRes] = await Promise.all([
    supabase
      .from('sites')
      .select('id, domain, preset, palette_index, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('onboarding_profiles')
      .select('completeness_score, business_name, niche')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const sites = (sitesRes.data ?? []) as SiteRow[]
  const profile = onboardingRes.data as OnboardingRow | null
  const hasSites = sites.length > 0

  const businessName = profile?.business_name
  const greeting = businessName ? `Olá, ${businessName.split(' ')[0]}` : 'Bem-vindo'

  return (
    <div>
      {/* Header da página */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {greeting} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasSites
              ? `${sites.length} site${sites.length > 1 ? 's' : ''} no seu painel`
              : 'Crie seu primeiro site abaixo'}
          </p>
        </div>

        {hasSites && (
          <Link
            href="/onboarding"
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Novo site
          </Link>
        )}
      </div>

      {/* Banner onboarding incompleto */}
      {profile && <OnboardingBanner profile={profile} />}

      {/* Conteúdo principal */}
      {!hasSites ? (
        <EmptyState />
      ) : (
        <>
          {/* Cards de sites */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map(site => (
              <SiteCard key={site.id} site={site} />
            ))}

            {/* Card "adicionar site" */}
            <Link
              href="/onboarding"
              className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card text-center text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <span className="text-3xl">+</span>
              <span className="text-sm font-medium">Adicionar site</span>
            </Link>
          </div>

          {/* Seção de próximos passos */}
          <div className="mt-10">
            <h2 className="font-heading mb-4 text-base font-semibold text-foreground">
              O que fazer agora
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: '🎨',
                  title: 'Personalizar o visual',
                  desc: 'Troque a paleta de cores, imagens e ajuste textos no editor.',
                  href: '/editor',
                  cta: 'Abrir editor',
                },
                {
                  icon: '✍️',
                  title: 'Publicar um artigo',
                  desc: 'Cada post indexado é mais uma chance de aparecer na busca.',
                  href: '/blog',
                  cta: 'Ir para o Blog',
                },
                {
                  icon: '📊',
                  title: 'Ver score SEO/GEO/AEO',
                  desc: 'Saiba o quanto seu site está pronto para ser citado pelas IAs.',
                  href: '/sites',
                  cta: 'Ver score',
                },
              ].map(item => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-3 text-2xl">{item.icon}</div>
                  <h3 className="font-heading mb-1 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                  <Link
                    href={item.href}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {item.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
