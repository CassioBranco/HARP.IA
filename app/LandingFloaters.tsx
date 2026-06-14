'use client'

// Penas/motes/pássaro flutuando ao fundo da landing (decorativo).
// Gerado no cliente p/ evitar mismatch de hidratação (usa aleatoriedade).
import { useEffect, useRef } from 'react'

export default function LandingFloaters() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = ref.current
    if (!wrap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function add(cls: string, glyph: string | null, o: { d: () => number; o: () => string; sz?: () => number }) {
      const el = document.createElement('div')
      el.className = 'fl ' + cls
      const i = document.createElement(glyph ? 'i' : 'span')
      i.className = glyph ? 'in ' + glyph : 'in'
      el.appendChild(i)
      el.style.top = Math.random() * 100 + '%'
      el.style.setProperty('--d', o.d() + 's')
      el.style.setProperty('--dl', -Math.random() * 60 + 's')
      el.style.setProperty('--s', (7 + Math.random() * 7).toFixed(1) + 's')
      el.style.setProperty('--sv', ((Math.random() * 22 + 6) | 0) + 'px')
      el.style.setProperty('--yend', ((Math.random() * 180 - 110) | 0) + 'px')
      el.style.setProperty('--r0', ((Math.random() * 30 - 15) | 0) + 'deg')
      el.style.setProperty('--r1', ((Math.random() * 30 - 5) | 0) + 'deg')
      el.style.setProperty('--o', o.o())
      if (o.sz) el.style.setProperty('--sz', o.sz() + 'px')
      wrap!.appendChild(el)
    }

    for (let i = 0; i < 9; i++) {
      const far = i < 4
      add('feather' + (far ? ' far' : ''), 'ph-fill ph-feather', {
        d: () => (far ? 52 + Math.random() * 28 : 30 + Math.random() * 26),
        o: () => (far ? 0.2 + Math.random() * 0.16 : 0.3 + Math.random() * 0.3).toFixed(2),
        sz: () => ((far ? 34 + Math.random() * 26 : 16 + Math.random() * 20) | 0),
      })
    }
    for (let i = 0; i < 16; i++)
      add('mote', null, { d: () => 22 + Math.random() * 26, o: () => (0.3 + Math.random() * 0.45).toFixed(2), sz: () => (2 + Math.random() * 4) | 0 })
    add('bird', 'ph-fill ph-bird', { d: () => 56 + Math.random() * 30, o: () => '0.14', sz: () => (44 + Math.random() * 28) | 0 })

    return () => { if (wrap) wrap.innerHTML = '' }
  }, [])

  return <div className="floaters" ref={ref} />
}
