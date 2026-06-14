'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ensureProfileOnClient } from '@/lib/auth/client'
import { createBrowserClient } from '@/lib/supabase/client'
import { GoogleButton } from '../GoogleButton'

// ---------------------------------------------------------------------------
// Eye icon
// ---------------------------------------------------------------------------
function EyeIcon({ open }: { open: boolean }) {
  if (open) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Força de senha com checklist de requisitos
// ---------------------------------------------------------------------------
const REQS = [
  { id: 'len',    label: 'Mínimo 8 caracteres',          test: (p: string) => p.length >= 8 },
  { id: 'upper',  label: 'Pelo menos 1 letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: 'Pelo menos 1 número',          test: (p: string) => /[0-9]/.test(p) },
  { id: 'symbol', label: 'Pelo menos 1 símbolo (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function getScore(pwd: string) {
  return REQS.filter(r => r.test(pwd)).length
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const score = getScore(password)
  const level = score <= 1 ? 'Fraca' : score <= 2 ? 'Média' : score === 3 ? 'Boa' : 'Forte'
  const barColor =
    score <= 1 ? 'bg-red-500' :
    score <= 2 ? 'bg-yellow-500' :
    score === 3 ? 'bg-blue-500' :
    'bg-green-500'
  const textColor =
    score <= 1 ? 'text-red-600' :
    score <= 2 ? 'text-yellow-600' :
    score === 3 ? 'text-blue-600' :
    'text-green-600'

  return (
    <div className="mt-2.5 space-y-2.5 rounded-lg border border-border bg-muted/40 p-3">
      {/* Barra de força */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? barColor : 'bg-muted'}`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${textColor}`}>{level}</span>
      </div>

      {/* Requisitos */}
      <ul className="space-y-1">
        {REQS.map(r => {
          const ok = r.test(password)
          return (
            <li key={r.id} className="flex items-center gap-2">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                ok ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
              }`}>
                {ok ? '✓' : '·'}
              </span>
              <span className={`text-xs transition-colors ${ok ? 'text-foreground' : 'text-muted-foreground'}`}>
                {r.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared input style
// ---------------------------------------------------------------------------
const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ' +
  'text-foreground placeholder:text-muted-foreground ' +
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ' +
  'disabled:opacity-50 transition-colors'

// ---------------------------------------------------------------------------
// Page — auth layout já centraliza, não precisa re-envolver
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter()
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        const m = authError.message.toLowerCase()
        setError(
          m.includes('invalid login credentials') ? 'Email ou senha incorretos.' :
          m.includes('email not confirmed')        ? 'Email não confirmado. Verifique sua caixa de entrada.' :
          `Erro: ${authError.message}`
        )
        return
      }
      try { await ensureProfileOnClient() } catch { /* ignora */ }
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next?.startsWith('/') ? next : '/sites')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Cabeçalho */}
      <div className="mb-8 text-center">
        <Link href="/" className="font-heading text-2xl font-bold text-primary">
          HARPIA
        </Link>
        <h1 className="font-heading mt-5 text-2xl font-bold text-foreground">
          Entrar na conta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Criar grátis
          </Link>
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        {/* Login social */}
        <GoogleButton next="/sites" label="Entrar com Google" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={inputCls}
              disabled={loading}
            />
          </div>

          {/* Senha + eye toggle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <Link href="/reset" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Esqueci a senha
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pr-11`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-muted-foreground hover:text-foreground transition-colors"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {/* Força de senha */}
            <PasswordStrength password={password} />
          </div>

          {/* Erro */}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </>
  )
}
