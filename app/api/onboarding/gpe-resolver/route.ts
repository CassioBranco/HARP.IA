// ============================================================
// ANCOREO — POST /api/onboarding/gpe-resolver (item 5.2).
//
// Abre o link curto que o dono colou (g.co/kgs, maps.app.goo.gl) e
// devolve o que dá pra ler do endereço final: nome do lugar e o
// identificador do perfil.
//
// O QUE ESTA ROTA PROVA E O QUE NÃO PROVA (medido em 07/08/2026):
//   - Link curto que não existe responde 404. Isso a rota pega, e é a
//     única checagem dura possível hoje sem a Business Profile API.
//   - Link completo de negócio inexistente responde 200 igual ao de um
//     real. Então a rota NÃO diz "este perfil existe". Ela lê o link e
//     devolve pro painel mostrar no mapa, pra quem confirma ser o dono.
//
// Não escreve nada no banco: quem salva é o autosave do onboarding,
// depois que o dono confirmar que é o negócio dele.
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { assertUrlIsPublic, isSsrfBlocked } from '@/lib/net/safe-fetch'
import { lerLinkGpe, identificadorDoPerfil, type LeituraGpe } from '@/lib/seo/gpe-link'

export const runtime = 'nodejs'
export const maxDuration = 15

// Só seguimos redirecionamento que continua dentro do Google. Um
// encurtador do Google apontando pra fora não é perfil de empresa, é
// outra coisa — e não é papel desta rota buscar essa outra coisa.
const SUFIXOS_GOOGLE = ['.google.com', '.google.com.br', '.goo.gl', '.g.co', '.share.google']
function ehDoGoogle(host: string): boolean {
  const h = host.toLowerCase()
  return h === 'google.com' || h === 'g.co' || h === 'goo.gl' || h === 'share.google'
      || SUFIXOS_GOOGLE.some(s => h.endsWith(s))
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

/** Segue os redirecionamentos do encurtador e devolve o endereço final. */
async function expandir(url: string): Promise<{ final: string; status: number }> {
  let atual = url
  for (let hop = 0; hop < 6; hop++) {
    const u = await assertUrlIsPublic(atual)
    if (!ehDoGoogle(u.hostname)) throw new Error('saiu_do_google')

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 6000)
    let res: Response
    try {
      res = await fetch(atual, {
        method: 'GET',
        redirect: 'manual',
        signal: ctrl.signal,
        headers: { 'user-agent': UA, 'accept-language': 'pt-BR' },
      })
    } finally {
      clearTimeout(timer)
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return { final: atual, status: res.status }
      atual = new URL(loc, atual).toString()
      continue
    }
    return { final: atual, status: res.status }
  }
  return { final: atual, status: 0 }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const body = await req.json().catch(() => null) as { link?: string } | null
  const bruto = (body?.link ?? '').trim()
  if (!bruto) return Response.json({ error: 'link é obrigatório' }, { status: 400 })
  if (bruto.length > 2048) return Response.json({ error: 'Link grande demais.' }, { status: 400 })

  let leitura: LeituraGpe = lerLinkGpe(bruto)

  if (leitura.precisaExpandir) {
    try {
      const { final, status } = await expandir(leitura.url)
      if (status === 404 || status === 410) {
        return Response.json({
          ok: false,
          motivo: 'link_morto',
          erro: 'Esse link não abre mais. Abra seu perfil no Google, toque em Compartilhar e copie o link de novo.',
        })
      }
      const expandida = lerLinkGpe(final)
      // Se o link curto levou a um lugar, vale o que veio de lá. Se levou
      // a uma busca ou a página genérica, ficamos com o curto mesmo e o
      // dono confirma pelo mapa.
      if (expandida.tipo === 'mapa') leitura = expandida
      else leitura = { ...leitura, url: final, tipo: expandida.tipo === 'busca' ? 'busca' : leitura.tipo, precisaExpandir: false }
    } catch (e) {
      if (isSsrfBlocked(e)) {
        return Response.json({ ok: false, motivo: 'bloqueado', erro: 'Não consegui abrir esse link com segurança.' })
      }
      // Rede instável não pode travar o onboarding: devolve o que já se
      // sabe e deixa o dono seguir confirmando pelo mapa.
      return Response.json({
        ok: true,
        incerto: true,
        leitura,
        identificador: identificadorDoPerfil(leitura),
      })
    }
  }

  return Response.json({
    ok: leitura.tipo === 'mapa' || leitura.tipo === 'curto',
    leitura,
    identificador: identificadorDoPerfil(leitura),
  })
}
