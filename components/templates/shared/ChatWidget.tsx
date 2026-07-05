'use client'

// Widget de FAQ/chat flutuante dos sites publicados (os 10 layouts).
// Botão circular no canto inferior direito que abre um painel com as
// perguntas frequentes do negócio + atalho "Falar no WhatsApp".
//
// Neutro por design: os templates de cliente têm identidade visual própria,
// então o widget usa cinza/branco (combina com qualquer layout) e o verde
// universal do WhatsApp como único acento. Sem SDK de terceiro, sem lib de
// chat — useState puro + CSS embutido.
//
// Renderizado UMA vez pelo LayoutRenderer, vale pros 10 layouts.
// SiteSocials sobe (prop raise) quando este widget está ativo.

import { useState } from 'react'

export type ChatFaq = { question: string; answer: string }

type Props = {
  /** número já normalizado, só dígitos com DDI (ex.: 5515991234567) */
  whatsapp?: string
  faqs?: ChatFaq[]
  businessName?: string
}

const DEFAULT_MSG = 'Olá! Vim pelo site e gostaria de mais informações.'

const CSS = `
.cw-btn{position:fixed;right:16px;bottom:16px;z-index:9999;width:56px;height:56px;border-radius:50%;border:1px solid rgba(0,0,0,.08);cursor:pointer;background:#1f2430;color:#fff;display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.25);padding:0}
.cw-panel{position:fixed;right:16px;bottom:84px;z-index:9999;width:min(340px,calc(100vw - 32px));max-height:min(480px,calc(100vh - 120px));display:flex;flex-direction:column;background:#fff;color:#18181b;border:1px solid #e4e4e7;border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.18);overflow:hidden;text-align:left}
.cw-q{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:10px 12px;border:none;background:none;cursor:pointer;text-align:left;font-size:13.5px;font-weight:600;color:#27272a;font-family:inherit}
.cw-q:hover{background:#f4f4f5}
@media (prefers-reduced-motion: no-preference){
  .cw-btn{transition:transform .18s ease}
  .cw-btn:hover{transform:scale(1.06)}
  .cw-panel{animation:cwIn .22s cubic-bezier(.22,1,.36,1)}
  @keyframes cwIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
}
`

// Balão de chat (fechado) e X (aberto) — SVG inline, sem fonte de ícones.
function BubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function ChatWidget({ whatsapp, faqs, businessName }: Props) {
  const [open, setOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const digits = (whatsapp ?? '').replace(/\D/g, '')
  const items = (faqs ?? []).filter(f => f?.question?.trim() && f?.answer?.trim())

  // Nada pra mostrar — não polui o site do cliente.
  if (!digits && items.length === 0) return null

  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(DEFAULT_MSG)}`
    : ''

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {open && (
        <div className="cw-panel" role="dialog" aria-label="Perguntas frequentes e contato">
          {/* Cabeçalho */}
          <div style={{ padding: '14px 16px 12px', background: '#fafafa', borderBottom: '1px solid #ececee' }}>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#18181b', lineHeight: 1.3 }}>
              {businessName?.trim() || 'Fale com a gente'}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#71717a' }}>
              {items.length > 0 ? 'Tire suas dúvidas ou chame no WhatsApp.' : 'Estamos a uma mensagem de distância.'}
            </p>
          </div>

          {/* Perguntas frequentes */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {items.length > 0 ? (
              items.map((f, i) => (
                <div key={i} style={{ borderBottom: '1px solid #f1f1f3' }}>
                  <button
                    type="button"
                    className="cw-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{f.question}</span>
                    <svg
                      viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                      style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <p style={{ margin: 0, padding: '0 12px 11px', fontSize: 13, lineHeight: 1.55, color: '#52525b' }}>
                      {f.answer}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ margin: 0, padding: '14px 16px', fontSize: 13, lineHeight: 1.55, color: '#52525b' }}>
                Ficou com alguma dúvida? Chame no WhatsApp — respondemos rapidinho.
              </p>
            )}
          </div>

          {/* CTA WhatsApp */}
          {waHref && (
            <div style={{ padding: 12, borderTop: '1px solid #ececee', background: '#fff' }}>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 14px', borderRadius: 10, background: '#25D366',
                  color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.07-1.82-.11-.42-.14-.96-.32-1.65-.62-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.01s.75-2.14 1.02-2.43c.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.83 2.02.9 2.17.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.29.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.27.14.43.12.59-.07.16-.19.68-.79.86-1.07.18-.28.36-.23.61-.14.25.09 1.6.76 1.87.9.27.14.46.21.53.32.07.12.07.68-.17 1.36z" />
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="cw-btn"
        aria-label={open ? 'Fechar perguntas frequentes' : 'Abrir perguntas frequentes'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <CloseIcon /> : <BubbleIcon />}
      </button>
    </>
  )
}
