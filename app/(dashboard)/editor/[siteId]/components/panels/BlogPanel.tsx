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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Blog</p>
        <button
          onClick={() => setView('new')}
          className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo post
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <p className="text-center text-[11px] text-muted-foreground py-8">Carregando posts...</p>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
            <p className="text-[11px] text-muted-foreground text-center">Nenhum post ainda.<br/>Crie o primeiro artigo do blog.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => { setEditingId(post.id); setView('edit') }}
                className="flex flex-col gap-1 rounded-xl border border-border p-3 text-left hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{post.title}</p>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Post['status'] }) {
  const map = {
    published: 'bg-green-100 text-green-700',
    review: 'bg-yellow-100 text-yellow-700',
    draft: 'bg-muted text-muted-foreground',
  }
  const labels = { published: 'Publicado', review: 'Revisão', draft: 'Rascunho' }
  return (
    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

// ── Editor de post ─────────────────────────────────────────────────

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

  if (loading) return <div className="flex-1 flex items-center justify-center text-[11px] text-muted-foreground">Carregando...</div>

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <p className="text-xs font-bold text-foreground flex-1 truncate">{data.title || 'Novo post'}</p>
        <button
          onClick={save}
          disabled={saving || !data.title}
          className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">

        {/* Geração IA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-primary">Gerar com IA</p>

          {/* Tipo de cluster */}
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de artigo</p>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { id: 'pillar' as ClusterType,   label: 'Pilar',    desc: 'Tema amplo, hub do cluster' },
                { id: 'satellite' as ClusterType, label: 'Satélite', desc: 'Subtema específico do pilar' },
              ] as { id: ClusterType; label: string; desc: string }[]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setData(d => ({ ...d, cluster_type: opt.id }))}
                  className={`flex flex-col rounded-lg border-2 px-2 py-1.5 text-left transition-all ${
                    data.cluster_type === opt.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-[11px] font-bold text-foreground">{opt.label}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
            {data.cluster_type === 'pillar' && (
              <p className="text-[9px] text-orange-600 bg-orange-50 rounded px-2 py-1 leading-tight">
                Artigo pilar deve cobrir o tema amplamente — 1500+ palavras. Cria o hub do cluster.
              </p>
            )}
          </div>

          <input
            type="text"
            placeholder={data.cluster_type === 'pillar' ? 'Ex: fisioterapia de ombro em SP' : 'Ex: fisioterapia de ombro para nadadores'}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] outline-none focus:border-primary"
          />
          <button
            onClick={generateWithAI}
            disabled={aiLoading || !keyword.trim()}
            className="w-full rounded-lg bg-primary py-2 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {aiLoading ? 'Gerando artigo...' : '✨ Gerar artigo completo'}
          </button>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Título</label>
          <input
            type="text"
            value={data.title}
            onChange={e => setData(d => ({ ...d, title: e.target.value }))}
            placeholder="Título do artigo"
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Meta description</label>
          <textarea
            value={data.meta_description}
            onChange={e => setData(d => ({ ...d, meta_description: e.target.value }))}
            rows={2}
            placeholder="120–155 caracteres"
            className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conteúdo (HTML)</label>
          <textarea
            value={data.content}
            onChange={e => setData(d => ({ ...d, content: e.target.value }))}
            rows={10}
            placeholder="Conteúdo do artigo..."
            className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-[11px] font-mono outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
          <select
            value={data.status}
            onChange={e => setData(d => ({ ...d, status: e.target.value as Post['status'] }))}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[12px] outline-none focus:border-primary"
          >
            <option value="draft">Rascunho</option>
            <option value="review">Em revisão</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        {/* Dica de links internos */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Links internos
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Após publicar, toda página precisa de ≥2 links internos apontando pra ela — regra anti-página-órfã do HARPIA.
            {data.cluster_type === 'satellite'
              ? ' Adicione um link deste satélite para o artigo pilar do cluster.'
              : ' Como artigo pilar, vincule todos os satélites do cluster a este artigo.'}
          </p>
        </div>
      </div>
    </div>
  )
}
