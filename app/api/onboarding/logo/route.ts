import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// ============================================================
// POST /api/onboarding/logo  (multipart: file)
// Upload da logo no onboarding (tela-logo.html). Gera:
//   - logo_url  (WebP otimizado, ou o original p/ SVG)
//   - favicon_url (PNG 64x64)
//   - paleta    (cor dominante extraída → primary + derivadas)
// Escopo por usuário/tenant (ainda não há site_id nesta etapa).
// ============================================================

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

// Clareia/escurece um canal pra derivar accent/bg a partir da cor dominante.
function shade(r: number, g: number, b: number, factor: number) {
  return { r: r + (255 - r) * factor, g: g + (255 - g) * factor, b: b + (255 - b) * factor }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = userData?.tenant_id

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'Arquivo obrigatório' }, { status: 400 })
  if (!ACCEPTED.includes(file.type)) {
    return Response.json({ error: 'Formato inválido. Use PNG, JPG, WEBP ou SVG.' }, { status: 415 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const isSvg = file.type === 'image/svg+xml'
  const base = `logos/${user.id}/${Date.now()}`

  let logoBuffer: Buffer<ArrayBufferLike> = buffer
  let logoPath = `${base}.svg`
  let logoContentType = file.type
  let faviconBuffer: Buffer<ArrayBufferLike> | null = null
  let paleta: Record<string, string> | undefined

  if (!isSvg) {
    try {
      const sharp = (await import('sharp')).default

      // Logo em WebP (mantém transparência, cabe em 512px)
      logoBuffer = await sharp(buffer)
        .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90, effort: 4 })
        .toBuffer()
      logoPath = `${base}.webp`
      logoContentType = 'image/webp'

      // Favicon 64x64 PNG
      faviconBuffer = await sharp(buffer)
        .resize({ width: 64, height: 64, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()

      // Paleta: cor dominante → primary + accent (clara) + bg (bem clara)
      const { dominant } = await sharp(buffer).stats()
      const { r, g, b } = dominant
      const accent = shade(r, g, b, 0.25)
      const bg = shade(r, g, b, 0.92)
      paleta = {
        primary: toHex(r, g, b),
        accent: toHex(accent.r, accent.g, accent.b),
        bg: toHex(bg.r, bg.g, bg.b),
      }
    } catch {
      // Sharp falhou — sobe o original sem favicon/paleta (degradação graciosa)
      logoBuffer = buffer
      logoPath = `${base}.${file.name.split('.').pop() ?? 'png'}`
      logoContentType = file.type
    }
  }

  // ── Upload ────────────────────────────────────────────────
  const { error: logoErr } = await supabase.storage
    .from('images')
    .upload(logoPath, logoBuffer, { contentType: logoContentType, upsert: false })
  if (logoErr) return Response.json({ error: 'Falha no upload da logo' }, { status: 500 })

  const { data: { publicUrl: logo_url } } = supabase.storage.from('images').getPublicUrl(logoPath)

  let favicon_url: string | null = null
  if (faviconBuffer) {
    const faviconPath = `${base}_favicon.png`
    const { error: favErr } = await supabase.storage
      .from('images')
      .upload(faviconPath, faviconBuffer, { contentType: 'image/png', upsert: false })
    if (!favErr) {
      favicon_url = supabase.storage.from('images').getPublicUrl(faviconPath).data.publicUrl
    }
  }

  // Persiste no perfil mais recente do usuário (RLS garante posse)
  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (profile?.id) {
    await supabase
      .from('onboarding_profiles')
      .update({ logo_url, favicon_url, paleta, tenant_id: tenantId })
      .eq('id', profile.id)
  }

  return Response.json({ logo_url, favicon_url, paleta })
}
