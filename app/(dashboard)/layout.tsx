import Link from 'next/link'
import { LogoutButton } from '@/components/draft/LogoutButton'
import { hasSupabaseEnv } from '@/lib/env'
import { createServerClient } from '@/lib/supabase/server'

const NAV = [
  { href: '/sites',    label: 'Meus sites',     icon: '🌐' },
  { href: '/blog',     label: 'Blog',            icon: '✍️' },
  { href: '/editor',   label: 'Editor',          icon: '🎨' },
  { href: '/settings', label: 'Configurações',   icon: '⚙️' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Tenta buscar email do usuário para exibir no sidebar
  let userEmail = ''
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createServerClient()
      const { data } = await supabase.auth.getUser()
      userEmail = data.user?.email ?? ''
    } catch {
      // silencioso — não travar o layout por erro de auth
    }
  }

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        {/* Logo */}
        <div className="border-b border-border px-6 py-5">
          <Link href="/sites" className="font-heading text-lg font-bold text-primary">
            HARPIA
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {NAV.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/onboarding"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="text-base">🚀</span>
                Novo site
              </Link>
            </li>
          </ul>
        </nav>

        {/* Usuário + plano */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {userEmail || 'Usuário'}
              </p>
              <p className="text-[10px] text-muted-foreground">Trial Pro · 7 dias</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Link href="/sites" className="font-heading text-base font-bold text-primary">
            HARPIA
          </Link>
          <div className="flex items-center gap-3">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg"
                title={item.label}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}
