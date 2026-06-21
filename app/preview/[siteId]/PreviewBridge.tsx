'use client'

// ============================================================
// Ponte de edição: roda DENTRO do iframe do preview (só no modo
// editor, chrome=0). Realça o que dá pra editar e, ao clicar,
// avisa o painel (window.parent) qual tipo de elemento foi clicado
// pra abrir a aba certa. Clicar NÃO navega — seleciona pra editar.
// ============================================================
import { useEffect } from 'react'

type EditKind = 'image' | 'text'

export default function PreviewBridge() {
  useEffect(() => {
    const kindOf = (el: EventTarget | null): EditKind | null => {
      if (!(el instanceof Element)) return null
      if (el.closest('img')) return 'image'
      const txt = el.closest('h1,h2,h3,h4,p,li,a,button,span')
      if (txt && (txt.textContent ?? '').trim().length > 0) return 'text'
      return null
    }

    const onClick = (e: MouseEvent) => {
      const kind = kindOf(e.target)
      if (!kind) return
      // No editor, clicar é pra EDITAR, não seguir link/CTA.
      e.preventDefault()
      e.stopPropagation()
      window.parent?.postMessage({ source: 'harpia-preview', kind }, '*')
    }

    const onOver = (e: MouseEvent) => {
      document.body.style.cursor = kindOf(e.target) ? 'pointer' : ''
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('mouseover', onOver, true)

    // Realce de "editável" ao passar o mouse.
    const style = document.createElement('style')
    style.setAttribute('data-harpia-edit', '')
    style.textContent = `
      img:hover, h1:hover, h2:hover, h3:hover, h4:hover, p:hover {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 3px;
        cursor: pointer;
        transition: outline-color .1s;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('mouseover', onOver, true)
      style.remove()
    }
  }, [])

  return null
}
