'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './consent.css'

// Banner de privacidade (telemetria). Modelo transparência + opt-out:
//  • A telemetria de produto roda por legítimo interesse (dados pseudônimos).
//  • "Entendi" apenas reconhece e fecha o banner (telemetria segue ligada).
//  • "Não quero ser rastreado" grava o cookie aco_no_track=1, que tanto o
//    client (lib/analytics/client) quanto a rota /api/track respeitam.
// Só aparece no host do painel/landing — nunca nos sites publicados de clientes.

const APP_URL_DEFAULT = 'https://ancoreo.com.br'
const ONE_YEAR = 60 * 60 * 24 * 365

function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false
  return new RegExp(`(?:^|;\\s*)${name}=`).test(document.cookie)
}

function setCookie(name: string, value: string) {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${name}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`
}

// Mesma lógica do middleware: o banner só vale no domínio do app (não em site de cliente).
function isAppHost(): boolean {
  if (typeof location === 'undefined') return false
  const h = location.hostname.toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1') return true
  if (h.endsWith('.vercel.app')) return true
  let app = ''
  try { app = new URL(process.env.NEXT_PUBLIC_APP_URL || APP_URL_DEFAULT).hostname.toLowerCase() } catch { /* ignora */ }
  if (!app) return false
  const bare = h.startsWith('www.') ? h.slice(4) : h
  const appBare = app.startsWith('www.') ? app.slice(4) : app
  return bare === appBare
}

export default function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Mostra só se for host do app e o usuário ainda não respondeu.
    if (isAppHost() && !hasCookie('aco_consent') && !hasCookie('aco_no_track')) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  function accept() {
    setCookie('aco_consent', '1')
    setShow(false)
  }

  function refuse() {
    setCookie('aco_no_track', '1')
    setCookie('aco_consent', '1')
    setShow(false)
  }

  return (
    <div className="aco-consent" role="dialog" aria-live="polite" aria-label="Aviso de privacidade">
      <p className="aco-consent__txt">
        Usamos dados de uso anônimos para melhorar a plataforma. Sem anúncios, sem venda de dados.
        Saiba mais na <Link href="/privacidade">Política de Privacidade</Link>.
      </p>
      <div className="aco-consent__actions">
        <button type="button" className="aco-consent__btn aco-consent__btn--no" onClick={refuse}>
          Não, obrigado
        </button>
        <button type="button" className="aco-consent__btn aco-consent__btn--ok" onClick={accept}>
          Entendi
        </button>
      </div>
    </div>
  )
}
