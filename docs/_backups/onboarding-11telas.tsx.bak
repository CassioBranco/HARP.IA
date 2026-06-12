'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ServiceItem = { name: string; description: string; price_range: string }

type OnboardingData = {
  category: string
  niche: string
  business_name: string
  city: string
  state: string
  service_radius_km: number
  city2: string
  state2: string
  services: ServiceItem[]
  expertise: string        // "seu conhecimento vale ouro" — mapeia para cases + differentials
  target_audience: string
  pain_points: string
  years_experience: string
  credentials: string
  keywords_primary: string[]
  keywords_secondary: string[]
  tone: string
  intent_default_blog: string
  gbp_connected: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Categorias e nichos
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'saude',       label: 'Saúde',                 icon: '🏥', desc: 'Clínica, dentista, psicólogo...' },
  { value: 'juridico',    label: 'Jurídico & Financeiro',  icon: '⚖️', desc: 'Advogado, contador, consultor...' },
  { value: 'beleza',      label: 'Beleza & Cuidados',      icon: '✂️', desc: 'Salão, barbearia, estética...' },
  { value: 'alimentacao', label: 'Alimentação',            icon: '🍽️', desc: 'Restaurante, padaria, café...' },
  { value: 'educacao',    label: 'Educação & Cursos',      icon: '🎓', desc: 'Escola, academia, coaching...' },
  { value: 'imoveis',     label: 'Imóveis & Construção',   icon: '🏠', desc: 'Imobiliária, reformas...' },
  { value: 'geral',       label: 'Outro Negócio',          icon: '🔧', desc: 'Serviços, comércio, institucional...' },
]

const NICHES_BY_CAT: Record<string, { value: string; label: string; icon: string }[]> = {
  saude: [
    { value: 'clinica',      label: 'Clínica / Consultório', icon: '🏥' },
    { value: 'odontologia',  label: 'Odontologia',           icon: '🦷' },
    { value: 'psicologia',   label: 'Psicologia / Terapia',  icon: '🧠' },
    { value: 'fisioterapia', label: 'Fisioterapia',           icon: '🏃' },
    { value: 'veterinaria',  label: 'Veterinária / Pet',      icon: '🐾' },
    { value: 'nutricao',     label: 'Nutrição / Bem-estar',   icon: '🥗' },
  ],
  juridico: [
    { value: 'advocacia',     label: 'Advocacia',              icon: '⚖️' },
    { value: 'contabilidade', label: 'Contabilidade',          icon: '📊' },
    { value: 'consultoria',   label: 'Consultoria / Coaching', icon: '💼' },
  ],
  beleza: [
    { value: 'salao',    label: 'Salão de Beleza', icon: '💇' },
    { value: 'barbearia',label: 'Barbearia',        icon: '✂️' },
    { value: 'estetica', label: 'Estética / Clínica',icon: '💅' },
    { value: 'spa',      label: 'Spa / Bem-estar',  icon: '🧖' },
  ],
  alimentacao: [
    { value: 'restaurante', label: 'Restaurante / Bistrô',  icon: '🍽️' },
    { value: 'lanchonete',  label: 'Lanchonete / Café',     icon: '☕' },
    { value: 'padaria',     label: 'Padaria / Confeitaria', icon: '🥐' },
    { value: 'bar',         label: 'Bar / Cervejaria',      icon: '🍺' },
  ],
  educacao: [
    { value: 'escola',   label: 'Escola / Curso',      icon: '🎓' },
    { value: 'academia', label: 'Academia / Pilates',   icon: '💪' },
    { value: 'coaching', label: 'Coaching / Mentoria',  icon: '🎯' },
    { value: 'idiomas',  label: 'Escola de Idiomas',    icon: '🌎' },
  ],
  imoveis: [
    { value: 'imobiliaria', label: 'Imobiliária / Corretor', icon: '🏠' },
    { value: 'construtora', label: 'Construtora / Reformas', icon: '🏗️' },
    { value: 'arquitetura', label: 'Arquitetura / Design',   icon: '📐' },
  ],
  geral: [
    { value: 'servicos',      label: 'Prestação de Serviços',   icon: '🔧' },
    { value: 'comercio',      label: 'Comércio Local',          icon: '🏪' },
    { value: 'institucional', label: 'Empresa / Institucional', icon: '🏢' },
    { value: 'landing',       label: 'Landing Page',            icon: '🚀' },
  ],
}

const TONES = [
  { value: 'profissional', label: 'Profissional',  desc: 'Sério, técnico, confiável',        icon: '👔' },
  { value: 'proximo',      label: 'Próximo',        desc: 'Caloroso, acessível, humano',     icon: '🤝' },
  { value: 'autoridade',   label: 'Autoridade',     desc: 'Especialista, direto, assertivo', icon: '🎯' },
  { value: 'descontraido', label: 'Descontraído',   desc: 'Informal, leve, direto ao ponto', icon: '😊' },
]

const TOTAL_SCREENS = 11

const EMPTY: OnboardingData = {
  category: '', niche: '', business_name: '',
  city: '', state: '', service_radius_km: 20, city2: '', state2: '',
  services: [{ name: '', description: '', price_range: '' }],
  expertise: '',
  target_audience: '', pain_points: '',
  years_experience: '', credentials: '',
  keywords_primary: [], keywords_secondary: [],
  tone: 'profissional', intent_default_blog: 'informacional',
  gbp_connected: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// Score CPF
// ─────────────────────────────────────────────────────────────────────────────

type CPFScore = { c: number; p: number; f: number; total: number }

function calcCPF(d: OnboardingData): CPFScore {
  const c = ([
    [d.business_name.trim().length > 2, 30],
    [d.niche.length > 0,                25],
    [d.city.trim().length > 2,          25],
    [Number(d.years_experience) > 0,    10],
    [d.credentials.trim().length > 0,   10],
  ] as [boolean, number][]).reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0)

  const p = ([
    [d.expertise.trim().length > 20,        40],
    [d.target_audience.trim().length > 10,  35],
    [d.pain_points.trim().length > 10,      25],
  ] as [boolean, number][]).reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0)

  const f = ([
    [d.services.some(s => s.name.trim().length > 2), 35],
    [d.keywords_primary.length > 0,                  35],
    [d.tone.length > 0,                              15],
    [d.gbp_connected,                                15],
  ] as [boolean, number][]).reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0)

  return { c, p, f, total: Math.round((c + p + f) / 3) }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Meter
// ─────────────────────────────────────────────────────────────────────────────

function calcExpertiseSEO(expertise: string, city: string): { score: number; tips: string[]; level: string } {
  const words = expertise.trim().split(/\s+/).filter(Boolean)
  const text  = expertise.toLowerCase()
  let score = 0
  const tips: string[] = []

  if (words.length >= 50) score += 25
  else if (words.length >= 25) { score += 12; tips.push(`Adicione mais ${50 - words.length} palavras para fortalecer o sinal`) }
  else tips.push('Escreva pelo menos 25 palavras para o Google entender sua especialização')

  if (city && text.includes(city.toLowerCase())) score += 20
  else if (city) tips.push(`Mencione "${city}" para reforçar o posicionamento local`)

  if (/\b\d+\s*(ano|anos)\b/.test(text)) score += 15
  else tips.push('Mencione quantos anos de experiência você tem')

  const specWords = ['especialista','especializado','único','referência','certificad','pós-gradua','mestrado','doutor','expert']
  if (specWords.some(w => text.includes(w))) score += 20
  else tips.push('Mencione sua especialização, certificação ou o que te torna referência')

  if (/\b\d+\s*(paciente|cliente|caso|projeto|cirurgia|atendimento|consulta)/.test(text)) score += 20
  else tips.push('Adicione um número concreto: pacientes atendidos, projetos entregues, casos resolvidos')

  score = Math.min(100, score)
  const level = score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Fraco'
  if (score >= 80 && tips.length === 0) tips.push('Perfeito! Este conteúdo vai se destacar na busca orgânica.')
  return { score, tips, level }
}

// ─────────────────────────────────────────────────────────────────────────────
// TagInput
// ─────────────────────────────────────────────────────────────────────────────

function TagInput({ tags, onAdd, onRemove, placeholder }: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  function commit(value: string) {
    const tag = value.trim().replace(/,+$/, '')
    if (tag && !tags.includes(tag)) onAdd(tag)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && input.trim()) { e.preventDefault(); commit(input) }
    else if (e.key === ',' && input.trim()) { e.preventDefault(); commit(input) }
    else if (e.key === 'Backspace' && !input && tags.length > 0) onRemove(tags[tags.length - 1]!)
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-input bg-background p-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 min-h-[60px] cursor-text">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="ml-0.5 text-base leading-none hover:text-destructive transition-colors"
            aria-label={`Remover ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? (placeholder ?? 'Digite e pressione Enter…') : 'Mais uma…'}
        className="flex-1 min-w-[140px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-0.5"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CitySearch — Nominatim autocomplete
// ─────────────────────────────────────────────────────────────────────────────

type NominatimResult = {
  place_id: number
  display_name: string
  address: { city?: string; town?: string; municipality?: string; state?: string; state_code?: string }
}

const STATE_MAP: Record<string, string> = {
  'Acre':'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA','Ceará':'CE',
  'Distrito Federal':'DF','Espírito Santo':'ES','Goiás':'GO','Maranhão':'MA',
  'Mato Grosso':'MT','Mato Grosso do Sul':'MS','Minas Gerais':'MG','Pará':'PA',
  'Paraíba':'PB','Paraná':'PR','Pernambuco':'PE','Piauí':'PI','Rio de Janeiro':'RJ',
  'Rio Grande do Norte':'RN','Rio Grande do Sul':'RS','Rondônia':'RO','Roraima':'RR',
  'Santa Catarina':'SC','São Paulo':'SP','Sergipe':'SE','Tocantins':'TO',
}

const INPUT_CLS =
  'w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base ' +
  'text-foreground placeholder:text-muted-foreground focus:outline-none ' +
  'focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50'

function CitySearch({ city, state, onSelect, placeholder }: {
  city: string; state: string
  onSelect: (city: string, state: string) => void
  placeholder?: string
}) {
  const [query, setQuery]     = useState(city ? `${city}${state ? ` — ${state}` : ''}` : '')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef    = useRef<AbortController | null>(null)

  useEffect(() => {
    if (city && query === '') setQuery(`${city}${state ? ` — ${state}` : ''}`)
  }, [city]) // eslint-disable-line

  async function search(q: string) {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=br&format=json&limit=8&addressdetails=1&email=harpia-beta@dicasdodove.com.br`
      const res  = await fetch(url, { signal: abortRef.current.signal })
      const data: NominatimResult[] = await res.json()
      const cities = data.filter(r => r.address.city || r.address.town || r.address.municipality)
      setResults(cities.slice(0, 6))
      setOpen(cities.length > 0)
    } catch { /* aborted or network error */ } finally { setLoading(false) }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 400)
  }

  function handleSelect(r: NominatimResult) {
    const cityName  = r.address.city ?? r.address.town ?? r.address.municipality ?? ''
    const stateName = r.address.state ?? ''
    const uf = r.address.state_code?.toUpperCase() ?? STATE_MAP[stateName] ?? ''
    setQuery(`${cityName}${uf ? ` — ${uf}` : ''}`)
    setOpen(false)
    onSelect(cityName, uf)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          className={INPUT_CLS}
          placeholder={placeholder ?? 'Digite o nome da cidade…'}
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
            buscando…
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {results.map(r => {
            const cityName  = r.address.city ?? r.address.town ?? r.address.municipality ?? ''
            const stateName = r.address.state ?? ''
            const uf = r.address.state_code?.toUpperCase() ?? STATE_MAP[stateName] ?? ''
            return (
              <li key={r.place_id}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                >
                  <span className="text-base">📍</span>
                  <span className="font-medium text-foreground">{cityName}</span>
                  {uf && <span className="text-muted-foreground">— {uf}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {city && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          ✓ {city}{state ? `, ${state}` : ''}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CPF Mini — barras de sinal no header
// ─────────────────────────────────────────────────────────────────────────────

function SignalBars({ value, color }: { value: number; color: string }) {
  const bars = Math.round(value / 25)
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1,2,3,4].map(i => (
        <div
          key={i}
          className={`w-1 rounded-sm transition-all duration-500 ${i <= bars ? color : 'bg-muted'}`}
          style={{ height: `${i * 25}%` }}
        />
      ))}
    </div>
  )
}

function CPFMini({ score }: { score: CPFScore }) {
  return (
    <div className="flex items-center gap-3">
      {[
        { label: 'C', value: score.c, color: 'bg-blue-500' },
        { label: 'P', value: score.p, color: 'bg-purple-500' },
        { label: 'F', value: score.f, color: 'bg-green-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center gap-1" title={`${label}: ${value}%`}>
          <SignalBars value={value} color={color} />
          <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ScreenLayout — wrapper Typeform-style
// ─────────────────────────────────────────────────────────────────────────────

interface ScreenLayoutProps {
  screen: number
  cpf: CPFScore
  saving: boolean
  onBack: () => void
  onNext: () => void
  canNext: boolean
  nextLabel?: string
  hint?: string
  children: React.ReactNode
}

function ScreenLayout({ screen, cpf, saving, onBack, onNext, canNext, nextLabel, hint, children }: ScreenLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="font-heading text-lg font-bold text-primary">HARPIA</Link>
          <div className="flex items-center gap-4">
            {saving && <span className="text-xs text-muted-foreground animate-pulse">Salvando…</span>}
            <CPFMini score={cpf} />
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              cpf.total >= 70 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {cpf.total}%
            </span>
          </div>
        </div>
        {/* Barra de progresso */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${(screen / TOTAL_SCREENS) * 100}%` }}
          />
        </div>
      </header>

      {/* Corpo */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {screen} de {TOTAL_SCREENS}
        </p>
        {children}
        {hint && <p className="mt-4 text-sm text-muted-foreground">{hint}</p>}
      </main>

      {/* Rodapé fixo */}
      <footer className="sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            disabled={screen === 1}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Voltar
          </button>
          <button
            onClick={onNext}
            disabled={!canNext}
            className={`rounded-xl px-7 py-2.5 text-sm font-semibold transition-all ${
              canNext
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {nextLabel ?? 'Continuar →'}
          </button>
        </div>
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router    = useRouter()
  const [screen,    setScreen]    = useState(1)
  const [data,      setData]      = useState<OnboardingData>(EMPTY)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)
  // Nicho expandido na tela 1 — qual categoria está aberta
  const [expandedCat, setExpandedCat] = useState<string>('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cpf         = calcCPF(data)
  const canGenerate = cpf.total >= 70

  function guessCategory(niche: string): string {
    for (const [cat, niches] of Object.entries(NICHES_BY_CAT)) {
      if (niches.some(n => n.value === niche)) return cat
    }
    return 'geral'
  }

  // ── Init: auth + restore ──
  useEffect(() => {
    async function init() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const savedScreen = typeof window !== 'undefined'
        ? localStorage.getItem('harpia_onboarding_screen')
        : null

      const { data: profiles } = await supabase
        .from('onboarding_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (profiles && profiles.length > 0) {
        const p = profiles[0]
        setProfileId(p.id)
        const cat = p.niche ? guessCategory(p.niche) : ''
        const city2Raw: string = p.coverage_areas?.[0] ?? ''
        const city2Parts = city2Raw.split(',').map((s: string) => s.trim())
        setData({
          category:            cat,
          niche:               p.niche             ?? '',
          business_name:       p.business_name     ?? '',
          city:                p.city              ?? '',
          state:               p.state             ?? '',
          service_radius_km:   p.service_radius_km ?? 20,
          city2:               city2Parts[0] ?? '',
          state2:              city2Parts[1] ?? '',
          services:            p.services?.length ? p.services : [{ name: '', description: '', price_range: '' }],
          expertise:           p.cases ?? p.differentials ?? '',
          target_audience:     p.target_audience   ?? '',
          pain_points:         p.pain_points       ?? '',
          years_experience:    p.years_experience?.toString() ?? '',
          credentials:         (p.credentials ?? []).join(', '),
          keywords_primary:    p.keywords_primary  ?? [],
          keywords_secondary:  p.keywords_secondary ?? [],
          tone:                p.tone              ?? 'profissional',
          intent_default_blog: p.intent_default_blog ?? 'informacional',
          gbp_connected:       p.gbp_connected     ?? false,
        })
        if (cat) setExpandedCat(cat)
        if (savedScreen) {
          const n = parseInt(savedScreen)
          if (n >= 1 && n <= TOTAL_SCREENS) setScreen(n)
        }
      }
    }
    init()
  }, [router])

  // ── Save to Supabase ──
  const save = useCallback(async (d: OnboardingData, sc?: number) => {
    if (!userId) return
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const coverage: string[] = []
      if (d.city2) coverage.push(`${d.city2}${d.state2 ? `, ${d.state2}` : ''}`)

      const payload = {
        business_name:       d.business_name     || null,
        niche:               d.niche             || null,
        city:                d.city              || null,
        state:               d.state             || null,
        service_radius_km:   d.service_radius_km || null,
        coverage_areas:      coverage,
        services:            d.services.filter(s => s.name.trim()),
        differentials:       d.expertise         || null,  // expertise → differentials
        target_audience:     d.target_audience   || null,
        pain_points:         d.pain_points       || null,
        credentials:         d.credentials
          ? d.credentials.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        years_experience:    d.years_experience ? Number(d.years_experience) : null,
        cases:               d.expertise         || null,  // expertise → cases
        keywords_primary:    d.keywords_primary  ?? [],
        keywords_secondary:  d.keywords_secondary ?? [],
        tone:                d.tone              || null,
        intent_default_blog: d.intent_default_blog || null,
        gbp_connected:       d.gbp_connected,
        completeness_score:  calcCPF(d).total,
        updated_at:          new Date().toISOString(),
      }

      if (profileId) {
        await supabase.from('onboarding_profiles').update(payload).eq('id', profileId)
      } else {
        const { data: inserted } = await supabase
          .from('onboarding_profiles')
          .insert(payload)
          .select('id')
          .single()
        if (inserted?.id) setProfileId(inserted.id)
      }

      if (sc !== undefined) {
        localStorage.setItem('harpia_onboarding_screen', String(sc))
      }
    } catch { /* silencioso */ } finally {
      setSaving(false)
    }
  }, [userId, profileId])

  function scheduleSave(d: OnboardingData) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(d), 1500)
  }

  function update(patch: Partial<OnboardingData>) {
    setData(prev => {
      const next = { ...prev, ...patch }
      scheduleSave(next)
      return next
    })
  }

  function updateService(idx: number, field: keyof ServiceItem, value: string) {
    setData(prev => {
      const services = prev.services.map((s, i) => i === idx ? { ...s, [field]: value } : s)
      const next = { ...prev, services }
      scheduleSave(next)
      return next
    })
  }

  function goTo(n: number) {
    const next = Math.max(1, Math.min(TOTAL_SCREENS, n))
    setScreen(next)
    save(data, next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => goTo(screen + 1)
  const back = () => goTo(screen - 1)

  async function finish() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await save(data, TOTAL_SCREENS)
    localStorage.removeItem('harpia_onboarding_screen')
    router.push('/templates')
  }

  // ── can-next por tela ──
  const canNext: boolean = (() => {
    switch (screen) {
      case 1:  return data.niche.length > 0
      case 2:  return data.business_name.trim().length > 2
      case 3:  return data.city.trim().length > 1
      case 4:  return data.services.some(s => s.name.trim().length > 1)
      case 5:  return data.expertise.trim().length > 10
      case 6:  return data.target_audience.trim().length > 5
      case 7:  return data.pain_points.trim().length > 5
      case 8:  return true
      case 9:  return true
      case 10: return data.tone.length > 0
      case 11: return canGenerate
      default: return true
    }
  })()

  const isLast    = screen === TOTAL_SCREENS
  const nextLabel = isLast
    ? (canGenerate ? '✨ Gerar meu site' : `Faltam ${70 - cpf.total}% para gerar`)
    : undefined

  const layoutProps = { screen, cpf, saving, onBack: back, onNext: isLast ? finish : next, canNext, nextLabel }
  const TEXTAREA_CLS = `${INPUT_CLS} min-h-[140px] resize-none`

  // ─────────────────────────────────────────────────────────────────────────
  // Telas
  // ─────────────────────────────────────────────────────────────────────────

  // ── Tela 1 — Categoria + Nicho (1 tela, 2 cliques) ──
  if (screen === 1) {
    const nichos = expandedCat ? (NICHES_BY_CAT[expandedCat] ?? []) : []
    const selectedCat = CATEGORIES.find(c => c.value === expandedCat)

    return (
      <ScreenLayout {...layoutProps} hint="Clique na categoria e depois no tipo de negócio.">
        <h1 className="font-heading mb-8 text-2xl font-bold text-foreground sm:text-3xl">
          Que tipo de negócio você tem?
        </h1>

        {/* Categorias */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {CATEGORIES.map(cat => {
            const isExpanded = expandedCat === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setExpandedCat(isExpanded ? '' : cat.value)}
                className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                  isExpanded
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                <span className="text-xs text-muted-foreground leading-snug">{cat.desc}</span>
              </button>
            )
          })}
        </div>

        {/* Nichos — aparecem inline ao expandir a categoria */}
        {expandedCat && nichos.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <span>{selectedCat?.icon}</span>
              <span>{selectedCat?.label} — escolha a especialidade:</span>
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {nichos.map(n => (
                <button
                  key={n.value}
                  onClick={() => {
                    update({ category: expandedCat, niche: n.value })
                    setTimeout(next, 150)
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    data.niche === n.value
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                  }`}
                >
                  <span className="text-2xl shrink-0">{n.icon}</span>
                  <span className="text-sm font-semibold text-foreground">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </ScreenLayout>
    )
  }

  // ── Tela 2 — Nome do negócio ──
  if (screen === 2) return (
    <ScreenLayout {...layoutProps} hint="Exatamente como aparece no Google e nos seus materiais.">
      <h1 className="font-heading mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Qual é o nome do seu negócio?
      </h1>
      <input
        className={INPUT_CLS}
        placeholder="Ex: Clínica Dr. Carlos, Studio Beleza, Marmoraria Silva..."
        value={data.business_name}
        onChange={e => update({ business_name: e.target.value })}
        onKeyDown={e => e.key === 'Enter' && canNext && next()}
        autoFocus
      />
    </ScreenLayout>
  )

  // ── Tela 3 — Localização ──
  if (screen === 3) {
    const km = data.service_radius_km
    const radiusLabel =
      km <= 10 ? 'bairros próximos' :
      km <= 20 ? 'cidade e arredores' :
      'cidades vizinhas'

    return (
      <ScreenLayout {...layoutProps}>
        <h1 className="font-heading mb-8 text-2xl font-bold text-foreground sm:text-3xl">
          Onde você atende?
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Cidade principal *</label>
            <CitySearch city={data.city} state={data.state} onSelect={(city, state) => update({ city, state })} />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Raio de atuação</label>
              <span className="font-heading text-lg font-bold text-primary">{km} km</span>
            </div>
            <input
              type="range" min={5} max={30} step={5}
              value={km}
              onChange={e => update({ service_radius_km: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>5 km</span><span>15 km</span><span>30 km</span>
            </div>
            <div className="mt-3 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-foreground">
              {data.city
                ? <>{km} km ao redor de <strong>{data.city}</strong> — {radiusLabel}</>
                : 'Selecione a cidade primeiro'
              }
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Segunda cidade <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <CitySearch
              city={data.city2} state={data.state2}
              onSelect={(city, state) => update({ city2: city, state2: state })}
              placeholder="Cidade adicional (opcional)…"
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            💡 Atende em mais de 2 cidades ou em todo o estado?{' '}
            <span className="font-medium text-foreground">Planos maiores cobrem estadual e nacional.</span>{' '}
            Disponível em breve.
          </div>
        </div>
      </ScreenLayout>
    )
  }

  // ── Tela 4 — Serviços ──
  if (screen === 4) return (
    <ScreenLayout {...layoutProps} hint="Cada serviço vira uma seção do site com SEO próprio.">
      <h1 className="font-heading mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        O que você oferece?
      </h1>

      <div className="flex flex-col gap-4">
        {data.services.map((svc, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Serviço {i + 1}
              </span>
              {data.services.length > 1 && (
                <button
                  type="button"
                  onClick={() => update({ services: data.services.filter((_, j) => j !== i) })}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <input
                className={INPUT_CLS}
                placeholder="Nome do serviço (ex: Consulta, Limpeza de pele, Defesa criminal...)"
                value={svc.name}
                onChange={e => updateService(i, 'name', e.target.value)}
              />
              <textarea
                className={`${INPUT_CLS} min-h-[80px] resize-none`}
                placeholder="O que inclui, como funciona, resultado esperado..."
                value={svc.description}
                onChange={e => updateService(i, 'description', e.target.value)}
              />
              <input
                className={INPUT_CLS}
                placeholder="Faixa de preço (ex: A partir de R$ 150, Consulte...)"
                value={svc.price_range}
                onChange={e => updateService(i, 'price_range', e.target.value)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => update({ services: [...data.services, { name: '', description: '', price_range: '' }] })}
          className="rounded-2xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          + Adicionar serviço
        </button>
      </div>
    </ScreenLayout>
  )

  // ── Tela 5 — "Seu conhecimento vale ouro" ──
  if (screen === 5) {
    const seo = calcExpertiseSEO(data.expertise, data.city)
    const barColor =
      seo.score >= 80 ? 'bg-green-500' :
      seo.score >= 60 ? 'bg-yellow-500' :
      seo.score >= 40 ? 'bg-orange-500' :
      'bg-red-400'

    return (
      <ScreenLayout {...layoutProps}>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">
          ⭐ Seu conhecimento vale ouro
        </div>
        <h1 className="font-heading mb-3 mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          O que você sabe que poucos sabem?
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sua especialização única — o que te diferencia de todo mundo na sua área.
          Ex: <em>"Especialista em guarda compartilhada há 12 anos em SP"</em>, <em>"Único nutricionista da região com foco em atletas amadores"</em>, <em>"10 anos trabalhando só com cães de grande porte em Sorocaba"</em>.
        </p>

        <textarea
          className={TEXTAREA_CLS}
          placeholder="Descreva sua especialização, seu nicho específico dentro da área e os resultados únicos que você entrega..."
          value={data.expertise}
          onChange={e => update({ expertise: e.target.value })}
          autoFocus
        />

        {/* SEO Meter */}
        {data.expertise.trim().length > 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Sinal SEO deste campo
              </span>
              <span className={`text-xs font-bold ${
                seo.score >= 80 ? 'text-green-600' :
                seo.score >= 60 ? 'text-yellow-600' :
                seo.score >= 40 ? 'text-orange-600' :
                'text-red-500'
              }`}>
                {seo.level} · {seo.score}%
              </span>
            </div>

            <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${seo.score}%` }}
              />
            </div>

            {seo.tips.length > 0 && (
              <ul className="space-y-1.5">
                {seo.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-0.5 shrink-0">{seo.score >= 80 ? '✅' : '💡'}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2">
              <span className="text-sm">✨</span>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Em breve:</span>{' '}
                IA vai sugerir melhorias e completar lacunas automaticamente
              </span>
            </div>
          </div>
        )}
      </ScreenLayout>
    )
  }

  // ── Tela 6 — Para quem você atende ──
  if (screen === 6) return (
    <ScreenLayout {...layoutProps} hint="Quanto mais específico, mais certeiro é o conteúdo gerado.">
      <h1 className="font-heading mb-3 text-2xl font-bold text-foreground sm:text-3xl">
        Para quem você atende?
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ex: adultos 30–60 anos com dor crônica em Sorocaba, donos de imóveis no centro da cidade...
      </p>
      <textarea
        className={TEXTAREA_CLS}
        placeholder="Descreva seu público ideal..."
        value={data.target_audience}
        onChange={e => update({ target_audience: e.target.value })}
        autoFocus
      />
    </ScreenLayout>
  )

  // ── Tela 7 — Dores do cliente ──
  if (screen === 7) return (
    <ScreenLayout {...layoutProps} hint="Essas dores viram perguntas do FAQ — a base do AEO (resposta direta no Google).">
      <h1 className="font-heading mb-3 text-2xl font-bold text-foreground sm:text-3xl">
        Quais são as principais dores do seu cliente?
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ex: não consegue dormir com a dor, não sabe se o terreno tem estrutura, quer resolver mas não sabe por onde começar...
      </p>
      <textarea
        className={TEXTAREA_CLS}
        placeholder="Problemas que seu cliente tem antes de te contratar..."
        value={data.pain_points}
        onChange={e => update({ pain_points: e.target.value })}
        autoFocus
      />
    </ScreenLayout>
  )

  // ── Tela 8 — Autoridade ──
  if (screen === 8) return (
    <ScreenLayout {...layoutProps} hint="Opcional — credenciais viram o bloco de autoridade. Google valoriza especialistas comprovados.">
      <h1 className="font-heading mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Sua autoridade
      </h1>

      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Anos de experiência</label>
            <input
              className={INPUT_CLS}
              type="number" min="0" max="60" placeholder="Ex: 15"
              value={data.years_experience}
              onChange={e => update({ years_experience: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Registro / Credencial</label>
            <input
              className={INPUT_CLS}
              placeholder="CRM 12345-SP, CRECI, CRC..."
              value={data.credentials}
              onChange={e => update({ credentials: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          💡 Esta etapa é opcional mas aumenta o score. Quanto mais completo, melhor o texto gerado.
        </div>
      </div>
    </ScreenLayout>
  )

  // ── Tela 9 — Keywords ──
  if (screen === 9) return (
    <ScreenLayout
      {...layoutProps}
      hint="Digite cada keyword e pressione Enter. Inclua sempre a cidade."
    >
      <h1 className="font-heading mb-3 text-2xl font-bold text-foreground sm:text-3xl">
        Palavras-chave do seu negócio
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        O que seus clientes digitam no Google para te encontrar?
      </p>

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Principais{' '}
            <span className="font-normal text-muted-foreground">(as que mais convertem)</span>
          </label>
          <TagInput
            tags={data.keywords_primary}
            onAdd={tag => update({ keywords_primary: [...data.keywords_primary, tag] })}
            onRemove={tag => update({ keywords_primary: data.keywords_primary.filter(t => t !== tag) })}
            placeholder={
              data.niche && data.city
                ? `${data.niche} ${data.city}, melhor ${data.niche} ${data.city}…`
                : 'Ex: dentista sorocaba, clínica odontológica sp…'
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Secundárias{' '}
            <span className="font-normal text-muted-foreground">(opcional — para blog e páginas internas)</span>
          </label>
          <TagInput
            tags={data.keywords_secondary}
            onAdd={tag => update({ keywords_secondary: [...data.keywords_secondary, tag] })}
            onRemove={tag => update({ keywords_secondary: data.keywords_secondary.filter(t => t !== tag) })}
            placeholder="implante dentário, clareamento, ortodontia adulto…"
          />
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">✨ A IA vai sugerir as melhores keywords</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Com base no seu nicho, cidade e serviços, o HARPIA vai gerar automaticamente as keywords com maior potencial. Você edita antes de gerar o site.
          </p>
        </div>
      </div>
    </ScreenLayout>
  )

  // ── Tela 10 — Tom de voz ──
  if (screen === 10) return (
    <ScreenLayout {...layoutProps}>
      <h1 className="font-heading mb-3 text-2xl font-bold text-foreground sm:text-3xl">
        Como você quer soar?
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        O tom de voz define como a IA escreve cada texto do seu site.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {TONES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => { update({ tone: t.value }); setTimeout(next, 150) }}
            className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
              data.tone === t.value
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
            }`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className="text-sm font-semibold text-foreground">{t.label}</span>
            <span className="text-xs text-muted-foreground">{t.desc}</span>
          </button>
        ))}
      </div>
    </ScreenLayout>
  )

  // ── Tela 11 — Resumo + GBP + Gerar ──
  return (
    <ScreenLayout
      {...layoutProps}
      nextLabel={canGenerate ? '✨ Gerar meu site' : `Faltam ${70 - cpf.total}% para gerar`}
    >
      <h1 className="font-heading mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Quase lá! 🎉
      </h1>

      {/* Score CPF */}
      <div className={`mb-6 rounded-2xl border p-5 ${
        canGenerate ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30'
      }`}>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-foreground">
            Sinais para o Google e as IAs
          </span>
          <span className={`font-heading text-xl font-bold ${
            canGenerate ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {cpf.total}%
          </span>
        </div>

        <div className="space-y-3">
          {[
            { label: 'C — Conhecimento',   sub: 'Google sabe quem você é',           value: cpf.c, color: 'bg-blue-500' },
            { label: 'P — Posicionamento', sub: 'Google entende por que te escolher', value: cpf.p, color: 'bg-purple-500' },
            { label: 'F — Faturamento',    sub: 'Google sabe o que você vende',       value: cpf.f, color: 'bg-green-500' },
          ].map(({ label, sub, value, color }) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{sub}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className={`mt-4 text-sm font-medium ${canGenerate ? 'text-primary' : 'text-muted-foreground'}`}>
          {canGenerate
            ? '✓ Ótimo! A IA tem o que precisa para gerar seu site.'
            : `Precisa de 70% no score. Volte e preencha mais campos. Faltam ${70 - cpf.total}%.`
          }
        </p>
      </div>

      {/* GBP */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Google Perfil de Empresas</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Integração OAuth — disponível em breve</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Em breve
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => update({ gbp_connected: !data.gbp_connected })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              data.gbp_connected ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              data.gbp_connected ? 'translate-x-5' : ''
            }`} />
          </button>
          <span className="text-sm text-muted-foreground">
            {data.gbp_connected ? 'Marcado como conectado' : 'Pular por agora'}
          </span>
        </div>
      </div>
    </ScreenLayout>
  )
}
