// ============================================================
// Checagem da leitura de link do Google Perfil de Empresa (item 5.2).
//
// Roda com: npx tsx scripts/check-gpe-link.ts
//
// Existe porque link é texto colado por gente apressada: vem com espaço,
// sem https, do celular, do desktop, encurtado, de busca em vez de lugar.
// Errar aqui é aceitar lixo em silêncio ou recusar link bom, e nos dois
// casos o cliente só descobre semanas depois. O repo não tem test runner,
// então isto é um script como o estado.mjs, não uma suíte.
// ============================================================
import { lerLinkGpe, identificadorDoPerfil, urlDeMapaEmbed, urlDeBuscaNoGoogle, problemaDoLink } from '../lib/seo/gpe-link'

let falhas = 0
function ok(rotulo: string, real: unknown, esperado: unknown) {
  const bate = JSON.stringify(real) === JSON.stringify(esperado)
  if (!bate) falhas++
  console.log(`${bate ? 'ok  ' : 'FALHOU'} ${rotulo}${bate ? '' : `\n       esperado ${JSON.stringify(esperado)}\n       veio     ${JSON.stringify(real)}`}`)
}

console.log('— tipo do link —')
ok('vazio', lerLinkGpe('   ').tipo, 'vazio')
ok('encurtador g.co', lerLinkGpe('https://g.co/kgs/abc123').tipo, 'curto')
ok('encurtador maps.app', lerLinkGpe('https://maps.app.goo.gl/abc').tipo, 'curto')
ok('sem https vira curto', lerLinkGpe('g.co/kgs/abc123').tipo, 'curto')
ok('com espaço em volta', lerLinkGpe('  https://g.co/kgs/abc  ').tipo, 'curto')
ok('site qualquer', lerLinkGpe('https://meunegocio.com.br').tipo, 'nao_e_google')
ok('facebook', lerLinkGpe('https://facebook.com/meunegocio').tipo, 'nao_e_google')
ok('texto que não é URL', lerLinkGpe('meu perfil do google').tipo, 'nao_e_google')
ok('busca no maps', lerLinkGpe('https://www.google.com/maps/search/padaria+sorocaba').tipo, 'busca')
ok('lugar no maps', lerLinkGpe('https://www.google.com/maps/place/Padaria+do+Ze/@-23.5,-47.4,17z').tipo, 'mapa')

console.log('\n— o que dá pra ler do link —')
const comNome = lerLinkGpe('https://www.google.com/maps/place/Padaria+do+Z%C3%A9/@-23.5,-47.4,17z')
ok('nome sai do caminho', comNome.nome, 'Padaria do Zé')
ok('encurtador precisa expandir', lerLinkGpe('https://g.co/kgs/abc').precisaExpandir, true)
ok('link completo não precisa', comNome.precisaExpandir, false)

const comPlaceId = lerLinkGpe('https://www.google.com/maps/place/?q=place_id:ChIJN1t_tDeuEmsRUsoyG83frY4')
ok('place_id em q=place_id:', comPlaceId.placeId, 'ChIJN1t_tDeuEmsRUsoyG83frY4')
ok('place_id vira identificador', identificadorDoPerfil(comPlaceId), 'ChIJN1t_tDeuEmsRUsoyG83frY4')

const comCid = lerLinkGpe('https://maps.google.com/?cid=10720126916433874521')
ok('cid como parâmetro', comCid.cid, '10720126916433874521')
ok('cid vira identificador', identificadorDoPerfil(comCid), '10720126916433874521')

const comHex = lerLinkGpe('https://www.google.com/maps/place/Loja/@-23.5,-47.4,17z/data=!3m1!4b1!4m5!3m4!1s0x94cf5f0b:0xdeadbeef!8m2!3d-23.5!4d-47.4')
ok('cid hex no caminho', comHex.cid, '0x94cf5f0b:0xdeadbeef')
ok('link sem id nenhum', identificadorDoPerfil(comNome), null)

console.log('\n— mapa de conferência —')
ok(
  'prefere place_id',
  urlDeMapaEmbed(comPlaceId),
  'https://maps.google.com/maps?q=place_id%3AChIJN1t_tDeuEmsRUsoyG83frY4&hl=pt-BR&z=16&output=embed',
)
ok('cai no nome quando não tem id', urlDeMapaEmbed(comNome)?.includes('Padaria%20do%20Z%C3%A9'), true)
ok('usa a busca alternativa em último caso', urlDeMapaEmbed(lerLinkGpe('https://g.co/kgs/x'), 'Padaria Sorocaba')?.includes('Padaria%20Sorocaba'), true)
ok('sem nada pra mostrar devolve null', urlDeMapaEmbed(lerLinkGpe('https://g.co/kgs/x')), null)
ok('busca alternativa em branco não vale', urlDeMapaEmbed(lerLinkGpe('https://g.co/kgs/x'), '   '), null)

console.log('\n— procurar o negócio no Google —')
ok(
  'nome + cidade',
  urlDeBuscaNoGoogle('Padaria do Zé', 'Sorocaba'),
  'https://www.google.com/maps/search/Padaria%20do%20Z%C3%A9%20Sorocaba',
)
ok('sem cidade não deixa espaço solto', urlDeBuscaNoGoogle('Padaria do Zé', null).endsWith('Z%C3%A9'), true)

console.log('\n— mensagem de erro pro dono —')
ok('vazio não reclama', problemaDoLink(lerLinkGpe('')), null)
ok('encurtador não reclama', problemaDoLink(lerLinkGpe('https://g.co/kgs/x')), null)
ok('lugar não reclama', problemaDoLink(comNome), null)
ok('link de fora reclama', typeof problemaDoLink(lerLinkGpe('https://facebook.com/x')), 'string')
ok('busca reclama', typeof problemaDoLink(lerLinkGpe('https://www.google.com/maps/search/padaria')), 'string')

console.log(falhas === 0 ? '\nTUDO OK' : `\n${falhas} FALHA(S)`)
process.exit(falhas === 0 ? 0 : 1)
