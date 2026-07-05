'use client'

// NV4 — UI de Parcerias. Superfície interna: flat, token-based (painel.css),
// sem liquid-glass novo. Quatro blocos: (1) opt-in + blurb; (2) parceiros
// sugeridos ranqueados com "Convidar"; (3) convites recebidos (aceitar/recusar);
// (4) anéis em andamento/ativos. Toda ação chama as rotas /api/partners/*.
import { useState } from 'react'

export type OptinState = { optedIn: boolean; enabled: boolean; blurb: string }
export type Suggestion = { siteId: string; segment: string | null; blurb: string | null; score: number }
export type ReceivedInvite = { id: string; fromSiteId: string; message: string | null; createdAt: string }
export type RingCard = {
  id: string
  status: 'forming' | 'active' | 'dissolved'
  acceptedCount: number
  createdAt: string
}

function shortId(id: string): string {
  return id.slice(0, 8)
}

export default function ParceriasClient({
  siteId,
  domain,
  optin,
  suggestions,
  received,
  rings,
}: {
  siteId: string
  domain: string
  optin: OptinState
  suggestions: Suggestion[]
  received: ReceivedInvite[]
  rings: RingCard[]
}) {
  const [enabled, setEnabled] = useState(optin.enabled)
  const [optedIn, setOptedIn] = useState(optin.optedIn)
  const [blurb, setBlurb] = useState(optin.blurb)
  const [savingOptin, setSavingOptin] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const [sugg, setSugg] = useState(suggestions)
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set())
  const [busySite, setBusySite] = useState<string | null>(null)

  const [invites, setInvites] = useState(received)
  const [busyInvite, setBusyInvite] = useState<string | null>(null)

  const subtitle = domain
    ? `${domain} · troque links com sites parceiros, em anéis de 3`
    : 'troque links com sites parceiros, em anéis de 3'

  async function saveOptin(nextEnabled: boolean) {
    setSavingOptin(true)
    setMsg(null)
    try {
      const res = await fetch('/api/partners/optin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, enabled: nextEnabled, blurb }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg(data?.error === 'feature_unavailable'
          ? 'O programa de Parcerias ainda não foi ativado nesta conta.'
          : 'Não foi possível salvar agora. Tente de novo.')
      } else {
        setEnabled(nextEnabled)
        setOptedIn(true)
        setMsg(nextEnabled ? 'Você está no programa de Parcerias.' : 'Você saiu do programa.')
      }
    } catch {
      setMsg('Falha de conexão. Tente de novo.')
    } finally {
      setSavingOptin(false)
    }
  }

  async function invite(targetSiteId: string) {
    setBusySite(targetSiteId)
    setMsg(null)
    try {
      const res = await fetch('/api/partners/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, target_site_id: targetSiteId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg(data?.error === 'no_third_available'
          ? 'Ainda não há um terceiro parceiro compatível pra fechar o anel. Tente mais tarde.'
          : 'Não foi possível enviar o convite agora.')
      } else {
        setInvitedIds(prev => new Set(prev).add(targetSiteId))
        setSugg(prev => prev.filter(s => s.siteId !== targetSiteId))
        setMsg('Convite enviado. O anel fecha quando os dois parceiros aceitarem.')
      }
    } catch {
      setMsg('Falha de conexão. Tente de novo.')
    } finally {
      setBusySite(null)
    }
  }

  async function respond(requestId: string, accept: boolean) {
    setBusyInvite(requestId)
    setMsg(null)
    try {
      const res = await fetch('/api/partners/respond', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, accept }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg('Não foi possível responder agora. Tente de novo.')
      } else {
        setInvites(prev => prev.filter(i => i.id !== requestId))
        setMsg(accept
          ? (data?.ringActive ? 'Anel fechado! Os links já estão sendo publicados.' : 'Convite aceito. Falta o outro parceiro confirmar.')
          : 'Convite recusado.')
      }
    } catch {
      setMsg('Falha de conexão. Tente de novo.')
    } finally {
      setBusyInvite(null)
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Parcerias</h1>
          <div className="sub">{subtitle}</div>
        </div>
      </div>

      <div className="note" style={{ marginBottom: '1.2rem' }}>
        <i className="ph-duotone ph-info" />
        <span>
          As parcerias funcionam em <b>anéis de 3 sites</b>: o seu aponta pro segundo,
          o segundo pro terceiro, o terceiro de volta pro seu. Nunca um link recíproco
          direto — é assim que o Google enxerga a recomendação como natural.
        </span>
      </div>

      {msg && (
        <div className="glass" style={{ padding: '.7rem 1rem', marginBottom: '1rem', fontSize: '.85rem' }}>
          {msg}
        </div>
      )}

      {/* ── 1. Opt-in + blurb ── */}
      <section className="glass" style={{ padding: '1.1rem 1.2rem', marginBottom: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <b style={{ fontSize: '.98rem' }}>Programa de Parcerias</b>
            <p style={{ margin: '.25rem 0 0', fontSize: '.84rem', color: 'var(--muted)' }}>
              {optedIn && enabled
                ? 'Seu site está no diretório de parceiros e pode ser sugerido a outros.'
                : 'Entre no programa pra receber e enviar convites de troca de links.'}
            </p>
          </div>
          <button
            className={`btn ${optedIn && enabled ? 'ghost' : ''}`}
            disabled={savingOptin}
            onClick={() => saveOptin(!(optedIn && enabled))}
          >
            <i className={`ph-duotone ${optedIn && enabled ? 'ph-sign-out' : 'ph-handshake'}`} />
            {optedIn && enabled ? 'Sair do programa' : 'Entrar no programa'}
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label className="lbl" htmlFor="blurb">Como você se apresenta aos parceiros</label>
          <textarea
            id="blurb"
            className="field"
            rows={2}
            maxLength={280}
            placeholder="Ex.: Estúdio de fotografia de casamento em Florianópolis, foco em ensaios ao ar livre."
            value={blurb}
            onChange={e => setBlurb(e.target.value)}
            style={{ resize: 'vertical' }}
          />
          <div style={{ marginTop: '.6rem' }}>
            <button className="btn ghost sm" disabled={savingOptin} onClick={() => saveOptin(enabled)}>
              Salvar apresentação
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Convites recebidos ── */}
      {invites.length > 0 && (
        <section style={{ marginBottom: '1.4rem' }}>
          <label className="lbl">Convites recebidos</label>
          <div className="posts">
            {invites.map(i => (
              <article className="glass post" key={i.id} style={{ alignItems: 'flex-start' }}>
                <div className="ti">
                  <b>Convite pra formar um anel</b>
                  <div className="meta">
                    <span className="cat">site {shortId(i.fromSiteId)}</span>
                  </div>
                  {i.message && (
                    <p style={{ margin: '.35rem 0 0', fontSize: '.84rem' }}>{i.message}</p>
                  )}
                </div>
                <div className="acts" style={{ gap: '.5rem' }}>
                  <button
                    className="btn sm"
                    disabled={busyInvite === i.id}
                    onClick={() => respond(i.id, true)}
                  >
                    <i className="ph-duotone ph-check" /> Aceitar
                  </button>
                  <button
                    className="btn ghost sm"
                    disabled={busyInvite === i.id}
                    onClick={() => respond(i.id, false)}
                  >
                    Recusar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── 2. Parceiros sugeridos ── */}
      <section style={{ marginBottom: '1.4rem' }}>
        <label className="lbl">Parceiros sugeridos pra você</label>
        {!optedIn || !enabled ? (
          <div className="glass empty">
            <i className="ph-duotone ph-users-three" />
            Entre no programa pra ver sites parceiros compatíveis com o seu conteúdo.
          </div>
        ) : sugg.length === 0 ? (
          <div className="glass empty">
            <i className="ph-duotone ph-users-three" />
            Nenhum parceiro compatível ainda. Assim que mais sites entrarem no programa, eles aparecem aqui.
          </div>
        ) : (
          <div className="posts">
            {sugg.map(s => (
              <article className="glass post" key={s.siteId} style={{ alignItems: 'flex-start' }}>
                <div className="ti">
                  <b>{s.segment || 'Site parceiro'}</b>
                  <div className="meta">
                    <span className="badge ok"><i className="ph-fill ph-target" /> {s.score}% afinidade</span>
                    <span>·</span>
                    <span className="cat">site {shortId(s.siteId)}</span>
                  </div>
                  {s.blurb && (
                    <p style={{ margin: '.35rem 0 0', fontSize: '.84rem', color: 'var(--muted)' }}>{s.blurb}</p>
                  )}
                </div>
                <div className="acts">
                  <button
                    className="btn sm"
                    disabled={busySite === s.siteId || invitedIds.has(s.siteId)}
                    onClick={() => invite(s.siteId)}
                  >
                    <i className="ph-duotone ph-paper-plane-tilt" />
                    {invitedIds.has(s.siteId) ? 'Convidado' : 'Convidar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Anéis ── */}
      {rings.length > 0 && (
        <section>
          <label className="lbl">Seus anéis</label>
          <div className="posts">
            {rings.map(r => (
              <article className="glass post" key={r.id} style={{ alignItems: 'flex-start' }}>
                <div className="ti">
                  <b>Anel {shortId(r.id)}</b>
                  <div className="meta">
                    {r.status === 'active' ? (
                      <span className="badge ok"><i className="ph-fill ph-check-circle" /> Ativo</span>
                    ) : (
                      <span className="badge warn"><i className="ph-fill ph-hourglass" /> Formando ({r.acceptedCount}/3)</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
