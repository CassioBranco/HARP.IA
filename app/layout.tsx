import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Fraunces, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import ConsentBanner from './ConsentBanner'

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

// Núcleo ANCOREO (docs/DESIGN-NUCLEO.md): display serif vintage p/ títulos
// das superfícies públicas + mono p/ rótulos técnicos de "carta náutica".
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ANCOREO',
  description: 'Plataforma de sites com SEO, GEO e AEO para negócios locais',
}

// Aplica o tema salvo (aco_theme) ou o do sistema ANTES da pintura — evita flash.
// Inline e minificado de propósito; roda uma vez por carga de página.
const THEME_INIT = `try{var t=localStorage.getItem('aco_theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${fraunces.variable} ${plexMono.variable}`}
    >
      <body className={inter.className}>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
        <ConsentBanner />
      </body>
    </html>
  )
}
