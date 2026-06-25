'use client'

import { useState, useEffect, useTransition } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SiteData } from '../../page'
import ImageUploader from './ImageUploader'
import SectionEditor from './SectionEditor'
import BrandPanel from './BrandPanel'
import {
  MODELS,
  PALETTES,
  PALETTE_GROUPS,
  CUSTOM_DEFAULT,
  buildCustom,
} from '@/app/templates/model-data'
import { FONT_PAIRS } from '@/lib/templates/fonts'

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

type SubTab = 'modelo' | 'cores' | 'fontes' | 'imagens' | 'marca' | 'textos'

export default function CustomizationPanel({ site, siteId, onSave }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('cores')
  const [selectedName, setSelectedName] = useState(site.palette_name ?? 'Original')
  const [custom, setCustom] = useState<string[]>(
    site.palette_name === 'Personalizada' && site.palette?.colors?.length === 7
      ? site.palette.colors
      : CUSTOM_DEFAULT,
  )
  const [selectedFont, setSelectedFont] = useState(site.font_pair ?? 'classico')
  const [selectedTemplate, setSelectedTemplate] = useState(site.template ?? 'clean')
  const [expandedSection, setExpandedSection] = useState<string | null>('hero')
  const [saving, setSaving] = useState(false)

  // Clique no preview (iframe) → abre a aba certa. A ponte vive no PreviewBridge.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { source?: string; kind?: string } | null
      if (!d || d.source !== 'ancoreo-preview') return
      if (d.kind === 'image') setSubTab('imagens')
      else if (d.kind === 'text') setSubTab('textos')
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])
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
      const reader = res.body.getReader()
      while (true) {
        const { done } = await reader.read()
        if (done) break
      }
      onSave({})
    } catch {
      setAiError('Falha de conexão ao gerar o conteúdo.')
    } finally {
      setAiFilling(false)
    }
  }

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

  // Troca o template do site. Só muda qual layout renderiza — textos, imagens
  // e seções continuam os mesmos. onSave atualiza o estado e recarrega o preview.
  async function saveTemplate(templateId: string) {
    if (templateId === selectedTemplate) return
    setSelectedTemplate(templateId)
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ template: templateId }).eq('id', siteId)
    setSaving(false)
    onSave({ template: templateId })
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
    { id: 'modelo',  label: 'Modelo' },
    { id: 'cores',   label: 'Cores' },
    { id: 'fontes',  label: 'Fontes' },
    { id: 'imagens', label: 'Imagens' },
    { id: 'marca',   label: 'Marca' },
    { id: 'textos',  label: 'Textos' },
  ]

  return (
    <>
      <div className="ed-ph"><h2>Personalizar</h2></div>

      <div className="ed-subtabs">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`ed-subtab ${subTab === t.id ? 'on' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ed-scroll">

        {/* ── MODELO (troca o layout do site) ── */}
        {subTab === 'modelo' && (
          <>
            <p className="ed-hint">Troque o modelo do site. Seus textos, imagens e seções continuam — só muda o visual.</p>
            <div className="ed-pal-grid">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => saveTemplate(m.id)}
                  title={m.desc}
                  className={`ed-pal ${selectedTemplate === m.id ? 'on' : ''}`}
                >
                  <span className="sw">
                    <i style={{ background: m.swatch[0], flex: 2 }} />
                    <i style={{ background: m.swatch[1], flex: 1 }} />
                    <i style={{ background: m.swatch[2], flex: 1 }} />
                  </span>
                  <span className="nm">{m.name}</span>
                </button>
              ))}
            </div>
            {saving && <p className="ed-saving">Salvando…</p>}
          </>
        )}

        {/* ── CORES ── */}
        {subTab === 'cores' && (
          <>
            <p className="ed-hint">Escolha a paleta de cores do site.</p>

            {/* Original */}
            <button
              onClick={() => savePaletteByName('Original', null, 'base')}
              className={`ed-pal-row ed-opt ${selectedName === 'Original' ? 'on' : ''}`}
            >
              <span className="sw">
                {['#3a4a63', '#26344a', '#5d6b82'].map((c, i) => (
                  <i key={i} style={{ background: c, flex: i === 0 ? 2 : 1 }} />
                ))}
              </span>
              <b>Original</b>
              <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--muted)' }}>padrão do template</span>
            </button>

            {PALETTE_GROUPS.map(group => {
              const items = PALETTES.filter(p => p.group === group)
              if (!items.length) return null
              return (
                <div key={group}>
                  <p className="ed-cap" style={{ marginBottom: '.4rem' }}>{group}</p>
                  <div className="ed-pal-grid">
                    {items.map(p => {
                      const c = p.colors ?? []
                      return (
                        <button
                          key={p.name}
                          onClick={() => savePaletteByName(p.name, p.colors, p.group)}
                          title={p.name}
                          className={`ed-pal ${selectedName === p.name ? 'on' : ''}`}
                        >
                          <span className="sw">
                            <i style={{ background: c[0], flex: 2 }} />
                            <i style={{ background: c[1], flex: 1 }} />
                            <i style={{ background: c[2], flex: 1 }} />
                          </span>
                          <span className="nm">{p.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <p className="ed-cap" style={{ marginTop: '.3rem' }}>Personalizada</p>
            <div className={`ed-custom ${selectedName === 'Personalizada' ? 'on' : ''}`}>
              {(['Principal', 'Apoio', 'Destaque'] as const).map((lbl, i) => (
                <label key={lbl}>
                  {lbl}
                  <input
                    type="color"
                    value={custom[i]}
                    onChange={e => pickCustom(i as 0 | 1 | 2, e.target.value)}
                  />
                </label>
              ))}
            </div>

            {saving && <p className="ed-saving">Salvando…</p>}
          </>
        )}

        {/* ── FONTES ── */}
        {subTab === 'fontes' && (
          <>
            <p className="ed-hint">Par tipográfico para títulos e texto do site.</p>
            {FONT_PAIRS.map(fp => (
              <button
                key={fp.id}
                onClick={() => saveFont(fp.id)}
                className={`ed-opt ed-font ${selectedFont === fp.id ? 'on' : ''}`}
              >
                <b>{fp.name}</b>
                <span className="smp">{fp.sample}</span>
                <p style={{ fontFamily: fp.heading, fontSize: '1rem', fontWeight: 700, margin: '.3rem 0 0', color: '#fff' }}>
                  Título do Site
                </p>
                <p style={{ fontFamily: fp.body, fontSize: '.75rem', color: 'var(--muted)', margin: '2px 0 0' }}>
                  Texto do corpo em {fp.body.split(',')[0]?.replace(/'/g, '') ?? fp.body}
                </p>
              </button>
            ))}
            {saving && <p className="ed-saving">Salvando…</p>}
          </>
        )}

        {/* ── IMAGENS ── */}
        {subTab === 'imagens' && <ImageUploader siteId={siteId} niche={site.niche} onAssigned={() => onSave({})} />}

        {/* ── MARCA (logo, favicon, redes) ── */}
        {subTab === 'marca' && <BrandPanel siteId={siteId} />}

        {/* ── TEXTOS ── */}
        {subTab === 'textos' && (
          <>
            <button onClick={runAiFill} disabled={aiFilling} className="ed-ai">
              {aiFilling ? 'Escrevendo seu site…' : <><i className="ph-fill ph-sparkle ai-spark" /> Preencher tudo com IA</>}
            </button>
            {aiError && <p className="ed-err">{aiError}</p>}
            <p className="ed-hint">Edite cada seção do site. Use a IA para reescrever ou melhorar.</p>
            {SECTIONS.map(sec => (
              <div key={sec} className="ed-acc">
                <button
                  onClick={() => setExpandedSection(expandedSection === sec ? null : sec)}
                  className="ed-acc-h"
                >
                  {SECTION_LABELS[sec]}
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: expandedSection === sec ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSection === sec && (
                  <div className="ed-acc-b">
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
          </>
        )}
      </div>
    </>
  )
}
