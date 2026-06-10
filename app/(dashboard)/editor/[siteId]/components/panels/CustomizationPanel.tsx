'use client'

import { useState, useTransition } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SiteData } from '../../page'
import ImageUploader from './ImageUploader'
import SectionEditor from './SectionEditor'

// Paletas — mesmo sistema da galeria de templates
const PALETTES: Record<string, { index: number; name: string; colors: [string, string, string] }[]> = {
  default: [
    { index: 0, name: 'Azul Profissional', colors: ['#2563eb', '#1d4ed8', '#f8fafc'] },
    { index: 1, name: 'Verde Saúde',       colors: ['#0d9488', '#5eead4', '#f0fdfa'] },
    { index: 2, name: 'Grafite Premium',   colors: ['#1e293b', '#f59e0b', '#fffbeb'] },
  ],
}

const FONT_PAIRS = [
  { id: 'classico',   name: 'Clássico',   sample: 'Plus Jakarta + Inter',      heading: "'Plus Jakarta Sans', sans-serif", body: "'Inter', sans-serif" },
  { id: 'elegante',   name: 'Elegante',   sample: 'Playfair + Lato',           heading: "'Playfair Display', serif",      body: "'Lato', sans-serif" },
  { id: 'moderno',    name: 'Moderno',    sample: 'Sora + DM Sans',            heading: "'Sora', sans-serif",             body: "'DM Sans', sans-serif" },
  { id: 'acolhedor',  name: 'Acolhedor',  sample: 'Merriweather + Nunito',     heading: "'Merriweather', serif",          body: "'Nunito', sans-serif" },
  { id: 'arrojado',   name: 'Arrojado',   sample: 'Bebas Neue + Inter',        heading: "'Bebas Neue', sans-serif",       body: "'Inter', sans-serif" },
  { id: 'jovem',      name: 'Jovem',      sample: 'Space Grotesk + Outfit',    heading: "'Space Grotesk', sans-serif",    body: "'Outfit', sans-serif" },
]

const SECTIONS = ['hero', 'about', 'services', 'faq']
const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero (cabeçalho)',
  about: 'Sobre o negócio',
  services: 'Serviços',
  faq: 'Perguntas frequentes',
}

type Props = {
  site: SiteData
  siteId: string
  onSave: (updated: Partial<SiteData>) => void
}

type SubTab = 'cores' | 'fontes' | 'imagens' | 'textos'

export default function CustomizationPanel({ site, siteId, onSave }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('cores')
  const [selectedPalette, setSelectedPalette] = useState(site.palette_index ?? 0)
  const [selectedFont, setSelectedFont] = useState(site.font_pair ?? 'classico')
  const [expandedSection, setExpandedSection] = useState<string | null>('hero')
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()

  const palettes = PALETTES[site.niche] ?? PALETTES.default ?? []

  async function savePalette(index: number) {
    setSelectedPalette(index)
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ palette_index: index }).eq('id', siteId)
    setSaving(false)
    onSave({ palette_index: index })
  }

  async function saveFont(fontId: string) {
    setSelectedFont(fontId)
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ font_pair: fontId }).eq('id', siteId)
    setSaving(false)
    onSave({ font_pair: fontId })
  }

  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'cores',   label: 'Cores' },
    { id: 'fontes',  label: 'Fontes' },
    { id: 'imagens', label: 'Imagens' },
    { id: 'textos',  label: 'Textos' },
  ]

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personalizar</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-border px-3 pt-2 gap-1">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex-1 rounded-t-md pb-2 pt-1.5 text-xs font-semibold transition-colors ${
              subTab === t.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* ── CORES ─────────────────────────────────────────── */}
        {subTab === 'cores' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">Escolha a paleta de cores do site.</p>
            {palettes.map(p => {
              const [c1, c2, c3] = p.colors
              const isSelected = selectedPalette === p.index
              return (
                <button
                  key={p.index}
                  onClick={() => savePalette(p.index)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex h-8 w-16 shrink-0 overflow-hidden rounded-lg">
                    <div className="flex-[2]" style={{ backgroundColor: c1 }} />
                    <div className="flex-1" style={{ backgroundColor: c2 }} />
                    <div className="flex-[2]" style={{ backgroundColor: c3 }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{p.name}</span>
                  {isSelected && <span className="ml-auto text-primary text-sm">✓</span>}
                </button>
              )
            })}
            {saving && <p className="text-center text-[11px] text-muted-foreground">Salvando...</p>}
          </div>
        )}

        {/* ── FONTES ────────────────────────────────────────── */}
        {subTab === 'fontes' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">Par tipográfico para títulos e texto do site.</p>
            {FONT_PAIRS.map(fp => {
              const isSelected = selectedFont === fp.id
              return (
                <button
                  key={fp.id}
                  onClick={() => saveFont(fp.id)}
                  className={`flex flex-col rounded-xl border-2 p-3 text-left transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{fp.name}</span>
                    {isSelected && <span className="text-primary text-xs">✓</span>}
                  </div>
                  <span className="text-[11px] text-muted-foreground mb-2">{fp.sample}</span>
                  <p style={{ fontFamily: fp.heading, fontSize: '1rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--foreground)' }}>
                    Título do Site
                  </p>
                  <p style={{ fontFamily: fp.body, fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                    Texto do corpo em {fp.body.split(',')[0]?.replace(/'/g, '') ?? fp.body}
                  </p>
                </button>
              )
            })}
            {saving && <p className="text-center text-[11px] text-muted-foreground">Salvando...</p>}
          </div>
        )}

        {/* ── IMAGENS ───────────────────────────────────────── */}
        {subTab === 'imagens' && (
          <ImageUploader siteId={siteId} niche={site.niche} />
        )}

        {/* ── TEXTOS ────────────────────────────────────────── */}
        {subTab === 'textos' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground mb-2">
              Edite cada seção do site. Use a IA para reescrever ou melhorar.
            </p>
            {SECTIONS.map(sec => (
              <div key={sec} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === sec ? null : sec)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs font-semibold text-foreground">{SECTION_LABELS[sec]}</span>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-muted-foreground transition-transform ${expandedSection === sec ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {expandedSection === sec && (
                  <div className="border-t border-border">
                    <SectionEditor
                      siteId={siteId}
                      sectionType={sec}
                      niche={site.niche}
                      onSaved={() => startTransition(() => {})}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
