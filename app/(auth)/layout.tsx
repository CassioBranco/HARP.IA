import ThemeToggle from '@/components/ThemeToggle'
import './auth.css'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="auth-shell">
      <div className="auth-theme"><ThemeToggle /></div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
