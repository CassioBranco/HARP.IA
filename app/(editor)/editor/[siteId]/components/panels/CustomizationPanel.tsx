'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SiteData } from '../../page'
import ImageUploader from './ImageUploader'
import SectionEditor from './SectionEditor'
import BrandPanel from './BrandPanel'
import SeoPanel from './SeoPanel'
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

// Dois painéis, duas famílias de abas. Esquerda = o QUE o site diz (conteúdo);
// direita = como ele PARECE (design) + os ajustes de captação. Cada painel tem
// seu próprio estado de aba ativa, então os dois ficam visíveis ao mesmo tempo.
type ContentTab = 'textos' | 'imagens' | 'marca'
type DesignTab = 'modelo' | 'cores' | 'fontes' | 'seo' | 'agenda' | 'leads'

const CONTENT_TABS: { id: ContentTab; label: string }[] = [
  { id: 'textos',  label: 'Textos' },
  { id: 'imagens', label: 'Imagens' },
  { id: 'marca',   label: 'Marca' },
]
const DESIGN_TABS: { id: DesignTab; label: string }[] = [
  { id: 'modelo', label: 'Modelo' },
  { id: 'cores',  label: 'Cores' },
  { id: 'fontes', label: 'Fontes' },
  { id: 'seo',    label: 'SEO' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'leads',  label: 'Leads' },
]

// Entrada da pilha de undo — guarda o estado ANTERIOR de cada mudança
// de personalização (padrão dos editores top: Framer/Webflow têm undo).
type UndoEntry =
  | { type: 'palette'; name: string; colors: string[] | null; group: string }
  | { type: 'font'; id: string }
  | { type: 'template'; id: string }

export default function CustomizationPanel({ site, siteId, onSave }: Props) {
  const [contentTab, setContentTab] = useState<ContentTab>('textos')
  const [designTab, setDesignTab] = useState<DesignTab>('cores')
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
  const [bookingOn, setBookingOn] = useState(Boolean(site.booking_enabled))
  const [leadsOn, setLeadsOn] = useState(Boolean(site.leads_enabled))

  // ── Undo (Desfazer) ──
  const [history, setHistory] = useState<UndoEntry[]>([])
  const lastPalette = useRef<{ name: string; colors: string[] | null; group: string }>({
    name: site.palette_name ?? 'Original',
    colors: site.palette?.colors ?? null,
    group: site.palette?.group ?? 'base',
  })
  const lastFont = useRef(site.font_pair ?? 'classico')
  const lastTemplate = useRef(site.template ?? 'clean')

  // Clique no preview (iframe) → abre a aba certa. A ponte vive no PreviewBridge.
  // Imagem e texto são conteúdo (painel esquerdo). Quando o clique foi num texto
  // de seção conhecida, expande o acordeão dela.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as { source?: string; kind?: string; sectionType?: string } | null
      if (!d || d.source !== 'ancoreo-preview') return
      if (d.kind === 'image') setContentTab('imagens')
      else if (d.kind === 'text') {
        setContentTab('textos')
        if (d.sectionType && SECTIONS.includes(d.sectionType)) setExpandedSection(d.sectionType)
      }
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

  async function savePaletteByName(name: string, colors: string[] | null, group: string, record = true) {
    if (record) setHistory(h => [...h, { type: 'palette', ...lastPalette.current }])
    lastPalette.current = { name, colors, group }
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
    // só grava no histórico ao ENTRAR na personalizada — arrastar o
    // seletor de cor dispara dezenas de onChange e inundaria o undo
    const record = lastPalette.current.name !== 'Personalizada'
    void savePaletteByName('Personalizada', built, 'custom', record)
  }

  // Troca o template do site. Só muda qual layout renderiza — textos, imagens
  // e seções continuam os mesmos. onSave atualiza o estado e recarrega o preview.
  async function saveTemplate(templateId: string, record = true) {
    if (templateId === selectedTemplate) return
    if (record) setHistory(h => [...h, { type: 'template', id: lastTemplate.current }])
    lastTemplate.current = templateId
    setSelectedTemplate(templateId)
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ template: templateId }).eq('id', siteId)
    setSaving(false)
    onSave({ template: templateId })
  }

  async function saveFont(fontId: string, record = true) {
    if (record) setHistory(h => [...h, { type: 'font', id: lastFont.current }])
    lastFont.current = fontId
    setSelectedFont(fontId)
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ font_pair: fontId }).eq('id', siteId)
    setSaving(false)
    onSave({ font_pair: fontId })
  }

  // Desfaz a última mudança de modelo/cor/fonte (LIFO).
  async function undo() {
    const entry = history[history.length - 1]
    if (!entry) return
    setHistory(h => h.slice(0, -1))
    if (entry.type === 'palette') {
      lastPalette.current = { name: entry.name, colors: entry.colors, group: entry.group }
      if (entry.colors) setCustom(entry.colors.length === 7 ? entry.colors : CUSTOM_DEFAULT)
      await savePaletteByName(entry.name, entry.colors, entry.group, false)
    } else if (entry.type === 'font') {
      lastFont.current = entry.id
      await saveFont(entry.id, false)
    } else {
      lastTemplate.current = entry.id
      await saveTemplate(entry.id, false)
    }
  }

  // Liga/desliga o widget de agendamento no site publicado (sites.booking_enabled).
  async function saveBooking(on: boolean) {
    setBookingOn(on)
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ booking_enabled: on }).eq('id', siteId)
    setSaving(false)
    onSave({ booking_enabled: on })
  }

  // Liga/desliga a faixa de captura de leads no site publicado (sites.leads_enabled).
  async function saveLeads(on: boolean) {
    setLeadsOn(on)
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase.from('sites').update({ leads_enabled: on }).eq('id', siteId)
    setSaving(false)
    onSave({ leads_enabled: on })
  }

  return (
    <>
      {/* ══ PAINEL ESQUERDO — CONTEÚDO (o que o site diz) ══ */}
      <aside className="ed-panel ed-panel-l">
        <div className="ed-ph"><h2>Conteúdo</h2></div>

        <div className="ed-subtabs">
          {CONTENT_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setContentTab(t.id)}
              className={`ed-subtab ${contentTab === t.id ? 'on' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ed-scroll">
          {/* ── TEXTOS ── */}
          {contentTab === 'textos' && (
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

          {/* ── IMAGENS ── */}
          {contentTab === 'imagens' && <ImageUploader siteId={siteId} niche={site.niche} onAssigned={() => onSave({})} />}

          {/* ── MARCA (logo, favicon, redes) ── */}
          {contentTab === 'marca' && <BrandPanel siteId={siteId} />}
        </div>
      </aside>

      {/* ══ PAINEL DIREITO — DESIGN & AJUSTES (como o site parece + captação) ══ */}
      <aside className="ed-panel ed-panel-r">
        <div className="ed-ph">
          <h2>Design &amp; ajustes</h2>
          <button
            className="btn glass sm"
            onClick={undo}
            disabled={history.length === 0 || saving}
            title="Desfaz a última mudança de modelo, cor ou fonte"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
            Desfazer
          </button>
        </div>

        <div className="ed-subtabs">
          {DESIGN_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setDesignTab(t.id)}
              className={`ed-subtab ${designTab === t.id ? 'on' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ed-scroll">
          {/* ── MODELO (troca o layout do site) ── */}
          {designTab === 'modelo' && (
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
          {designTab === 'cores' && (
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
          {designTab === 'fontes' && (
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
                  <p style={{ fontFamily: fp.heading, fontSize: '1rem', fontWeight: 700, margin: '.3rem 0 0', color: 'var(--ink)' }}>
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

          {/* ── SEO (score ao vivo da página + título/meta do Google) ── */}
          {designTab === 'seo' && <SeoPanel siteId={siteId} onSaved={() => onSave({})} />}

          {/* ── AGENDA (widget de agendamento no site) ── */}
          {designTab === 'agenda' && (
            <>
              <p className="ed-hint">
                Botão &quot;Agendar&quot; flutuante no site: o visitante pede um horário
                (nome, WhatsApp, serviço, data) e a solicitação chega no seu painel.
              </p>
              <button
                onClick={() => saveBooking(!bookingOn)}
                className={`ed-opt ${bookingOn ? 'on' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '.6rem', width: '100%' }}
                role="switch"
                aria-checked={bookingOn}
              >
                <span style={{
                  width: 34, height: 20, borderRadius: 999, flexShrink: 0,
                  background: bookingOn ? '#22c55e' : 'var(--line)',
                  position: 'relative', transition: 'background .15s',
                }}>
                  <i style={{
                    position: 'absolute', top: 2, left: bookingOn ? 16 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left .15s',
                  }} />
                </span>
                <span style={{ textAlign: 'left' }}>
                  <b>{bookingOn ? 'Agendamento ativado' : 'Agendamento desativado'}</b>
                  <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)' }}>
                    {bookingOn ? 'O botão aparece no site publicado.' : 'Ative pra receber pedidos de horário.'}
                  </span>
                </span>
              </button>
              <p className="ed-hint" style={{ marginTop: '.6rem' }}>
                Você vê e confirma cada solicitação em{' '}
                <a href="/agendamentos" style={{ color: 'inherit', textDecoration: 'underline' }}>Agendamentos</a>.
                Não é reserva automática — quem confirma o horário é você.
              </p>
              {saving && <p className="ed-saving">Salvando…</p>}
            </>
          )}

          {/* ── LEADS (faixa de captura de contato no site) ── */}
          {designTab === 'leads' && (
            <>
              <p className="ed-hint">
                Faixa discreta &quot;Fique por dentro&quot; no fim do site: o visitante
                deixa nome, e-mail ou WhatsApp e o contato chega no seu painel.
                Não é popup — não atrapalha a navegação nem o Google.
              </p>
              <button
                onClick={() => saveLeads(!leadsOn)}
                className={`ed-opt ${leadsOn ? 'on' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '.6rem', width: '100%' }}
                role="switch"
                aria-checked={leadsOn}
              >
                <span style={{
                  width: 34, height: 20, borderRadius: 999, flexShrink: 0,
                  background: leadsOn ? '#22c55e' : 'var(--line)',
                  position: 'relative', transition: 'background .15s',
                }}>
                  <i style={{
                    position: 'absolute', top: 2, left: leadsOn ? 16 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left .15s',
                  }} />
                </span>
                <span style={{ textAlign: 'left' }}>
                  <b>{leadsOn ? 'Captura de leads ativada' : 'Captura de leads desativada'}</b>
                  <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--muted)' }}>
                    {leadsOn ? 'A faixa aparece no fim do site publicado.' : 'Ative pra receber contatos de interessados.'}
                  </span>
                </span>
              </button>
              <p className="ed-hint" style={{ marginTop: '.6rem' }}>
                Você vê cada contato em{' '}
                <a href="/leads" style={{ color: 'inherit', textDecoration: 'underline' }}>Leads</a>.
                O visitante pode dispensar a faixa — ela não volta no mesmo dia.
              </p>
              {saving && <p className="ed-saving">Salvando…</p>}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
