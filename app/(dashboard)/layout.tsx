import Link from 'next/link'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4">
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/onboarding">Onboarding</Link>
          <Link href="/sites">Sites</Link>
          <Link href="/editor">Editor</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/settings">Configurações</Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
