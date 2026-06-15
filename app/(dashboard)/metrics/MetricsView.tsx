'use client'

// Métricas (client). Anéis + "o que melhorar" = reais (/api/score/[siteId]).
// Visitas e ranking = "em breve" (sem fonte de dado no beta — não fabricar).
import { useEffect, useState } from 'react'

type Pillar = 'seo' | 'geo' | 'aeo' | 'eeat'
type ScoreRule = { rule_key: string; description: string; pillar: Pillar; fix: string; passed: boolean }
type ScoreData = {
  overall: number; seo: number; geo: number; aeo: number; eeat: number
  rules: ScoreRule[]; calculated_at: string | null
}

const RINGS: { id: Exclude<Pillar, 'eeat'>; label: string; color: string; hint: (n: number) => string }[] = [
  { id: 'seo', label: 'SEO', color: '#22c55e', hint: n => `Busca tradicional no Google. ${grade(n)}.` },
  { id: 'geo', label: 'GEO', color: '#f5a30a', hint: n => `Citação pelas IAs. ${grade(n)}.` },
  { id: 'aeo', label: 'AEO', color: '#3b82f6', hint: n => `Resposta direta e por voz. ${grade(n)}.` },
]

function grade(n: number): string {
  if (n >= 80) return 'Forte'
  if (n >= 60) return 'Boa'
  if (n >= 40) return 'Pode melhorar'
  return 'Precisa de atenção'
}

type PostLite = {
  title: string
  status: 'draft' | 'review' | 'published'
  created_at: string
  published_at: string | null
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const WEEKDAYS = ['D','S','T','Q','Q','S','S']

export default function MetricsView({ siteId, domain, posts = [] }: { siteId: string; domain: string; posts?: PostLite[] }) {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calRef, setCalRef] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`/api/score/${siteId}`)
      .then(async r => {
        if (!r.ok) throw new Error('Falha ao calcular o score')
        return r.json()
      })
      .then(j => { if (alive) { setData(j); setLoading(false) } })
      .catch(e => { if (alive) { setError(e instanceof Error ? e.message : 'Erro'); setLoading(false) } })
    return () => { alive = false }
  }, [siteId])

  // "O que melhorar" = regras falhando (texto de correção real). Limita a 4.
  const toImprove = (data?.rules ?? []).filter(r => !r.passed).slice(0, 4)
  const allGood = !!data && toImprove.length === 0

  // ── Blog: métricas de conteúdo (reais) ──────────────────────
  const published = posts.filter(p => p.status === 'published').length
  const drafts = posts.filter(p => p.status === 'draft' || p.status === 'review').length
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const thisMonth = posts.filter(p => new Date(p.created_at) >= monthStart).length

  // ── Calendário de postagens ─────────────────────────────────
  // Dias do mês que têm artigo (published_at se publicado, senão created_at).
  const postedDays = new Set<number>()
  for (const p of posts) {
    const ref = p.published_at ?? p.created_at
    const d = new Date(ref)
    if (d.getFullYear() === calRef.y && d.getMonth() === calRef.m) postedDays.add(d.getDate())
  }
  const firstWeekday = new Date(calRef.y, calRef.m, 1).getDay()
  const daysInMonth = new Date(calRef.y, calRef.m + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === calRef.y && today.getMonth() === calRef.m
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  function shiftMonth(delta: number) {
    setCalRef(({ y, m }) => {
      const nm = m + delta
      return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 }
    })
  }

  return (
    <>
      <div className="topbar">
        <div><h1>Painel</h1><div className="sub">{domain} · como você está aparecendo</div></div>
      </div>

      {error && <div className="glass empty"><i className="ph-duotone ph-warning" /> {error}</div>}
      {loading && <div className="glass metric-loading">Calculando seu score…</div>}

      {data && !loading && (
        <>
          {/* anéis SEO / GEO / AEO — reais */}
          <div className="seo3">
            {RINGS.map(r => {
              const n = data[r.id]
              return (
                <div className="glass seo-card" key={r.id}>
                  <div className="ring" style={{ background: `conic-gradient(${r.color} 0 ${n}%,rgba(255,255,255,.1) ${n}%)` }}>
                    <div className="rin"><b>{n}</b><span>{r.label}</span></div>
                  </div>
                  <h3>{r.label}</h3>
                  <p>{r.hint(n)}</p>
                </div>
              )
            })}
          </div>

          <div className="cols">
            {/* visitas — em breve (sem analytics no beta) */}
            <div className="glass card">
              <h3><i className="ph-duotone ph-chart-bar" /> Visitas</h3>
              <div className="soon">
                <span className="bigic"><i className="ph-duotone ph-chart-line-up" /></span>
                <span className="pill">Em breve</span>
                <p>A análise de tráfego conecta ao seu site assim que a integração com o Google (Analytics e Search Console) for ativada.</p>
              </div>
            </div>

            {/* o que melhorar — real, das regras falhando */}
            <div className="glass card">
              <h3><i className="ph-duotone ph-lightbulb" /> O que melhorar</h3>
              <div className="mtodo">
                {allGood ? (
                  <div className="ti ok">
                    <span className="ic"><i className="ph-fill ph-check" /></span>
                    <div><b>Tudo certo por aqui</b><p>Seu site passa em todas as regras de SEO, GEO e AEO avaliadas.</p></div>
                  </div>
                ) : (
                  toImprove.map(rule => (
                    <div className="ti warn" key={rule.rule_key}>
                      <span className="ic"><i className="ph-fill ph-warning" /></span>
                      <div><b>{rule.description}</b><p>{rule.fix}</p></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Conteúdo (blog) + calendário de postagens ── */}
          <div className="cols" style={{ marginTop: '1.2rem' }}>
            {/* métricas reais do blog */}
            <div className="glass card">
              <h3><i className="ph-duotone ph-article" /> Conteúdo do blog</h3>
              <div className="stats" style={{ marginTop: '.4rem' }}>
                <div className="stat"><div className="n">{published}</div><div className="l">publicados</div></div>
                <div className="stat"><div className="n">{drafts}</div><div className="l">em rascunho</div></div>
                <div className="stat"><div className="n">{thisMonth}</div><div className="l">criados este mês</div></div>
              </div>
              <a href="/blog" className="btn glass" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                <i className="ph-fill ph-pencil-simple" /> Ir pro blog
              </a>
            </div>

            {/* calendário de postagens (datas reais dos artigos) */}
            <div className="glass card">
              <div className="cal-head">
                <h3 style={{ margin: 0 }}><i className="ph-duotone ph-calendar-dots" /> Calendário de postagens</h3>
                <div className="cal-nav">
                  <button onClick={() => shiftMonth(-1)} aria-label="Mês anterior"><i className="ph-bold ph-caret-left" /></button>
                  <span>{MONTHS[calRef.m]} {calRef.y}</span>
                  <button onClick={() => shiftMonth(1)} aria-label="Próximo mês"><i className="ph-bold ph-caret-right" /></button>
                </div>
              </div>
              <div className="cal-grid">
                {WEEKDAYS.map((w, i) => <span key={`w${i}`} className="cal-wd">{w}</span>)}
                {cells.map((day, i) => {
                  if (day === null) return <span key={`e${i}`} className="cal-cell empty" />
                  const posted = postedDays.has(day)
                  const isToday = isCurrentMonth && day === today.getDate()
                  return (
                    <span key={`d${day}`} className={`cal-cell${posted ? ' posted' : ''}${isToday ? ' today' : ''}`}>
                      {day}
                      {posted && <i className="cal-dot" />}
                    </span>
                  )
                })}
              </div>
              <p className="sub" style={{ fontSize: '.72rem', marginTop: '.7rem' }}>
                Pontos marcam dias com artigo. Agendamento de posts futuros chega em breve.
              </p>
            </div>
          </div>

          {/* ranking de keywords — em breve (sem Search Console no beta) */}
          <div className="glass card" style={{ marginTop: '1.2rem' }}>
            <h3><i className="ph-duotone ph-magnifying-glass" /> Palavras-chave que trazem você</h3>
            <div className="soon">
              <span className="bigic"><i className="ph-duotone ph-magnifying-glass" /></span>
              <span className="pill">Em breve</span>
              <p>As posições reais no Google aparecem aqui quando o Search Console estiver conectado. Não mostramos número estimado pra você não decidir em cima de dado que não é real.</p>
            </div>
          </div>

          {data.calculated_at && (
            <p className="sub" style={{ marginTop: '1rem', fontSize: '.76rem' }}>
              Score calculado em {new Date(data.calculated_at).toLocaleString('pt-BR')}
            </p>
          )}
        </>
      )}
    </>
  )
}
