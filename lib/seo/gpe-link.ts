// ============================================================
// ANCOREO — Leitura de link do Google Perfil de Empresa (item 5.2).
//
// Funções PURAS. Nada aqui fala com rede: recebe o texto que o dono
// colou e devolve o que dá pra saber lendo o próprio link.
//
// O QUE DÁ E O QUE NÃO DÁ PRA SABER (medido em 07/08/2026):
//
// - Link curto morto (g.co/kgs, maps.app.goo.gl) responde 404. Então
//   expandir link curto É uma checagem de verdade, e ela mora na rota
//   /api/onboarding/gpe-resolver, não aqui.
// - Link completo de um negócio que NÃO existe responde 200 igualzinho
//   ao de um que existe. Buscar o nome na busca interna do Maps também
//   não serve: nome inventado casa com um negócio real perto. Ou seja,
//   NÃO existe como o servidor provar sozinho que o perfil é do cliente
//   sem a Business Profile API (pedido protocolado, caso 1-5531000041573).
//
// Por isso a confirmação do 5.2 é VISUAL: o painel mostra o mapa do que
// ele colou e pergunta "é este o seu negócio?". Quem confirma é o dono,
// que é a única parte desta conversa que sabe a resposta. É mais honesto
// que um palpite de servidor e não quebra quando o Google mexe no HTML.
// ============================================================

export type TipoDeLink =
  | 'vazio'          // nada colado ainda
  | 'curto'          // g.co/kgs, maps.app.goo.gl: precisa expandir no servidor
  | 'mapa'           // URL completa do Maps: dá pra ler nome e/ou id
  | 'busca'          // URL do Maps, mas de busca e não de um lugar
  | 'nao_e_google'   // não é link do Google

export type LeituraGpe = {
  tipo: TipoDeLink
  url: string                 // normalizada (com https://)
  nome: string | null         // nome do lugar quando está no caminho da URL
  cid: string | null          // identificador do lugar (formato 0x...:0x... ou decimal)
  placeId: string | null      // ChIJ... quando o link traz
  precisaExpandir: boolean
}

// Hosts que o Google usa pra encurtar. Um link destes não diz nada sem
// ser aberto: o nome do lugar só aparece depois do redirecionamento.
const HOSTS_CURTOS = new Set([
  'g.co',
  'goo.gl',
  'maps.app.goo.gl',
  'share.google',
])

const HOSTS_MAPA = new Set([
  'maps.google.com',
  'www.google.com',
  'google.com',
  'maps.google.com.br',
  'www.google.com.br',
  'google.com.br',
])

/** Aceita o que o dono colar: com ou sem https, com espaço sobrando. */
function normalizar(bruto: string): URL | null {
  const t = bruto.trim()
  if (!t) return null
  const comEsquema = /^https?:\/\//i.test(t) ? t : `https://${t}`
  try {
    return new URL(comEsquema)
  } catch {
    return null
  }
}

/** "Padaria+do+Zé" no caminho da URL vira "Padaria do Zé". */
function nomeDoCaminho(pathname: string): string | null {
  const m = pathname.match(/\/maps\/place\/([^/@]+)/)
  if (!m?.[1]) return null
  try {
    const cru = decodeURIComponent(m[1].replace(/\+/g, ' ')).trim()
    // "?" é o placeholder que o Google usa quando não tem nome no link.
    if (!cru || cru === '?' || /^@/.test(cru)) return null
    return cru
  } catch {
    return null
  }
}

export function lerLinkGpe(bruto: string): LeituraGpe {
  const vazio: LeituraGpe = {
    tipo: 'vazio', url: '', nome: null, cid: null, placeId: null, precisaExpandir: false,
  }
  const u = normalizar(bruto)
  if (!u) return bruto.trim() ? { ...vazio, tipo: 'nao_e_google', url: bruto.trim() } : vazio

  const host = u.hostname.toLowerCase().replace(/^m\./, '')

  if (HOSTS_CURTOS.has(host)) {
    return { tipo: 'curto', url: u.toString(), nome: null, cid: null, placeId: null, precisaExpandir: true }
  }

  if (!HOSTS_MAPA.has(host)) {
    return { tipo: 'nao_e_google', url: u.toString(), nome: null, cid: null, placeId: null, precisaExpandir: false }
  }

  const q = u.searchParams
  const nome = nomeDoCaminho(u.pathname)

  // place_id chega de dois jeitos: ?place_id=X ou ?q=place_id:X
  const placeId =
    q.get('place_id') ??
    q.get('q')?.match(/^place_id:(.+)$/)?.[1] ??
    u.pathname.match(/!1s(ChIJ[\w-]+)/)?.[1] ??
    null

  // cid aparece como ?cid=123 (decimal) ou dentro do !1s0x…:0x… do caminho
  const cid =
    q.get('cid') ??
    u.pathname.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i)?.[1] ??
    null

  const ehLugar = u.pathname.includes('/maps/place') || !!placeId || !!cid
  if (!ehLugar) {
    const ehMapa = u.pathname.includes('/maps') || host.startsWith('maps.')
    return {
      tipo: ehMapa ? 'busca' : 'nao_e_google',
      url: u.toString(), nome: null, cid: null, placeId: null, precisaExpandir: false,
    }
  }

  return { tipo: 'mapa', url: u.toString(), nome, cid, placeId, precisaExpandir: false }
}

/**
 * O que guardar em onboarding_profiles.gbp_place_id.
 *
 * A coluna existe desde o schema inicial e NADA no código escrevia nela.
 * Guardar o identificador agora é o que permite, quando o acesso à API
 * sair, ligar o perfil sem pedir nada de novo ao cliente.
 */
export function identificadorDoPerfil(l: LeituraGpe): string | null {
  return l.placeId ?? l.cid ?? null
}

/**
 * URL do mapa pra mostrar dentro de um iframe.
 *
 * Este embed não pede chave de API e não manda X-Frame-Options, então
 * roda em iframe. Serve pra UMA coisa: o dono bater o olho e dizer se
 * é o negócio dele. Não é medição nem prova.
 */
export function urlDeMapaEmbed(l: LeituraGpe, buscaAlternativa?: string): string | null {
  const alvo =
    (l.placeId ? `place_id:${l.placeId}` : null) ??
    (l.cid ? `cid:${l.cid}` : null) ??
    l.nome ??
    (buscaAlternativa?.trim() || null)
  if (!alvo) return null
  return `https://maps.google.com/maps?q=${encodeURIComponent(alvo)}&hl=pt-BR&z=16&output=embed`
}

/** Busca pronta pra quem não sabe se tem perfil. A maioria tem e não sabe. */
export function urlDeBuscaNoGoogle(nomeDoNegocio: string, cidade?: string | null): string {
  const termo = [nomeDoNegocio, cidade].filter(Boolean).join(' ').trim()
  return `https://www.google.com/maps/search/${encodeURIComponent(termo)}`
}

/** Mensagem de erro pro que o dono colou. null = está bom. */
export function problemaDoLink(l: LeituraGpe): string | null {
  switch (l.tipo) {
    case 'vazio':
      return null
    case 'nao_e_google':
      return 'Esse link não é do Google. Abra seu perfil no Google, toque em Compartilhar e cole o link aqui.'
    case 'busca':
      return 'Esse link é de uma busca no mapa, não de um perfil. Abra o seu negócio no mapa e copie o link de lá.'
    default:
      return null
  }
}
