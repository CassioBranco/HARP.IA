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
    return <p className="ed-saving">Carregando…</p>
  }

  if (!content) {
    return (
      <>
        <p className="ed-hint">Conteúdo ainda não gerado.</p>
        <button onClick={() => rewriteWithAI('block')} disabled={aiLoading} className="ed-ai sm">
          {aiLoading ? 'Gerando…' : '✨ Gerar com IA'}
        </button>
      </>
    )
  }

  const editableFields = getEditableFields(sectionType, content)

  return (
    <>
      {editableFields.map(({ key, label, multiline }) => {
        const value = String(content[key] ?? '')
        return (
          <div key={key} className="ed-field-group">
            <label className="lbl" style={{ margin: 0 }}>{label}</label>
            {multiline ? (
              <textarea
                className="field"
                value={value}
                rows={3}
                style={{ resize: 'vertical' }}
                onChange={e => setContent(prev => ({ ...prev!, [key]: e.target.value }))}
                onBlur={() => save({ ...content })}
              />
            ) : (
              <input
                className="field"
                type="text"
                value={value}
                onChange={e => setContent(prev => ({ ...prev!, [key]: e.target.value }))}
                onBlur={() => save({ ...content })}
              />
            )}
          </div>
        )
      })}

      {saving && <p className="ed-saving">Salvando…</p>}

      <div style={{ display: 'flex', gap: '.5rem', borderTop: '1px solid var(--line)', paddingTop: '.7rem' }}>
        <button onClick={() => rewriteWithAI('block')} disabled={aiLoading} className="ed-ai sm" style={{ flex: 1 }}>
          {aiLoading && aiMode === 'block' ? 'Reescrevendo…' : '✨ Reescrever bloco'}
        </button>
        <button
          onClick={() => rewriteWithAI('page')}
          disabled={aiLoading}
          className="btn glass sm"
          style={{ flex: 1 }}
          title="Regerar a página toda com IA"
        >
          {aiLoading && aiMode === 'page' ? 'Regerando…' : '⟳ Página toda'}
        </button>
      </div>
    </>
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
