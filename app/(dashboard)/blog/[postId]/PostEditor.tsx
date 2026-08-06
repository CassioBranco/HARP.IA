'use client'

// Post-editor página cheia. Visual = protótipo post-editor.html.
// Wire real: title/slug/content/meta_description/status (colunas existentes).
// Sem lastro no schema (desabilitados, sem fabricar): capa, categoria, keywords.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { extractKeywords, similarity, injectLinks, norm } from '@/lib/seo/triangulation'
import { buildPostSeoChecks, computeSeoScore, wordCount, type FaqItem } from '@/lib/seo/score'
import FaqEditor from './FaqEditor'
import SnippetPreview from './SnippetPreview'

export type PostEditorData = {
  id: string | null
  title: string
  slug: string
  content: string
  meta_description: string
  /** FAQ estruturada (blog_posts.schema_faq) — acordeão + FAQPage no público */
  faq: FaqItem[]
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

// Sugestões genéricas (não fabricam dados do negócio — guiam o tema).
const IDEA_TEMPLATES = [
  { b: 'Responda uma dúvida comum dos seus clientes', s: 'Informacional · ótimo pra ser citado por IA' },
  { b: 'Compare duas opções que seu cliente avalia', s: 'Comercial · ajuda na decisão' },
  { b: 'Um guia prático do seu serviço, passo a passo', s: 'Informacional · constrói autoridade' },
]

export default function PostEditor({
  siteId,
  tenantId,
  domain,
  initial,
}: {
  siteId: string
  tenantId: string
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

  // outros artigos publicados do site — base das sugestões de link interno
  const [published, setPublished] = useState<{ id: string; slug: string; title: string; meta: string | null }[]>([])

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
      const payload: Record<string, unknown> = {
        title: next.title,
        slug: next.slug || slugify(next.title),
        content: next.content,
        meta_description: next.meta_description,
        schema_faq: next.faq,
        status: next.status,
      }
      // Banco sem a coluna schema_faq (migration pendente) não pode travar o
      // save: se o erro citar a coluna, salva de novo sem ela.
      const withoutFaq = () => {
        const { schema_faq: _drop, ...rest } = payload
        return rest
      }
      try {
        if (postId) {
          let { error } = await supabase.from('blog_posts').update(payload).eq('id', postId)
          if (error && /schema_faq/i.test(error.message)) {
            ({ error } = await supabase.from('blog_posts').update(withoutFaq()).eq('id', postId))
          }
          if (error) throw error
          setSaving(false)
          setDirty(false)
          setSavedAt(true)
          return postId
        } else {
          let { data: ins, error } = await supabase
            .from('blog_posts')
            .insert({ ...payload, site_id: siteId, tenant_id: tenantId })
            .select('id')
            .single()
          if (error && /schema_faq/i.test(error.message)) {
            ({ data: ins, error } = await supabase
              .from('blog_posts')
              .insert({ ...withoutFaq(), site_id: siteId, tenant_id: tenantId })
              .select('id')
              .single())
          }
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
    setErr(null)
    // Human-in-the-Loop: publicação é ação explícita do usuário (este clique).
    // Salva o rascunho atual; a publicação real passa pelo gate AEO no servidor
    // (valida Regras 3/4 e religa os links internos — Regra 7).
    const id = await persist()
    if (!id) { setPublishing(false); return }
    try {
      const res = await fetch('/api/publish/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: id }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        const detail = (json.validation?.errors as { message: string }[] | undefined)?.map(e => e.message).join(' ')
        setErr(detail || json.error || 'Não foi possível publicar agora.')
        setPublishing(false)
        return
      }
      setData(d => ({ ...d, status: 'published' }))
      setPublishing(false)
      router.push('/blog')
    } catch {
      setErr('Falha de conexão ao publicar.')
      setPublishing(false)
    }
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
        // a IA de artigo já devolve a FAQ estruturada — aproveita direto
        faq: Array.isArray(json.schema_faq)
          ? (json.schema_faq as FaqItem[]).map(f => ({ question: String(f?.question ?? ''), answer: String(f?.answer ?? '') }))
          : d.faq,
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

  // ── Gerar FAQ com IA (a partir do conteúdo do próprio artigo) ──
  const [faqGenerating, setFaqGenerating] = useState(false)
  const [faqErr, setFaqErr] = useState<string | null>(null)

  async function generateFaq() {
    setFaqErr(null)
    setFaqGenerating(true)
    // a rota lê o post do banco — garante que o rascunho atual está salvo
    const id = await persist()
    if (!id) { setFaqGenerating(false); setFaqErr('Salve o artigo antes (dê um título).'); return }
    try {
      const res = await fetch('/api/ai/generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: id }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Falha na geração')
      const generated = (json.faq as FaqItem[]).map(f => ({ question: String(f.question ?? ''), answer: String(f.answer ?? '') }))
      // mantém o que o usuário já escreveu; IA completa por baixo
      patch({ faq: [...data.faq.filter(f => f.question.trim() || f.answer.trim()), ...generated] })
    } catch (e) {
      setFaqErr(e instanceof Error ? e.message : 'Não consegui gerar agora. Tente de novo.')
    } finally {
      setFaqGenerating(false)
    }
  }

  // ── Sugestão de links internos (triangulação N5, client-side) ──
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase
      .from('blog_posts')
      .select('id, slug, title, meta_description')
      .eq('site_id', siteId)
      .eq('status', 'published')
      .then(({ data: rows }) => {
        setPublished(
          (rows ?? [])
            .filter(r => r.id !== postId && r.slug && r.title)
            .map(r => ({ id: r.id as string, slug: r.slug as string, title: r.title as string, meta: (r.meta_description as string) ?? null })),
        )
      })
  }, [siteId, postId])

  const hasInternalLink = /\]\(\/blog\/|href="\/blog\//.test(data.content)

  const linkSuggestions = useMemo(() => {
    if (published.length === 0) return []
    const mine = extractKeywords(data.title, data.meta_description || data.content.slice(0, 400))
    return published
      .map(p => ({ ...p, score: similarity(mine, extractKeywords(p.title, p.meta)) }))
      .filter(p => !data.content.includes(`/blog/${p.slug}`)) // já linkado → some
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [published, data.title, data.meta_description, data.content])

  // 1 clique: corpo HTML (gerado pela IA) usa o injectLinks da triangulação —
  // âncora natural na 1ª menção do assunto, ou bloco "Leia também" no fim.
  // Corpo markdown/texto do usuário mantém a inserção na posição do cursor.
  function insertLink(p: { slug: string; title: string; meta: string | null }) {
    const isHtml = /<(p|h2|h3|ul|ol)\b/i.test(data.content)
    if (isHtml) {
      const contentNorm = norm(data.content)
      const keyword = Array.from(extractKeywords(p.title, p.meta))
        .sort((a, b) => b.length - a.length)
        .find(w => contentNorm.includes(w)) ?? null
      const { content } = injectLinks(data.content, [{ slug: p.slug, anchor: p.title, keyword }])
      patch({ content })
      return
    }
    const ta = bodyRef.current
    const md = `[${p.title}](/blog/${p.slug})`
    if (!ta) { patch({ content: `${data.content}\n\n${md}` }); return }
    const { selectionStart: s, value } = ta
    patch({ content: `${value.slice(0, s)}${md}${value.slice(s)}` })
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + md.length, s + md.length) })
  }

  // ── Checklist de SEO (núcleo compartilhado em lib/seo/score) ──
  const checks = buildPostSeoChecks({
    title: data.title,
    metaDescription: data.meta_description,
    content: data.content,
    faq: data.faq,
    hasLinkTargets: published.length > 0,
    hasInternalLink,
  })
  const { score, label: scoreLabel } = computeSeoScore(checks)

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
        {/* coluna do documento (artigo + FAQ estruturada) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', minWidth: 0 }}>
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

        {/* FAQ estruturada — acordeão + FAQPage schema no artigo publicado */}
        <FaqEditor
          faq={data.faq}
          onChange={faq => patch({ faq })}
          onGenerate={() => { void generateFaq() }}
          generating={faqGenerating}
          canGenerate={wordCount(data.content) >= 50}
          genErr={faqErr}
        />
        </div>

        {/* sidebar — ordem = fluxo do trabalho: escrever, otimizar, publicar.
            Fica sticky (.post-side) pra o feedback de SEO acompanhar a escrita. */}
        <div className="post-side">
          {/* 1 · ESCREVER — ponto de partida do artigo */}
          <div className="glass side-card gen-card">
            <div className="gh"><span className="ic"><i className="ph-fill ph-sparkle ai-spark" /></span><b>Escrever com IA</b></div>
            <p>A IA usa o seu conhecimento de especialista pra escrever o artigo, já otimizado.</p>
            <button className="btn" type="button" onClick={() => { setAiErr(null); setAiOpen(true) }}>
              <i className="ph-fill ph-sparkle" /> Gerar artigo
            </button>
          </div>

          {/* 2 · OTIMIZAR — força de SEO ao vivo, reage ao que você digita */}
          <div className="glass side-card">
            <div className="seoscore"><span style={{ color: 'var(--ink)' }}>Força de SEO</span><span>{scoreLabel}</span></div>
            <div className="seobar"><i style={{ width: `${score}%` }} /></div>
            <div className="seochk">
              {checks.map((c, i) => (
                <div className={`ck ${c.ok ? '' : 'todo'}`} key={i}>
                  <i className={c.ok ? 'ph-fill ph-check-circle' : 'ph-fill ph-circle'} /> {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* 2b · OTIMIZAR — links internos sugeridos (some quando não há) */}
          {linkSuggestions.length > 0 && (
            <div className="glass side-card">
              <h3><i className="ph-duotone ph-link" /> Links internos sugeridos</h3>
              <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: '0 0 .6rem' }}>
                Linkar artigos entre si ajuda o Google a entender seu site. Sugestões por afinidade de tema:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                {linkSuggestions.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className="btn ghost sm"
                    style={{ justifyContent: 'space-between', textAlign: 'left', gap: '.6rem' }}
                    title={`Inserir link pra “${p.title}” na posição do cursor`}
                    onClick={() => insertLink(p)}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                    <i className="ph-fill ph-plus-circle" style={{ flex: 'none' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3 · PUBLICAR — resumo do Google (o que ainda vem fica num rodapé honesto) */}
          <div className="glass side-card">
            <h3><i className="ph-duotone ph-gear-six" /> Publicação</h3>
            <div>
              <label className="lbl">Resumo (meta description)</label>
              <textarea
                className="field"
                style={{ minHeight: 64, resize: 'none' }}
                placeholder="Resumo que aparece no Google…"
                value={data.meta_description}
                onChange={e => patch({ meta_description: e.target.value })}
              />
            </div>
            <p className="soon-note">
              <i className="ph-duotone ph-clock-countdown" /> Categoria e palavras-chave por artigo chegam em breve.
            </p>
          </div>
        </div>
      </div>

      {err && <p className="err-msg" style={{ marginTop: '1rem' }}>{err}</p>}

      {/* modal gerar com IA */}
      <div className={`ai-modal ${aiOpen ? 'show' : ''}`} onClick={e => { if (e.target === e.currentTarget && !aiGenerating) setAiOpen(false) }}>
        <div className="glass ai-box">
          {!aiGenerating ? (
            <div>
              <h2><i className="ph-fill ph-sparkle ai-spark" /> Gerar artigo com IA</h2>
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
