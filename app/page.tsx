import Link from 'next/link'
import { hasSupabaseEnv } from '@/lib/env'
import { createServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  let dbStatus: 'ok' | 'empty_env' | 'error' = 'empty_env'
  let sessionLabel = ''

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createServerClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        dbStatus = 'error'
      } else {
        dbStatus = 'ok'
        sessionLabel = data.session
          ? `autenticado (${data.session.user.email ?? data.session.user.id})`
          : 'sem sessão (normal antes do login)'
      }
    } catch {
      dbStatus = 'error'
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-8">
      <div>
        <p className="text-sm text-muted-foreground">Projeto HARPIA — dev</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Fundação Next.js 14
        </h1>
        <p className="mt-2 text-muted-foreground">
          App Router, TypeScript estrito, Tailwind, shadcn/ui (New York +
          Slate), Supabase SSR.
        </p>
      </div>

      <div className="rounded-lg border p-4 text-sm">
        <p className="font-medium">Conexão Supabase</p>
        {dbStatus === 'empty_env' && (
          <p className="mt-1 text-muted-foreground">
            Preencha as chaves em <code>.env.local</code> e reinicie{' '}
            <code>npm run dev</code>.
          </p>
        )}
        {dbStatus === 'ok' && (
          <p className="mt-1 text-green-700 dark:text-green-400">
            Conectado ao projeto Supabase. {sessionLabel}
          </p>
        )}
        {dbStatus === 'error' && (
          <p className="mt-1 text-destructive">
            Erro ao consultar o banco. Verifique URL, anon key e RLS.
          </p>
        )}
      </div>

      <nav className="flex flex-wrap gap-4 text-sm">
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
        <Link href="/signup" className="underline underline-offset-4">
          Cadastro
        </Link>
        <Link href="/onboarding" className="underline underline-offset-4">
          Onboarding
        </Link>
        <Link href="/api/health" className="underline underline-offset-4">
          API health
        </Link>
      </nav>
    </main>
  )
}
