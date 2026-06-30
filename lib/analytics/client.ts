// Telemetria client-side: dispara um evento de funil, fire-and-forget.
// Nunca quebra a UX, nunca envia PII, respeita opt-out (cookie aco_no_track).
// O id de sessão (pseudônimo) é gerido server-side via cookie httpOnly — aqui
// não lemos nem geramos identidade.

import type { AnalyticsEvent } from './events'

function optedOut(): boolean {
  if (typeof document === 'undefined') return true
  return /(?:^|;\s*)aco_no_track=1/.test(document.cookie)
}

type Props = Record<string, string | number | boolean>

export function track(event: AnalyticsEvent, props?: Props): void {
  if (typeof window === 'undefined' || optedOut()) return
  try {
    const body = JSON.stringify({ event, path: window.location.pathname, props: props ?? {} })
    // keepalive: o envio sobrevive a navegação/fechamento de aba.
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => {})
  } catch {
    /* telemetria é best-effort — silenciar qualquer erro */
  }
}
