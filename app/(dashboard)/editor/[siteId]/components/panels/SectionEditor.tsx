'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type Props = {
  siteId: string
  sectionType: string
  niche: string
  onSaved: () => void
}

type SectionContent = Record<string, unknown>

export default function SectionEditor({ siteId, sectionType, niche, onSaved }: Props) {
  const [content, setContent] = useState<SectionContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMode, setAiMode] = useState<'block' | 'page' | null>(null)
  const [pageId, setPageId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()
      const { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('site_id', siteId)
        .eq('slug', 'home')
        .single()

      if (!page?.id) { setLoading(false); return }
      setPageId(page.id)

      const { data: section } = await supabase
        .from('sections')
        .select('content')
        .eq('page_id', page.id)
        .eq('section_type', sectionType)
        .single()

      if (section?.content) setContent(section.content as SectionContent)
      setLoading(false)
    }
    load()
  }, [siteId, sectionType])

  async function save(updated: SectionContent) {
    if (!pageId) return
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase
      .from('sections')
      .update({ content: updated })
      .eq('page_id', pageId)
      .eq('section_type', sectionType)
    setSaving(false)
    onSaved()
  }

  async function rewriteWithAI(scope: 'block' | 'page') {
    setAiLoading(true)
    setAiMode(scope)
    const endpoint = scope === 'block' ? '/api/ai/text' : '/api/ai/page'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, section_type: sectionType, niche }),
      })
      if (!res.ok) throw new Error('Falha na IA')
      const { content: updated } = await res.json()
      if (updated) {
        setContent(updated)
        await save(updated)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAiLoading(false)
      setAiMode(null)
    }
  }

  if (loading) {
    return <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">Carregando...</div>
  }

  if (!content) {
    return (
      <div className="flex flex-col gap-2 p-3">
        <p className="text-[11px] text-muted-foreground">Conteúdo ainda não gerado.</p>
        <button
          onClick={() => rewriteWithAI('block')}
          disabled={aiLoading}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {aiLoading ? 'Gerando...' : '✨ Gerar com IA'}
        </button>
      </div>
    )
  }

  const editableFields = getEditableFields(sectionType, content)

  return (
    <div className="flex flex-col gap-3 p-3">

      {/* Campos editáveis */}
      {editableFields.map(({ key, label, multiline }) => {
        const value = String(content[key] ?? '')
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
            {multiline ? (
              <textarea
                value={value}
                rows={3}
                onChange={e => setContent(prev => ({ ...prev!, [key]: e.target.value }))}
                onBlur={() => save({ ...content })}
                className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={e => setContent(prev => ({ ...prev!, [key]: e.target.value }))}
                onBlur={() => save({ ...content })}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            )}
          </div>
        )
      })}

      {saving && <p className="text-center text-[10px] text-muted-foreground">Salvando...</p>}

      {/* Botões IA */}
      <div className="mt-1 flex gap-2 border-t border-border pt-2">
        <button
          onClick={() => rewriteWithAI('block')}
          disabled={aiLoading}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
        >
          {aiLoading && aiMode === 'block' ? (
            <span className="animate-pulse">Reescrevendo...</span>
          ) : (
            <><span>✨</span> Reescrever bloco</>
          )}
        </button>
        <button
          onClick={() => rewriteWithAI('page')}
          disabled={aiLoading}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          title="Regerar a página toda com IA"
        >
          {aiLoading && aiMode === 'page' ? (
            <span className="animate-pulse">Regerando...</span>
          ) : (
            <><span>⟳</span> Página toda</>
          )}
        </button>
      </div>
    </div>
  )
}

function getEditableFields(
  sectionType: string,
  content: SectionContent
): { key: string; label: string; multiline: boolean }[] {
  switch (sectionType) {
    case 'hero':
      return [
        { key: 'headline', label: 'Título principal', multiline: false },
        { key: 'sub', label: 'Subtítulo', multiline: true },
        { key: 'cta_label', label: 'Botão CTA', multiline: false },
      ]
    case 'about':
      return [
        { key: 'title', label: 'Título da seção', multiline: false },
        { key: 'body', label: 'Texto sobre o negócio', multiline: true },
        { key: 'credential', label: 'Credencial / autoridade', multiline: false },
      ]
    case 'services':
      return []
    case 'faq':
      return []
    default:
      return Object.keys(content)
        .filter(k => typeof content[k] === 'string')
        .map(k => ({ key: k, label: k, multiline: String(content[k]).length > 80 }))
  }
}
