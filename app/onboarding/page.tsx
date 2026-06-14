'use client'

// ============================================================
// HARPIA — Onboarding v2 (7 telas, Liquid Glass)
// Markup/visual portado 1:1 do protótipo aprovado.
// A lógica (autosave, navegação, cidades) liga nas server actions.
// Não redesenhar o visual aqui; mudanças de estilo vêm do Claude Design.
// ============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { saveOnboardingProfile } from '@/lib/onboarding/actions'
import type {
  Objetivo,
  Porte,
  GpeModo,
  DominioModo,
  OnboardingProfileInput,
} from '@/lib/onboarding/types'
import {
  GOALS,
  CATS,
  REGULATED,
  PORTES,
  KQUESTIONS,
  nicheToSlug,
  areaTipoFromPorte,
  slugifyBusiness,
} from './data'
import '@phosphor-icons/web/fill'
import '@phosphor-icons/web/duotone'
import './onboarding.css'

const TOTAL = 7

type CityResult = { name: string; state: string; lat?: number; lng?: number }

export default function OnboardingPage() {
  const router = useRouter()

  // ── estado das telas ──────────────────────────────────────
  const [screen, setScreen] = useState(0)
  const [objetivo, setObjetivo] = useState<Objetivo>('servico_agendamento')
  const [businessName, setBusinessName] = useState('')
  const [about, setAbout] = useState('')
  const [cat, setCat] = useState('saude')
  const [niche, setNiche] = useState('Clínica médica')
  const [guess] = useState('Clínica médica')
  const [otherActive, setOtherActive] = useState(false)
  const [registro, setRegistro] = useState('')
  const [segQuery, setSegQuery] = useState('')
  const [porte, setPorte] = useState<Porte>('micro_pequena')
  const [city, setCity] = useState('')
  const [uf, setUf] = useState('')
  const [cityResults, setCityResults] = useState<CityResult[]>([])
  const [cityOpen, setCityOpen] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)
  const [radiusKm, setRadiusKm] = useState(15)
  const [areaText, setAreaText] = useState('')
  const [gpeModo, setGpeModo] = useState<GpeModo>('vincular')
  const [gpeLink, setGpeLink] = useState('')
  const [gpeErr, setGpeErr] = useState(false)
  const [answers, setAnswers] = useState<string[]>(() => KQUESTIONS.map(() => ''))
  const [dominioModo, setDominioModo] = useState<DominioModo>('proprio')
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [overlay, setOverlay] = useState(false)
  const [loadStep, setLoadStep] = useState(0)
  const [diagModal, setDiagModal] = useState(false)
  const [genError, setGenError] = useState('')
  const [mounted, setMounted] = useState(false)

  const auraRef = useRef<HTMLDivElement>(null)
  const profileIdRef = useRef<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── auth gate (mesmo padrão do app) ───────────────────────
  useEffect(() => {
    setMounted(true)
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
    })
  }, [router])

  // ── monta o input a partir do estado ──────────────────────
  const buildInput = useCallback((): OnboardingProfileInput => {
    const catLabel = CATS.find((c) => c[0] === cat)?.[1] ?? null
    const slug = slugifyBusiness(businessName)
    const area = areaTipoFromPorte(porte)
    return {
      objetivo,
      business_name: businessName || null,
      differentials: about || null,
      setor: catLabel,
      profissao: niche || null,
      niche: niche ? nicheToSlug(niche) : null,
      segmento_custom: otherActive ? niche || null : null,
      registro_profissional: REGULATED[niche] ? registro || null : null,
      porte,
      area_tipo: area,
      service_radius_km: area === 'local' ? radiusKm : null,
      coverage_areas:
        area === 'regional' && areaText.trim()
          ? areaText.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
      city: city || null,
      state: uf || null,
      gpe_modo: gpeModo,
      gpe_link: gpeModo === 'vincular' ? gpeLink || null : null,
      conhecimento: KQUESTIONS.map((q, i) => ({
        pergunta: q[0],
        resposta: answers[i] ?? '',
      })).filter((x) => x.resposta.trim()),
      dominio_modo: dominioModo,
      dominio: dominioModo === 'proprio' ? `${slug}.com.br` : `${slug}.harpia.site`,
    }
  }, [
    objetivo, businessName, about, cat, niche, otherActive, registro,
    porte, radiusKm, areaText, city, uf, gpeModo, gpeLink, answers, dominioModo,
  ])

  // ── autosave debounced via server action ──────────────────
  const flushSave = useCallback(async (): Promise<void> => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving(true)
    const input = buildInput()
    const r = await saveOnboardingProfile(
      profileIdRef.current ? { ...input, id: profileIdRef.current } : input
    )
    if (r.ok && r.id) {
      profileIdRef.current = r.id
      setProfileId(r.id)
    }
    setSaving(false)
  }, [buildInput])

  const scheduleSave = useCallback(() => {
    setSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void flushSave()
    }, 1200)
  }, [flushSave])

  // salva sempre que um campo relevante muda (depois de montado)
  useEffect(() => {
    if (!mounted) return
    scheduleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    objetivo, businessName, about, cat, niche, otherActive, registro,
    porte, radiusKm, areaText, city, uf, gpeModo, gpeLink, answers, dominioModo,
  ])

  // ── navegação ─────────────────────────────────────────────
  const auraBurst = useCallback(() => {
    const el = auraRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.animate(
      [
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(1.16) rotate(6deg)' },
        { transform: 'scale(1) rotate(0deg)' },
      ],
      { duration: 1200, easing: 'cubic-bezier(.5,0,.2,1)', composite: 'add' }
    )
  }, [])

  const go = useCallback(
    (d: number) => {
      setScreen((s) => {
        const ns = Math.max(0, Math.min(TOTAL - 1, s + d))
        return ns
      })
      auraBurst()
    },
    [auraBurst]
  )
  const jump = useCallback(
    (ns: number) => {
      setScreen(ns)
      auraBurst()
    },
    [auraBurst]
  )

  // ── tela 1: objetivo (avança sozinho) ─────────────────────
  function pickGoal(id: Objetivo) {
    setObjetivo(id)
    setTimeout(() => go(1), 260)
  }

  // ── tela 3: categoria/nicho ───────────────────────────────
  function pickCat(id: string) {
    setCat(id)
    const first = CATS.find((c) => c[0] === id)?.[3][0] ?? ''
    setNiche(first)
    setOtherActive(false)
    setSegQuery('')
  }
  function pickNiche(n: string) {
    setNiche(n)
    setOtherActive(false)
  }
  function activateOther() {
    setOtherActive(true)
    setNiche('')
  }
  // resultados da busca de segmento (sobre os dados do protótipo)
  const segResults = useMemo(() => {
    const q = segQuery.trim().toLowerCase()
    if (q.length < 2) return null
    const all: [string, string][] = []
    CATS.forEach((c) => c[3].forEach((n) => all.push([n, c[0]])))
    return all.filter((x) => x[0].toLowerCase().includes(q))
  }, [segQuery])
  function pickFromSearch(catId: string, n: string) {
    setCat(catId)
    setNiche(n)
    setOtherActive(false)
    setSegQuery('')
  }
  function useTypedSeg() {
    setNiche(segQuery.trim())
    setOtherActive(true)
    setSegQuery('')
  }

  // ── tela 4: porte + cidade ────────────────────────────────
  function pickPorte(id: Porte) {
    setPorte(id)
    if (id === 'mei_autonomo') setRadiusKm(8)
    else if (id === 'micro_pequena') setRadiusKm(15)
  }
  function cityType(v: string) {
    setCity(v)
    setUf('')
    if (cityTimer.current) clearTimeout(cityTimer.current)
    if (!v.trim() || v.trim().length < 2) {
      setCityOpen(false)
      setCityResults([])
      return
    }
    setCityLoading(true)
    setCityOpen(true)
    cityTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/onboarding/cities?q=${encodeURIComponent(v.trim())}`)
        const data = (await res.json()) as { results?: CityResult[] }
        setCityResults(data.results ?? [])
      } catch {
        setCityResults([])
      } finally {
        setCityLoading(false)
      }
    }, 350)
  }
  function pickCity(c: CityResult) {
    setCity(c.name)
    setUf(c.state)
    setCityOpen(false)
  }

  // ── tela 5: google ────────────────────────────────────────
  function gValidate(v: string) {
    setGpeLink(v)
    const ok = v === '' || /maps\.|goo\.gl|google\.com\/maps|g\.co/.test(v)
    setGpeErr(!ok && v.length > 4)
  }

  // ── tela 6: conhecimento / autoridade ─────────────────────
  function setAnswer(i: number, v: string) {
    setAnswers((a) => {
      const next = [...a]
      next[i] = v
      return next
    })
  }
  const authority = useMemo(() => {
    let words = 0
    let answered = 0
    answers.forEach((a) => {
      const w = a.trim().split(/\s+/).filter(Boolean).length
      words += w
      if (w >= 12) answered++
    })
    const p = Math.min(100, Math.round(words * 1.1 + answered * 20))
    const label = p < 35 ? 'Fraco' : p < 70 ? 'Bom' : 'Forte'
    const color = p < 35 ? '#f5a30a' : p < 70 ? '#8fc0ff' : '#22c55e'
    return { p, label, color }
  }, [answers])

  // ── tela 7: domínio ───────────────────────────────────────
  const slug = useMemo(() => slugifyBusiness(businessName), [businessName])

  // ── gerar (Fase 1: salva e entrega ao seletor de modelo) ──
  async function handleGenerate() {
    setGenError('')
    setOverlay(true)
    setLoadStep(0)
    await flushSave()
    // animação cosmética dos 4 passos, depois segue pro seletor de modelo
    const steps = [1, 2, 3]
    let i = 0
    const tick = setInterval(() => {
      i++
      setLoadStep(i)
      if (i >= steps.length) {
        clearInterval(tick)
        setTimeout(() => router.push('/templates'), 700)
      }
    }, 850)
  }

  // ── floaters (client-only, evita mismatch de hidratação) ──
  const floaters = useMemo(() => {
    if (!mounted) return [] as React.ReactNode[]
    const items: React.ReactNode[] = []
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)
    const setVars = (o: Record<string, string>) => o
    let k = 0
    for (let n = 0; n < 10; n++) {
      const far = n < 4
      const sz = (far ? rnd(34, 62) : rnd(16, 38)) | 0
      items.push(
        <div
          key={`f${k++}`}
          className={`fl feather${far ? ' far' : ''}`}
          style={
            {
              top: `${rnd(0, 100)}%`,
              '--d': `${(far ? rnd(52, 80) : rnd(28, 54)).toFixed(1)}s`,
              '--dl': `${-rnd(0, 60)}s`,
              '--s': `${rnd(7, 14).toFixed(1)}s`,
              '--o': (far ? rnd(0.2, 0.38) : rnd(0.34, 0.68)).toFixed(2),
              '--sz': `${sz}px`,
              '--yend': `${(rnd(0, 120) - 70) | 0}px`,
            } as React.CSSProperties
          }
        >
          <i className="in ph-fill ph-feather" />
        </div>
      )
    }
    for (let n = 0; n < 18; n++) {
      items.push(
        <div
          key={`f${k++}`}
          className="fl mote"
          style={
            {
              top: `${rnd(0, 100)}%`,
              '--d': `${rnd(20, 48).toFixed(1)}s`,
              '--dl': `${-rnd(0, 60)}s`,
              '--o': rnd(0.3, 0.8).toFixed(2),
              '--sz': `${(2 + rnd(0, 4)) | 0}px`,
            } as React.CSSProperties
          }
        >
          <span className="in" />
        </div>
      )
    }
    items.push(
      <div
        key={`f${k++}`}
        className="fl bird"
        style={
          { top: `${rnd(0, 100)}%`, '--d': `${rnd(54, 84).toFixed(1)}s`, '--o': '0.15', '--sz': `${(42 + rnd(0, 30)) | 0}px` } as React.CSSProperties
        }
      >
        <i className="in ph-fill ph-bird" />
      </div>
    )
    void setVars
    return items
  }, [mounted])

  const regDoc = REGULATED[niche]
  const catObj = CATS.find((c) => c[0] === cat)
  const isLastScreen = screen === TOTAL - 1

  return (
    <div className="ob-page">
      <div className="aura" ref={auraRef} />
      <div className="floaters">{floaters}</div>
      <div className="skyveil top" />
      <div className="skyveil bottom" />
      <div className="grain" />

      <div className="ob">
        {/* header */}
        <header className="head">
          <div className="brand">
            <span className="mk">
              <i className="ph-fill ph-bird" />
            </span>{' '}
            HARPIA
          </div>
          <div className={`save${saving ? ' saving' : ''}`}>
            <span className="dot" />
            <span>{saving ? 'Salvando…' : 'Salvo'}</span>
          </div>
        </header>

        {/* progress */}
        <div className="prog">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`seg${i < screen ? ' done' : i === screen ? ' cur' : ''}`}>
              <i />
            </div>
          ))}
        </div>

        {/* body */}
        <div className="body">
          {/* 1 · OBJETIVO */}
          <section className={`screen${screen === 0 ? ' active' : screen > 0 ? ' left' : ''}`}>
            <div className="panel">
              <div className="card">
                <div className="step">
                  <span className="n">1</span> Vamos começar
                </div>
                <h1 className="q">O que você quer construir?</h1>
                <p className="hint">
                  Isso ajuda a sugerir o modelo e as cores certas já na primeira tela. Dá pra mudar
                  depois.
                </p>
                <div className="goals">
                  {GOALS.map((g) => (
                    <button
                      key={g[0]}
                      className={`goal${g[0] === objetivo ? ' on' : ''}`}
                      onClick={() => pickGoal(g[0])}
                    >
                      <span className="gic">
                        <i className={`ph-duotone ${g[2]}`} />
                      </span>
                      <span className="gt">
                        <b>{g[1]}</b>
                        <span>{g[3]}</span>
                      </span>
                      <i className="ph-fill ph-check-circle gck" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 2 · NOME */}
          <section className={`screen${screen === 1 ? ' active' : screen > 1 ? ' left' : ''}`}>
            <div className="panel">
              <div className="card">
                <div className="step">
                  <span className="n">2</span> Vamos começar
                </div>
                <h1 className="q">Qual é o nome do seu negócio?</h1>
                <p className="hint">É o nome que aparece no topo do site e na busca do Google.</p>
                <input
                  className="field"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') go(1)
                  }}
                  placeholder="Ex.: Clínica Vida Plena"
                  autoComplete="off"
                />
                <div className="key">
                  <kbd>Enter</kbd> para continuar
                </div>
              </div>
            </div>
          </section>

          {/* 3 · SOBRE / SEGMENTO */}
          <section
            className={`screen compact${screen === 2 ? ' active' : screen > 2 ? ' left' : ''}`}
          >
            <div className="panel">
              <div className="card">
                <div className="step">
                  <span className="n">3</span> Sobre o negócio
                </div>
                <h1 className="q">Conte rapidinho o que você faz</h1>
                <p className="hint">
                  Pode ser informal, a gente usa pra escrever os textos e escolher o segmento.
                </p>
                <textarea
                  className="field"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Ex.: Clínica geral e pediatria, consulta sem pressa e exames no mesmo dia."
                />

                <div className="lbl">
                  <i className="ph-duotone ph-squares-four" /> Qual o segmento?
                </div>
                <input
                  className="field segsearch"
                  style={{ marginBottom: '.7rem', fontSize: '1rem', padding: '.8rem 1rem' }}
                  value={segQuery}
                  onChange={(e) => setSegQuery(e.target.value)}
                  placeholder="Buscar segmento. Ex.: advocacia, mecânica…"
                  autoComplete="off"
                />

                {segResults === null ? (
                  <>
                    <div className="cats">
                      {CATS.map((c) => (
                        <button
                          key={c[0]}
                          className={`chip${c[0] === cat ? ' on' : ''}`}
                          onClick={() => pickCat(c[0])}
                        >
                          <i className={`ph-duotone ${c[2]}`} />
                          {c[1]}
                        </button>
                      ))}
                    </div>
                    <div className="niches">
                      {catObj?.[3].map((n) => (
                        <button
                          key={n}
                          className={`niche${n === niche && !otherActive ? ' on' : ''}${
                            n === guess ? ' guess' : ''
                          }`}
                          onClick={() => pickNiche(n)}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        className={`niche niche-other${otherActive ? ' on' : ''}`}
                        onClick={activateOther}
                      >
                        <i className="ph-duotone ph-plus-circle" /> Outro
                      </button>
                      {otherActive && (
                        <div className="other-wrap">
                          <input
                            className="field other-input"
                            maxLength={40}
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder="Escreva seu segmento. Ex.: Mecânica de motos"
                            autoComplete="off"
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="niches">
                    {segResults.length ? (
                      segResults.map((x) => (
                        <button
                          key={x[0]}
                          className={`niche${x[0] === niche ? ' on' : ''}`}
                          onClick={() => pickFromSearch(x[1], x[0])}
                        >
                          {x[0]}
                        </button>
                      ))
                    ) : (
                      <button className="niche niche-other on" onClick={useTypedSeg}>
                        <i className="ph-duotone ph-plus-circle" /> Usar segmento digitado
                      </button>
                    )}
                  </div>
                )}

                {regDoc && (
                  <>
                    <div className="lbl" style={{ marginTop: '1rem' }}>
                      <i className="ph-duotone ph-seal-check" /> {regDoc}{' '}
                      <span className="reg-tag">profissão regulada</span>
                    </div>
                    <input
                      className="field"
                      value={registro}
                      onChange={(e) => setRegistro(e.target.value)}
                      placeholder={regDoc}
                      autoComplete="off"
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          {/* 4 · PORTE / LOCAL */}
          <section
            className={`screen compact${screen === 3 ? ' active' : screen > 3 ? ' left' : ''}`}
          >
            <div className="panel">
              <div className="card">
                <div className="step">
                  <span className="n">4</span> Tamanho e alcance
                </div>
                <h1 className="q">Qual o tamanho e onde você atende?</h1>
                <p className="hint">Isso define o foco do seu site no mapa e nas buscas locais.</p>

                <div className="lbl">
                  <i className="ph-duotone ph-buildings" /> Qual o tamanho da empresa?
                </div>
                <div className="portes">
                  {PORTES.map((p) => (
                    <button
                      key={p[0]}
                      className={`porte${p[0] === porte ? ' on' : ''}`}
                      onClick={() => pickPorte(p[0])}
                    >
                      <span className="pic">
                        <i className={`ph-duotone ${p[2]}`} />
                      </span>
                      <span className="pt">
                        <b>{p[1]}</b>
                        <span>{p[3]}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="lbl">
                  <i className="ph-duotone ph-map-pin" /> Onde fica a base do negócio?
                </div>
                <div className="ac">
                  <input
                    className="field"
                    value={city}
                    onChange={(e) => cityType(e.target.value)}
                    onFocus={() => city.trim().length >= 2 && cityResults.length > 0 && setCityOpen(true)}
                    placeholder="Comece a digitar a cidade…"
                    autoComplete="off"
                  />
                  <div className={`ac-list${cityOpen ? ' open' : ''}`}>
                    {cityLoading ? (
                      <div className="empty">
                        <i className="ph-duotone ph-circle-notch" />
                        Buscando cidades…
                      </div>
                    ) : cityResults.length ? (
                      cityResults.map((c, i) => (
                        <button key={`${c.name}-${i}`} onClick={() => pickCity(c)}>
                          <i className="ph-fill ph-map-pin" />
                          {c.name}, {c.state}
                        </button>
                      ))
                    ) : (
                      <div className="empty">
                        <i className="ph-duotone ph-map-pin-line" />
                        Nenhuma cidade encontrada.
                        <br />
                        Confira a digitação.
                      </div>
                    )}
                  </div>
                </div>

                {/* área condicional ao porte */}
                {porte === 'mei_autonomo' || porte === 'micro_pequena' ? (
                  <>
                    <div className="lbl">
                      <i className="ph-duotone ph-target" /> Atende num raio de{' '}
                      <span className="rangeval">{radiusKm} km</span>
                    </div>
                    <input
                      className="slider"
                      type="range"
                      min={2}
                      max={80}
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                    />
                  </>
                ) : porte === 'media' ? (
                  <>
                    <div className="lbl">
                      <i className="ph-duotone ph-map-trifold" /> Quais regiões ou estados você atende?
                    </div>
                    <input
                      className="field"
                      value={areaText}
                      onChange={(e) => setAreaText(e.target.value)}
                      placeholder="Ex.: interior de SP, sul de MG"
                      autoComplete="off"
                    />
                  </>
                ) : (
                  <div className="area-note" style={{ marginTop: '1rem' }}>
                    <i className="ph-duotone ph-globe-hemisphere-west" />{' '}
                    <span>
                      <b>Atendimento nacional.</b> Vamos otimizar o site pra busca em todo o Brasil,
                      sem foco em um único mapa.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 5 · GOOGLE */}
          <section
            className={`screen compact${screen === 4 ? ' active' : screen > 4 ? ' left' : ''}`}
          >
            <div className="panel">
              <div className="card">
                <div className="step">
                  <span className="n">5</span> Google Perfil de Empresa
                </div>
                <h1 className="q">Você já tem Perfil de Empresa no Google?</h1>
                <p className="hint">
                  O cartão que aparece no Google com avaliações, horário e mapa. É o que mais pesa
                  pra você aparecer na busca local.
                </p>
                <div className="choice">
                  <button
                    className={`opt${gpeModo === 'vincular' ? ' on' : ''}`}
                    onClick={() => setGpeModo('vincular')}
                  >
                    <span className="ic g">
                      <i className="ph-fill ph-storefront" />
                    </span>
                    <span className="otxt">
                      <b>Já tenho, vincular agora</b>
                      <span>A gente puxa avaliações, horário e mapa</span>
                    </span>
                    <span className="seo hi">
                      <i className="ph-fill ph-trophy" /> SEO máximo
                    </span>
                  </button>
                  <button
                    className={`opt${gpeModo === 'criar' ? ' on' : ''}`}
                    onClick={() => setGpeModo('criar')}
                  >
                    <span className="ic g">
                      <i className="ph-duotone ph-map-pin-plus" />
                    </span>
                    <span className="otxt">
                      <b>Criar um perfil agora</b>
                      <span>A gente te leva ao Google, leva uns 2 minutos</span>
                    </span>
                    <span className="seo hi">
                      <i className="ph-fill ph-trophy" /> SEO máximo
                    </span>
                  </button>
                  <button
                    className={`opt${gpeModo === 'sem' ? ' on' : ''}`}
                    onClick={() => setGpeModo('sem')}
                  >
                    <span className="ic n">
                      <i className="ph-duotone ph-clock-countdown" />
                    </span>
                    <span className="otxt">
                      <b>Continuar sem perfil</b>
                      <span>Você adiciona depois quando quiser</span>
                    </span>
                    <span className="seo lo">
                      <i className="ph-fill ph-warning" /> SEO mínimo
                    </span>
                  </button>
                </div>

                <div className="gctx">
                  {gpeModo === 'vincular' && (
                    <>
                      <input
                        className="field"
                        value={gpeLink}
                        onChange={(e) => gValidate(e.target.value)}
                        placeholder="https://g.co/kgs/… ou link do seu perfil"
                        autoComplete="off"
                      />
                      {gpeErr && (
                        <div className="err">
                          <i className="ph-fill ph-warning-circle" /> Esse link não parece ser do
                          Google. Confira e cole de novo.
                        </div>
                      )}
                    </>
                  )}
                  {gpeModo === 'criar' && (
                    <div className="gnote">
                      <i className="ph-fill ph-arrow-square-out" />
                      <span>
                        <b>Vamos abrir o Google pra você criar o perfil.</b> Depois é só voltar aqui
                        e colar o link.
                      </span>
                      <a
                        className="btn sm"
                        href="https://business.google.com/create"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir o Google
                      </a>
                    </div>
                  )}
                  {gpeModo === 'sem' && (
                    <div className="gwarn">
                      <i className="ph-fill ph-warning" />
                      <span>
                        <b>SEO mínimo:</b> sem o Perfil de Empresa, seu negócio não aparece no mapa
                        nem nas buscas locais do Google (&quot;perto de mim&quot;), a visibilidade
                        que mais traz cliente da sua região.
                      </span>
                    </div>
                  )}
                </div>

                <p className="diag-line">
                  <i className="ph-duotone ph-sparkle" /> A IA analisa sua presença no Google e nas
                  IAs e mostra o que melhorar.{' '}
                  <button className="diag-link" onClick={() => setDiagModal(true)}>
                    Ver como funciona
                  </button>{' '}
                  <span className="pro">
                    <i className="ph-fill ph-crown-simple" /> Assinante
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* 6 · CONHECIMENTO */}
          <section
            className={`screen compact${screen === 5 ? ' active' : screen > 5 ? ' left' : ''}`}
          >
            <div className="panel">
              <div className="card">
                <div className="step gold">
                  <span className="n">6</span> Seu conhecimento vale ouro
                </div>
                <h1 className="q">Compartilhe o que só quem é da área sabe</h1>
                <p className="hint">
                  Isso vira a base de conhecimento do seu site: a IA usa pra escrever os artigos do
                  blog e responder seus clientes, construindo autoridade real.
                </p>

                <div className="kgrid">
                  <div className="kmain">
                    <div className="eeat">
                      <span className="eeat-ic">
                        <i className="ph-duotone ph-medal" />
                      </span>
                      <p>
                        Quanto mais você ensina aqui, mais forte fica seu <b>E-E-A-T</b>, o sinal que
                        mais pesa no SEO hoje.
                      </p>
                    </div>
                    <div className="kq">
                      {KQUESTIONS.map((q, i) => {
                        const done =
                          (answers[i] ?? '').trim().split(/\s+/).filter(Boolean).length >= 12
                        return (
                          <div key={i} className={`kq-item${done ? ' done' : ''}`}>
                            <div className="kq-q">
                              <i className="ph-fill ph-seal-question" /> {q[0]}
                            </div>
                            <textarea
                              value={answers[i] ?? ''}
                              onChange={(e) => setAnswer(i, e.target.value)}
                              placeholder={q[1]}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <p className="tips">
                      {authority.p < 35 ? (
                        <>
                          <i className="ph-fill ph-lightbulb" /> Responda com detalhes do seu dia a
                          dia. Quanto mais específico, mais autoridade.
                        </>
                      ) : authority.p < 70 ? (
                        <>
                          <i className="ph-fill ph-lightbulb" /> Bom! Mais um exemplo concreto e você
                          chega em autoridade Forte.
                        </>
                      ) : (
                        <>
                          <i className="ph-fill ph-check-circle" /> Excelente. Isso vira artigos de
                          blog e respostas que só você tem.
                        </>
                      )}
                    </p>
                    <div className="kfuturo">
                      <i className="ph-duotone ph-books" />{' '}
                      <span>
                        Isso vira a <b>wiki do seu negócio</b>, a base que a IA usa pra gerar o
                        conteúdo do site e os artigos do blog. Você pode <b>editar e adicionar mais</b>{' '}
                        quando quiser, lá no painel.
                      </span>
                    </div>
                  </div>
                  <aside className="authbar">
                    <span className="auth-score" style={{ color: authority.color }}>
                      {authority.label}
                    </span>
                    <div className="auth-track">
                      <i
                        style={{
                          transform: `scaleY(${Math.max(0.06, authority.p / 100).toFixed(3)})`,
                        }}
                      />
                    </div>
                    <span className="auth-lbl">
                      Força de
                      <br />
                      autoridade
                    </span>
                  </aside>
                </div>
              </div>
            </div>
          </section>

          {/* 7 · PRÉVIA / DOMÍNIO */}
          <section className={`screen${screen === 6 ? ' active' : ''}`}>
            <div className="panel">
              <div className="card">
                <div className="step">
                  <span className="n">7</span> Tudo pronto
                </div>
                <h1 className="q">Você está pronto pra gerar o site</h1>
                <div className="ready">
                  <i className="ph-fill ph-check-circle" /> Tudo certo, podemos criar agora
                </div>
                <div className="recap">
                  <div className="rrow">
                    <span className="ic">
                      <i className="ph-fill ph-storefront" />
                    </span>
                    <div>
                      <div className="k">Negócio</div>
                      <div className="v">{businessName || 'Seu negócio'}</div>
                    </div>
                    <button className="edit" onClick={() => jump(1)}>
                      editar
                    </button>
                  </div>
                  <div className="rrow">
                    <span className="ic">
                      <i className="ph-fill ph-tag" />
                    </span>
                    <div>
                      <div className="k">Segmento</div>
                      <div className="v">{niche || '—'}</div>
                    </div>
                    <button className="edit" onClick={() => jump(2)}>
                      editar
                    </button>
                  </div>
                  <div className="rrow">
                    <span className="ic">
                      <i className="ph-fill ph-buildings" />
                    </span>
                    <div>
                      <div className="k">Porte</div>
                      <div className="v">{PORTES.find((p) => p[0] === porte)?.[1] ?? '—'}</div>
                    </div>
                    <button className="edit" onClick={() => jump(3)}>
                      editar
                    </button>
                  </div>
                  <div className="rrow">
                    <span className="ic">
                      <i className="ph-fill ph-map-pin" />
                    </span>
                    <div>
                      <div className="k">Cidade</div>
                      <div className="v">{city ? `${city}${uf ? `, ${uf}` : ''}` : 'Sua cidade'}</div>
                    </div>
                    <button className="edit" onClick={() => jump(3)}>
                      editar
                    </button>
                  </div>
                </div>

                <div className="lbl" style={{ marginTop: '1.7rem' }}>
                  <i className="ph-duotone ph-globe-hemisphere-west" /> Qual será o endereço do seu
                  site?
                </div>
                <p className="hint" style={{ margin: '0 0 1rem', fontSize: '.92rem' }}>
                  Isso afeta diretamente sua força no Google e nas IAs. Você pode mudar depois.
                </p>
                <div className="domains">
                  <button
                    className={`dom${dominioModo === 'proprio' ? ' on' : ''}`}
                    onClick={() => setDominioModo('proprio')}
                  >
                    <span className="dradio" />
                    <span className="dbody">
                      <span className="dhead">
                        <b>Domínio próprio</b>
                        <span className="rec">
                          <i className="ph-fill ph-trophy" /> Recomendado p/ SEO
                        </span>
                      </span>
                      <span className="durl">{slug}.com.br</span>
                      <span className="ddesc">
                        Máxima performance no Google e nas buscas por IA. Não tem um? A gente compra e
                        configura pra você.
                      </span>
                    </span>
                  </button>
                  <button
                    className={`dom${dominioModo === 'subdominio' ? ' on' : ''}`}
                    onClick={() => setDominioModo('subdominio')}
                  >
                    <span className="radio" />
                    <span className="dbody">
                      <span className="dhead">
                        <b>Subdomínio grátis do HARPIA</b>
                      </span>
                      <span className="durl">{slug}.harpia.site</span>
                      <span className="ddesc">Pronto na hora, sem custo.</span>
                      <span className="dwarn">
                        <i className="ph-fill ph-warning" />{' '}
                        <span>
                          <b>Desempenho de SEO inferior:</b> seu site terá menos força no Google e nas
                          IAs, e a autoridade fica com a plataforma, não com você.
                        </span>
                      </span>
                    </span>
                  </button>
                </div>

                {genError && (
                  <div className="err">
                    <i className="ph-fill ph-warning-circle" /> {genError}
                  </div>
                )}

                <p className="hint" style={{ margin: '1.1rem 0 0' }}>
                  A IA vai escrever os textos já otimizados pra SEO, GEO e AEO. Leva cerca de um
                  minuto.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* footer */}
        <footer className="foot">
          <button
            className="btn ghost"
            style={{ visibility: screen === 0 ? 'hidden' : 'visible' }}
            onClick={() => go(-1)}
          >
            <i className="ph-duotone ph-arrow-left" /> Voltar
          </button>
          {isLastScreen ? (
            <button className="btn amber big" onClick={handleGenerate}>
              Gerar meu site <i className="ph-fill ph-rocket-launch" />
            </button>
          ) : (
            <button className="btn" onClick={() => go(1)}>
              Continuar <i className="ph-fill ph-arrow-right" />
            </button>
          )}
        </footer>
      </div>

      {/* loading overlay */}
      {overlay && (
        <div className="overlay">
          <div className="loadcard">
            <div className="spinner" />
            <h2>Criando seu site…</h2>
            <p>Escrevendo os textos e otimizando pra busca. Não feche esta tela.</p>
            <div className="loadsteps">
              {[
                'Entendendo o seu negócio',
                'Escrevendo os textos otimizados',
                'Montando o layout e o blog',
                'Aplicando SEO, GEO e AEO',
              ].map((t, i) => (
                <div key={i} className={i <= loadStep ? 'on' : ''}>
                  <i className={i <= loadStep ? 'ph-fill ph-check-circle' : 'ph-duotone ph-circle'} />{' '}
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* modal: como o diagnóstico funciona */}
      {diagModal && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDiagModal(false)
          }}
        >
          <div className="loadcard" style={{ textAlign: 'left', maxWidth: 450 }}>
            <span className="diag-ic" style={{ marginBottom: '1rem' }}>
              <i className="ph-duotone ph-sparkle" />
            </span>
            <h2 style={{ textAlign: 'left', margin: '0 0 .4rem' }}>Como o diagnóstico funciona</h2>
            <p style={{ textAlign: 'left', margin: '0 0 1.2rem' }}>
              A IA olha sua presença no Google e nas IAs e mostra exatamente o que melhorar:
            </p>
            <div className="recap" style={{ margin: '0 0 1.3rem' }}>
              <div className="rrow">
                <span className="ic">
                  <i className="ph-fill ph-magnifying-glass" />
                </span>
                <div>
                  <div className="k">Google</div>
                  <div className="v" style={{ fontSize: '.88rem' }}>
                    Aparece, mas sem horário nem fotos
                  </div>
                </div>
              </div>
              <div className="rrow">
                <span className="ic" style={{ background: 'linear-gradient(160deg,#7c6df0,#4a86f5)' }}>
                  <i className="ph-fill ph-brain" />
                </span>
                <div>
                  <div className="k">ChatGPT &amp; Gemini</div>
                  <div className="v" style={{ fontSize: '.88rem' }}>
                    Ainda não citam você na sua cidade
                  </div>
                </div>
              </div>
              <div className="rrow">
                <span className="ic" style={{ background: 'linear-gradient(160deg,#5a6b82,#36435a)' }}>
                  <i className="ph-fill ph-code" />
                </span>
                <div>
                  <div className="k">Site atual</div>
                  <div className="v" style={{ fontSize: '.88rem' }}>
                    Sem dados estruturados (schema) e sem FAQ
                  </div>
                </div>
              </div>
            </div>
            <p style={{ textAlign: 'left', fontSize: '.84rem', color: '#9fb2cc', margin: '0 0 1.3rem' }}>
              A HARPIA preenche o que falta, cria o conteúdo e estrutura tudo pra você aparecer.
              Disponível na plataforma após assinar.
            </p>
            <button
              className="btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setDiagModal(false)}
            >
              <i className="ph-fill ph-check" /> Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
