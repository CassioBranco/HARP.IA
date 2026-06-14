'use client'

// Lista de artigos do blog — filtros + busca (client). Visual = protótipo blog.html.
import { useMemo, useState } from 'react'
import Link from 'next/link'

export type BlogPostRow = {
  id: string
  title: string
  status: string // draft | review | published
  intent: string | null
  created_at: string
  published_at: string | null
  ai: boolean
}

type Filter = 'todos' | 'publicados' | 'rascunhos' | 'ia'

const INTENT_LABEL: Record<string, string> = {
  informacional: 'Informacional',
  comercial: 'Comercial',
  transacional: 'Transacional',
  navegacional: 'Navegacional',
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export default function BlogList({ posts }: { posts: BlogPostRow[] }) {
  const [filter, setFilter] = useState<Filter>('todos')
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    return posts.filter(p => {
      if (filter === 'publicados' && p.status !== 'published') return false
      if (filter === 'rascunhos' && p.status === 'published') return false
      if (filter === 'ia' && !p.ai) return false
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [posts, filter, q])

  const chips: { id: Filter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'publicados', label: 'Publicados' },
    { id: 'rascunhos', label: 'Rascunhos' },
    { id: 'ia', label: 'Gerados por IA' },
  ]

  return (
    <>
      <div className="toolbar">
        <div className="filters">
          {chips.map(c => (
            <span
              key={c.id}
              className={`chip-f ${filter === c.id ? 'on' : ''}`}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </span>
          ))}
        </div>
        <input
          className="field"
          style={{ maxWidth: 240 }}
          placeholder="Buscar artigo…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {shown.length === 0 ? (
        <div className="glass empty">
          <i className="ph-duotone ph-article" />
          {posts.length === 0
            ? 'Nenhum artigo ainda. Gere o primeiro com a IA.'
            : 'Nenhum artigo encontrado com esse filtro.'}
        </div>
      ) : (
        <div className="posts">
          {shown.map(p => {
            const published = p.status === 'published'
            const cat = p.intent ? INTENT_LABEL[p.intent] ?? p.intent : 'Artigo'
            const when = published
              ? `Publicado ${fmtDate(p.published_at ?? p.created_at)}`
              : p.ai
                ? 'Rascunho da IA'
                : 'Rascunho'
            return (
              <article className="glass post" key={p.id}>
                <div className="thumb" />
                <div className="ti">
                  <b>{p.title}</b>
                  <div className="meta">
                    <span className="cat">{cat}</span>
                    <span>·</span>
                    <span>{when}</span>
                  </div>
                </div>
                <div className="acts">
                  {published ? (
                    <span className="badge ok"><i className="ph-fill ph-check-circle" /> No ar</span>
                  ) : p.ai ? (
                    <span className="badge warn"><i className="ph-fill ph-sparkle" /> IA</span>
                  ) : (
                    <span className="badge muted"><i className="ph-fill ph-pencil" /> Rascunho</span>
                  )}
                  <Link className="ib" href={`/blog/${p.id}`} title="Editar"><i className="ph-fill ph-pencil-simple" /></Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
