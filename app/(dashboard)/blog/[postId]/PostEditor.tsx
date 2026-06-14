'use client'

// Post-editor página cheia. Visual = protótipo post-editor.html.
// Wire real: title/slug/content/meta_description/status (colunas existentes).
// Sem lastro no schema (desabilitados, sem fabricar): capa, categoria, keywords.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

export type PostEditorData = {
  id: string | null
  title: string
  slug: string
  content: string
  meta_description: string
  status: 'draft' | 'review' | 'published'
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
}

// Sugestões genéricas (não fabricam dados do negócio — guiam o tema).
const IDEA_TEMPLATES = [
  { b: 'Responda uma dúvida comum dos seus clientes', s: 'Informacional · ótimo pra ser citado por IA' },
  { b: 'Compare duas opções que seu cliente avalia', s: 'Comercial · ajuda na decisão' },
  { b: 'Um guia prático do seu serviço, passo a passo', s: 'Informacional · constrói autoridade' },
]

export default function PostEditor({
  siteId,
  domain,
  initial,
}: {
  siteId: string
  domain: string
  initial: PostEditorData
}) {
  const router = useRouter()
  const [data, setData] = useState<PostEditorData>(initial)
  const [postId, setPostId] = useState<string | null>(initial.id)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<boolean>(!!initial.id)
  const [publishing, setPublishing] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // modal IA
  const [aiOpen, setAiOpen] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiTheme, setAiTheme] = useState('')
  const [aiErr, setAiErr] = useState<string | null>(null)

  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const slug = useMemo(() => data.slug || slugify(data.title) || 'novo-artigo', [data.slug, data.title])

  function patch(p: Partial<PostEditorData>) {
    setData(d => ({ ...d, ...p }))
    setDirty(true)
    setSavedAt(false)
  }

  // ── Persistência (só colunas existentes) ──────────────────
  const persist = useCallback(
    async (override?: Partial<PostEditorData>): Promise<string | null> => {
      const next = { ...data, ...override }
      if (!next.title.trim()) return postId // não salva sem título
      setSaving(true)
      setErr(null)
      const supabase = createBrowserClient()
      const payload = {
        title: next.title,
        slug: next.slug || slugify(next.title),
        content: next.content,
        meta_description: next.meta_description,
        status: next.status,
      }
      try {
        if (postId) {
          const { error } = await supabase.from('blog_posts').update(payload).eq('id', postId)
          if (error) throw error
          setSaving(false)
          setDirty(false)
          setSavedAt(true)
          return postId
        } else {
          const { data: ins, error } = await supabase
            .from('blog_posts')
            .insert({ ...payload, site_id: siteId })
            .select('id')
            .single()
          if (error) throw error
          const newId = ins!.id as string
          setPostId(newId)
          setSaving(false)
          setDirty(false)
          setSavedAt(true)
          // troca a URL pra refletir o id real, sem recarregar
          window.history.replaceState(null, '', `/blog/${newId}`)
          return newId
        }
      } catch (e) {
        setSaving(false)
        setErr(e instanceof Error ? e.message : 'Falha ao salvar')
        return null
      }
    },
    [data, postId, siteId],
  )

  // Autosave debounced (1.4s) quando há título e está sujo
  useEffect(() => {
    if (!dirty || !data.title.trim()) return
    const t = setTimeout(() => { void persist() }, 1400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dirty])

  async function publish() {
    if (!data.title.trim()) { setErr('Dê um título antes de publicar.'); return }
    setPublishing(true)
    // Human-in-the-Loop: publicação é ação explícita do usuário (este clique).
    const updated = { ...data, status: 'published' as const }
    setData(updated)
    const supabase = createBrowserClient()
    const id = await persist({ status: 'published' })
    if (id) {
      await supabase.from('blog_posts').update({ published_at: new Date().toISOString() }).eq('id', id)
    }
    setPublishing(false)
    if (id) router.push('/blog')
  }

  // ── Toolbar de formatação (markdown leve na seleção) ──────
  function wrapSelection(before: string, after = before) {
    const ta = bodyRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const sel = value.slice(s, e) || 'texto'
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    patch({ content: next })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(s + before.length, s + before.length + sel.length)
    })
  }
  function prefixLine(prefix: string) {
    const ta = bodyRef.current
    if (!ta) return
    const { selectionStart: s, value } = ta
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    patch({ content: next })
    requestAnimationFrame(() => ta.focus())
  }

  // ── Gerar com IA ──────────────────────────────────────────
  async function generate(theme: string) {
    const keyword = theme.trim()
    if (!keyword) return
    setAiGenerating(true)
    setAiErr(null)
    try {
      const res = await fetch('/api/ai/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, keyword }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Falha na geração')
      setData(d => ({
        ...d,
        title: json.title ?? d.title,
        slug: slugify(json.title ?? d.title),
        content: json.content ?? d.content,
        meta_description: json.meta_description ?? d.meta_description,
        status: 'review',
      }))
      setDirty(true)
      setSavedAt(false)
      setAiOpen(false)
      setAiGenerating(false)
      setAiTheme('')
    } catch (e) {
      setAiGenerating(false)
      setAiErr(e instanceof Error ? e.message : 'Não consegui gerar agora. Tente de novo.')
    }
  }

  // ── Checklist de SEO (calculado de verdade) ──────────────
  const words = wordCount(data.content)
  const titleHasKeyword = data.title.trim().length >= 8
  const checks = [
    { ok: titleHasKeyword, label: 'Título preenchido' },
    { ok: data.meta_description.trim().length >= 80, label: 'Resumo (meta) com 80+ caracteres' },
    { ok: words >= 600, label: `Texto com 600+ palavras (${words})` },
    { ok: /(<h2|^##\s|\n##\s)/i.test(data.content), label: 'Pelo menos 1 subtítulo (H2)' },
    { ok: /faq|pergunt/i.test(data.content), label: 'Bloco de FAQ' },
  ]
  const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 100)
  const scoreLabel = score >= 80 ? 'Bom' : score >= 50 ? 'Regular' : 'Fraco'

  return (
    <>
      {/* topo */}
      <div className="editor-top">
        <Link className="back" href="/blog"><i className="ph-duotone ph-arrow-left" /> Voltar ao blog</Link>
        <div className="right">
          <span className={`save-state ${dirty ? 'dirty' : ''}`}>
            <span className="dot" />
            {saving ? 'Salvando…' : dirty ? 'Alterações não salvas' : savedAt ? 'Rascunho salvo' : 'Novo rascunho'}
          </span>
          <button className="btn ghost" type="button" onClick={() => router.push('/blog')}>
            <i className="ph-fill ph-eye" /> Pré-visualizar
          </button>
          <button className="btn lg" type="button" onClick={publish} disabled={publishing}>
            <i className="ph-fill ph-rocket-launch" /> {publishing ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="post-grid">
        {/* documento */}
        <article className="glass doc">
          <div className="cover">
            <button className="cover-btn" type="button" disabled title="Capa por artigo ainda não disponível">
              <i className="ph-fill ph-image" /> Imagem de capa (em breve)
            </button>
          </div>
          <div className="doc-body">
            <input
              className="t-input"
              placeholder="Título do artigo…"
              value={data.title}
              onChange={e => patch({ title: e.target.value, slug: slugify(e.target.value) })}
            />
            <div className="slug">
              <i className="ph-duotone ph-link" /> {domain}/blog/<b>{slug}</b>
            </div>
            <div className="toolbar-mini">
              <button type="button" title="Negrito" onClick={() => wrapSelection('**')}><i className="ph-fill ph-text-b" /></button>
              <button type="button" title="Itálico" onClick={() => wrapSelection('*')}><i className="ph-fill ph-text-italic" /></button>
              <span className="sep" />
              <button type="button" title="Subtítulo" onClick={() => prefixLine('## ')}><i className="ph-fill ph-text-h-two" /></button>
              <button type="button" title="Lista" onClick={() => prefixLine('- ')}><i className="ph-fill ph-list-bullets" /></button>
              <button type="button" title="Citação" onClick={() => prefixLine('> ')}><i className="ph-fill ph-quotes" /></button>
              <span className="sep" />
              <button type="button" title="Link" onClick={() => wrapSelection('[', '](url)')}><i className="ph-fill ph-link-simple" /></button>
            </div>
            <textarea
              ref={bodyRef}
              className="body-input"
              placeholder="Comece a escrever ou gere o artigo com a IA…"
              value={data.content}
              onChange={e => patch({ content: e.target.value })}
            />
          </div>
        </article>

        {/* sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div className="glass side-card gen-card">
            <div className="gh"><span className="ic"><i className="ph-fill ph-magic-wand" /></span><b>Escrever com IA</b></div>
            <p>A IA usa o seu conhecimento de especialista pra escrever o artigo, já otimizado.</p>
            <button className="btn" type="button" onClick={() => { setAiErr(null); setAiOpen(true) }}>
              <i className="ph-fill ph-sparkle" /> Gerar artigo
            </button>
          </div>

          <div className="glass side-card">
            <h3><i className="ph-duotone ph-gear-six" /> Publicação</h3>
            <div className="row-gap">
              <label className="lbl">Categoria <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>· em breve</span></label>
              <select className="field is-disabled" disabled defaultValue="">
                <option value="">Ainda não disponível</option>
              </select>
            </div>
            <div className="row-gap">
              <label className="lbl">Resumo (meta description)</label>
              <textarea
                className="field"
                style={{ minHeight: 64, resize: 'none' }}
                placeholder="Resumo que aparece no Google…"
                value={data.meta_description}
                onChange={e => patch({ meta_description: e.target.value })}
              />
            </div>
            <div>
              <label className="lbl">Palavras-chave <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>· em breve</span></label>
              <div className="tags"><span className="tag" style={{ opacity: 0.6 }}>edição por artigo em breve</span></div>
            </div>
          </div>

          <div className="glass side-card">
            <div className="seoscore"><span style={{ color: '#cfe0f5' }}>Força de SEO</span><span>{scoreLabel}</span></div>
            <div className="seobar"><i style={{ width: `${score}%` }} /></div>
            <div className="seochk">
              {checks.map((c, i) => (
                <div className={`ck ${c.ok ? '' : 'todo'}`} key={i}>
                  <i className={c.ok ? 'ph-fill ph-check-circle' : 'ph-fill ph-circle'} /> {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {err && <p className="err-msg" style={{ marginTop: '1rem' }}>{err}</p>}

      {/* modal gerar com IA */}
      <div className={`ai-modal ${aiOpen ? 'show' : ''}`} onClick={e => { if (e.target === e.currentTarget && !aiGenerating) setAiOpen(false) }}>
        <div className="glass ai-box">
          {!aiGenerating ? (
            <div>
              <h2><i className="ph-fill ph-magic-wand" /> Gerar artigo com IA</h2>
              <p className="sub">Escolha um caminho ou escreva o seu tema.</p>
              {IDEA_TEMPLATES.map((idea, i) => (
                <button className="idea" type="button" key={i} onClick={() => document.getElementById('aiTheme')?.focus()}>
                  <i className="ph-fill ph-lightbulb" />
                  <div><b>{idea.b}</b><span>{idea.s}</span></div>
                </button>
              ))}
              <div className="own">
                <input
                  id="aiTheme"
                  className="field"
                  placeholder="Escreva seu tema (ex: como escolher…)"
                  value={aiTheme}
                  onChange={e => setAiTheme(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') generate(aiTheme) }}
                />
                <button className="btn" type="button" onClick={() => generate(aiTheme)} disabled={!aiTheme.trim()}>
                  <i className="ph-fill ph-arrow-right" />
                </button>
              </div>
              {aiErr && <div className="ai-err">{aiErr}</div>}
              <div className="actions">
                <button className="btn ghost" type="button" onClick={() => setAiOpen(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="gen-loading show">
              <div className="spinner" />
              <h2 style={{ justifyContent: 'center' }}><i className="ph-fill ph-sparkle" /> Escrevendo seu artigo…</h2>
              <p className="sub" style={{ textAlign: 'center' }}>Usando o seu conhecimento de especialista e otimizando pra busca.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
