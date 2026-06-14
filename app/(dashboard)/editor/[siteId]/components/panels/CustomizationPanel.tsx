'use client'

import { useState, useTransition } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SiteData } from '../../page'
import ImageUploader from './ImageUploader'
import SectionEditor from './SectionEditor'
import {
  PALETTES,
  PALETTE_GROUPS,
  CUSTOM_DEFAULT,
  buildCustom,
} from '@/app/templates/model-data'

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
  const [selectedName, setSelectedName] = useState(site.palette_name ?? 'Original')
  const [custom, setCustom] = useState<string[]>(
    site.palette_name === 'Personalizada' && site.palette?.colors?.length === 7
      ? site.palette.colors
      : CUSTOM_DEFAULT,
  )
  const [selectedFont, setSelectedFont] = useState(site.font_pair ?? 'classico')
  const [expandedSection, setExpandedSection] = useState<string | null>('hero')
  const [saving, setSaving] = useState(false)
  const [aiFilling, setAiFilling] = useState(false)
  const [aiError, setAiError] = useState('')
  const [, startTransition] = useTransition()

  // "Preencher tudo com IA" — dispara o Agente Onboarding (/api/generate/site, SSE)
  // e atualiza o preview ao concluir. Human-in-the-Loop: não publica, só gera rascunho.
  async function runAiFill() {
    setAiFilling(true)
    setAiError('')
    try {
      const res = await fetch('/api/generate/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId }),
      })
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => '')
        setAiError(txt || 'Não consegui gerar o conteúdo agora.')
        return
      }
      // Consome o stream SSE até o fim (o conteúdo é gravado no banco pelo servidor).
      const reader = res.body.getReader()
      while (true) {
        const { done } = await reader.read()
        if (done) break
      }
      onSave({}) // força refresh do preview no parent
    } catch {
      setAiError('Falha de conexão ao gerar o conteúdo.')
    } finally {
      setAiFilling(false)
    }
  }

  // Salva a paleta nomeada/custom em sites.palette (jsonb) + palette_name.
  // 'Original' (colors null) zera a paleta → preview cai no default do nicho.
  async function savePaletteByName(name: string, colors: string[] | null, group: string) {
    setSelectedName(name)
    setSaving(true)
    const palette = colors && colors.length >= 7 ? { name, group, colors } : null
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ palette, palette_name: name }).eq('id', siteId)
    setSaving(false)
    onSave({ palette, palette_name: name })
  }

  function pickCustom(idx: 0 | 1 | 2, val: string) {
    const next = [...custom]
    next[idx] = val
    const built = buildCustom(next[0]!, next[1]!, next[2]!)
    setCustom(built)
    void savePaletteByName('Personalizada', built, 'custom')
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
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground mb-1">Escolha a paleta de cores do site.</p>

            {/* Original (default do nicho) */}
            {(() => {
              const isSel = selectedName === 'Original'
              return (
                <button
                  onClick={() => savePaletteByName('Original', null, 'base')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-2.5 text-left transition-all ${
                    isSel ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex h-7 w-14 shrink-0 overflow-hidden rounded-lg">
                    {['#3a4a63', '#26344a', '#5d6b82'].map((c, i) => (
                      <div key={i} className={i === 0 ? 'flex-[2]' : 'flex-1'} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-foreground">Original</span>
                  {isSel && <span className="ml-auto text-primary text-sm">✓</span>}
                </button>
              )
            })()}

            {/* Grupos de paletas nomeadas */}
            {PALETTE_GROUPS.map(group => {
              const items = PALETTES.filter(p => p.group === group)
              if (!items.length) return null
              return (
                <div key={group} className="mt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{group}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {items.map(p => {
                      const isSel = selectedName === p.name
                      const c = p.colors ?? []
                      return (
                        <button
                          key={p.name}
                          onClick={() => savePaletteByName(p.name, p.colors, p.group)}
                          title={p.name}
                          className={`flex flex-col gap-1 rounded-lg border-2 p-1.5 transition-all ${
                            isSel ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <div className="flex h-6 w-full overflow-hidden rounded">
                            <div className="flex-[2]" style={{ backgroundColor: c[0] }} />
                            <div className="flex-1" style={{ backgroundColor: c[1] }} />
                            <div className="flex-1" style={{ backgroundColor: c[2] }} />
                          </div>
                          <span className="truncate text-[10px] font-semibold text-foreground">{p.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Personalizada */}
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 mt-2">Personalizada</p>
            <div className={`grid grid-cols-3 gap-2 rounded-xl border-2 p-2.5 ${
              selectedName === 'Personalizada' ? 'border-primary bg-primary/5' : 'border-border'
            }`}>
              {(['Principal', 'Apoio', 'Destaque'] as const).map((lbl, i) => (
                <label key={lbl} className="flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {lbl}
                  <input
                    type="color"
                    value={custom[i]}
                    onChange={e => pickCustom(i as 0 | 1 | 2, e.target.value)}
                    className="h-7 w-full cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                </label>
              ))}
            </div>

            {saving && <p className="text-center text-[11px] text-muted-foreground mt-1">Salvando...</p>}
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
            <button
              onClick={runAiFill}
              disabled={aiFilling}
              className="mb-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
            >
              {aiFilling ? 'Escrevendo seu site…' : '✨ Preencher tudo com IA'}
            </button>
            {aiError && <p className="text-[11px] text-red-500">{aiError}</p>}
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
