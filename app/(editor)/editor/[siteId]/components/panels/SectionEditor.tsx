'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { EVT_INLINE_CONTENT, EVT_PANEL_SAVED } from '@/lib/editor/inline-edit'

type Props = {
  siteId: string
  sectionType: string
  niche: string
  onSaved: () => void
}

type SectionContent = Record<string, unknown>

type FaqItem = { question: string; answer: string }

type ServiceItem = { name: string; description: string; icon?: string }

export default function SectionEditor({ siteId, sectionType, niche, onSaved }: Props) {
  const [content, setContent] = useState<SectionContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMode, setAiMode] = useState<'block' | 'page' | null>(null)
  const [pageId, setPageId] = useState<string | null>(null)
  // Geração de descrição por item (serviços/produtos): índice em andamento e índice com erro
  const [genIdx, setGenIdx] = useState<number | null>(null)
  const [genErrIdx, setGenErrIdx] = useState<number | null>(null)

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

      // .limit(1) em vez de .single(): a seção pode ter sido duplicada no
      // editor visual (linhas do mesmo tipo compartilham o conteúdo).
      const { data: sectionRows } = await supabase
        .from('sections')
        .select('content')
        .eq('page_id', page.id)
        .eq('section_type', sectionType)
        .order('order_index')
        .limit(1)

      const section = sectionRows?.[0]
      if (section?.content) setContent(section.content as SectionContent)
      setLoading(false)
    }
    load()
  }, [siteId, sectionType])

  // Edição inline no preview → espelha aqui (aba Textos) sem reload.
  useEffect(() => {
    const onInline = (e: Event) => {
      const d = (e as CustomEvent).detail as { sectionType?: string; content?: SectionContent } | null
      if (d?.sectionType === sectionType && d.content) setContent(d.content)
    }
    window.addEventListener(EVT_INLINE_CONTENT, onInline)
    return () => window.removeEventListener(EVT_INLINE_CONTENT, onInline)
  }, [sectionType])

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
    // avisa a ponte de edição: o preview espelha o texto novo sem reload
    window.dispatchEvent(new CustomEvent(EVT_PANEL_SAVED, { detail: { sectionType, content: updated } }))
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
          {aiLoading ? 'Gerando…' : <><i className="ph-fill ph-sparkle ai-spark" /> Gerar com IA</>}
        </button>
      </>
    )
  }

  const editableFields = getEditableFields(sectionType, content)

  // ── FAQ: lista de pergunta/resposta editável ──
  // Essas perguntas aparecem na seção de FAQ do site E no widget de chat
  // flutuante (balão no canto inferior direito do site publicado).
  const isFaq = sectionType === 'faq'
  const faqItems: FaqItem[] = isFaq && Array.isArray(content.items)
    ? (content.items as FaqItem[])
    : []

  function setFaqField(idx: number, key: keyof FaqItem, value: string) {
    setContent(prev => {
      const items = Array.isArray(prev?.items) ? [...(prev!.items as FaqItem[])] : []
      items[idx] = { ...items[idx]!, [key]: value }
      return { ...prev!, items }
    })
  }

  function addFaq() {
    const next = { ...content!, items: [...faqItems, { question: '', answer: '' }] }
    setContent(next)
    void save(next)
  }

  function removeFaq(idx: number) {
    const next = { ...content!, items: faqItems.filter((_, i) => i !== idx) }
    setContent(next)
    void save(next)
  }

  // ── Serviços/produtos: lista de itens editável, com "Gerar com IA" por descrição ──
  const isServices = sectionType === 'services'
  const svcItems: ServiceItem[] = isServices && Array.isArray(content.items)
    ? (content.items as ServiceItem[])
    : []

  function setSvcField(idx: number, key: 'name' | 'description', value: string) {
    setContent(prev => {
      const items = Array.isArray(prev?.items) ? [...(prev!.items as ServiceItem[])] : []
      items[idx] = { ...items[idx]!, [key]: value }
      return { ...prev!, items }
    })
  }

  function addSvc() {
    const next = { ...content!, items: [...svcItems, { name: '', description: '' }] }
    setContent(next)
    void save(next)
  }

  function removeSvc(idx: number) {
    const next = { ...content!, items: svcItems.filter((_, i) => i !== idx) }
    setContent(next)
    void save(next)
  }

  // Gera a descrição de UM item a partir do nome + palavras-chave já digitadas
  // no campo. Botão fica desabilitado enquanto gera (proteção contra clique
  // repetido) e mostra "Erro, tente de novo" em falha, sem quebrar o editor.
  async function generateDescription(idx: number) {
    if (genIdx !== null) return
    const item = svcItems[idx]
    if (!item) return
    setGenErrIdx(null)
    setGenIdx(idx)
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          name: item.name ?? '',
          keywords: item.description ?? '',
        }),
      })
      if (!res.ok) throw new Error('Falha na IA')
      const { description } = await res.json() as { description?: string }
      if (!description) throw new Error('Resposta vazia')
      const items = [...svcItems]
      items[idx] = { ...items[idx]!, description }
      const next = { ...content!, items }
      setContent(next)
      await save(next)
    } catch (e) {
      console.error(e)
      setGenErrIdx(idx)
    } finally {
      setGenIdx(null)
    }
  }

  return (
    <>
      {isFaq && (
        <>
          <p className="ed-hint" style={{ marginTop: 0 }}>
            As perguntas aparecem na seção de FAQ e no balão de chat flutuante do site.
          </p>
          {faqItems.map((item, i) => (
            <div
              key={i}
              style={{
                border: '1px solid var(--line)', borderRadius: 10,
                padding: '.6rem .65rem', marginBottom: '.6rem',
                display: 'flex', flexDirection: 'column', gap: '.45rem',
              }}
            >
              <div className="ed-field-group">
                <label className="lbl" style={{ margin: 0 }}>Pergunta {i + 1}</label>
                <input
                  className="field"
                  type="text"
                  value={item.question ?? ''}
                  placeholder="Ex.: Quais são as formas de pagamento?"
                  onChange={e => setFaqField(i, 'question', e.target.value)}
                  onBlur={() => save({ ...content })}
                />
              </div>
              <div className="ed-field-group">
                <label className="lbl" style={{ margin: 0 }}>Resposta</label>
                <textarea
                  className="field"
                  value={item.answer ?? ''}
                  rows={3}
                  style={{ resize: 'vertical' }}
                  placeholder="Responda de forma direta e completa."
                  onChange={e => setFaqField(i, 'answer', e.target.value)}
                  onBlur={() => save({ ...content })}
                />
              </div>
              <button
                onClick={() => removeFaq(i)}
                style={{
                  alignSelf: 'flex-end', background: 'none', cursor: 'pointer',
                  border: '1px solid var(--line)', borderRadius: 8,
                  padding: '.25rem .6rem', fontSize: '.72rem', color: 'var(--muted)',
                }}
              >
                Remover
              </button>
            </div>
          ))}
          <button
            onClick={addFaq}
            disabled={saving}
            style={{
              width: '100%', background: 'none', cursor: 'pointer',
              border: '1px dashed var(--line)', borderRadius: 10,
              padding: '.55rem', fontSize: '.78rem', color: 'var(--muted)',
              marginBottom: '.7rem',
            }}
          >
            + Adicionar pergunta
          </button>
        </>
      )}

      {isServices && (
        <>
          <p className="ed-hint" style={{ marginTop: 0 }}>
            Itens da seção de serviços/produtos do site. Digite algumas
            palavras-chave na descrição (ou só o nome) e use "Gerar com IA".
          </p>
          {svcItems.map((item, i) => (
            <div
              key={i}
              style={{
                border: '1px solid var(--line)', borderRadius: 10,
                padding: '.6rem .65rem', marginBottom: '.6rem',
                display: 'flex', flexDirection: 'column', gap: '.45rem',
              }}
            >
              <div className="ed-field-group">
                <label className="lbl" style={{ margin: 0 }}>Nome {i + 1}</label>
                <input
                  className="field"
                  type="text"
                  value={item.name ?? ''}
                  placeholder="Ex.: Limpeza de pele profunda"
                  onChange={e => setSvcField(i, 'name', e.target.value)}
                  onBlur={() => save({ ...content })}
                />
              </div>
              <div className="ed-field-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                  <label className="lbl" style={{ margin: 0 }}>Descrição</label>
                  <button
                    onClick={() => generateDescription(i)}
                    disabled={genIdx !== null || (!(item.name ?? '').trim() && !(item.description ?? '').trim())}
                    className="ed-ai sm"
                    style={{ width: 'auto', padding: '.3rem .55rem' }}
                    title="Gera a descrição a partir do nome e das palavras-chave do campo. Você pode editar depois."
                  >
                    {genIdx === i
                      ? 'Gerando…'
                      : genErrIdx === i
                        ? 'Erro, tente de novo'
                        : <><i className="ph-fill ph-sparkle ai-spark" /> Gerar com IA</>}
                  </button>
                </div>
                <textarea
                  className="field"
                  value={item.description ?? ''}
                  rows={3}
                  style={{ resize: 'vertical' }}
                  placeholder="Escreva a descrição ou digite palavras-chave e clique em Gerar com IA."
                  onChange={e => setSvcField(i, 'description', e.target.value)}
                  onBlur={() => save({ ...content })}
                />
              </div>
              <button
                onClick={() => removeSvc(i)}
                style={{
                  alignSelf: 'flex-end', background: 'none', cursor: 'pointer',
                  border: '1px solid var(--line)', borderRadius: 8,
                  padding: '.25rem .6rem', fontSize: '.72rem', color: 'var(--muted)',
                }}
              >
                Remover
              </button>
            </div>
          ))}
          <button
            onClick={addSvc}
            disabled={saving}
            style={{
              width: '100%', background: 'none', cursor: 'pointer',
              border: '1px dashed var(--line)', borderRadius: 10,
              padding: '.55rem', fontSize: '.78rem', color: 'var(--muted)',
              marginBottom: '.7rem',
            }}
          >
            + Adicionar item
          </button>
        </>
      )}

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
          {aiLoading && aiMode === 'block' ? 'Reescrevendo…' : <><i className="ph-fill ph-sparkle ai-spark" /> Reescrever bloco</>}
        </button>
        <button
          onClick={() => rewriteWithAI('page')}
          disabled={aiLoading}
          className="btn glass sm"
          style={{ flex: 1 }}
          title="Regerar a página toda com IA"
        >
          {aiLoading && aiMode === 'page' ? 'Regerando…' : <><i className="ph-fill ph-sparkle ai-spark" /> Página toda</>}
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
