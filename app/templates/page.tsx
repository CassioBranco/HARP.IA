'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { LAYOUTS, getRecommendedLayouts } from '@/lib/templates/layouts'
import type { LayoutId } from '@/lib/templates/layouts'

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------

type Palette = { index: number; name: string; colors: [string, string, string] }
type Niche   = { value: string; label: string; icon: string; group: string; tagline: string; palettes: Palette[] }

const NICHOS: Niche[] = [
  { value: 'advocacia',     label: 'Advocacia',             icon: '⚖️',  group: 'Profissões reguladas', tagline: 'Escritório de advocacia e advogados autônomos',
    palettes: [
      { index: 0, name: 'Autoridade Clássica', colors: ['#1e3a5f','#c9a84c','#f8f7f4'] },
      { index: 1, name: 'Moderno Sóbrio',      colors: ['#1e293b','#64748b','#f1f5f9'] },
      { index: 2, name: 'Premium Escuro',       colors: ['#0f172a','#f59e0b','#ffffff'] },
    ]},
  { value: 'contabilidade', label: 'Contabilidade',         icon: '📊',  group: 'Profissões reguladas', tagline: 'Escritórios contábeis e contadores autônomos',
    palettes: [
      { index: 0, name: 'Sólido Profissional', colors: ['#1e3a5f','#2d6a4f','#f8f9fa'] },
      { index: 1, name: 'Crescimento Verde',   colors: ['#1e293b','#059669','#f0fdf4'] },
      { index: 2, name: 'Tech Financeiro',      colors: ['#0f172a','#0891b2','#f0f9ff'] },
    ]},
  { value: 'psicologia',    label: 'Psicologia',            icon: '🧠',  group: 'Profissões reguladas', tagline: 'Psicólogos, terapeutas e consultórios de saúde mental',
    palettes: [
      { index: 0, name: 'Acolhimento', colors: ['#6b8f71','#a8c5a0','#faf7f2'] },
      { index: 1, name: 'Serenidade',  colors: ['#6b7280','#9f8fc4','#faf5ff'] },
      { index: 2, name: 'Natural',     colors: ['#4a7c59','#8fbc8f','#f6f4ef'] },
    ]},
  { value: 'clinica',       label: 'Clínica / Consultório', icon: '🏥',  group: 'Saúde', tagline: 'Clínicas médicas e consultórios em geral',
    palettes: [
      { index: 0, name: 'Confiança Teal', colors: ['#0d9488','#5eead4','#f0fdfa'] },
      { index: 1, name: 'Azul Clínico',   colors: ['#2563eb','#93c5fd','#eff6ff'] },
      { index: 2, name: 'Saúde Natural',  colors: ['#16a34a','#86efac','#f0fdf4'] },
    ]},
  { value: 'odontologia',   label: 'Odontologia',           icon: '🦷',  group: 'Saúde', tagline: 'Clínicas odontológicas e dentistas',
    palettes: [
      { index: 0, name: 'Claridade',    colors: ['#0ea5e9','#7dd3fc','#f0f9ff'] },
      { index: 1, name: 'Premium Azul', colors: ['#1d4ed8','#93c5fd','#eff6ff'] },
      { index: 2, name: 'Moderno Mint', colors: ['#0891b2','#67e8f9','#ecfeff'] },
    ]},
  { value: 'fisioterapia',  label: 'Fisioterapia',          icon: '🏃',  group: 'Saúde', tagline: 'Clínicas de fisioterapia e reabilitação',
    palettes: [
      { index: 0, name: 'Movimento',    colors: ['#16a34a','#4ade80','#f0fdf4'] },
      { index: 1, name: 'Energia',      colors: ['#d97706','#fcd34d','#fffbeb'] },
      { index: 2, name: 'Profissional', colors: ['#0d9488','#5eead4','#f0fdfa'] },
    ]},
  { value: 'veterinaria',   label: 'Veterinária / Pet',     icon: '🐾',  group: 'Saúde', tagline: 'Clínicas veterinárias e pet shops',
    palettes: [
      { index: 0, name: 'Natureza',   colors: ['#16a34a','#f97316','#fafaf9'] },
      { index: 1, name: 'Carinho',    colors: ['#7c3aed','#f472b6','#fdf4ff'] },
      { index: 2, name: 'Confiança',  colors: ['#0d9488','#fbbf24','#fefce8'] },
    ]},
  { value: 'imobiliaria',   label: 'Imobiliária',           icon: '🏠',  group: 'Outros', tagline: 'Imobiliárias e corretores de imóveis',
    palettes: [
      { index: 0, name: 'Premium Grafite', colors: ['#1e293b','#c9a84c','#fafaf9'] },
      { index: 1, name: 'Moderno Escuro',  colors: ['#111827','#6b7280','#f9fafb'] },
      { index: 2, name: 'Sofisticado',     colors: ['#292524','#d4a017','#fefce8'] },
    ]},
  { value: 'restaurante',   label: 'Restaurante',           icon: '🍽️', group: 'Outros', tagline: 'Restaurantes, lanchonetes e delivery',
    palettes: [
      { index: 0, name: 'Apetite',     colors: ['#b45309','#fbbf24','#fffbeb'] },
      { index: 1, name: 'Requinte',    colors: ['#7c2d12','#d97706','#fef3c7'] },
      { index: 2, name: 'Casual Vivo', colors: ['#dc2626','#f97316','#fff7ed'] },
    ]},
  { value: 'salao',         label: 'Salão / Estética',      icon: '✂️',  group: 'Outros', tagline: 'Salões de beleza, barbearias e estéticas',
    palettes: [
      { index: 0, name: 'Rosé',        colors: ['#be185d','#f9a8d4','#fdf2f8'] },
      { index: 1, name: 'Nude Premium',colors: ['#92400e','#d6b899','#fefaf5'] },
      { index: 2, name: 'Minimalista', colors: ['#374151','#9ca3af','#f9fafb'] },
    ]},
  { value: 'escola',        label: 'Escola / Curso',        icon: '🎓',  group: 'Outros', tagline: 'Escolas, cursos livres e professores autônomos',
    palettes: [
      { index: 0, name: 'Conhecimento', colors: ['#1d4ed8','#fbbf24','#fffbeb'] },
      { index: 1, name: 'Inspiração',   colors: ['#7c3aed','#60a5fa','#eff6ff'] },
      { index: 2, name: 'Vibrante',     colors: ['#059669','#f59e0b','#fefce8'] },
    ]},
  { value: 'servicos',      label: 'Serviços / Prestador',  icon: '🔧',  group: 'Outros', tagline: 'Prestadores de serviço em geral',
    palettes: [
      { index: 0, name: 'Profissional', colors: ['#0e7490','#0891b2','#f0f9ff'] },
      { index: 1, name: 'Confiança',    colors: ['#1e40af','#3b82f6','#eff6ff'] },
      { index: 2, name: 'Direto',       colors: ['#1e293b','#f97316','#fff7ed'] },
    ]},
  { value: 'institucional', label: 'Empresa / Institucional',icon: '🏢', group: 'Outros', tagline: 'Empresas, ONGs e organizações em geral',
    palettes: [
      { index: 0, name: 'Corporativo',   colors: ['#1e3a5f','#64748b','#f8fafc'] },
      { index: 1, name: 'Sério Moderno', colors: ['#0f172a','#475569','#f1f5f9'] },
      { index: 2, name: 'Neutro Clean',  colors: ['#374151','#9ca3af','#f9fafb'] },
    ]},
  { value: 'landing',       label: 'Landing Page',          icon: '🚀',  group: 'Outros', tagline: 'Páginas de conversão para qualquer oferta',
    palettes: [
      { index: 0, name: 'Conversão Alta',  colors: ['#111827','#f59e0b','#fffbeb'] },
      { index: 1, name: 'Escuro Vibrante', colors: ['#0f172a','#6366f1','#eef2ff'] },
      { index: 2, name: 'Direto ao Ponto', colors: ['#1e293b','#10b981','#f0fdf4'] },
    ]},
]

const GROUPS = ['Profissões reguladas', 'Saúde', 'Outros']
type ViewMode = 'desktop' | 'mobile'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedNiche,   setSelectedNiche]   = useState<Niche>(NICHOS[0]!)
  const [selectedLayout,  setSelectedLayout]  = useState<LayoutId>('clean')
  const [selectedPalette, setSelectedPalette] = useState(0)
  const [viewMode,        setViewMode]        = useState<ViewMode>('desktop')
  const [iframeKey,       setIframeKey]       = useState(0)
  const [error,           setError]           = useState('')

  // Força reload do iframe ao trocar nicho/layout/paleta
  useEffect(() => { setIframeKey(k => k + 1) }, [selectedNiche.value, selectedLayout, selectedPalette])

  // Ao trocar nicho, sugere o primeiro layout recomendado
  useEffect(() => {
    const recommended = getRecommendedLayouts(selectedNiche.value)
    setSelectedLayout(recommended[0]?.id ?? 'clean')
    setSelectedPalette(0)
  }, [selectedNiche.value])

  const previewSrc = `/preview/template?preset=${selectedNiche.value}&palette=${selectedPalette}&layout=${selectedLayout}`

  async function handleCreate() {
    setError('')
    startTransition(async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { error: dbError } = await supabase
          .from('sites')
          .insert({ preset: selectedNiche.value, palette_index: selectedPalette, template: selectedLayout, status: 'draft' })

        if (dbError) { setError('Erro ao criar site. Tente novamente.'); return }

        router.push('/sites')
        router.refresh()
      } catch {
        setError('Erro inesperado. Tente novamente.')
      }
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-5 py-3">
        <Link href="/sites" className="font-heading text-base font-bold text-primary">
          HARPIA
        </Link>

        <div className="flex items-center gap-2">
          {/* Toggle desktop / mobile */}
          <div className="flex rounded-lg border border-border bg-muted p-0.5">
            {(['desktop', 'mobile'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'desktop' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                )}
                {mode === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            ))}
          </div>

          <Link href="/sites" className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            ← Voltar
          </Link>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar esquerda ──────────────────────────────────────── */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Modelo do site
            </p>
          </div>

          {/* Lista de nichos — scrollável */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {GROUPS.map(group => (
              <div key={group} className="mb-4">
                <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {group}
                </p>
                <div className="flex flex-col gap-0.5">
                  {NICHOS.filter(n => n.group === group).map(n => (
                    <button
                      key={n.value}
                      onClick={() => { setSelectedNiche(n); setSelectedPalette(0) }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                        selectedNiche.value === n.value
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="text-lg shrink-0">{n.icon}</span>
                      <span className="leading-tight">{n.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Layout do site */}
          <div className="border-t border-border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Layout visual
            </p>
            <div className="flex flex-col gap-1">
              {getRecommendedLayouts(selectedNiche.value).map((layout, idx) => {
                const isSelected = selectedLayout === layout.id
                const isRecommended = layout.recommendedFor.includes(selectedNiche.value)
                return (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedLayout(layout.id)}
                    className={`flex flex-col rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {layout.name}
                      </span>
                      {isRecommended && idx === 0 && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                          recomendado
                        </span>
                      )}
                      {isSelected && <span className="ml-auto text-primary text-xs">✓</span>}
                    </div>
                    {isSelected && (
                      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{layout.description}</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Paletas do nicho selecionado */}
          <div className="border-t border-border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Paleta de cores
            </p>
            <div className="flex flex-col gap-2">
              {selectedNiche.palettes.map(p => {
                const [c1, c2, c3] = p.colors
                const isSelected = selectedPalette === p.index
                return (
                  <button
                    key={p.index}
                    onClick={() => setSelectedPalette(p.index)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-2.5 text-left transition-all ${
                      isSelected ? 'border-primary' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex h-7 w-14 shrink-0 overflow-hidden rounded-md">
                      <div className="flex-[2]" style={{ backgroundColor: c1 }} />
                      <div className="flex-1" style={{ backgroundColor: c2 }} />
                      <div className="flex-[2]" style={{ backgroundColor: c3 }} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{p.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-primary text-xs">✓</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* CTA */}
            {error && (
              <p className="mt-3 text-xs text-destructive">{error}</p>
            )}
            <button
              onClick={handleCreate}
              disabled={isPending}
              className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending ? 'Criando...' : `Usar este modelo →`}
            </button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Cores e textos podem ser ajustados depois
            </p>
          </div>
        </aside>

        {/* ── Painel de preview ─────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-muted/40">
          {/* Info do modelo atual */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-5 py-2">
            <span className="text-xl">{selectedNiche.icon}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedNiche.label}</p>
              <p className="text-xs text-muted-foreground">{selectedNiche.tagline}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {LAYOUTS.find(l => l.id === selectedLayout)?.name ?? selectedLayout}
              </span>
              <div className="flex items-center gap-1.5">
                {(selectedNiche.palettes[selectedPalette]?.colors ?? []).map((c, i) => (
                  <div key={i} className="h-4 w-4 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  {selectedNiche.palettes[selectedPalette]?.name ?? ''}
                </span>
              </div>
            </div>
          </div>

          {/* Iframe escalado */}
          <div className="flex flex-1 items-start justify-center overflow-auto p-6">
            {viewMode === 'desktop' ? (
              /* ── Desktop: iframe full width com scroll ── */
              <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-border shadow-lg bg-white" style={{ height: 'calc(100vh - 160px)' }}>
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="mx-4 flex-1 rounded bg-background px-3 py-1 text-xs text-muted-foreground">
                    {selectedNiche.label.toLowerCase().replace(/\s/g, '')}.com.br
                  </div>
                </div>
                <iframe
                  key={`${iframeKey}-desktop`}
                  src={previewSrc}
                  className="h-full w-full"
                  style={{ height: 'calc(100% - 36px)' }}
                  title="Preview desktop"
                />
              </div>
            ) : (
              /* ── Mobile: iframe em moldura de celular ── */
              <div className="flex flex-col items-center">
                <div
                  className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-foreground bg-foreground shadow-2xl"
                  style={{ width: 390, height: 720 }}
                >
                  {/* Notch */}
                  <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground" />
                  <div className="h-full overflow-hidden rounded-[2rem] bg-white">
                    <iframe
                      key={`${iframeKey}-mobile`}
                      src={previewSrc}
                      className="h-full w-full"
                      style={{ width: '100%', height: '100%' }}
                      title="Preview mobile"
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">390 × 720 px — iPhone 14</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
