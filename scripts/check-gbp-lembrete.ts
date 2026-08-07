// ============================================================
// Checagem do lembrete semanal do Google Perfil (item 5.6).
//
// Roda com: npx tsx scripts/check-gbp-lembrete.ts
//
// O que precisa estar certo aqui não é a estética do e-mail: é QUANDO
// ele não sai. Um lembrete que chega sem motivo é a coisa mais fácil de
// escrever e a mais cara de consertar, porque o dono aprende a apagar o
// remetente sem ler. Então metade das asserções abaixo cobra silêncio.
// ============================================================
import { buildGbpLembreteEmail } from '../lib/email/gbp-lembrete'

let falhas = 0
function ok(rotulo: string, real: unknown, esperado: unknown) {
  const bate = JSON.stringify(real) === JSON.stringify(esperado)
  if (!bate) falhas++
  console.log(`${bate ? 'ok  ' : 'FALHOU'} ${rotulo}${bate ? '' : `\n       esperado ${JSON.stringify(esperado)}\n       veio     ${JSON.stringify(real)}`}`)
}

const HOJE = new Date(2026, 7, 11)          // terça, 11/08/2026
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const dia = (delta: number) => iso(new Date(2026, 7, 11 + delta))

function montar(posts: Array<{ scheduled_for: string | null; published_at?: string | null; content?: string | null }>) {
  return buildGbpLembreteEmail({
    businessName: 'Padaria do Zé',
    siteDomain: 'padariadoze.ancoreo.com.br',
    painelUrl: 'https://ancoreo.com.br/gbp',
    posts: posts.map((p) => ({ scheduled_for: p.scheduled_for, published_at: p.published_at ?? null, content: p.content ?? null })),
    hoje: HOJE,
  })
}

console.log('— quando o e-mail NÃO sai —')
ok('agenda vazia', montar([]), null)
ok('post só semana que vem', montar([{ scheduled_for: dia(7) }]), null)
ok('mês inteiro pela frente', montar([{ scheduled_for: dia(7) }, { scheduled_for: dia(14) }, { scheduled_for: dia(21) }]), null)
ok('post de hoje já publicado', montar([{ scheduled_for: dia(0), published_at: '2026-08-11T10:00:00Z' }]), null)
ok('post atrasado mas publicado depois', montar([{ scheduled_for: dia(-9), published_at: '2026-08-05T10:00:00Z' }]), null)
ok('post avulso sem data não cobra', montar([{ scheduled_for: null }]), null)

console.log('\n— quando sai, e com que cara —')
const hoje1 = montar([{ scheduled_for: dia(0), content: 'Pão quentinho saindo às 17h todos os dias.' }])
ok('post de hoje gera e-mail', hoje1 !== null, true)
ok('assunto de hoje', hoje1?.subject, 'Hoje é dia de post no Google — Padaria do Zé')
ok('assunto não fala em atraso', hoje1?.subject.includes('pra trás'), false)
ok('trecho do post entra no corpo', hoje1?.html.includes('Pão quentinho saindo às 17h'), true)
ok('tem botão pro painel', hoje1?.html.includes('https://ancoreo.com.br/gbp'), true)

const atrasado = montar([{ scheduled_for: dia(-3), content: 'Promoção de sexta.' }])
ok('atrasado gera e-mail', atrasado !== null, true)
ok('assunto de atraso', atrasado?.subject, 'Seu post do Google ficou pra trás — Padaria do Zé')
ok('diz há quanto tempo', atrasado?.html.includes('era há 3 dias'), true)

console.log('\n— atraso manda no assunto, mesmo com post de hoje junto —')
const misto = montar([{ scheduled_for: dia(0), content: 'De hoje.' }, { scheduled_for: dia(-7), content: 'O antigo.' }])
ok('assunto vira o de atraso', misto?.subject.includes('ficou pra trás'), true)
ok('mostra o mais antigo primeiro', misto?.html.includes('O antigo.'), true)
ok('não despeja os dois textos', misto?.html.includes('De hoje.'), false)
ok('avisa que tem mais um na fila', misto?.html.includes('ainda tem mais um post'), true)

console.log('\n— nome do negócio —')
const semNome = buildGbpLembreteEmail({
  businessName: null, siteDomain: 'loja.ancoreo.com.br',
  painelUrl: 'https://ancoreo.com.br/gbp',
  posts: [{ scheduled_for: dia(0), published_at: null, content: null }], hoje: HOJE,
})
ok('cai no domínio quando não tem nome', semNome?.subject, 'Hoje é dia de post no Google — loja.ancoreo.com.br')
const semNada = buildGbpLembreteEmail({
  painelUrl: 'https://ancoreo.com.br/gbp',
  posts: [{ scheduled_for: dia(0), published_at: null, content: null }], hoje: HOJE,
})
ok('sem nome e sem domínio', semNada?.subject, 'Hoje é dia de post no Google — seu negócio')

console.log('\n— texto do dono não vira HTML —')
const injecao = montar([{ scheduled_for: dia(0), content: '<script>alert(1)</script> "aspas" & e-comercial' }])
ok('script escapado', injecao?.html.includes('<script>'), false)
ok('escapa como entidade', injecao?.html.includes('&lt;script&gt;'), true)
ok('aspas escapadas', injecao?.html.includes('&quot;aspas&quot;'), true)

console.log('\n— prévia longa não estoura o e-mail —')
const longo = montar([{ scheduled_for: dia(0), content: 'palavra '.repeat(80) }])
const trecho = longo?.html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/)?.[1] ?? ''
ok('corta em ~180 chars', trecho.length <= 200, true)
ok('termina em reticências', trecho.trimEnd().endsWith('…'), true)

console.log(falhas === 0 ? '\nTUDO OK' : `\n${falhas} FALHA(S)`)
process.exit(falhas === 0 ? 0 : 1)
