'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type Post = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'review' | 'published'
  created_at: string
}

type Props = { siteId: string }

type View = 'list' | 'new' | 'edit'

export default function BlogPanel({ siteId }: Props) {
  const [view, setView] = useState<View>('list')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [siteId])

  async function loadPosts() {
    setLoading(true)
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('id,title,slug,status,created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts((data ?? []) as Post[])
    setLoading(false)
  }

  if (view === 'new' || view === 'edit') {
    return (
      <BlogEditor
        siteId={siteId}
        postId={view === 'edit' ? editingId : null}
        onBack={() => { setView('list'); loadPosts() }}
      />
    )
  }

  return (
    <>
      <div className="ed-ph">
        <h2>Blog</h2>
        <button onClick={() => setView('new')} className="btn sm">+ Novo post</button>
      </div>

      <div className="ed-scroll">
        {loading ? (
          <p className="ed-saving">Carregando posts…</p>
        ) : posts.length === 0 ? (
          <div className="ed-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
            <p className="ed-hint">Nenhum post ainda.<br/>Crie o primeiro artigo do blog.</p>
          </div>
        ) : (
          <div className="ed-list">
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => { setEditingId(post.id); setView('edit') }}
                className="ed-item"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem' }}>
                  <span className="ti">{post.title}</span>
                  <StatusBadge status={post.status} />
                </div>
                <span className="mt">{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function StatusBadge({ status }: { status: Post['status'] }) {
  const cls = status === 'published' ? 'ok' : status === 'review' ? 'warn' : 'muted'
  const labels = { published: 'Publicado', review: 'Revisão', draft: 'Rascunho' }
  return <span className={`badge ${cls}`}>{labels[status]}</span>
}

// ── Editor de post ──────────────────────────────────────────

type EditorProps = {
  siteId: string
  postId: string | null
  onBack: () => void
}

type ClusterType = 'pillar' | 'satellite'

type PostData = {
  title: string
  content: string
  meta_description: string
  status: Post['status']
  cluster_type: ClusterType
}

function BlogEditor({ siteId, postId, onBack }: EditorProps) {
  const [data, setData] = useState<PostData>({ title: '', content: '', meta_description: '', status: 'draft', cluster_type: 'satellite' })
  const [loading, setLoading] = useState(!!postId)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    if (!postId) return
    const supabase = createBrowserClient()
    supabase
      .from('blog_posts')
      .select('title,content,meta_description,status')
      .eq('id', postId)
      .single()
      .then(({ data: d }) => {
        if (d) setData(d as PostData)
        setLoading(false)
      })
  }, [postId])

  async function save() {
    setSaving(true)
    const supabase = createBrowserClient()
    const slug = data.title
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    if (postId) {
      await supabase.from('blog_posts').update({ ...data }).eq('id', postId)
    } else {
      await supabase.from('blog_posts').insert({ ...data, site_id: siteId, slug })
    }
    setSaving(false)
    onBack()
  }

  async function generateWithAI() {
    if (!keyword.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, keyword, cluster_type: data.cluster_type }),
      })
      if (!res.ok) throw new Error('Falha')
      const { title, content, meta_description } = await res.json()
      setData(prev => ({ ...prev, title: title ?? prev.title, content: content ?? prev.content, meta_description: meta_description ?? prev.meta_description }))
    } catch (e) {
      console.error(e)
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return <div className="ed-scroll"><p className="ed-saving">Carregando…</p></div>

  return (
    <>
      <div className="ed-ph">
        <button onClick={onBack} className="ed-icon-btn" title="Voltar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 style={{ flex: 1, textTransform: 'none', letterSpacing: 0, color: '#fff', fontSize: '.9rem' }}>
          {data.title || 'Novo post'}
        </h2>
        <button onClick={save} disabled={saving || !data.title} className="btn sm">
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <div className="ed-scroll">

        {/* Geração IA */}
        <div className="ed-card" style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          <p className="ed-cap" style={{ color: '#bcd8ff' }}>Gerar com IA</p>

          <p className="ed-cap">Tipo de artigo</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
            {([
              { id: 'pillar' as ClusterType,   label: 'Pilar',    desc: 'Tema amplo, hub do cluster' },
              { id: 'satellite' as ClusterType, label: 'Satélite', desc: 'Subtema específico do pilar' },
            ]).map(opt => (
              <button
                key={opt.id}
                onClick={() => setData(d => ({ ...d, cluster_type: opt.id }))}
                className={`ed-opt ${data.cluster_type === opt.id ? 'on' : ''}`}
              >
                <b>{opt.label}</b>
                <span>{opt.desc}</span>
              </button>
            ))}
          </div>
          {data.cluster_type === 'pillar' && (
            <p className="note" style={{ fontSize: '.74rem' }}>
              <i className="ph-duotone ph-info" />
              <span>Artigo pilar deve cobrir o tema amplamente — 1500+ palavras. Cria o hub do cluster.</span>
            </p>
          )}

          <input
            type="text"
            className="field"
            placeholder={data.cluster_type === 'pillar' ? 'Ex: fisioterapia de ombro em SP' : 'Ex: fisioterapia de ombro para nadadores'}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button onClick={generateWithAI} disabled={aiLoading || !keyword.trim()} className="ed-ai">
            {aiLoading ? 'Gerando artigo…' : '✨ Gerar artigo completo'}
          </button>
        </div>

        <div className="ed-field-group">
          <label className="lbl" style={{ margin: 0 }}>Título</label>
          <input type="text" className="field" value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} placeholder="Título do artigo" />
        </div>

        <div className="ed-field-group">
          <label className="lbl" style={{ margin: 0 }}>Meta description</label>
          <textarea className="field" value={data.meta_description} onChange={e => setData(d => ({ ...d, meta_description: e.target.value }))} rows={2} placeholder="120–155 caracteres" style={{ resize: 'none' }} />
        </div>

        <div className="ed-field-group">
          <label className="lbl" style={{ margin: 0 }}>Conteúdo (HTML)</label>
          <textarea className="field" value={data.content} onChange={e => setData(d => ({ ...d, content: e.target.value }))} rows={10} placeholder="Conteúdo do artigo…" style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '.8rem' }} />
        </div>

        <div className="ed-field-group">
          <label className="lbl" style={{ margin: 0 }}>Status</label>
          <select className="field" value={data.status} onChange={e => setData(d => ({ ...d, status: e.target.value as Post['status'] }))}>
            <option value="draft">Rascunho</option>
            <option value="review">Em revisão</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className="note">
          <i className="ph-duotone ph-link" />
          <span>
            Após publicar, toda página precisa de ≥2 links internos apontando pra ela — regra anti-página-órfã.
            {data.cluster_type === 'satellite'
              ? ' Adicione um link deste satélite para o artigo pilar do cluster.'
              : ' Como pilar, vincule todos os satélites do cluster a este artigo.'}
          </span>
        </div>
      </div>
    </>
  )
}
