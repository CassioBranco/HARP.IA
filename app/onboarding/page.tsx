'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServiceItem = {
  name: string
  description: string
  price_range: string
}

type OnboardingData = {
  // Step 1 — Identidade
  business_name: string
  niche: string
  city: string
  state: string
  service_radius_km: string
  // Step 2 — Serviços
  services: ServiceItem[]
  differentials: string
  // Step 3 — Público
  target_audience: string
  pain_points: string
  // Step 4 — Autoridade
  credentials: string
  years_experience: string
  cases: string
  // Step 5 — SEO
  keywords_primary: string
  keywords_secondary: string
  tone: string
  intent_default_blog: string
  // Step 6 — GBP
  gbp_connected: boolean
}

const EMPTY: OnboardingData = {
  business_name: '',
  niche: '',
  city: '',
  state: '',
  service_radius_km: '30',
  services: [{ name: '', description: '', price_range: '' }],
  differentials: '',
  target_audience: '',
  pain_points: '',
  credentials: '',
  years_experience: '',
  cases: '',
  keywords_primary: '',
  keywords_secondary: '',
  tone: 'profissional',
  intent_default_blog: 'informacional',
  gbp_connected: false,
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NICHES = [
  // Profissões reguladas — dependem de SEO (não podem ou mal conseguem fazer tráfego pago)
  { value: 'advocacia',      label: 'Advocacia',                icon: '⚖️',  group: 'Profissões reguladas' },
  { value: 'contabilidade',  label: 'Contabilidade',            icon: '📊',  group: 'Profissões reguladas' },
  { value: 'psicologia',     label: 'Psicologia / Terapia',     icon: '🧠',  group: 'Profissões reguladas' },
  // Saúde
  { value: 'clinica',        label: 'Clínica / Consultório',    icon: '🏥',  group: 'Saúde' },
  { value: 'odontologia',    label: 'Odontologia',              icon: '🦷',  group: 'Saúde' },
  { value: 'fisioterapia',   label: 'Fisioterapia',             icon: '🏃',  group: 'Saúde' },
  { value: 'veterinaria',    label: 'Veterinária / Pet',        icon: '🐾',  group: 'Saúde' },
  // Outros nichos
  { value: 'imobiliaria',    label: 'Imobiliária',              icon: '🏠',  group: 'Outros' },
  { value: 'restaurante',    label: 'Restaurante / Alimentação',icon: '🍽️', group: 'Outros' },
  { value: 'salao',          label: 'Salão / Estética',         icon: '✂️',  group: 'Outros' },
  { value: 'escola',         label: 'Escola / Curso',           icon: '🎓',  group: 'Outros' },
  { value: 'servicos',       label: 'Serviços / Prestador',     icon: '🔧',  group: 'Outros' },
  { value: 'institucional',  label: 'Empresa / Institucional',  icon: '🏢',  group: 'Outros' },
  { value: 'landing',        label: 'Landing Page',             icon: '🚀',  group: 'Outros' },
]

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

const TONES = [
  { value: 'profissional',   label: 'Profissional',  desc: 'Sério, técnico, confiável'       },
  { value: 'proximo',        label: 'Próximo',       desc: 'Caloroso, acessível, humano'     },
  { value: 'autoridade',     label: 'Autoridade',    desc: 'Especialista, direto, assertivo'  },
  { value: 'descontraido',   label: 'Descontraído',  desc: 'Informal, leve, direto ao ponto' },
]

const INTENTS = [
  { value: 'informacional',  label: 'Informacional', desc: 'Ensina e explica — "como escolher..."'     },
  { value: 'comercial',      label: 'Comercial',     desc: 'Compara e convence — "melhor X em..."'     },
  { value: 'transacional',   label: 'Transacional',  desc: 'Gera ação — "agendar / contratar..."'      },
]

const STEP_LABELS = [
  'Identidade',
  'Serviços',
  'Público',
  'Autoridade',
  'SEO',
  'Google',
]

// ---------------------------------------------------------------------------
// Score CPF — 3 pilares do Método CPF + score global
// ---------------------------------------------------------------------------

type CPFScore = { c: number; p: number; f: number; total: number }

function calcCPF(d: OnboardingData): CPFScore {
  // C — Conhecimento: Google sabe quem você é
  const cChecks: Array<[boolean, number]> = [
    [d.business_name.trim().length > 2, 30],
    [d.niche.length > 0,                25],
    [d.city.trim().length > 2,          25],
    [Number(d.years_experience) > 0,    10],
    [d.credentials.trim().length > 0,   10],
  ]
  // P — Posicionamento: Google entende por que te escolher
  const pChecks: Array<[boolean, number]> = [
    [d.differentials.trim().length > 10, 35],
    [d.target_audience.trim().length > 10, 30],
    [d.pain_points.trim().length > 10,   25],
    [d.cases.trim().length > 5,          10],
  ]
  // F — Faturamento: Google sabe o que você vende e como te encontrar
  const fChecks: Array<[boolean, number]> = [
    [d.services.some(s => s.name.trim().length > 2), 35],
    [d.keywords_primary.trim().length > 3,           35],
    [d.tone.length > 0,                              15],
    [d.gbp_connected,                                15],
  ]
  const c = cChecks.reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0)
  const p = pChecks.reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0)
  const f = fChecks.reduce((s, [ok, pts]) => s + (ok ? pts : 0), 0)
  return { c, p, f, total: Math.round((c + p + f) / 3) }
}

// Mantido para compatibilidade com o bloqueio de geração (≥70%)
function calcScore(d: OnboardingData): number {
  return calcCPF(d).total
}

// ---------------------------------------------------------------------------
// CPFBars — mini barras de sinal no header
// ---------------------------------------------------------------------------

function SignalBars({ value, color }: { value: number; color: string }) {
  const bars = Math.round(value / 25) // 0-4 barras
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`w-1 rounded-sm transition-all duration-500 ${i <= bars ? color : 'bg-muted'}`}
          style={{ height: `${i * 25}%` }}
        />
      ))}
    </div>
  )
}

function CPFBars({ score }: { score: CPFScore }) {
  return (
    <div className="flex items-center gap-3">
      {[
        { label: 'Marca',    value: score.c, color: 'bg-blue-500',   tip: 'C — Conhecimento' },
        { label: 'Posição',  value: score.p, color: 'bg-purple-500', tip: 'P — Posicionamento' },
        { label: 'Vendas',   value: score.f, color: 'bg-green-500',  tip: 'F — Faturamento' },
      ].map(({ label, value, color, tip }) => (
        <div key={label} className="flex flex-col items-center gap-1" title={`${tip}: ${value}%`}>
          <SignalBars value={value} color={color} />
          <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepImpact — card de impacto por step (linguagem leiga)
// ---------------------------------------------------------------------------

type ImpactItem = { icon: string; text: string; badge?: string }

const STEP_IMPACT: Record<number, { title: string; items: ImpactItem[] }> = {
  1: {
    title: 'O que este passo faz pelo seu posicionamento',
    items: [
      { icon: '🔍', text: 'Seu nome e cidade entram em cada texto gerado — Google e IAs aprendem quem você é e onde atende', badge: 'Marca' },
      { icon: '📍', text: 'O nicho define quais buscas vão te mostrar — "dentista em Sorocaba" só aparece se o nicho estiver certo', badge: 'Busca local' },
      { icon: '🗺️', text: 'O raio de atuação faz seu site aparecer para quem busca "perto de mim" dentro da sua área', badge: 'Google Maps' },
    ],
  },
  2: {
    title: 'O que este passo faz pelo seu posicionamento',
    items: [
      { icon: '💰', text: 'Cada serviço vira uma seção otimizada — quem busca por aquele serviço específico vai te encontrar', badge: 'Visibilidade' },
      { icon: '⭐', text: 'Seus diferenciais viram respostas no Google — quando alguém perguntar "por que escolher você", o Google responde com os seus dados', badge: 'Destaque' },
      { icon: '🤖', text: 'O ChatGPT e o Gemini usam seus diferenciais quando alguém pede recomendações na sua área', badge: 'IA generativa' },
    ],
  },
  3: {
    title: 'O que este passo faz pelo seu posicionamento',
    items: [
      { icon: '❓', text: 'As dores do seu cliente viram perguntas do FAQ — essas perguntas são exatamente o que as pessoas digitam no Google', badge: 'FAQ / AEO' },
      { icon: '🗣️', text: 'Busca por voz ("Ok Google, qual o melhor dentista perto de mim?") usa as dores e o público para te recomendar', badge: 'Voz' },
      { icon: '🧠', text: 'O ChatGPT cita negócios que aparecem como solução para dores específicas — seus dados alimentam isso', badge: 'GEO' },
    ],
  },
  4: {
    title: 'O que este passo faz pelo seu posicionamento',
    items: [
      { icon: '🏆', text: 'Anos de experiência e credenciais (CRM, OAB, CRO...) aumentam a autoridade do seu site — o Google valoriza especialistas comprovados', badge: 'Autoridade' },
      { icon: '📊', text: 'Resultados concretos (casos e números) entram no conteúdo como prova — o Google prefere sites com dados reais', badge: 'Confiança' },
    ],
  },
  5: {
    title: 'O que este passo faz pelo seu posicionamento',
    items: [
      { icon: '🎯', text: 'As keywords entram em TODOS os textos gerados — título, descrição, headings e parágrafos. Sem keywords, o Google não sabe quando te mostrar', badge: 'Palavras-chave' },
      { icon: '✍️', text: 'O tom de voz define como a IA escreve — profissional, próximo ou descontraído. O texto precisa soar como você', badge: 'Tom' },
      { icon: '📝', text: 'O intent do blog define se o artigo vai educar, convencer ou gerar contato direto — cada formato ranqueia de forma diferente', badge: 'Blog' },
    ],
  },
  6: {
    title: 'O que este passo faz pelo seu posicionamento',
    items: [
      { icon: '📍', text: 'O Google Perfil de Empresas conectado faz você aparecer no Maps e no painel lateral do Google — visibilidade local máxima', badge: 'Google Maps' },
      { icon: '🤖', text: 'Posts automáticos no seu perfil alimentam o ChatGPT e o Gemini com dados atualizados sobre o seu negócio', badge: 'GEO' },
    ],
  },
}

function StepImpact({ step }: { step: number }) {
  const impact = STEP_IMPACT[step]
  if (!impact) return null
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {impact.title}
      </p>
      <ul className="space-y-2.5">
        {impact.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 text-base shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-foreground leading-relaxed">{item.text}</span>
              {item.badge && (
                <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {item.badge}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared input classes
// ---------------------------------------------------------------------------

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ' +
  'focus:ring-offset-1 disabled:opacity-50'

const labelCls = 'block text-sm font-medium text-foreground mb-1.5'

const hintCls = 'mt-1 text-xs text-muted-foreground'

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(EMPTY)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cpf = calcCPF(data)
  const score = cpf.total
  const canGenerate = score >= 70

  // Load session + existing profile
  useEffect(() => {
    async function init() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profiles } = await supabase
        .from('onboarding_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (profiles && profiles.length > 0) {
        const p = profiles[0]
        setProfileId(p.id)
        setData({
          business_name:       p.business_name     ?? '',
          niche:               p.niche             ?? '',
          city:                p.city              ?? '',
          state:               p.state             ?? '',
          service_radius_km:   p.service_radius_km?.toString() ?? '30',
          services:            p.services?.length ? p.services : [{ name: '', description: '', price_range: '' }],
          differentials:       p.differentials     ?? '',
          target_audience:     p.target_audience   ?? '',
          pain_points:         p.pain_points       ?? '',
          credentials:         (p.credentials ?? []).join(', '),
          years_experience:    p.years_experience?.toString() ?? '',
          cases:               p.cases             ?? '',
          keywords_primary:    (p.keywords_primary ?? []).join(', '),
          keywords_secondary:  (p.keywords_secondary ?? []).join(', '),
          tone:                p.tone              ?? 'profissional',
          intent_default_blog: p.intent_default_blog ?? 'informacional',
          gbp_connected:       p.gbp_connected     ?? false,
        })
      }
    }
    init()
  }, [router])

  // Autosave (debounced 1.5s)
  const save = useCallback(async (d: OnboardingData) => {
    if (!userId) return
    setSaving(true)
    setSaveError('')
    try {
      const supabase = createBrowserClient()
      const payload = {
        business_name:       d.business_name     || null,
        niche:               d.niche             || null,
        city:                d.city              || null,
        state:               d.state             || null,
        service_radius_km:   d.service_radius_km ? Number(d.service_radius_km) : null,
        services:            d.services.filter(s => s.name.trim()),
        differentials:       d.differentials     || null,
        target_audience:     d.target_audience   || null,
        pain_points:         d.pain_points       || null,
        credentials:         d.credentials ? d.credentials.split(',').map(s => s.trim()).filter(Boolean) : [],
        years_experience:    d.years_experience ? Number(d.years_experience) : null,
        cases:               d.cases             || null,
        keywords_primary:    d.keywords_primary ? d.keywords_primary.split(',').map(s => s.trim()).filter(Boolean) : [],
        keywords_secondary:  d.keywords_secondary ? d.keywords_secondary.split(',').map(s => s.trim()).filter(Boolean) : [],
        tone:                d.tone              || null,
        intent_default_blog: d.intent_default_blog || null,
        gbp_connected:       d.gbp_connected,
        completeness_score:  calcScore(d),
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
    } catch {
      setSaveError('Erro ao salvar. Verifique a conexão.')
    } finally {
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

  function addService() {
    setData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', price_range: '' }],
    }))
  }

  function removeService(idx: number) {
    setData(prev => {
      if (prev.services.length <= 1) return prev
      const services = prev.services.filter((_, i) => i !== idx)
      const next = { ...prev, services }
      scheduleSave(next)
      return next
    })
  }

  async function finish() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await save(data)
    router.push('/templates')
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-heading text-lg font-bold text-primary">
            HARPIA
          </Link>

          {/* CPF Score */}
          <div className="flex items-center gap-4">
            {saving && <span className="text-xs text-muted-foreground">Salvando…</span>}
            {saveError && <span className="text-xs text-destructive">{saveError}</span>}
            <CPFBars score={cpf} />
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
              canGenerate ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {score}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-1 bg-primary transition-all duration-500"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </header>

      {/* Step indicator */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="mx-auto flex max-w-3xl items-center gap-0 overflow-x-auto px-6 py-3">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            const active = n === step
            const done = n < step
            return (
              <div key={n} className="flex items-center">
                <button
                  onClick={() => n < step && setStep(n)}
                  disabled={n > step}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : done
                      ? 'cursor-pointer text-primary hover:bg-primary/10'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    active ? 'bg-primary-foreground/20' : done ? 'bg-primary/15' : 'bg-muted'
                  }`}>
                    {done ? '✓' : n}
                  </span>
                  <span className="hidden sm:block">{label}</span>
                </button>
                {i < 5 && <span className="mx-1 text-muted-foreground/30">›</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {step === 1 && <><Step1 data={data} update={update} /><StepImpact step={1} /></>}
        {step === 2 && (
          <>
            <Step2
              data={data}
              update={update}
              updateService={updateService}
              addService={addService}
              removeService={removeService}
            />
            <StepImpact step={2} />
          </>
        )}
        {step === 3 && <><Step3 data={data} update={update} /><StepImpact step={3} /></>}
        {step === 4 && <><Step4 data={data} update={update} /><StepImpact step={4} /></>}
        {step === 5 && <><Step5 data={data} update={update} /><StepImpact step={5} /></>}
        {step === 6 && <Step6 data={data} update={update} score={score} canGenerate={canGenerate} cpf={cpf} />}
      </main>

      {/* Bottom nav */}
      <footer className="sticky bottom-0 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            ← Voltar
          </button>

          <span className="text-sm text-muted-foreground">
            {step} de 6
          </span>

          {step < 6 ? (
            <button
              onClick={() => setStep(s => Math.min(6, s + 1))}
              className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continuar →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!canGenerate}
              className={`rounded-md px-6 py-2 text-sm font-semibold transition-colors ${
                canGenerate
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                  : 'cursor-not-allowed bg-muted text-muted-foreground'
              }`}
              title={!canGenerate ? `Preencha mais campos para atingir 70% (atual: ${score}%)` : ''}
            >
              {canGenerate ? '✨ Gerar meu site' : `Faltam ${70 - score}% para gerar`}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CitySearch — autocomplete via Nominatim (OpenStreetMap, gratuito)
// ---------------------------------------------------------------------------

type NominatimResult = {
  place_id: number
  display_name: string
  address: {
    city?: string
    town?: string
    municipality?: string
    county?: string
    state?: string
    state_code?: string
  }
}

const STATE_TO_UF: Record<string, string> = {
  'Acre':'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA',
  'Ceará':'CE','Distrito Federal':'DF','Espírito Santo':'ES','Goiás':'GO',
  'Maranhão':'MA','Mato Grosso':'MT','Mato Grosso do Sul':'MS','Minas Gerais':'MG',
  'Pará':'PA','Paraíba':'PB','Paraná':'PR','Pernambuco':'PE','Piauí':'PI',
  'Rio de Janeiro':'RJ','Rio Grande do Norte':'RN','Rio Grande do Sul':'RS',
  'Rondônia':'RO','Roraima':'RR','Santa Catarina':'SC','São Paulo':'SP',
  'Sergipe':'SE','Tocantins':'TO',
}

function CitySearch({
  city, state, onSelect,
}: {
  city: string
  state: string
  onSelect: (city: string, state: string) => void
}) {
  const [query, setQuery]         = useState(city || '')
  const [results, setResults]     = useState<NominatimResult[]>([])
  const [open, setOpen]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef                  = useRef<AbortController | null>(null)

  // Sincroniza se o valor externo mudar (load de perfil salvo)
  useEffect(() => { if (city && query !== city) setQuery(city) }, [city]) // eslint-disable-line

  async function search(q: string) {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(q)}` +
        `&countrycodes=br&format=json&limit=8&addressdetails=1` +
        `&email=harpia-beta@dicasdodove.com.br`
      const res = await fetch(url, { signal: abortRef.current.signal })
      const data: NominatimResult[] = await res.json()
      // Filtra para municípios (exclui ruas, POIs, etc.)
      const cities = data.filter(r =>
        r.address.city || r.address.town || r.address.municipality
      )
      setResults(cities.slice(0, 6))
      setOpen(cities.length > 0)
    } catch { /* abortado ou erro de rede */ } finally {
      setLoading(false)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 400)
  }

  function handleSelect(r: NominatimResult) {
    const cityName = r.address.city ?? r.address.town ?? r.address.municipality ?? ''
    const stateName = r.address.state ?? ''
    const uf = r.address.state_code?.toUpperCase() ?? STATE_TO_UF[stateName] ?? ''
    setQuery(`${cityName}${uf ? ` — ${uf}` : ''}`)
    setOpen(false)
    onSelect(cityName, uf)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          className={inputCls}
          placeholder="Digite o nome da cidade..."
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
            buscando…
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {results.map(r => {
            const cityName = r.address.city ?? r.address.town ?? r.address.municipality ?? ''
            const stateName = r.address.state ?? ''
            const uf = r.address.state_code?.toUpperCase() ?? STATE_TO_UF[stateName] ?? ''
            return (
              <li key={r.place_id}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(r)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
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

      {state && (
        <p className="mt-1 text-xs text-muted-foreground">
          ✓ {city}{state ? `, ${state}` : ''}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// RadiusSlider — slider visual de raio de atuação
// ---------------------------------------------------------------------------

function RadiusSlider({
  value, city, onChange,
}: {
  value: string
  city: string
  onChange: (v: string) => void
}) {
  const km = parseInt(value) || 30

  const label =
    km <= 15  ? 'bairros próximos' :
    km <= 40  ? 'cidade e municípios vizinhos' :
    km <= 100 ? 'toda a região metropolitana' :
                'ampla região do estado'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Raio de atuação</span>
        <span className="font-heading text-lg font-bold text-primary">{km} km</span>
      </div>

      <input
        type="range"
        min={5} max={300} step={5}
        value={km}
        onChange={e => onChange(e.target.value)}
        className="w-full accent-primary"
      />

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>5 km</span>
        <span>150 km</span>
        <span>300 km</span>
      </div>

      <div className="rounded-lg bg-primary/8 px-4 py-2.5 text-sm text-foreground">
        {city ? (
          <>Cobrindo <strong>{km} km</strong> a partir de <strong>{city}</strong> — {label}</>
        ) : (
          <>Selecione a cidade primeiro para ver a cobertura</>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tooltip — fade in/out ao passar o mouse no ícone de interrogação
// ---------------------------------------------------------------------------

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center align-middle ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors cursor-help"
        aria-label="Saiba mais"
        tabIndex={-1}
      >
        ?
      </button>
      <span
        className={`pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 rounded-xl border border-border bg-card p-3 text-xs leading-relaxed text-foreground shadow-lg transition-all duration-200 ${
          show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
        }`}
      >
        {text}
        {/* Setinha */}
        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 border-b border-l border-border bg-card" />
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// suggestKeywords — gera sugestões básicas sem IA (placeholder para o motor)
// ---------------------------------------------------------------------------

const NICHE_LABELS: Record<string, string> = {
  advocacia: 'advogado', contabilidade: 'contador', psicologia: 'psicólogo',
  clinica: 'médico', odontologia: 'dentista', fisioterapia: 'fisioterapeuta',
  veterinaria: 'veterinário', imobiliaria: 'imobiliária', restaurante: 'restaurante',
  salao: 'salão de beleza', escola: 'escola', servicos: 'prestador de serviços',
  institucional: 'empresa', landing: 'serviço',
}

function suggestKeywords(niche: string, city: string, businessName: string): string {
  const n = NICHE_LABELS[niche] ?? niche
  const c = city || 'sua cidade'
  const suggestions = [
    `${n} ${c}`,
    `${n} em ${c}`,
    `melhor ${n} ${c}`,
    businessName ? `${businessName} ${c}` : `${n} perto de mim`,
  ].filter(Boolean)
  return suggestions.join(', ')
}

// ---------------------------------------------------------------------------
// NicheButton — reutilizado nos grupos de nicho
// ---------------------------------------------------------------------------

function NicheButton({
  n, selected, onClick,
}: {
  n: { value: string; label: string; icon: string }
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-xs font-medium transition-all ${
        selected
          ? 'border-primary bg-primary/8 text-primary shadow-sm'
          : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <span className="text-2xl">{n.icon}</span>
      {n.label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Identidade
// ---------------------------------------------------------------------------

function Step1({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Sobre o negócio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Essas informações vão para o SEO local — nome, cidade e raio de atuação aparecem em toda geração.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className={labelCls}>Nome do negócio *</label>
          <input
            className={inputCls}
            placeholder="Ex: Clínica Dr. Carlos, Marmoraria Silva, Escola Futuro..."
            value={data.business_name}
            onChange={e => update({ business_name: e.target.value })}
          />
        </div>

        <div>
          <label className={labelCls}>Nicho / Tipo de negócio *</label>

          {/* Profissões reguladas */}
          <div className="mb-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Profissões reguladas
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                dependem mais de SEO
              </span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {NICHES.filter(n => n.group === 'Profissões reguladas').map(n => (
                <NicheButton key={n.value} n={n} selected={data.niche === n.value} onClick={() => update({ niche: n.value })} />
              ))}
            </div>
          </div>

          {/* Saúde */}
          <div className="mb-2 mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saúde</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {NICHES.filter(n => n.group === 'Saúde').map(n => (
                <NicheButton key={n.value} n={n} selected={data.niche === n.value} onClick={() => update({ niche: n.value })} />
              ))}
            </div>
          </div>

          {/* Outros */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outros</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {NICHES.filter(n => n.group === 'Outros').map(n => (
                <NicheButton key={n.value} n={n} selected={data.niche === n.value} onClick={() => update({ niche: n.value })} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Cidade-base *</label>
          <CitySearch
            city={data.city}
            state={data.state}
            onSelect={(city, state) => update({ city, state })}
          />
          <p className={hintCls}>Digite o nome e selecione na lista — powered by OpenStreetMap</p>
        </div>

        <div>
          <RadiusSlider
            value={data.service_radius_km}
            city={data.city}
            onChange={v => update({ service_radius_km: v })}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Serviços
// ---------------------------------------------------------------------------

function Step2({
  data, update, updateService, addService, removeService,
}: {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  updateService: (i: number, f: keyof ServiceItem, v: string) => void
  addService: () => void
  removeService: (i: number) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">O que você oferece</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada serviço vira uma seção do site com SEO próprio. Quanto mais detalhado, melhor o texto gerado.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className={labelCls}>Serviços *</label>

        {data.services.map((svc, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Serviço {i + 1}
              </span>
              {data.services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <input
                className={inputCls}
                placeholder="Nome do serviço (ex: Consulta ortopédica, Limpeza de terreno...)"
                value={svc.name}
                onChange={e => updateService(i, 'name', e.target.value)}
              />
              <textarea
                className={`${inputCls} min-h-[80px] resize-none`}
                placeholder="Descrição breve — o que inclui, como funciona, resultado esperado..."
                value={svc.description}
                onChange={e => updateService(i, 'description', e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Faixa de preço (ex: A partir de R$ 150, Sob consulta...)"
                value={svc.price_range}
                onChange={e => updateService(i, 'price_range', e.target.value)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addService}
          className="rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          + Adicionar serviço
        </button>
      </div>

      <div>
        <label className={labelCls}>Diferenciais do negócio *</label>
        <textarea
          className={`${inputCls} min-h-[120px] resize-none`}
          placeholder="O que te diferencia da concorrência? Ex: 15 anos de experiência, atendimento no mesmo dia, única clínica da região com equipamento X..."
          value={data.differentials}
          onChange={e => update({ differentials: e.target.value })}
        />
        <p className={hintCls}>Escreva como você falaria pra um cliente. Sem firula.</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Público
// ---------------------------------------------------------------------------

function Step3({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Quem você atende</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A IA usa isso para calibrar o tom dos textos e as perguntas do FAQ — que são a base do AEO.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className={labelCls}>Público-alvo *</label>
          <textarea
            className={`${inputCls} min-h-[100px] resize-none`}
            placeholder="Quem são seus clientes? Ex: Adultos 30-60 anos com dor crônica em Sorocaba, donos de terrenos em condomínios fechados..."
            value={data.target_audience}
            onChange={e => update({ target_audience: e.target.value })}
          />
        </div>

        <div>
          <label className={labelCls}>Principais dores / problemas que você resolve *</label>
          <textarea
            className={`${inputCls} min-h-[120px] resize-none`}
            placeholder="Quais problemas concretos seu cliente tem antes de te contratar? Ex: Não consegue dormir por causa da dor, não sabe se o terreno tem infraestrutura para construção..."
            value={data.pain_points}
            onChange={e => update({ pain_points: e.target.value })}
          />
          <p className={hintCls}>Essas dores viram perguntas do FAQ e títulos de blog — direto no coração do AEO.</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — Autoridade
// ---------------------------------------------------------------------------

function Step4({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Sua autoridade</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Credenciais e histórico viram o bloco "Sobre" e o perfil de autoridade que o Google usa para ranquear.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Anos de experiência</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              max="60"
              placeholder="15"
              value={data.years_experience}
              onChange={e => update({ years_experience: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls}>Registro / Credencial</label>
            <input
              className={inputCls}
              placeholder="CRM 12345-SP, CRECI 54321-SP, CRC..."
              value={data.credentials}
              onChange={e => update({ credentials: e.target.value })}
            />
            <p className={hintCls}>Separe por vírgula se tiver mais de um</p>
          </div>
        </div>

        <div>
          <label className={labelCls}>Cases / Resultados concretos</label>
          <textarea
            className={`${inputCls} min-h-[120px] resize-none`}
            placeholder="Números reais que impressionam: Ex: +500 pacientes atendidos, 3 projetos aprovados na prefeitura em 2024, cliente recuperou mobilidade em 3 sessões..."
            value={data.cases}
            onChange={e => update({ cases: e.target.value })}
          />
          <p className={hintCls}>Fatos e números batem prova social genérica.</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 5 — SEO
// ---------------------------------------------------------------------------

function Step5({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  const suggested = suggestKeywords(data.niche, data.city, data.business_name)

  function applySuggestion() {
    if (!data.keywords_primary) update({ keywords_primary: suggested })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          SEO
          <Tooltip text="Search Engine Optimization — conjunto de técnicas que fazem seu site aparecer no Google quando alguém busca pelo seu serviço. O HARPIA aplica tudo automaticamente." />
          {' '}e tom de voz
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keywords e tom entram em todo texto gerado — título, meta description, headings e corpo.
        </p>
      </div>

      {/* Banner IA */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <span className="mt-0.5 text-lg shrink-0">✨</span>
        <div className="text-sm">
          <p className="font-semibold text-foreground">A IA vai sugerir as melhores keywords para o seu negócio</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Com base no seu nicho, cidade e serviços preenchidos nos steps anteriores, o HARPIA vai gerar automaticamente as keywords com maior potencial de ranqueamento. Você pode editar qualquer uma antes de gerar o site.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Keywords principais */}
        <div>
          <label className={labelCls}>
            Keywords principais
            <Tooltip text="Palavras que seus clientes digitam no Google para encontrar seu serviço. Ex: 'dentista sorocaba', 'advogado trabalhista sp'. Inclua sempre a cidade. A IA vai sugerir as melhores para o seu nicho e localização." />
          </label>

          {/* Sugestão automática */}
          {suggested && !data.keywords_primary && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-primary">Sugestão: </span>
                {suggested}
              </p>
              <button
                type="button"
                onClick={applySuggestion}
                className="ml-3 shrink-0 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Usar
              </button>
            </div>
          )}

          <input
            className={inputCls}
            placeholder={suggested || 'dentista sorocaba, clínica odontológica sorocaba...'}
            value={data.keywords_primary}
            onChange={e => update({ keywords_primary: e.target.value })}
          />
          <p className={hintCls}>Separe por vírgula · inclua a cidade · pense como o cliente busca</p>
        </div>

        {/* Keywords secundárias */}
        <div>
          <label className={labelCls}>
            Keywords secundárias
            <Tooltip text="Termos de suporte que complementam as principais. São usados em páginas internas, artigos de blog e seções específicas. Têm menos volume de busca mas convertem bem porque são mais específicos." />
          </label>
          <input
            className={inputCls}
            placeholder="implante dentário sorocaba, clareamento dental, ortodontia adulto..."
            value={data.keywords_secondary}
            onChange={e => update({ keywords_secondary: e.target.value })}
          />
          <p className={hintCls}>Opcional — entram em páginas internas e artigos de blog</p>
        </div>

        {/* Tom de voz */}
        <div>
          <label className={labelCls}>Tom de voz *</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TONES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => update({ tone: t.value })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  data.tone === t.value
                    ? 'border-primary bg-primary/8 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="text-sm font-semibold text-foreground">{t.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Intent padrão */}
        <div>
          <label className={labelCls}>
            Intent padrão dos artigos de blog
            <Tooltip text="Intent = intenção de busca do leitor. Define a estrutura do artigo: Informacional explica e educa, Comercial convence e compara, Transacional gera ação imediata (agendamento, contato). O HARPIA adapta o artigo ao intent escolhido." />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {INTENTS.map(it => (
              <button
                key={it.value}
                type="button"
                onClick={() => update({ intent_default_blog: it.value })}
                className={`flex-1 rounded-xl border p-3 text-left transition-all ${
                  data.intent_default_blog === it.value
                    ? 'border-primary bg-primary/8 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="text-sm font-semibold text-foreground">{it.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{it.desc}</div>
              </button>
            ))}
          </div>
          <p className={hintCls}>Você pode alterar por artigo depois — esse é só o padrão</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 6 — GBP
// ---------------------------------------------------------------------------

function Step6({
  data, update, score, canGenerate, cpf,
}: {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  score: number
  canGenerate: boolean
  cpf: CPFScore
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Google Perfil de Empresas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conectar o GBP permite que a plataforma otimize seu perfil e gere posts automaticamente. Pode pular por agora.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">Google Perfil de Empresas</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Integração OAuth — disponível em breve
            </div>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Em breve
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => update({ gbp_connected: !data.gbp_connected })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              data.gbp_connected ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              data.gbp_connected ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
          <span className="text-sm text-foreground">
            {data.gbp_connected ? 'Marcado como conectado (+5% no score)' : 'Pular por agora'}
          </span>
        </div>
      </div>

      {/* Score CPF completo */}
      <div className={`rounded-xl border p-5 ${canGenerate ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30'}`}>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-foreground">
            Sinais que seu site vai enviar
          </span>
          <span className={`font-heading text-xl font-bold ${canGenerate ? 'text-primary' : 'text-muted-foreground'}`}>
            {score}%
          </span>
        </div>

        {/* 3 pilares */}
        <div className="space-y-3 mb-5">
          {[
            { label: 'C — Conhecimento', sub: 'Google sabe quem você é e onde atende', value: cpf.c, color: 'bg-blue-500' },
            { label: 'P — Posicionamento', sub: 'Google entende por que te escolher', value: cpf.p, color: 'bg-purple-500' },
            { label: 'F — Faturamento', sub: 'Google sabe o que você vende e como te encontrar', value: cpf.f, color: 'bg-green-500' },
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

        {canGenerate ? (
          <p className="text-sm font-medium text-primary">
            ✓ Sinais suficientes. A IA tem o que precisa para gerar seu site.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Precisa de <strong>70%</strong> no score geral. Faltam <strong>{70 - score}%</strong> — volte e preencha mais campos nos steps anteriores.
          </p>
        )}
      </div>

      <StepImpact step={6} />
    </div>
  )
}
