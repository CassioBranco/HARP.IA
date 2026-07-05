// ============================================================
// Envio de e-mail transacional via API HTTP do Resend.
// Módulo DORMENTE: liga sozinho quando RESEND_API_KEY existir no ambiente;
// sem a chave, sendEmail retorna { sent: false, reason: 'unconfigured' } —
// nunca lança, então a request que disparou o e-mail segue normal.
// Dependency-free: usa o fetch global, sem o pacote `resend`.
// Doc: https://resend.com/docs/api-reference/emails/send-email
// ============================================================

const RESEND_API = 'https://api.resend.com/emails'

/** True quando RESEND_API_KEY está no ambiente (módulo "acordado"). */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

// Remetente padrão; RESEND_FROM permite trocar sem redeploy de código.
function from(): string {
  return process.env.RESEND_FROM || 'ANCOREO <nao-responda@ancoreo.com.br>'
}

/**
 * Envia um e-mail via Resend. Degrada graciosamente:
 * - sem RESEND_API_KEY → { sent: false, reason: 'unconfigured' }
 * - status não-2xx ou erro de rede → { sent: false, reason }
 * NUNCA lança — seguro pra chamar de qualquer rota sem try/catch.
 */
export async function sendEmail(input: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<{ sent: boolean; reason?: string }> {
  if (!isEmailConfigured()) return { sent: false, reason: 'unconfigured' }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from(),
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return { sent: false, reason: `resend ${res.status} ${detail.slice(0, 200)}`.trim() }
    }
    return { sent: true }
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : 'erro desconhecido' }
  }
}
