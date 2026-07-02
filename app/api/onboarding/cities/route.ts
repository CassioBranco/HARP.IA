import { NextRequest } from 'next/server'
import MUNICIPIOS from '@/lib/data/municipios-br.json'

export const runtime = 'nodejs'

// ============================================================
// GET /api/onboarding/cities?q=chapec
// Autocomplete de cidade brasileira sobre a lista oficial do IBGE
// (5.571 municípios, asset local em lib/data/municipios-br.json).
// Busca com normalização de acento e ranking prefixo > contém —
// "chapec", "Chapec" e "chapecó" acham "Chapecó, SC" igualmente.
// (Substitui o proxy do Nominatim, que é geocoder e não fazia
// autocomplete: digitação parcial retornava vazio, além de
// depender de serviço externo com rate-limit. Bug N2-1.)
// ============================================================

type Row = [string, string] // [nome, UF]

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// índice normalizado calculado uma vez por processo
const INDEX: { name: string; state: string; key: string }[] = (MUNICIPIOS as Row[]).map(
  ([name, state]) => ({ name, state, key: norm(name) })
)

export async function GET(req: NextRequest) {
  const q = norm((req.nextUrl.searchParams.get('q') ?? '').trim())
  if (q.length < 2) return Response.json({ results: [] })

  const starts: { name: string; state: string }[] = []
  const contains: { name: string; state: string }[] = []
  for (const m of INDEX) {
    if (m.key.startsWith(q)) starts.push({ name: m.name, state: m.state })
    else if (m.key.includes(q)) contains.push({ name: m.name, state: m.state })
    if (starts.length >= 8) break
  }
  const results = [...starts, ...contains].slice(0, 8)

  return Response.json(
    { results },
    { headers: { 'Cache-Control': 'public, max-age=86400' } }
  )
}
