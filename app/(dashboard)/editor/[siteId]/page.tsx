'use client'

import { useState, useEffect, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import EditorSidebar from './components/EditorSidebar'
import CustomizationPanel from './components/panels/CustomizationPanel'
import BlogPanel from './components/panels/BlogPanel'
import MetricsPanel from './components/panels/MetricsPanel'
import AccountPanel from './components/panels/AccountPanel'

export type EditorTab = 'customize' | 'blog' | 'metrics' | 'account'
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
  const [activeTab, setActiveTab] = useState<EditorTab>('customize')
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [site, setSite] = useState<SiteData | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [, startTransition] = useTransition()
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('sites')
      .select('id,niche,template,palette_index,palette,palette_name,font_pair,domain,status')
      .eq('id', siteId)
      .single()
      .then(({ data }) => { if (data) setSite(data as SiteData) })
  }, [siteId])

  function refreshPreview() {
    startTransition(() => setPreviewKey(k => k + 1))
  }

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
        setPublishMsg({ type: 'ok', text: `Site publicado em ${json.domain}` })
        refreshPreview()
      }
    } catch {
      setPublishMsg({ type: 'err', text: 'Falha de conexão' })
    } finally {
      setPublishing(false)
    }
  }

  // Paleta nomeada/custom (escolher-modelo v2) tem prioridade sobre palette_index legado.
  const paletteColors =
    site?.palette?.colors && site.palette.colors.length >= 7
      ? site.palette.colors.slice(0, 7).join(',')
      : null

  const previewSrc = site
    ? `/preview/template?preset=${site.niche ?? 'servicos'}&palette=${site.palette_index ?? 0}` +
      `&layout=${site.template ?? 'clean'}&site_id=${siteId}` +
      (paletteColors ? `&colors=${encodeURIComponent(paletteColors)}` : '')
    : '/preview/template'

  if (!site) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Carregando editor...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar esquerda ────────────────────────────────── */}
      <EditorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        site={site}
      />

      {/* ── Painel central ──────────────────────────────────── */}
      <div className="flex w-80 shrink-0 flex-col border-r border-border bg-card overflow-hidden">
        {activeTab === 'customize' && (
          <CustomizationPanel
            site={site}
            siteId={siteId}
            onSave={(updated) => { setSite(s => s ? { ...s, ...updated } : s); refreshPreview() }}
          />
        )}
        {activeTab === 'blog' && <BlogPanel siteId={siteId} />}
        {activeTab === 'metrics' && <MetricsPanel siteId={siteId} />}
        {activeTab === 'account' && <AccountPanel />}
      </div>

      {/* ── Preview ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Toolbar do preview */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-4 py-2">
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
                {mode === 'desktop'
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                }
                {mode === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            ))}
          </div>

          <div className="mx-3 flex-1 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground truncate">
            {site.domain ?? `${siteId}.harp-ia.com`}
          </div>

          <button
            onClick={refreshPreview}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Recarregar preview"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {publishing ? 'Publicando...' : site?.status === 'published' ? 'Republicar →' : 'Publicar →'}
            </button>
            {publishMsg && (
              <p className={`text-[10px] ${publishMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                {publishMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* Iframe do preview */}
        <div className="flex flex-1 items-start justify-center overflow-auto bg-muted/30 p-4">
          {viewMode === 'desktop' ? (
            <div
              className="w-full max-w-5xl overflow-hidden rounded-xl border border-border shadow-lg bg-white"
              style={{ height: 'calc(100vh - 100px)' }}
            >
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="mx-3 flex-1 rounded bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  {site.domain ?? `${siteId}.harp-ia.com`}
                </div>
              </div>
              <iframe
                key={`desktop-${previewKey}`}
                src={previewSrc}
                className="w-full"
                style={{ height: 'calc(100% - 33px)', border: 'none' }}
                title="Preview desktop"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div
                className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-foreground shadow-2xl bg-foreground"
                style={{ width: 390, height: 720 }}
              >
                <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground" />
                <div className="h-full overflow-hidden rounded-[2rem] bg-white">
                  <iframe
                    key={`mobile-${previewKey}`}
                    src={previewSrc}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Preview mobile"
                  />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">390 × 720 px</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
