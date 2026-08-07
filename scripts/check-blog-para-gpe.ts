// ============================================================
// Checagem das regras da ponte blog -> Google Perfil (tarefa #23).
//
// Roda com: npx tsx scripts/check-blog-para-gpe.ts
//
// O que este arquivo protege não é uma função, é uma promessa: o
// calendário do cliente diz "4 posts por mês, um por terça". Se a isca
// que nasce de um artigo criar vaga em vez de ocupar uma, quem escreve
// 4 artigos acorda com 8 posts na fila e um lembrete por e-mail virando
// spam. Isso quebra em silêncio, então tem checagem.
//
// Mesmo padrão do check-gbp-calendar: script, não suíte. O repo não tem
// test runner.
// ============================================================
import {
  escolherVagaDaIsca,
  jaTemIscaDoArtigo,
  extrairTextoDoArtigo,
  urlDoArtigo,
  assuntosJaCobertos,
  type PostNaAgenda,
} from '../lib/seo/blog-para-gpe'
import { proximasDatas } from '../lib/seo/gbp-calendar'

let falhas = 0
const ok = (nome: string, cond: boolean, extra = '') => {
  if (!cond) { falhas++; console.log('FALHOU:', nome, extra) }
  else console.log('ok   :', nome, extra)
}

// Segunda 10/08/2026. As quatro tercas: 11/08, 18/08, 25/08, 01/09.
const HOJE = new Date(2026, 7, 10)
const [T1, T2, T3, T4] = proximasDatas(HOJE, 4) as [string, string, string, string]

function post(p: Partial<PostNaAgenda> & { id: string }): PostNaAgenda {
  return {
    scheduled_for: null,
    published_at: null,
    post_type: 'novidade',
    deBlog: false,
    ...p,
  }
}

// ── escolherVagaDaIsca ───────────────────────────────────────

// 1. Agenda vazia: pega a primeira terca.
{
  const v = escolherVagaDaIsca([], HOJE)
  ok('agenda vazia -> primeira terca', v.tipo === 'livre' && v.data === T1, JSON.stringify(v))
}

// 2. Buraco no meio do mes: pega o buraco, nao o fim da fila.
{
  const v = escolherVagaDaIsca([
    post({ id: 'a', scheduled_for: T1 }),
    post({ id: 'c', scheduled_for: T3 }),
  ], HOJE)
  ok('acha o buraco no meio', v.tipo === 'livre' && v.data === T2, JSON.stringify(v))
}

// 3. Mes cheio de novidade generica: troca com a MAIS PROXIMA.
{
  const v = escolherVagaDaIsca([
    post({ id: 'd', scheduled_for: T4 }),
    post({ id: 'b', scheduled_for: T2 }),
    post({ id: 'a', scheduled_for: T1 }),
    post({ id: 'c', scheduled_for: T3 }),
  ], HOJE)
  ok('mes cheio -> troca com a mais proxima',
    v.tipo === 'troca' && v.data === T1 && v.cedeuId === 'a', JSON.stringify(v))
}

// 4. Oferta e evento NAO cedem a data: tem motivo no mundo real.
{
  const v = escolherVagaDaIsca([
    post({ id: 'a', scheduled_for: T1, post_type: 'oferta' }),
    post({ id: 'b', scheduled_for: T2, post_type: 'evento' }),
    post({ id: 'c', scheduled_for: T3, post_type: 'oferta' }),
    post({ id: 'd', scheduled_for: T4, post_type: 'evento' }),
  ], HOJE)
  ok('oferta/evento nao cedem -> sem data', v.tipo === 'sem-data', JSON.stringify(v))
}

// 5. Com oferta ocupando as primeiras, a troca cai na novidade la atras.
{
  const v = escolherVagaDaIsca([
    post({ id: 'a', scheduled_for: T1, post_type: 'oferta' }),
    post({ id: 'b', scheduled_for: T2, post_type: 'evento' }),
    post({ id: 'c', scheduled_for: T3, post_type: 'novidade' }),
    post({ id: 'd', scheduled_for: T4, post_type: 'novidade' }),
  ], HOJE)
  ok('pula oferta/evento e troca com a novidade', v.tipo === 'troca' && v.cedeuId === 'c', JSON.stringify(v))
}

// 6. Isca nao tira a vaga de outra isca: artigo nao briga com artigo.
{
  const v = escolherVagaDaIsca([
    post({ id: 'a', scheduled_for: T1, deBlog: true }),
    post({ id: 'b', scheduled_for: T2, deBlog: true }),
    post({ id: 'c', scheduled_for: T3, deBlog: true }),
    post({ id: 'd', scheduled_for: T4, deBlog: true }),
  ], HOJE)
  ok('isca nao toma vaga de isca -> sem data', v.tipo === 'sem-data', JSON.stringify(v))
}

// 7. Post JA PUBLICADO nao ocupa vaga: a terca dele ja passou de valor.
{
  const v = escolherVagaDaIsca([
    post({ id: 'a', scheduled_for: T1, published_at: '2026-08-11T10:00:00Z' }),
  ], HOJE)
  ok('publicado nao segura a data', v.tipo === 'livre' && v.data === T1, JSON.stringify(v))
}

// 8. Post sem data nao entra na conta em lugar nenhum.
{
  const v = escolherVagaDaIsca([
    post({ id: 'x' }), post({ id: 'y' }), post({ id: 'z' }),
  ], HOJE)
  ok('post avulso sem data nao ocupa terca', v.tipo === 'livre' && v.data === T1, JSON.stringify(v))
}

// 9. Data fora das 4 proximas tercas nao bloqueia nem e cedivel.
{
  const v = escolherVagaDaIsca([
    post({ id: 'a', scheduled_for: T1 }),
    post({ id: 'b', scheduled_for: T2 }),
    post({ id: 'c', scheduled_for: T3 }),
    post({ id: 'd', scheduled_for: T4 }),
    post({ id: 'longe', scheduled_for: '2027-03-02' }),
  ], HOJE)
  ok('data distante nao vira alvo de troca', v.tipo === 'troca' && v.cedeuId === 'a', JSON.stringify(v))
}

// 10. A isca NUNCA aumenta a conta do mes. Esta e a promessa inteira.
{
  let agenda: PostNaAgenda[] = [
    post({ id: 'a', scheduled_for: T1 }), post({ id: 'b', scheduled_for: T2 }),
    post({ id: 'c', scheduled_for: T3 }), post({ id: 'd', scheduled_for: T4 }),
  ]
  // Cinco artigos publicados em sequencia, cada um pedindo sua vaga.
  for (let i = 0; i < 5; i++) {
    const v = escolherVagaDaIsca(agenda, HOJE)
    if (v.tipo === 'troca') {
      agenda = agenda.map(p => (p.id === v.cedeuId ? { ...p, scheduled_for: null } : p))
    }
    agenda.push(post({
      id: `isca${i}`,
      scheduled_for: v.tipo === 'sem-data' ? null : v.data,
      deBlog: true,
    }))
  }
  const comData = agenda.filter(p => p.scheduled_for).length
  ok('5 artigos seguidos nao estouram o mes', comData === 4, `${comData} posts com data`)
  const semData = agenda.filter(p => !p.scheduled_for).length
  ok('nada foi apagado no caminho', agenda.length === 9 && semData === 5, `${agenda.length} posts, ${semData} sem data`)
}

// ── jaTemIscaDoArtigo ────────────────────────────────────────
{
  const agenda = [{ origemBlogId: 'artigo-1' }, { origemBlogId: null }, {}]
  ok('acha isca do mesmo artigo', jaTemIscaDoArtigo(agenda, 'artigo-1'))
  ok('nao confunde artigo diferente', !jaTemIscaDoArtigo(agenda, 'artigo-2'))
  ok('agenda vazia nao tem isca', !jaTemIscaDoArtigo([], 'artigo-1'))
}

// ── extrairTextoDoArtigo ─────────────────────────────────────
{
  const html = '<h2>Preço</h2><p>Custa <b>R$ 90</b> &amp; sobe em 2027.</p>'
  const t = extrairTextoDoArtigo(html)
  ok('tira tag e decodifica entidade', t === 'Preço Custa R$ 90 & sobe em 2027.', JSON.stringify(t))
}
{
  const t = extrairTextoDoArtigo('<script>alert(1)</script><p>Texto</p>')
  ok('script nao vaza pro prompt', t === 'Texto', JSON.stringify(t))
}
{
  const t = extrairTextoDoArtigo('<style>p{color:red}</style><p>Texto</p>')
  ok('style nao vaza pro prompt', t === 'Texto', JSON.stringify(t))
}
{
  // Corte em fronteira de palavra: meia palavra no fim faz o modelo inventar o resto.
  const t = extrairTextoDoArtigo('palavra '.repeat(50), 20)
  ok('corta em espaco, nao no meio da palavra', t.endsWith('…') && !/palav…$/.test(t), JSON.stringify(t))
  ok('respeita o limite', t.length <= 21, String(t.length))
}
{
  ok('texto curto sai inteiro e sem reticencia', extrairTextoDoArtigo('<p>Oi</p>', 100) === 'Oi')
  ok('html vazio nao quebra', extrairTextoDoArtigo(null) === '')
}

// ── urlDoArtigo ──────────────────────────────────────────────
{
  ok('monta a url publica', urlDoArtigo('joao.ancoreo.site', 'preco-do-servico') === 'https://joao.ancoreo.site/blog/preco-do-servico')
  ok('sem dominio -> null', urlDoArtigo(null, 'slug') === null)
  ok('sem slug -> null', urlDoArtigo('x.com', '') === null)
  ok('espaco em branco nao vira url', urlDoArtigo('  ', ' ') === null)
}

// ── assuntosJaCobertos ───────────────────────────────────────
{
  const r = assuntosJaCobertos(['Preço do serviço', 'preço do SERVIÇO', null, '  ', 'Outro tema'])
  ok('deduplica ignorando caixa', r.length === 2, JSON.stringify(r))
  ok('mantem o texto original do primeiro', r[0] === 'Preço do serviço', JSON.stringify(r))
}
{
  const r = assuntosJaCobertos(Array.from({ length: 30 }, (_, i) => `Tema ${i}`))
  ok('respeita o teto', r.length === 8, String(r.length))
}
{
  ok('lista vazia -> vazio', assuntosJaCobertos([]).length === 0)
}

console.log(falhas === 0 ? '\nTUDO OK' : `\n${falhas} FALHA(S)`)
process.exit(falhas === 0 ? 0 : 1)
