import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// ============================================================
// GET /api/onboarding/cities?q=soro
// Autocomplete de cidade brasileira. Proxy server-side do Nominatim
// (OpenStreetMap) com User-Agent próprio — evita o rate-limit/CORS
// que o cliente sofre e força resultados BR em PT-BR.
// ============================================================

interface CityResult {
  name: string
  state: string
  lat: number
  lng: number
}

interface NominatimItem {
  lat: string
  lon: string
  name?: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
  }
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  if (q.length < 2) return Response.json({ results: [] })

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('countrycodes', 'br')
  url.searchParams.set('featuretype', 'city')
  url.searchParams.set('accept-language', 'pt-BR')
  url.searchParams.set('limit', '8')

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'HARPIA/1.0 (onboarding city search)',
        'Accept-Language': 'pt-BR',
      },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return Response.json({ results: [] })

    const data = (await res.json()) as NominatimItem[]
    const seen = new Set<string>()
    const results: CityResult[] = []

    for (const item of data) {
      const a = item.address ?? {}
      const name = a.city ?? a.town ?? a.village ?? a.municipality ?? item.name
      const state = a.state ?? ''
      if (!name) continue
      const key = `${name}|${state}`.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      results.push({ name, state, lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
    }

    return Response.json({ results }, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    return Response.json({ results: [] }, { status: 200 })
  }
}
