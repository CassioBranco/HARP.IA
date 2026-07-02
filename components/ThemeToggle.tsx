'use client'

import { useEffect, useState } from 'react'

// Alternador claro/escuro do núcleo ANCOREO. A classe .dark vive no <html>
// (aplicada cedo pelo script inline do root layout); aqui só alternamos e
// persistimos a escolha. Estilo próprio inline-free: usa .aco-theme-btn
// (globals.css) pra funcionar em qualquer superfície.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('aco_theme', next ? 'dark' : 'light') } catch { /* segue */ }
  }

  // Evita mismatch de hidratação: só renderiza o ícone certo depois de montar.
  return (
    <button
      type="button"
      className="aco-theme-btn"
      onClick={toggle}
      aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={dark ? 'Tema claro' : 'Tema escuro'}
    >
      {mounted ? (dark ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
    </button>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}
