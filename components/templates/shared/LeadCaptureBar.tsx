'use client'

// Faixa inline de captura de leads dos sites publicados (os 10 layouts).
// NÃO é popup nem modal: é uma seção discreta no FLUXO normal da página,
// renderizada pelo LayoutRenderer depois do layout (última faixa do site).
// Zero overlay = zero risco de "intrusive interstitial" (penalidade mobile
// do Google) e zero conflito com o ChatWidget (canto inferior direito) e o
// BookingWidget (canto inferior esquerdo), que continuam donos dos cantos.
//
// Neutro por design (mesma filosofia do ChatWidget/BookingWidget): os
// templates de cliente têm identidade própria, então cinza/branco que
// combina com qualquer layout. Botão "X" dispensa a faixa e lembra a
// escolha por 1 dia (localStorage) — não reaparece pro mesmo visitante.
//
// Renderizado UMA vez pelo LayoutRenderer quando sites.leads_enabled = true.
// Ao enviar, POST em /api/leads, que grava em `leads` — o dono vê em /leads.

import { useEffect, useState } from 'react'

type Props = {
  siteId: string
  businessName?: string
  /** nomes dos serviços cadastrados — vira <select> de interesse; vazio vira campo livre */
  services?: string[]
  /** no preview do editor não grava lead real nem persiste o "dispensar" */
  preview?: boolean
}

const CSS = `
.lc-band{position:relative;background:#fafafa;border-top:1px solid #e4e4e7;color:#18181b;padding:30px 18px 26px;font-family:inherit;text-align:left}
.lc-inner{max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:16px 32px}
.lc-copy{flex:1 1 240px;min-width:220px;display:flex;align-items:flex-start;gap:12px}
.lc-title{margin:0;font-size:16px;font-weight:700;color:#18181b;line-height:1.3}
.lc-sub{margin:4px 0 0;font-size:13px;color:#71717a;line-height:1.5}
.lc-form{flex:2 1 400px;display:flex;flex-wrap:wrap;gap:8px}
.lc-in{flex:1 1 150px;min-width:0;box-sizing:border-box;padding:10px 11px;border:1px solid #d4d4d8;border-radius:9px;font-size:13.5px;font-family:inherit;color:#18181b;background:#fff}
.lc-in:focus{outline:2px solid #1f2430;outline-offset:-1px}
.lc-send{flex:1 1 140px;padding:10px 16px;border:none;border-radius:9px;background:#1f2430;color:#fff;font-size:13.5px;font-weight:700;font-family:inherit;cursor:pointer}
.lc-send:disabled{opacity:.6;cursor:default}
.lc-close{position:absolute;top:10px;right:10px;border:none;background:none;cursor:pointer;color:#a1a1aa;padding:4px;line-height:0}
.lc-close:hover{color:#52525b}
.lc-err{flex-basis:100%;margin:0;font-size:12.5px;color:#b91c1c}
.lc-priv{flex-basis:100%;margin:0;font-size:11.5px;color:#a1a1aa}
`

// Envelope — SVG inline simples (sem fonte de ícones no site publicado).
function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

type SendState = 'idle' | 'sending' | 'ok' | 'error'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function LeadCaptureBar({ siteId, businessName, services, preview = false }: Props) {
  // Publicado começa oculto e o efeito revela se o visitante não dispensou
  // hoje (localStorage é client-only — evita mismatch de hidratação).
  // No preview do editor aparece sempre, direto.
  const [hidden, setHidden] = useState(!preview)
  const [state, setState] = useState<SendState>('idle')
  const [err, setErr] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [interest, setInterest] = useState('')

  const storageKey = `anc-lead-hide-${siteId}`
  const serviceList = (services ?? []).map(s => s.trim()).filter(Boolean)

  useEffect(() => {
    if (preview) return
    try {
      setHidden(localStorage.getItem(storageKey) === todayStr())
    } catch {
      setHidden(false)
    }
  }, [preview, storageKey])

  function remember() {
    if (preview) return
    try { localStorage.setItem(storageKey, todayStr()) } catch { /* storage bloqueado — segue sem lembrar */ }
  }

  function dismiss() {
    setHidden(true)
    remember()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return
    const phoneDigits = phone.replace(/\D/g, '')
    if (!email.trim() && phoneDigits.length < 8) {
      setErr('Deixe um e-mail ou um telefone pra gente falar com você.')
      return
    }
    setErr('')
    if (preview) {
      // No editor o lead não é gravado — só mostra como o visitante vê.
      setState('ok')
      return
    }
    setState('sending')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          name,
          email,
          phone,
          interest,
          source: window.location.pathname,
        }),
      })
      if (res.ok) {
        setState('ok')
        remember() // já deixou contato — não pedir de novo em outra página hoje
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (hidden) return null

  return (
    <section className="lc-band" aria-label="Receba novidades e ofertas">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <button type="button" className="lc-close" onClick={dismiss} aria-label="Dispensar formulário de contato">
        <CloseIcon />
      </button>

      <div className="lc-inner">
        <div className="lc-copy">
          <EnvelopeIcon />
          <div>
            <p className="lc-title">
              {businessName?.trim() ? `Fique por dentro — ${businessName.trim()}` : 'Fique por dentro'}
            </p>
            <p className="lc-sub">Deixe seu contato e retornamos com novidades e condições. Sem spam.</p>
          </div>
        </div>

        {state === 'ok' ? (
          <div style={{ flex: '2 1 400px' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#18181b' }}>Contato recebido!</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: '#52525b' }}>
              {preview
                ? 'Modo preview: nada foi enviado. No site publicado, o lead chega no seu painel.'
                : 'Obrigado pelo interesse — retornamos em breve.'}
            </p>
          </div>
        ) : (
          <form className="lc-form" onSubmit={submit}>
            <input
              className="lc-in" type="text" required minLength={2} maxLength={120}
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Seu nome" aria-label="Seu nome"
            />
            <input
              className="lc-in" type="email" maxLength={160}
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Seu e-mail" aria-label="Seu e-mail"
            />
            <input
              className="lc-in" type="tel" maxLength={20}
              value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="Telefone / WhatsApp" aria-label="Telefone ou WhatsApp"
            />
            {serviceList.length > 0 ? (
              <select
                className="lc-in" value={interest} onChange={e => setInterest(e.target.value)}
                aria-label="Assunto de interesse"
                style={{ color: interest ? '#18181b' : '#71717a' }}
              >
                <option value="">Interesse (opcional)</option>
                {serviceList.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Outro">Outro</option>
              </select>
            ) : (
              <input
                className="lc-in" type="text" maxLength={120}
                value={interest} onChange={e => setInterest(e.target.value)}
                placeholder="Interesse (opcional)" aria-label="Assunto de interesse"
              />
            )}
            <button type="submit" className="lc-send" disabled={state === 'sending'}>
              {state === 'sending' ? 'Enviando…' : 'Quero receber'}
            </button>

            {err && <p className="lc-err">{err}</p>}
            {state === 'error' && (
              <p className="lc-err">Não consegui enviar agora. Tente de novo em instantes.</p>
            )}
            <p className="lc-priv">Usamos seu contato só pra retornar — nada de spam.</p>
          </form>
        )}
      </div>
    </section>
  )
}
