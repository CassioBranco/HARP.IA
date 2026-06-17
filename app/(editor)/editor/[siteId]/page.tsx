'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import EditorSidebar from './components/EditorSidebar'
import CustomizationPanel from './components/panels/CustomizationPanel'

export type ViewMode = 'desktop' | 'mobile'

export type SitePalette = { name?: string; group?: string; colors: string[] } | null

export type SiteData = {
  id: string
  niche: string
  template: string
  palette_index: number
  palette: SitePalette
  palette_name: string | null
  font_pair: string
  domain: string | null
  status: string
}

export default function EditorPage() {
  const { siteId } = useParams<{ siteId: string }>()
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [site, setSite] = useState<SiteData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [, startTransition] = useTransition()
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  // Geração automática do conteúdo na 1ª abertura (site recém-criado vem vazio).
  const [gen, setGen] = useState<{ state: 'idle' | 'running' | 'error'; msg?: string }>({ state: 'idle' })
  const autoGenChecked = useRef(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('sites')
      .select('id,niche,template,palette_index,palette,palette_name,font_pair,domain,status')
      .eq('id', siteId)
      .single()
      .then(({ data, error }) => {
        if (data) setSite(data as SiteData)
        else setLoadError(error?.message ?? 'Site não encontrado')
      })
  }, [siteId])

  function refreshPreview() {
    startTransition(() => setPreviewKey(k => k + 1))
  }

  // Dispara a geração de conteúdo (SSE). Usado tanto no auto-gen quanto no retry.
  async function generateContent() {
    setGen({ state: 'running' })
    try {
      const res = await fetch('/api/generate/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId }),
      })
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => '')
        let msg = txt
        try { msg = JSON.parse(txt).error ?? txt } catch { /* texto puro */ }
        setGen({ state: 'error', msg: msg || 'Não consegui gerar o conteúdo agora.' })
        return
      }
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = '', errMsg = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const m = buf.match(/"error":"([^"]*)"/)
        if (m) errMsg = m[1] ?? ''
      }
      if (errMsg) { setGen({ state: 'error', msg: errMsg }); return }
      setGen({ state: 'idle' })
      refreshPreview()
    } catch {
      setGen({ state: 'error', msg: 'Falha de conexão ao gerar o conteúdo.' })
    }
  }

  // Na 1ª abertura: se a home ainda não tem seções, gera automaticamente.
  // (a geração não dispara mais no onboarding — o gatilho mora aqui agora.)
  useEffect(() => {
    if (!site || autoGenChecked.current) return
    autoGenChecked.current = true
    const supabase = createBrowserClient()
    ;(async () => {
      const { data: page } = await supabase
        .from('pages').select('id').eq('site_id', siteId).eq('slug', 'home').maybeSingle()
      let hasContent = false
      if (page?.id) {
        const { count } = await supabase
          .from('sections').select('*', { count: 'exact', head: true }).eq('page_id', page.id)
        hasContent = (count ?? 0) > 0
      }
      if (!hasContent) await generateContent()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, siteId])

  async function handlePublish() {
    setPublishing(true)
    setPublishMsg(null)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId }),
      })
      const json = await res.json()
      if (!res.ok) {
        setPublishMsg({ type: 'err', text: json.error ?? 'Erro ao publicar' })
      } else {
        setSite(s => s ? { ...s, status: 'published', domain: json.domain } : s)
        setPublishMsg({ type: 'ok', text: `Publicado em ${json.domain}` })
        refreshPreview()
      }
    } catch {
      setPublishMsg({ type: 'err', text: 'Falha de conexão' })
    } finally {
      setPublishing(false)
    }
  }

  // Preview do CONTEÚDO REAL do site (texto + paleta + fonte + imagens enviadas).
  // Lê do banco, que já está atualizado pelos saves do painel. previewKey força
  // o reload do iframe após cada alteração. chrome=0 esconde a barra (sem chrome dobrado).
  const previewSrc = site
    ? `/preview/${siteId}?chrome=0&v=${previewKey}`
    : 'about:blank'

  const url = site?.domain ?? `${siteId}.harp-ia.com`

  if (!site) {
    return (
      <div className="painel-shell">
        <div className="aura" />
        <div className="ed-loading">
          {loadError ? (
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <p style={{ color: '#ff9b9b', fontWeight: 600 }}>Não consegui abrir o editor.</p>
              <p style={{ color: 'var(--muted)', fontSize: '.8rem', marginTop: '.4rem' }}>{loadError}</p>
              <a href="/sites" className="btn glass sm" style={{ marginTop: '1rem' }}>Voltar pros meus sites</a>
            </div>
          ) : 'Carregando editor…'}
        </div>
      </div>
    )
  }

  return (
    <div className="painel-shell">
      <div className="aura" />
      <div className="ed">

        {/* Rail de ícones */}
        <EditorSidebar site={site} />

        {/* Painel de controles — edição do site */}
        <div className="ed-panel">
          <CustomizationPanel
            site={site}
            siteId={siteId}
            onSave={(updated) => { setSite(s => s ? { ...s, ...updated } : s); refreshPreview() }}
          />
        </div>

        {/* Palco / preview */}
        <div className="ed-stage">
          <div className="ed-toolbar">
            <div className="ed-seg">
              {(['desktop', 'mobile'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={viewMode === mode ? 'on' : ''}
                >
                  {mode === 'desktop'
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
                  {mode === 'desktop' ? 'Desktop' : 'Mobile'}
                </button>
              ))}
            </div>

            <div className="ed-url">{url}</div>

            <button onClick={refreshPreview} className="ed-icon-btn" title="Recarregar preview">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem' }}>
              <button onClick={handlePublish} disabled={publishing} className="btn sm">
                {publishing ? 'Publicando…' : site.status === 'published' ? 'Republicar →' : 'Publicar →'}
              </button>
              {publishMsg && (
                <span className={`ed-pubmsg ${publishMsg.type}`}>{publishMsg.text}</span>
              )}
            </div>
          </div>

          <div className="ed-canvas" style={{ position: 'relative' }}>
            {gen.state !== 'idle' && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 20, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '.8rem', textAlign: 'center', padding: '2rem',
                background: 'rgba(11,20,38,.82)', backdropFilter: 'blur(4px)',
              }}>
                {gen.state === 'running' ? (
                  <>
                    <i className="ph-fill ph-sparkle ai-spark" style={{ fontSize: '2.4rem' }} />
                    <b style={{ color: '#fff', fontFamily: "'Plus Jakarta Sans'", fontSize: '1.05rem' }}>
                      A IA está escrevendo seu site…
                    </b>
                    <span style={{ color: 'var(--muted)', fontSize: '.85rem', maxWidth: 320 }}>
                      Isso leva alguns segundos. Não feche esta página.
                    </span>
                  </>
                ) : (
                  <>
                    <i className="ph-fill ph-warning" style={{ fontSize: '2rem', color: '#fca5a5' }} />
                    <b style={{ color: '#fff', fontFamily: "'Plus Jakarta Sans'", fontSize: '1rem' }}>
                      Não consegui gerar o conteúdo
                    </b>
                    <span style={{ color: 'var(--muted)', fontSize: '.84rem', maxWidth: 340 }}>{gen.msg}</span>
                    <button onClick={generateContent} className="btn sm" style={{ marginTop: '.4rem' }}>
                      Tentar de novo
                    </button>
                  </>
                )}
              </div>
            )}
            {viewMode === 'desktop' ? (
              <div className="ed-browser">
                <div className="ed-chrome">
                  <span className="dot" style={{ background: '#f87171' }} />
                  <span className="dot" style={{ background: '#fbbf24' }} />
                  <span className="dot" style={{ background: '#34d399' }} />
                  <span className="u">{url}</span>
                </div>
                <iframe key={`desktop-${previewKey}`} src={previewSrc} title="Preview desktop" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                <div className="ed-phone">
                  <span className="notch" />
                  <div className="scr">
                    <iframe key={`mobile-${previewKey}`} src={previewSrc} title="Preview mobile" />
                  </div>
                </div>
                <p style={{ fontSize: '.7rem', color: 'var(--muted2)' }}>390 × 720 px</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
