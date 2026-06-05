'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function ConfirmeEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Monitora se o usuário já confirmou (polling leve a cada 5s)
  useEffect(() => {
    if (confirmed) return
    const check = async () => {
      try {
        const supabase = createBrowserClient()
        const { data } = await supabase.auth.getSession()
        if (data.session) setConfirmed(true)
      } catch { /* ignora */ }
    }
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [confirmed])

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      const supabase = createBrowserClient()
      await supabase.auth.resend({ type: 'signup', email })
      setResent(true)
      setTimeout(() => setResent(false), 30000) // reset após 30s
    } finally {
      setResending(false)
    }
  }

  // Conta confirmada — mostra tela de sucesso
  if (confirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading mb-2 text-2xl font-bold text-foreground">
              Email confirmado!
            </h2>
            <p className="mb-6 text-muted-foreground text-sm">
              Sua conta está ativa. Clique abaixo para entrar.
            </p>
            <Link
              href="/login"
              className="block w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Entrar na minha conta →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">

          {/* Ícone de email */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="font-heading mb-2 text-2xl font-bold text-foreground">
            Confirme seu email
          </h2>
          <p className="text-muted-foreground text-sm">
            Enviamos um link de confirmação para
          </p>
          {email && (
            <p className="mt-1 mb-6 font-semibold text-foreground">{email}</p>
          )}

          {/* Passos */}
          <div className="mb-6 rounded-xl bg-muted/50 p-4 text-left space-y-3">
            {[
              'Abra o email na sua caixa de entrada',
              'Clique em "Confirmar email" no link que enviamos',
              'A página vai atualizar automaticamente quando confirmado',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground pt-0.5">{text}</span>
              </div>
            ))}
          </div>

          {/* Indicador aguardando */}
          <div className="mb-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Aguardando confirmação…
          </div>

          <Link
            href="/login"
            className="block w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Já confirmei — ir para o login
          </Link>

          {/* Reenviar */}
          <div className="mt-5 border-t border-border pt-5 space-y-1">
            <p className="text-xs text-muted-foreground">
              Não recebeu? Verifique o spam ou
            </p>
            {resent ? (
              <p className="text-xs font-medium text-primary">✓ Email reenviado com sucesso!</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending || !email}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                {resending ? 'Reenviando…' : 'reenvie o email de confirmação'}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Criou com o email errado?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Tente de novo
          </Link>
        </p>
      </div>
    </div>
  )
}
