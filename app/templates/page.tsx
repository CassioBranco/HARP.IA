'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Dados dos nichos + paletas
// ---------------------------------------------------------------------------

type Palette = {
  index: number
  name: string
  colors: [string, string, string] // [primary, accent, bg]
}

type Niche = {
  value: string
  label: string
  icon: string
  group: string
  tagline: string
  palettes: Palette[]
}

const NICHOS: Niche[] = [
  // ── Profissões reguladas ──────────────────────────────────────────────────
  {
    value: 'advocacia', label: 'Advocacia', icon: '⚖️',
    group: 'Profissões reguladas',
    tagline: 'Escritório de advocacia e advogados autônomos',
    palettes: [
      { index: 0, name: 'Autoridade Clássica', colors: ['#1e3a5f', '#c9a84c', '#f8f7f4'] },
      { index: 1, name: 'Moderno Sóbrio',      colors: ['#1e293b', '#64748b', '#f1f5f9'] },
      { index: 2, name: 'Premium Escuro',       colors: ['#0f172a', '#f59e0b', '#ffffff'] },
    ],
  },
  {
    value: 'contabilidade', label: 'Contabilidade', icon: '📊',
    group: 'Profissões reguladas',
    tagline: 'Escritórios contábeis e contadores autônomos',
    palettes: [
      { index: 0, name: 'Sólido Profissional', colors: ['#1e3a5f', '#2d6a4f', '#f8f9fa'] },
      { index: 1, name: 'Crescimento Verde',   colors: ['#1e293b', '#059669', '#f0fdf4'] },
      { index: 2, name: 'Tech Financeiro',      colors: ['#0f172a', '#0891b2', '#f0f9ff'] },
    ],
  },
  {
    value: 'psicologia', label: 'Psicologia', icon: '🧠',
    group: 'Profissões reguladas',
    tagline: 'Psicólogos, terapeutas e consultórios de saúde mental',
    palettes: [
      { index: 0, name: 'Acolhimento',  colors: ['#6b8f71', '#a8c5a0', '#faf7f2'] },
      { index: 1, name: 'Serenidade',   colors: ['#6b7280', '#9f8fc4', '#faf5ff'] },
      { index: 2, name: 'Natural',      colors: ['#4a7c59', '#8fbc8f', '#f6f4ef'] },
    ],
  },
  // ── Saúde ─────────────────────────────────────────────────────────────────
  {
    value: 'clinica', label: 'Clínica / Consultório', icon: '🏥',
    group: 'Saúde',
    tagline: 'Clínicas médicas e consultórios em geral',
    palettes: [
      { index: 0, name: 'Confiança Teal',   colors: ['#0d9488', '#5eead4', '#f0fdfa'] },
      { index: 1, name: 'Azul Clínico',     colors: ['#2563eb', '#93c5fd', '#eff6ff'] },
      { index: 2, name: 'Saúde Natural',    colors: ['#16a34a', '#86efac', '#f0fdf4'] },
    ],
  },
  {
    value: 'odontologia', label: 'Odontologia', icon: '🦷',
    group: 'Saúde',
    tagline: 'Clínicas odontológicas e dentistas',
    palettes: [
      { index: 0, name: 'Claridade',    colors: ['#0ea5e9', '#7dd3fc', '#f0f9ff'] },
      { index: 1, name: 'Premium Azul', colors: ['#1d4ed8', '#93c5fd', '#eff6ff'] },
      { index: 2, name: 'Moderno Mint', colors: ['#0891b2', '#67e8f9', '#ecfeff'] },
    ],
  },
  {
    value: 'fisioterapia', label: 'Fisioterapia', icon: '🏃',
    group: 'Saúde',
    tagline: 'Clínicas de fisioterapia e reabilitação',
    palettes: [
      { index: 0, name: 'Movimento',      colors: ['#16a34a', '#4ade80', '#f0fdf4'] },
      { index: 1, name: 'Energia',        colors: ['#d97706', '#fcd34d', '#fffbeb'] },
      { index: 2, name: 'Profissional',   colors: ['#0d9488', '#5eead4', '#f0fdfa'] },
    ],
  },
  {
    value: 'veterinaria', label: 'Veterinária / Pet', icon: '🐾',
    group: 'Saúde',
    tagline: 'Clínicas veterinárias e pet shops',
    palettes: [
      { index: 0, name: 'Natureza',     colors: ['#16a34a', '#f97316', '#fafaf9'] },
      { index: 1, name: 'Carinho',      colors: ['#7c3aed', '#f472b6', '#fdf4ff'] },
      { index: 2, name: 'Confiança',    colors: ['#0d9488', '#fbbf24', '#fefce8'] },
    ],
  },
  // ── Outros ────────────────────────────────────────────────────────────────
  {
    value: 'imobiliaria', label: 'Imobiliária', icon: '🏠',
    group: 'Outros',
    tagline: 'Imobiliárias e corretores de imóveis',
    palettes: [
      { index: 0, name: 'Premium Grafite', colors: ['#1e293b', '#c9a84c', '#fafaf9'] },
      { index: 1, name: 'Moderno Escuro',  colors: ['#111827', '#6b7280', '#f9fafb'] },
      { index: 2, name: 'Sofisticado',     colors: ['#292524', '#d4a017', '#fefce8'] },
    ],
  },
  {
    value: 'restaurante', label: 'Restaurante', icon: '🍽️',
    group: 'Outros',
    tagline: 'Restaurantes, lanchonetes e delivery',
    palettes: [
      { index: 0, name: 'Apetite',      colors: ['#b45309', '#fbbf24', '#fffbeb'] },
      { index: 1, name: 'Requinte',     colors: ['#7c2d12', '#d97706', '#fef3c7'] },
      { index: 2, name: 'Casual Vivo',  colors: ['#dc2626', '#f97316', '#fff7ed'] },
    ],
  },
  {
    value: 'salao', label: 'Salão / Estética', icon: '✂️',
    group: 'Outros',
    tagline: 'Salões de beleza, barbearias e clínicas de estética',
    palettes: [
      { index: 0, name: 'Rosé Sofisticado', colors: ['#be185d', '#f9a8d4', '#fdf2f8'] },
      { index: 1, name: 'Nude Premium',     colors: ['#92400e', '#d6b899', '#fefaf5'] },
      { index: 2, name: 'Minimalista',      colors: ['#374151', '#9ca3af', '#f9fafb'] },
    ],
  },
  {
    value: 'escola', label: 'Escola / Curso', icon: '🎓',
    group: 'Outros',
    tagline: 'Escolas, cursos livres e professores autônomos',
    palettes: [
      { index: 0, name: 'Conhecimento',  colors: ['#1d4ed8', '#fbbf24', '#fffbeb'] },
      { index: 1, name: 'Inspiração',    colors: ['#7c3aed', '#60a5fa', '#eff6ff'] },
      { index: 2, name: 'Vibrante',      colors: ['#059669', '#f59e0b', '#fefce8'] },
    ],
  },
  {
    value: 'servicos', label: 'Serviços / Prestador', icon: '🔧',
    group: 'Outros',
    tagline: 'Prestadores de serviço em geral',
    palettes: [
      { index: 0, name: 'Profissional',  colors: ['#0e7490', '#0891b2', '#f0f9ff'] },
      { index: 1, name: 'Confiança',     colors: ['#1e40af', '#3b82f6', '#eff6ff'] },
      { index: 2, name: 'Direto',        colors: ['#1e293b', '#f97316', '#fff7ed'] },
    ],
  },
  {
    value: 'institucional', label: 'Empresa / Institucional', icon: '🏢',
    group: 'Outros',
    tagline: 'Empresas, ONGs e organizações em geral',
    palettes: [
      { index: 0, name: 'Corporativo',   colors: ['#1e3a5f', '#64748b', '#f8fafc'] },
      { index: 1, name: 'Sério Moderno', colors: ['#0f172a', '#475569', '#f1f5f9'] },
      { index: 2, name: 'Neutro Clean',  colors: ['#374151', '#9ca3af', '#f9fafb'] },
    ],
  },
  {
    value: 'landing', label: 'Landing Page', icon: '🚀',
    group: 'Outros',
    tagline: 'Páginas de conversão para qualquer oferta',
    palettes: [
      { index: 0, name: 'Conversão Alta', colors: ['#111827', '#f59e0b', '#fffbeb'] },
      { index: 1, name: 'Escuro Vibrante',colors: ['#0f172a', '#6366f1', '#eef2ff'] },
      { index: 2, name: 'Direto ao Ponto',colors: ['#1e293b', '#10b981', '#f0fdf4'] },
    ],
  },
]

const GROUPS = ['Profissões reguladas', 'Saúde', 'Outros']

// ---------------------------------------------------------------------------
// Componentes
// ---------------------------------------------------------------------------

function PaletteSwatch({ palette, selected, onClick }: {
  palette: Palette
  selected: boolean
  onClick: () => void
}) {
  const [c1, c2, c3] = palette.colors
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-xl border-2 p-3 text-left transition-all ${
        selected
          ? 'border-primary shadow-md'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Preview de cores */}
      <div className="mb-2.5 flex h-10 overflow-hidden rounded-lg">
        <div className="flex-[2]" style={{ backgroundColor: c1 }} />
        <div className="flex-1" style={{ backgroundColor: c2 }} />
        <div className="flex-[3]" style={{ backgroundColor: c3 }} />
      </div>
      <p className="text-xs font-semibold text-foreground">{palette.name}</p>
      {selected && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
          ✓
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null)
  const [selectedPalette, setSelectedPalette] = useState<number>(0)
  const [error, setError] = useState('')

  const niche = selectedNiche

  async function handleCreate() {
    if (!niche) return
    setError('')

    startTransition(async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { error: dbError } = await supabase
          .from('sites')
          .insert({
            preset: niche.value,
            palette_index: selectedPalette,
            status: 'draft',
          })

        if (dbError) {
          setError('Erro ao criar site. Tente novamente.')
          return
        }

        router.push('/sites')
        router.refresh()
      } catch {
        setError('Erro inesperado. Tente novamente.')
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/sites" className="font-heading text-lg font-bold text-primary">
            HARPIA
          </Link>
          <Link
            href="/sites"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao painel
          </Link>
        </div>
        <div className="h-0.5 w-full bg-muted">
          <div className="h-0.5 bg-primary transition-all duration-500"
            style={{ width: niche ? '100%' : '50%' }} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">

        {/* Título */}
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Escolha o modelo do seu site
          </h1>
          <p className="mt-2 text-muted-foreground">
            {niche
              ? `${niche.icon} ${niche.label} selecionado — agora escolha a paleta de cores`
              : 'Selecione o tipo de negócio para ver os modelos disponíveis'}
          </p>
        </div>

        {/* Grade de nichos */}
        <div className="mb-10 flex flex-col gap-8">
          {GROUPS.map(group => (
            <div key={group}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {group}
                </h2>
                {group === 'Profissões reguladas' && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    SEO é o canal principal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {NICHOS.filter(n => n.group === group).map(n => {
                  const isSelected = niche?.value === n.value
                  return (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => {
                        setSelectedNiche(n)
                        setSelectedPalette(0)
                      }}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/8 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                      }`}
                    >
                      <span className="text-3xl">{n.icon}</span>
                      <span className="text-xs font-semibold text-foreground leading-tight">
                        {n.label}
                      </span>
                      {isSelected && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                          selecionado
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Seleção de paleta (aparece após escolher nicho) */}
        {niche && (() => {
          const palette =
            niche.palettes[selectedPalette] ?? niche.palettes[0]
          if (!palette) return null

          return (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-3xl">{niche.icon}</span>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {niche.label}
                </h3>
                <p className="text-sm text-muted-foreground">{niche.tagline}</p>
              </div>
            </div>

            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Escolha a paleta de cores
            </h4>
            <div className="mb-6 grid grid-cols-3 gap-4">
              {niche.palettes.map(p => (
                <PaletteSwatch
                  key={p.index}
                  palette={p}
                  selected={selectedPalette === p.index}
                  onClick={() => setSelectedPalette(p.index)}
                />
              ))}
            </div>

            {/* Preview da combinação escolhida */}
            <div className="mb-6 rounded-xl border border-border overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: palette.colors[0] }}
              >
                <span className="font-heading text-sm font-bold text-white">
                  Nome do Negócio
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: palette.colors[1],
                    color: '#000000aa',
                  }}
                >
                  Contato
                </span>
              </div>
              <div
                className="px-4 py-5"
                style={{ backgroundColor: palette.colors[2] }}
              >
                <div
                  className="mb-2 h-4 w-2/3 rounded"
                  style={{ backgroundColor: palette.colors[0], opacity: 0.15 }}
                />
                <div
                  className="h-3 w-1/2 rounded"
                  style={{ backgroundColor: palette.colors[0], opacity: 0.08 }}
                />
              </div>
            </div>

            {error && (
              <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={isPending}
              className="w-full rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? 'Criando site...'
                : `✨ Usar ${niche.label} — ${palette.name}`}
            </button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Você pode trocar as cores e personalizar tudo depois no editor.
            </p>
          </div>
          )
        })()}
      </main>
    </div>
  )
}
