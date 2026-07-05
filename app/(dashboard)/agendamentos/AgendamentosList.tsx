'use client'

// Lista de solicitações de agendamento — filtros por status + ações
// (padrão visual do BlogList: chips, cards .glass, badges).
// O dono confirma o horário por fora (WhatsApp) e marca o status aqui.
import { useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export type BookingStatus = 'pending' | 'contacted' | 'confirmed' | 'canceled'

export type BookingRow = {
  id: string
  name: string
  phone: string
  service: string | null
  preferred_date: string // YYYY-MM-DD
  preferred_time: string // HH:MM[:SS]
  note: string | null
  status: BookingStatus
  created_at: string
}

type Filter = 'todos' | 'pendentes' | 'confirmados' | 'cancelados'

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendente',
  contacted: 'Em contato',
  confirmed: 'Confirmado',
  canceled: 'Cancelado',
}

function fmtDate(iso: string): string {
  try {
    // preferred_date é literal (sem fuso) — parse manual evita shift de timezone
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
      .toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

function fmtTime(t: string): string {
  return t.slice(0, 5)
}

export default function AgendamentosList({ requests }: { requests: BookingRow[] }) {
  const [filter, setFilter] = useState<Filter>('todos')
  const [rows, setRows] = useState(requests)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function setStatus(id: string, status: BookingStatus) {
    setSavingId(id)
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('booking_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setRows(rs => rs.map(r => (r.id === id ? { ...r, status } : r)))
    setSavingId(null)
  }

  const shown = useMemo(() => {
    return rows.filter(r => {
      if (filter === 'pendentes') return r.status === 'pending' || r.status === 'contacted'
      if (filter === 'confirmados') return r.status === 'confirmed'
      if (filter === 'cancelados') return r.status === 'canceled'
      return true
    })
  }, [rows, filter])

  const chips: { id: Filter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'confirmados', label: 'Confirmados' },
    { id: 'cancelados', label: 'Cancelados' },
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
          <i className="ph-duotone ph-calendar-check" />
          {rows.length === 0
            ? 'Nenhuma solicitação ainda. Quando um visitante pedir horário pelo site, ela aparece aqui.'
            : 'Nenhuma solicitação com esse filtro.'}
        </div>
      ) : (
        <div className="posts">
          {shown.map(r => (
            <article className="glass post" key={r.id} style={{ alignItems: 'flex-start' }}>
              <div className="ti">
                <b>{r.name}</b>
                <div className="meta">
                  <span className="cat">{fmtDate(r.preferred_date)} às {fmtTime(r.preferred_time)}</span>
                  {r.service && <><span>·</span><span>{r.service}</span></>}
                  <span>·</span>
                  <a
                    href={`https://wa.me/${r.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    WhatsApp {r.phone}
                  </a>
                </div>
                {r.note && (
                  <p style={{ margin: '.35rem 0 0', fontSize: '.78rem', color: 'var(--muted)' }}>
                    “{r.note}”
                  </p>
                )}
              </div>
              <div className="acts" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '.4rem' }}>
                {r.status === 'confirmed' ? (
                  <span className="badge ok"><i className="ph-fill ph-check-circle" /> Confirmado</span>
                ) : r.status === 'canceled' ? (
                  <span className="badge muted"><i className="ph-fill ph-x-circle" /> Cancelado</span>
                ) : r.status === 'contacted' ? (
                  <span className="badge warn"><i className="ph-fill ph-chat-circle" /> Em contato</span>
                ) : (
                  <span className="badge warn"><i className="ph-fill ph-clock" /> Pendente</span>
                )}
                <select
                  className="field"
                  style={{ fontSize: '.72rem', padding: '.3rem .5rem' }}
                  value={r.status}
                  disabled={savingId === r.id}
                  onChange={e => setStatus(r.id, e.target.value as BookingStatus)}
                  aria-label={`Status da solicitação de ${r.name}`}
                >
                  {(Object.keys(STATUS_LABEL) as BookingStatus[]).map(s => (
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
