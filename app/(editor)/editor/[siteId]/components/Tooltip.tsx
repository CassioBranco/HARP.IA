'use client'

import { useState, useRef, useCallback, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

type Side = 'top' | 'bottom' | 'right' | 'left'

// Tooltip confiável: renderiza no <body> via portal com position:fixed, então
// nunca é cortado por containers com overflow (ex.: .ed-scroll do painel).
// Aparece no hover e no foco de teclado. Puramente informativo (pointer-events:none).
export function Tip({ label, side = 'top', style, children }: { label: string; side?: Side; style?: CSSProperties; children: ReactNode }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const show = useCallback(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const map: Record<Side, { x: number; y: number }> = {
      top:    { x: r.left + r.width / 2, y: r.top - 8 },
      bottom: { x: r.left + r.width / 2, y: r.bottom + 8 },
      right:  { x: r.right + 8, y: r.top + r.height / 2 },
      left:   { x: r.left - 8, y: r.top + r.height / 2 },
    }
    setPos(map[side])
  }, [side])

  const hide = useCallback(() => setPos(null), [])

  const transform: Record<Side, string> = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    right: 'translate(0, -50%)',
    left: 'translate(-100%, -50%)',
  }

  return (
    <span
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      style={{ display: 'inline-flex', ...style }}
    >
      {children}
      {pos !== null && typeof document !== 'undefined' && createPortal(
        <span
          role="tooltip"
          style={{
            position: 'fixed', left: pos.x, top: pos.y, transform: transform[side],
            background: '#0f172a', color: '#fff', fontSize: 11, fontWeight: 500,
            lineHeight: 1.35, padding: '5px 8px', borderRadius: 7, maxWidth: 220,
            width: 'max-content', boxShadow: '0 6px 20px rgba(0,0,0,.3)',
            zIndex: 100000, pointerEvents: 'none', fontFamily: 'system-ui, sans-serif',
          }}
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  )
}
