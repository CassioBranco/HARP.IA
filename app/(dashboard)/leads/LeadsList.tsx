'use client'

// Lista de leads capturados — filtros por status + ações
// (mesmo padrão visual do AgendamentosList: chips, cards .glass, badges).
// O dono contata o lead por fora (e-mail/WhatsApp) e marca o status aqui.
import { useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'discarded'

export type LeadRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  interest: string | null
  source: string | null // path da página onde o lead foi deixado
  status: LeadStatus
  created_at: string
}

type Filter = 'todos' | 'novos' | 'convertidos' | 'descartados'

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Em contato',
  converted: 'Convertido',
  discarded: 'Descartado',
}

function fmtWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function LeadsList({ leads }: { leads: LeadRow[] }) {
  const [filter, setFilter] = useState<Filter>('todos')
  const [rows, setRows] = useState(leads)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function setStatus(id: string, status: LeadStatus) {
    setSavingId(id)
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setRows(rs => rs.map(r => (r.id === id ? { ...r, status } : r)))
    setSavingId(null)
  }

  const shown = useMemo(() => {
    return rows.filter(r => {
      if (filter === 'novos') return r.status === 'new' || r.status === 'contacted'
      if (filter === 'convertidos') return r.status === 'converted'
      if (filter === 'descartados') return r.status === 'discarded'
      return true
    })
  }, [rows, filter])

  const chips: { id: Filter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'novos', label: 'Novos' },
    { id: 'convertidos', label: 'Convertidos' },
    { id: 'descartados', label: 'Descartados' },
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
      </div>

      {shown.length === 0 ? (
        <div className="glass empty">
          <i className="ph-duotone ph-envelope-simple" />
          {rows.length === 0
            ? 'Nenhum lead ainda. Quando um visitante deixar contato pelo site, ele aparece aqui.'
            : 'Nenhum lead com esse filtro.'}
        </div>
      ) : (
        <div className="posts">
          {shown.map(r => (
            <article className="glass post" key={r.id} style={{ alignItems: 'flex-start' }}>
              <div className="ti">
                <b>{r.name}</b>
                <div className="meta">
                  <span className="cat">{fmtWhen(r.created_at)}</span>
                  {r.interest && <><span>·</span><span>{r.interest}</span></>}
                  {r.email && (
                    <>
                      <span>·</span>
                      <a href={`mailto:${r.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                        {r.email}
                      </a>
                    </>
                  )}
                  {r.phone && (
                    <>
                      <span>·</span>
                      <a
                        href={`https://wa.me/${r.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        WhatsApp {r.phone}
                      </a>
                    </>
                  )}
                </div>
                {r.source && (
                  <p style={{ margin: '.35rem 0 0', fontSize: '.78rem', color: 'var(--muted)' }}>
                    veio da página {r.source}
                  </p>
                )}
              </div>
              <div className="acts" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '.4rem' }}>
                {r.status === 'converted' ? (
                  <span className="badge ok"><i className="ph-fill ph-check-circle" /> Convertido</span>
                ) : r.status === 'discarded' ? (
                  <span className="badge muted"><i className="ph-fill ph-x-circle" /> Descartado</span>
                ) : r.status === 'contacted' ? (
                  <span className="badge warn"><i className="ph-fill ph-chat-circle" /> Em contato</span>
                ) : (
                  <span className="badge warn"><i className="ph-fill ph-sparkle" /> Novo</span>
                )}
                <select
                  className="field"
                  style={{ fontSize: '.72rem', padding: '.3rem .5rem' }}
                  value={r.status}
                  disabled={savingId === r.id}
                  onChange={e => setStatus(r.id, e.target.value as LeadStatus)}
                  aria-label={`Status do lead ${r.name}`}
                >
                  {(Object.keys(STATUS_LABEL) as LeadStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
