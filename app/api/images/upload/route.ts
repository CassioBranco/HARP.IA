import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS } from '@/lib/claude/client'

export const runtime = 'nodejs'
export const maxDuration = 30

// Mapa de cidades brasileiras → coordenadas GPS aproximadas
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'sorocaba': { lat: -23.5015, lng: -47.4526 },
  'campinas': { lat: -22.9068, lng: -47.0626 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'belo horizonte': { lat: -19.9191, lng: -43.9386 },
  'curitiba': { lat: -25.4284, lng: -49.2733 },
  'porto alegre': { lat: -30.0346, lng: -51.2177 },
  'salvador': { lat: -12.9714, lng: -38.5014 },
  'recife': { lat: -8.0476, lng: -34.877 },
  'fortaleza': { lat: -3.7172, lng: -38.5433 },
  'manaus': { lat: -3.119, lng: -60.0217 },
  'brasília': { lat: -15.7801, lng: -47.9292 },
}

function getCityCoords(city: string): { lat: number; lng: number } {
  const key = city.toLowerCase().trim()
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  // Default: São Paulo se cidade não encontrada
  return { lat: -23.5505, lng: -46.6333 }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const siteId = formData.get('site_id') as string | null
  const niche = formData.get('niche') as string | null

  if (!file || !siteId) {
    return Response.json({ error: 'Arquivo e site_id são obrigatórios' }, { status: 400 })
  }

  // Verifica se o site pertence ao usuário
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { data: site } = await supabase
    .from('sites')
    .select('id,city:onboarding_profiles(city)')
    .eq('id', siteId)
    .eq('tenant_id', userData?.tenant_id ?? '')
    .single()

  if (!site) return new Response('Site não encontrado', { status: 404 })

  // Lê o arquivo
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Importa Sharp dinamicamente (não disponível em Edge)
  const sharp = (await import('sharp')).default

  // Obtém dimensões originais
  const meta = await sharp(buffer).metadata()
  const originalWidth = meta.width ?? 1200
  const originalHeight = meta.height ?? 800

  // Converte para WebP otimizado
  const webpBuffer = await sharp(buffer)
    .resize({
      width: Math.min(originalWidth, 1920),
      height: Math.min(originalHeight, 1080),
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85, effort: 4 })
    .toBuffer()

  const { width = originalWidth, height = originalHeight } = await sharp(webpBuffer).metadata()

  // Obtém cidade do perfil de onboarding
  const siteData = site as unknown as { city?: string }
  const cityName = siteData.city ?? 'São Paulo'
  const coords = getCityCoords(cityName)

  // Gera alt text via Claude Vision (Haiku — mais barato pra análise)
  let altText = `Foto de ${niche ?? 'negócio'} em ${cityName}`
  try {
    const anthropic = getAnthropicClient()
    const base64 = webpBuffer.toString('base64')
    const response = await anthropic.messages.create({
      model: MODELS.audit,
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/webp', data: base64 },
          },
          {
            type: 'text',
            text: `Escreva um alt text SEO para esta imagem de um negócio do tipo "${niche ?? 'serviços'}" localizado em ${cityName}.
Regras:
- 80 a 140 caracteres
- Sem prefixo "Foto de" ou "Imagem de"
- Inclua a cidade ${cityName}
- Descreva o que está na imagem de forma específica
- Tom: profissional
Responda APENAS o alt text, sem aspas, sem explicações.`,
          },
        ],
      }],
    })
    const rawAlt = response.content[0]?.type === 'text' ? response.content[0].text.trim() : ''
    if (rawAlt.length >= 20) altText = rawAlt
  } catch {
    // mantém o alt text de fallback
  }

  // Salva no Supabase Storage
  const originalExt = file.name.split('.').pop() ?? 'jpg'
  const timestamp = Date.now()
  const originalPath = `sites/${siteId}/${timestamp}_original.${originalExt}`
  const webpPath = `sites/${siteId}/${timestamp}.webp`

  const { error: origErr } = await supabase.storage
    .from('images')
    .upload(originalPath, buffer, { contentType: file.type, upsert: false })

  const { error: webpErr } = await supabase.storage
    .from('images')
    .upload(webpPath, webpBuffer, { contentType: 'image/webp', upsert: false })

  if (origErr || webpErr) {
    return Response.json({ error: 'Falha no upload para storage' }, { status: 500 })
  }

  const { data: { publicUrl: originalUrl } } = supabase.storage.from('images').getPublicUrl(originalPath)
  const { data: { publicUrl: webpUrl } } = supabase.storage.from('images').getPublicUrl(webpPath)

  // Salva metadados na tabela images
  const { data: imageRecord, error: dbErr } = await supabase
    .from('images')
    .insert({
      site_id: siteId,
      original_url: originalUrl,
      webp_url: webpUrl,
      alt_text: altText,
      width,
      height,
      gps_lat: coords.lat,
      gps_lng: coords.lng,
      city: cityName,
    })
    .select('id,original_url,webp_url,alt_text,width,height')
    .single()

  if (dbErr || !imageRecord) {
    return Response.json({ error: 'Falha ao salvar metadados' }, { status: 500 })
  }

  return Response.json(imageRecord)
}
