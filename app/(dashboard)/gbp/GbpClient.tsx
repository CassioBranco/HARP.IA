'use client'

import { useRef, useState } from 'react'
import { gbpCadence } from '@/lib/seo/local-presence'

export type GbpPostRow = {
  id: string
  post_type: 'novidade' | 'oferta' | 'evento'
  content: string
  cta_label: string | null
  cta_url: string | null
  status: 'draft' | 'used'
  created_at: string
}

const TYPES: { id: GbpPostRow['post_type']; label: string; icon: string; hint: string }[] = [
  { id: 'novidade', label: 'Novidade', icon: 'ph-megaphone',     hint: 'Dica, bastidor ou atualização do negócio' },
  { id: 'oferta',   label: 'Oferta',   icon: 'ph-tag',           hint: 'Promoção ou condição especial' },
  { id: 'evento',   label: 'Evento',   icon: 'ph-calendar-star', hint: 'Ação com começo e fim' },
]

const TYPE_LABEL: Record<GbpPostRow['post_type'], string> = {
  novidade: 'Novidade', oferta: 'Oferta', evento: 'Evento',
}

export default function GbpClient({
  siteId, gpeConnected, gpeLink, initialPosts,
}: {
  siteId: string
  gpeConnected: boolean
  gpeLink: string
  initialPosts: GbpPostRow[]
}) {
  const [posts, setPosts] = useState<GbpPostRow[]>(initialPosts)
  const [postType, setPostType] = useState<GbpPostRow['post_type']>('novidade')
  const [topic, setTopic] = useState('')
  const [gen, setGen] = useState(false)
  const [err, setErr] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Cadência: há quanto tempo o dono não posta (sobre os posts já gerados).
  const cadence = gbpCadence(posts.map(p => p.created_at))
  const genRef = useRef<HTMLDivElement | null>(null)
  function focusGenerator() {
    const el = genRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.querySelector<HTMLInputElement>('input.field')?.focus()
  }

  async function generate() {
    if (!siteId) { setErr('Crie e publique um site primeiro.'); return }
    setGen(true); setErr('')
    try {
      const res = await fetch('/api/ai/gbp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, post_type: postType, topic }),
      })
      const j = await res.json()
      if (!res.ok || !j.post) { setErr(j.error ?? 'Não consegui gerar o post agora.'); return }
      setPosts(p => [j.post as GbpPostRow, ...p])
      setTopic('')
    } catch {
      setErr('Falha de conexão ao gerar o post.')
    } finally {
      setGen(false)
    }
  }

  async function copy(post: GbpPostRow) {
    try {
      await navigator.clipboard.writeText(post.content)
      setCopiedId(post.id)
      setTimeout(() => setCopiedId(c => (c === post.id ? null : c)), 1800)
    } catch { /* clipboard bloqueado */ }
  }

  const cadenceTone =
    cadence.status === 'overdue' ? 'warn'
    : cadence.status === 'due' ? 'due'
    : cadence.status === 'never' ? 'start'
    : 'ok'

  return (
    <>
      {/* banner de cadência: há quanto tempo não posta no Google */}
      <div className={`gbp-cadence ${cadenceTone}`}>
        <span className="ic">
          <i className={`ph-fill ${
            cadence.status === 'ok' ? 'ph-check-circle'
            : cadence.status === 'never' ? 'ph-rocket-launch'
            : 'ph-clock-countdown'
          }`} />
        </span>
        <p style={{ flex: 1, minWidth: 0 }}>{cadence.message}</p>
        {cadence.status !== 'ok' && (
          <button type="button" className="btn sm" onClick={focusGenerator}>
            <i className="ph-fill ph-sparkle" /> Gerar post agora
          </button>
        )}
      </div>

      {/* aviso se o perfil não estiver vinculado */}
      {!gpeConnected && (
        <div className="ai-banner" style={{ borderColor: 'rgba(245,163,10,.4)' }}>
          <span className="ic"><i className="ph-fill ph-warning" /></span>
          <div>
            <b>Vincule seu Perfil de Empresa pra aproveitar de verdade</b>
            <p>Você ainda pode gerar e copiar posts, mas vincular o perfil no onboarding fortalece sua busca local no Google.</p>
          </div>
        </div>
      )}

      {/* gerador */}
      <div className="ai-banner" ref={genRef}>
        <span className="ic"><i className="ph-fill ph-magic-wand" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>Deixe a IA escrever seu post do Google</b>
          <p>Escolha o tipo, dê (ou não) um assunto, e copie pronto pro seu perfil.</p>

          <div className="gbp-types" style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.7rem' }}>
            {TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPostType(t.id)}
                className={`btn glass sm${postType === t.id ? ' on' : ''}`}
                title={t.hint}
                style={postType === t.id ? { outline: '2px solid var(--accent, #8fc0ff)' } : undefined}
              >
                <i className={`ph-fill ${t.icon}`} /> {t.label}
              </button>
            ))}
          </div>

          <input
            className="field"
            style={{ marginTop: '.7rem' }}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Assunto (opcional). Ex.: desconto de inverno, novo horário, dica de cuidado…"
          />
        </div>
        <button className="btn" onClick={generate} disabled={gen}>
          {gen ? 'Escrevendo…' : <><i className="ph-fill ph-sparkle" /> Gerar post</>}
        </button>
      </div>

      {err && <p className="ed-err" style={{ margin: '.4rem 0' }}><i className="ph-fill ph-warning-circle" /> {err}</p>}

      {/* lista de posts */}
      {posts.length === 0 ? (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          Nenhum post ainda. Gere o primeiro acima.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
          {posts.map(post => (
            <div key={post.id} className="glass" style={{ padding: '1.1rem 1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                <span className="chip" style={{ fontSize: '.74rem', fontWeight: 700, opacity: .85 }}>
                  {TYPE_LABEL[post.post_type]}
                </span>
                {post.cta_label && (
                  <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>
                    botão: <b>{post.cta_label}</b>
                  </span>
                )}
                <button
                  className="btn glass sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => copy(post)}
                >
                  {copiedId === post.id
                    ? <><i className="ph-fill ph-check" /> Copiado</>
                    : <><i className="ph-fill ph-copy" /> Copiar</>}
                </button>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0 }}>{post.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* atalho pro perfil */}
      {gpeLink && (
        <p className="hint" style={{ marginTop: '1rem' }}>
          <a href={gpeLink} target="_blank" rel="noopener noreferrer" className="diag-link">
            <i className="ph-fill ph-arrow-square-out" /> Abrir meu Perfil no Google pra colar o post
          </a>
        </p>
      )}
    </>
  )
}
