'use client'

// Métricas (client). Anéis + "o que melhorar" = reais (/api/score/[siteId]).
// Visitas e ranking = "em breve" (sem fonte de dado no beta — não fabricar).
import { useEffect, useState } from 'react'
import { buildPresenceChecklist, type PresenceItem } from '@/lib/seo/local-presence'

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

// ── Links quebrados (payload do /api/score/[siteId]/links) ──
type BrokenLink = {
  url: string
  page: string
  type: 'internal' | 'external'
  status: number | null
  error: string | null
}
type LinkReport = {
  total_links: number
  internal_checked: number
  external_checked: number
  broken_count: number
  broken: BrokenLink[]
  checked_at: string
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const WEEKDAYS = ['D','S','T','Q','Q','S','S']

export default function MetricsView({
  siteId, domain, posts = [],
  siteStatus = '', gpeModo = '', gpeLink = '', businessName = '', city = '',
  gbpPostDates = [], sitemapPages = 0, sitemapPosts = 0,
}: {
  siteId: string
  domain: string
  posts?: PostLite[]
  siteStatus?: string
  gpeModo?: string
  gpeLink?: string
  businessName?: string
  city?: string
  gbpPostDates?: string[]
  sitemapPages?: number
  sitemapPosts?: number
}) {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calRef, setCalRef] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })

  // links quebrados — verificação sob demanda (fetches externos podem demorar)
  const [linkReport, setLinkReport] = useState<LinkReport | null>(null)
  const [linksLoading, setLinksLoading] = useState(false)
  const [linksError, setLinksError] = useState<string | null>(null)

  async function runLinkCheck() {
    setLinksLoading(true)
    setLinksError(null)
    try {
      const r = await fetch(`/api/score/${siteId}/links`)
      if (!r.ok) throw new Error('Falha ao verificar os links')
      setLinkReport(await r.json())
    } catch (e) {
      setLinksError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setLinksLoading(false)
    }
  }

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

  // ── Presença local no Google (NV5) ──────────────────────────
  // Itens automáticos = derivados do banco. Itens de conferência =
  // dado do Google que não lemos via API; o dono confirma na mão,
  // e o "conferido" mora no localStorage (sem migration).
  const blogPublishedDates = posts
    .filter(p => p.status === 'published')
    .map(p => p.published_at ?? p.created_at)
  const checklist = buildPresenceChecklist({
    siteStatus, siteDomain: domain, gpeModo, gpeLink, businessName, city,
    gbpPostDates, blogPublishedDates,
  })

  const storageKey = `aco_presence_${siteId}`
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      setConfirmed(raw ? JSON.parse(raw) : {})
    } catch { setConfirmed({}) }
  }, [storageKey])

  function toggleConfirm(key: string) {
    setConfirmed(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* storage bloqueado */ }
      return next
    })
  }

  // Item de conferência conta como concluído quando o dono marcou.
  function itemDone(it: PresenceItem): boolean {
    return it.kind === 'auto' ? it.status === 'ok' : !!confirmed[it.key]
  }
  const presenceDone = checklist.items.filter(itemDone).length
  const presenceTotal = checklist.total
  const presencePct = presenceTotal > 0 ? Math.round((presenceDone / presenceTotal) * 100) : 0

  // ── Sitemap / indexação ─────────────────────────────────────
  const siteIsPublished = siteStatus === 'published'
  const sitemapUrl = domain ? `https://${domain}/sitemap.xml` : ''
  const sitemapTotal = sitemapPages + sitemapPosts
  const [sitemapCopied, setSitemapCopied] = useState(false)
  async function copySitemap() {
    if (!sitemapUrl) return
    try {
      await navigator.clipboard.writeText(sitemapUrl)
      setSitemapCopied(true)
      setTimeout(() => setSitemapCopied(false), 1800)
    } catch { /* clipboard bloqueado */ }
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

          {/* links quebrados — verificação real sob demanda (/api/score/[siteId]/links) */}
          <div className="glass card" style={{ marginTop: '1.2rem' }}>
            <h3><i className="ph-duotone ph-link-break" /> Links quebrados</h3>
            {!linkReport && !linksLoading && (
              <div className="mtodo">
                <p className="sub" style={{ fontSize: '.8rem', margin: 0 }}>
                  Verifica todos os links do seu site — internos e externos — e aponta os que levam
                  a página inexistente ou fora do ar. Links quebrados afastam visitantes e derrubam
                  a confiança do Google.
                </p>
                {linksError && (
                  <div className="ti warn">
                    <span className="ic"><i className="ph-fill ph-warning" /></span>
                    <div><b>{linksError}</b><p>Tente novamente em instantes.</p></div>
                  </div>
                )}
                <button className="btn glass" onClick={runLinkCheck} style={{ alignSelf: 'flex-start', marginTop: '.6rem' }}>
                  <i className="ph-fill ph-magnifying-glass" /> Verificar links agora
                </button>
              </div>
            )}
            {linksLoading && (
              <div className="metric-loading" style={{ padding: '1rem 0' }}>
                Verificando os links do site… pode levar alguns segundos.
              </div>
            )}
            {linkReport && !linksLoading && (
              <div className="mtodo">
                {linkReport.broken_count === 0 ? (
                  <div className="ti ok">
                    <span className="ic"><i className="ph-fill ph-check" /></span>
                    <div>
                      <b>Nenhum link quebrado</b>
                      <p>
                        {linkReport.total_links} link{linkReport.total_links === 1 ? '' : 's'} verificado{linkReport.total_links === 1 ? '' : 's'}
                        {' '}({linkReport.internal_checked} internos, {linkReport.external_checked} externos). Tudo respondendo.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="ti warn">
                      <span className="ic"><i className="ph-fill ph-warning" /></span>
                      <div>
                        <b>{linkReport.broken_count} link{linkReport.broken_count === 1 ? '' : 's'} quebrado{linkReport.broken_count === 1 ? '' : 's'}</b>
                        <p>De {linkReport.total_links} verificados. Corrija ou remova os links abaixo.</p>
                      </div>
                    </div>
                    {linkReport.broken.slice(0, 10).map((b, i) => (
                      <div className="ti warn" key={`${b.page}-${b.url}-${i}`}>
                        <span className="ic"><i className="ph-fill ph-link-break" /></span>
                        <div>
                          <b style={{ wordBreak: 'break-all' }}>{b.url}</b>
                          <p>
                            Na página <code>{b.page}</code> · {b.type === 'internal' ? 'link interno' : 'link externo'}
                            {b.status ? ` · HTTP ${b.status}` : b.error ? ` · ${b.error}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                    {linkReport.broken.length > 10 && (
                      <p className="sub" style={{ fontSize: '.76rem', margin: 0 }}>
                        …e mais {linkReport.broken.length - 10} link{linkReport.broken.length - 10 === 1 ? '' : 's'}.
                      </p>
                    )}
                  </>
                )}
                {linksError && (
                  <div className="ti warn">
                    <span className="ic"><i className="ph-fill ph-warning" /></span>
                    <div><b>{linksError}</b><p>Mostrando o último resultado. Tente novamente.</p></div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginTop: '.6rem' }}>
                  <button className="btn glass sm" onClick={runLinkCheck}>
                    <i className="ph-fill ph-arrows-clockwise" /> Verificar de novo
                  </button>
                  <span className="sub" style={{ fontSize: '.72rem' }}>
                    Verificado em {new Date(linkReport.checked_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Presença local no Google (NV5) ── */}
          <div className="glass card" style={{ marginTop: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}><i className="ph-duotone ph-map-pin-area" /> Presença local no Google</h3>
              <span className="pill" style={{ marginLeft: 'auto' }}>{presenceDone} de {presenceTotal} prontos</span>
            </div>
            <div className="seobar" style={{ margin: '.9rem 0 1rem' }}>
              <i style={{ width: `${presencePct}%` }} />
            </div>

            <div className="mtodo">
              {checklist.items.map(it => {
                const done = itemDone(it)
                if (it.kind === 'auto') {
                  return (
                    <div className={`ti ${done ? 'ok' : 'warn'}`} key={it.key}>
                      <span className="ic"><i className={`ph-fill ${done ? 'ph-check' : 'ph-circle-dashed'}`} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b>{it.label}</b>
                        <p>{it.hint}</p>
                        {it.actionHref && (
                          it.actionHref.startsWith('/')
                            ? <a href={it.actionHref} className="diag-link" style={{ fontSize: '.74rem' }}>
                                <i className="ph-fill ph-arrow-right" /> {it.actionLabel}
                              </a>
                            : <a href={it.actionHref} target="_blank" rel="noopener noreferrer" className="diag-link" style={{ fontSize: '.74rem' }}>
                                <i className="ph-fill ph-arrow-square-out" /> {it.actionLabel}
                              </a>
                        )}
                      </div>
                    </div>
                  )
                }
                // Conferência guiada: checkbox auto-declarado pelo dono.
                return (
                  <label className={`ti ${done ? 'ok' : ''}`} key={it.key} style={{ cursor: 'pointer' }}>
                    <span className="pchk" data-on={done ? '1' : undefined}>
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleConfirm(it.key)}
                        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', margin: 0, cursor: 'pointer' }}
                      />
                      <i className={`ph-fill ${done ? 'ph-check' : 'ph-square'}`} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                        {it.label}
                        <span className="chip" style={{ fontSize: '.6rem', fontWeight: 600, opacity: .8 }}>confira no seu perfil</span>
                      </b>
                      <p>{it.hint}</p>
                      {it.actionHref && (
                        <a href={it.actionHref} target="_blank" rel="noopener noreferrer" className="diag-link" style={{ fontSize: '.74rem' }}>
                          <i className="ph-fill ph-arrow-square-out" /> {it.actionLabel}
                        </a>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
            <p className="sub" style={{ fontSize: '.72rem', marginTop: '.8rem' }}>
              Os itens marcados <b>“confira no seu perfil”</b> são dados que só o Google tem — a gente não lê
              eles automaticamente, então você confirma na mão. O que a gente consegue verificar sozinho já
              vem marcado.
            </p>
          </div>

          {/* ── Indexação e sitemap (NV5) ── */}
          <div className="glass card" style={{ marginTop: '1.2rem' }}>
            <h3><i className="ph-duotone ph-tree-structure" /> Indexação e sitemap</h3>
            {!siteIsPublished ? (
              <div className="mtodo">
                <div className="ti warn">
                  <span className="ic"><i className="ph-fill ph-warning" /></span>
                  <div>
                    <b>Publique seu site primeiro</b>
                    <p>O sitemap — o mapa que o Google usa pra achar suas páginas — só fica disponível depois que o site está no ar.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mtodo">
                <div className="ti ok">
                  <span className="ic"><i className="ph-fill ph-check" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>Seu sitemap está no ar</b>
                    <p>
                      {sitemapTotal} endereço{sitemapTotal === 1 ? '' : 's'} no sitemap
                      {sitemapTotal > 0 ? ` (${sitemapPages} página${sitemapPages === 1 ? '' : 's'} + ${sitemapPosts} artigo${sitemapPosts === 1 ? '' : 's'})` : ''}.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap', margin: '.2rem 0' }}>
                  <code style={{ fontSize: '.78rem', wordBreak: 'break-all', flex: 1, minWidth: '12rem' }}>{sitemapUrl}</code>
                  <button className="btn glass sm" onClick={copySitemap}>
                    {sitemapCopied
                      ? <><i className="ph-fill ph-check" /> Copiado</>
                      : <><i className="ph-fill ph-copy" /> Copiar</>}
                  </button>
                </div>

                <div className="ti">
                  <span className="ic" style={{ background: 'hsl(var(--muted))', color: 'var(--navy)' }}><i className="ph-fill ph-paper-plane-tilt" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>Envie ao Google Search Console</b>
                    <p>Cole o endereço acima em “Sitemaps” dentro do Search Console. É assim que você avisa o Google pra ler suas páginas mais rápido — de graça.</p>
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="diag-link" style={{ fontSize: '.74rem' }}>
                      <i className="ph-fill ph-arrow-square-out" /> Abrir o Search Console
                    </a>
                  </div>
                </div>
              </div>
            )}
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
