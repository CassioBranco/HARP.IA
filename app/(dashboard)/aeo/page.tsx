// ============================================================
// ANCOREO — /aeo = "Painel AEO" (visibilidade da marca nas IAs).
// Server component: auth real + site do tenant (via RLS). As
// métricas de citação vêm de lib/aeo/visibility (DEMONSTRAÇÃO)
// até o pipeline de tracking existir — marcado com selo "amostra".
// ============================================================
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { getAiVisibility, type ActionCta, type CitationStatus } from '@/lib/aeo/visibility'
import './aeo.css'

export const dynamic = 'force-dynamic'

type SiteRow = {
  id: string
  domain: string | null
  niche: string | null
  status: 'draft' | 'published' | 'archived'
}
type OnboardingRow = { business_name: string | null }

const STAT_CLASS: Record<CitationStatus, string> = { cited: 'win', partial: 'part', absent: 'miss' }
const STAT_LABEL: Record<CitationStatus, string> = { cited: 'Citado', partial: 'Parcial', absent: 'Ausente' }
const CTA_LABEL: Record<ActionCta, string> = { generate: 'Gerar com IA', apply: 'Aplicar', howto: 'Como fazer' }

function fmt(n: number) {
  return n.toLocaleString('pt-BR')
}

// Polyline (com área) da série do score, num viewBox 460x96.
function trendPaths(trend: number[]) {
  const W = 460, H = 96, pad = 6, top = 12, bottom = 84
  const safe = trend.length ? trend : [0, 0]
  const min = Math.min(...safe), max = Math.max(...safe)
  const span = Math.max(1, max - min)
  const stepX = (W - pad * 2) / Math.max(1, safe.length - 1)
  const pts = safe.map((v, i) => {
    const x = pad + i * stepX
    const y = bottom - ((v - min) / span) * (bottom - top)
    return [Math.round(x), Math.round(y)] as [number, number]
  })
  const first = pts[0] ?? [pad, bottom]
  const last = pts[pts.length - 1] ?? first
  const line = pts.map(p => `${p[0]},${p[1]}`).join(' ')
  const area = `${line} ${last[0]},${H - 6} ${first[0]},${H - 6}`
  return { line, area, last }
}

export default async function AeoPage() {
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

  const [siteRes, profRes] = await Promise.all([
    supabase
      .from('sites')
      .select('id, domain, niche, status')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('onboarding_profiles')
      .select('business_name')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const site = siteRes.data as SiteRow | null
  const bizName = (profRes.data as OnboardingRow | null)?.business_name ?? undefined

  // Sem site ainda → nada pra medir.
  if (!site) {
    return (
      <>
        <div className="topbar">
          <div>
            <h1>Painel AEO</h1>
            <div className="sub">Visibilidade da sua marca nas respostas de IA</div>
          </div>
        </div>
        <div className="empty-hero">
          <div className="bigic"><i className="ph-fill ph-sparkle" /></div>
          <h2>Crie um site para começar a medir</h2>
          <p>
            O Painel AEO acompanha quanto o ChatGPT, o Gemini e o AI Mode do Google citam a sua marca.
            Assim que você publicar um site, os números aparecem aqui.
          </p>
          <Link className="btn lg" href="/onboarding">
            <i className="ph-fill ph-rocket-launch" /> Criar meu site
          </Link>
        </div>
      </>
    )
  }

  const v = getAiVisibility(site.id, bizName)
  const CIRC = 2 * Math.PI * 50
  const ringOffset = CIRC * (1 - v.score / 100)
  const tp = trendPaths(v.trend)
  const rivalAvg = Math.round(
    v.competitors.filter(c => !c.you).reduce((s, c) => s + c.score, 0) /
    Math.max(1, v.competitors.filter(c => !c.you).length),
  )

  return (
    <div className="aeo">
      <div className="topbar">
        <div>
          <h1>Painel AEO</h1>
          <div className="sub">
            <span className="aeo-pill"><i className="ph-fill ph-sparkle" /> Diferencial ANCOREO</span>
            {' '}Quanto o ChatGPT, o Gemini e o AI Mode citam a sua marca
          </div>
        </div>
        {v.isSample && (
          <span className="aeo-sample" title="Dados de demonstração — o monitoramento real entra quando o site tiver histórico">
            <i className="ph-fill ph-flask" /> amostra
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="aeo-kpis">
        <div className="aeo-card aeo-kpi">
          <div className="lab">SCORE DE VISIBILIDADE IA</div>
          <div className="big">{v.score}<span>/100</span></div>
          <div className={`delta ${v.scoreDelta >= 0 ? 'up' : 'down'}`}>
            {v.scoreDelta >= 0 ? '▲' : '▼'} {Math.abs(v.scoreDelta)} pts em 30 dias
          </div>
        </div>
        <div className="aeo-card aeo-kpi">
          <div className="lab">CITAÇÕES DA MARCA</div>
          <div className="big">{fmt(v.brandCitations)}</div>
          <div className={`delta ${v.citationsDelta >= 0 ? 'up' : 'down'}`}>
            {v.citationsDelta >= 0 ? '▲' : '▼'} {Math.abs(v.citationsDelta)} esta semana
          </div>
        </div>
        <div className="aeo-card aeo-kpi">
          <div className="lab">VISITAS DE BOTS DE IA</div>
          <div className="big">{fmt(v.botVisitsTotal)}</div>
          <div className={`delta ${v.botVisitsDelta >= 0 ? 'up' : 'down'}`}>
            {v.botVisitsDelta >= 0 ? '▲' : '▼'} {Math.abs(v.botVisitsDelta)}% vs. semana anterior
          </div>
        </div>
      </div>

      {/* trend + per-engine */}
      <div className="aeo-band">
        <div className="aeo-card aeo-trend">
          <div className="head">
            <h3>Evolução do score de IA</h3>
            <span className="rng">últimos 90 dias</span>
            <span className={`delta ${v.scoreDelta >= 0 ? 'up' : 'down'}`} style={{ marginLeft: 'auto' }}>
              {v.scoreDelta >= 0 ? '▲' : '▼'} {Math.abs(v.scoreDelta)} pts
            </span>
          </div>
          <svg viewBox="0 0 460 96" width="100%" height={92} preserveAspectRatio="none"
            role="img" aria-label={`Score de IA variando de ${v.trend[0]} a ${v.trend[v.trend.length - 1]}`}>
            <defs>
              <linearGradient id="aeoTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--navy)" stopOpacity="0.24" />
                <stop offset="1" stopColor="var(--navy)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon fill="url(#aeoTrend)" points={tp.area} />
            <polyline fill="none" stroke="var(--navy)" strokeWidth={2.5} strokeLinecap="round"
              strokeLinejoin="round" points={tp.line} />
            <circle cx={tp.last[0]} cy={tp.last[1]} r={4.5} fill="var(--navy)" />
          </svg>
          <div className="axis">
            <span>{v.trend[0]}</span><span>90 dias</span><span>hoje · {v.score}</span>
          </div>
        </div>

        <div className="aeo-card aeo-engines">
          <h3>Onde você é citado</h3>
          <p>% de respostas em que a marca aparece</p>
          {v.engines.map(e => (
            <div className="crow" key={e.engine}>
              <span className="cname">{e.engine}</span>
              <span className="bar"><i style={{ width: `${e.pct}%` }} /></span>
              <span className="cval">{e.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* main grid */}
      <div className="aeo-grid">
        {/* monitored prompts */}
        <div className="aeo-card aeo-prompts">
          <div className="ph">
            <h3>Perguntas monitoradas</h3>
            <span className="aeo-pill" style={{ marginLeft: 'auto' }}>{v.promptsUsed} de {v.promptsLimit}</span>
          </div>
          <p className="desc">Prompts reais que seus clientes fazem às IAs. O painel checa se a sua marca aparece na resposta.</p>
          {v.prompts.map(p => (
            <div className="aeo-row" key={p.id}>
              <div className="qtext">
                {p.prompt}
                <small>{p.engines.join(' · ')}</small>
              </div>
              <span className={`aeo-stat ${STAT_CLASS[p.status]}`}>{STAT_LABEL[p.status]}</span>
            </div>
          ))}
          <div className="aeo-lock">
            <i className="ph-fill ph-lock-simple" />
            <span><b>{v.promptsLimit - v.promptsUsed} prompts a mais</b> e checagem diária no plano Agência.</span>
            <Link className="btn sm" href="/settings"><i className="ph-fill ph-crown-simple" /> Ver planos</Link>
          </div>
        </div>

        {/* right column */}
        <div className="aeo-col">
          <div className="aeo-card aeo-ring">
            <svg viewBox="0 0 120 120" role="img" aria-label={`Score ${v.score} de 100`}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--line)" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--navy)" strokeWidth="12"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={ringOffset}
                transform="rotate(-90 60 60)" />
              <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)">{v.score}</text>
              <text x="60" y="76" textAnchor="middle" fontSize="10" fill="var(--muted)">de 100</text>
            </svg>
            <div>
              <div className="kick">Como você está</div>
              <div className="h">{v.score >= rivalAvg ? 'Acima da média local' : 'Abaixo da média local'}</div>
              <div className="p">A concorrência média marca {rivalAvg}. Foco: cobrir os prompts ausentes.</div>
            </div>
          </div>

          <div className="aeo-card aeo-comp">
            <h3>Concorrentes</h3>
            {v.competitors.map(c => (
              <div className="crow" key={c.name}>
                <span className="cname">{c.you ? 'Você' : c.name}</span>
                <span className="bar"><i className={c.you ? '' : 'rival'} style={{ width: `${c.score}%` }} /></span>
                <span className="cval">{c.score}</span>
              </div>
            ))}
          </div>

          <div className="aeo-card aeo-bots">
            <h3>Visitas de bots de IA</h3>
            {v.botVisits.map(b => (
              <div className="botrow" key={b.bot}>
                <span className="bd" />
                <span className="bn">{b.bot}</span>
                <span className="bc">{fmt(b.visits)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* recommended actions */}
      <div className="aeo-card aeo-actions">
        <div className="ah">
          <h3>Ações recomendadas pela IA</h3>
          <span className="aeo-pill" style={{ marginLeft: 'auto' }}>ordenadas por impacto</span>
        </div>
        <p className="desc">Cada ação estima o ganho no score. As de conteúdo abrem a tarefa direto no editor.</p>
        {v.actions.map(a => (
          <div className="aeo-act" key={a.id}>
            <span className="aeo-imp">+{a.impact}</span>
            <div className="txt">
              <b>{a.title}</b>
              <small>{a.detail}</small>
            </div>
            {site.status && (
              <Link className={`btn sm ${a.cta === 'generate' ? '' : 'glass'}`} href={`/editor/${site.id}`}>
                {CTA_LABEL[a.cta]}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="aeo-note">
        <b>Por que isso importa:</b> nenhum construtor popular entrega monitoramento de citação em IA
        dentro do painel. É a ponte entre o site e a assinatura ANCOREO: o cliente vê o score subir e
        entende por que continuar.
      </div>
    </div>
  )
}
