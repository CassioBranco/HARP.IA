'use client'

// Widget de agendamento dos sites publicados (os 10 layouts).
// Botão circular no canto inferior ESQUERDO (o direito é do ChatWidget +
// SiteSocials) que abre um formulário simples: nome, WhatsApp, serviço,
// data e horário preferidos, observação. Ao enviar, POST em /api/booking,
// que grava a solicitação em booking_requests — o dono confirma por fora.
//
// Neutro por design (mesma filosofia do ChatWidget): os templates de cliente
// têm identidade própria, então cinza/branco que combina com qualquer layout.
// Inputs nativos de data/hora — sem lib de calendário.
//
// Renderizado UMA vez pelo LayoutRenderer quando sites.booking_enabled = true.

import { useState } from 'react'

type Props = {
  siteId: string
  businessName?: string
  /** nomes dos serviços cadastrados — vira <select>; vazio vira campo livre */
  services?: string[]
  /** no preview do editor não grava solicitação real */
  preview?: boolean
}

const CSS = `
.bw-btn{position:fixed;left:16px;bottom:16px;z-index:9999;height:56px;border-radius:28px;border:1px solid rgba(0,0,0,.08);cursor:pointer;background:#1f2430;color:#fff;display:flex;align-items:center;gap:8px;padding:0 18px 0 14px;font-size:13.5px;font-weight:700;font-family:inherit;box-shadow:0 8px 22px rgba(0,0,0,.25)}
.bw-panel{position:fixed;left:16px;bottom:84px;z-index:9999;width:min(360px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 120px));display:flex;flex-direction:column;background:#fff;color:#18181b;border:1px solid #e4e4e7;border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.18);overflow:hidden;text-align:left}
.bw-body{overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.bw-lbl{display:block;font-size:12px;font-weight:600;color:#3f3f46;margin:0 0 4px}
.bw-in{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #d4d4d8;border-radius:9px;font-size:13.5px;font-family:inherit;color:#18181b;background:#fff}
.bw-in:focus{outline:2px solid #1f2430;outline-offset:-1px}
.bw-row{display:flex;gap:8px}
.bw-row>div{flex:1;min-width:0}
.bw-send{width:100%;padding:11px 14px;border:none;border-radius:10px;background:#1f2430;color:#fff;font-size:13.5px;font-weight:700;font-family:inherit;cursor:pointer}
.bw-send:disabled{opacity:.6;cursor:default}
@media (prefers-reduced-motion: no-preference){
  .bw-btn{transition:transform .18s ease}
  .bw-btn:hover{transform:scale(1.04)}
  .bw-panel{animation:bwIn .22s cubic-bezier(.22,1,.36,1)}
  @keyframes bwIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
}
`

// Calendário — SVG inline simples (sem fonte de ícones no site publicado).
function CalendarIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

type SendState = 'idle' | 'sending' | 'ok' | 'error'

export default function BookingWidget({ siteId, businessName, services, preview = false }: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<SendState>('idle')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')

  const serviceList = (services ?? []).map(s => s.trim()).filter(Boolean)
  const today = new Date().toISOString().slice(0, 10)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return
    if (preview) {
      // No editor a solicitação não é gravada — só mostra como o visitante vê.
      setState('ok')
      return
    }
    setState('sending')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          name,
          phone,
          service,
          preferred_date: date,
          preferred_time: time,
          note,
        }),
      })
      setState(res.ok ? 'ok' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {open && (
        <div className="bw-panel" role="dialog" aria-label="Solicitar agendamento">
          {/* Cabeçalho */}
          <div style={{ padding: '14px 16px 12px', background: '#fafafa', borderBottom: '1px solid #ececee', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#18181b', lineHeight: 1.3 }}>
                Agendar horário
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#71717a' }}>
                {businessName?.trim()
                  ? `${businessName.trim()} confirma com você em seguida.`
                  : 'Confirmamos com você em seguida.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar agendamento"
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#71717a', padding: 2 }}
            >
              <CloseIcon />
            </button>
          </div>

          {state === 'ok' ? (
            <div style={{ padding: '22px 18px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#18181b' }}>
                Solicitação recebida!
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: '#52525b' }}>
                {preview
                  ? 'Modo preview: nada foi enviado. No site publicado, a solicitação chega no seu painel.'
                  : 'Entraremos em contato pelo seu WhatsApp para confirmar o horário.'}
              </p>
            </div>
          ) : (
            <form className="bw-body" onSubmit={submit}>
              <div>
                <label className="bw-lbl" htmlFor="bw-name">Seu nome</label>
                <input id="bw-name" className="bw-in" type="text" required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <label className="bw-lbl" htmlFor="bw-phone">Telefone / WhatsApp</label>
                <input id="bw-phone" className="bw-in" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="(15) 99123-4567" />
              </div>
              <div>
                <label className="bw-lbl" htmlFor="bw-service">Serviço desejado</label>
                {serviceList.length > 0 ? (
                  <select id="bw-service" className="bw-in" value={service} onChange={e => setService(e.target.value)}>
                    <option value="">Escolha um serviço…</option>
                    {serviceList.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Outro">Outro</option>
                  </select>
                ) : (
                  <input id="bw-service" className="bw-in" type="text" maxLength={120} value={service} onChange={e => setService(e.target.value)} placeholder="Ex.: consulta, avaliação…" />
                )}
              </div>
              <div className="bw-row">
                <div>
                  <label className="bw-lbl" htmlFor="bw-date">Data preferida</label>
                  <input id="bw-date" className="bw-in" type="date" required min={today} value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="bw-lbl" htmlFor="bw-time">Horário</label>
                  <input id="bw-time" className="bw-in" type="time" required value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="bw-lbl" htmlFor="bw-note">Observação (opcional)</label>
                <textarea id="bw-note" className="bw-in" rows={2} maxLength={500} style={{ resize: 'vertical' }} value={note} onChange={e => setNote(e.target.value)} placeholder="Algo que devemos saber?" />
              </div>

              {state === 'error' && (
                <p style={{ margin: 0, fontSize: 12.5, color: '#b91c1c' }}>
                  Não consegui enviar agora. Tente de novo em instantes.
                </p>
              )}

              <button type="submit" className="bw-send" disabled={state === 'sending'}>
                {state === 'sending' ? 'Enviando…' : 'Solicitar agendamento'}
              </button>
              <p style={{ margin: 0, fontSize: 11.5, color: '#a1a1aa', textAlign: 'center' }}>
                Sem pagamento agora — o horário é confirmado com você.
              </p>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        className="bw-btn"
        aria-label={open ? 'Fechar agendamento' : 'Abrir agendamento'}
        aria-expanded={open}
        onClick={() => { setOpen(o => !o); if (state === 'error') setState('idle') }}
      >
        <CalendarIcon />
        Agendar
      </button>
    </>
  )
}
