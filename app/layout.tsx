import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  // fonte variável: sem restrição de peso (o painel usa 500–800).
})

export const metadata: Metadata = {
  title: 'HARPIA',
  description: 'Plataforma de sites com SEO, GEO e AEO para negócios locais',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
