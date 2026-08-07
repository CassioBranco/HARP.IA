// ============================================================
// Checagem das regras de data do calendário do GPE (item 5.3).
//
// Roda com: npx tsx scripts/check-gbp-calendar.ts
//
// Existe porque data é o tipo de coisa que quebra em silêncio: o post
// aparece um dia antes, ou a virada de ano cai em fevereiro, e ninguém
// vê até um cliente reclamar. O repo não tem test runner, então isto é
// um script como o estado.mjs, não uma suíte.
// ============================================================
import { proximasDatas, tipoDaPosicao, grupoDoPost, rotuloDaData, resumoDaAgenda } from '../lib/seo/gbp-calendar'

let falhas = 0
const ok = (nome: string, cond: boolean, extra = '') => {
  if (!cond) { falhas++; console.log('FALHOU:', nome, extra) }
  else console.log('ok   :', nome, extra)
}

// 1. Segunda-feira 10/08/2026 -> primeira terca e 11/08.
const seg = new Date(2026, 7, 10)
const d1 = proximasDatas(seg, 4)
ok('segunda -> proxima terca', d1[0] === '2026-08-11', d1.join(' '))
ok('quatro datas, 7 em 7', d1.length === 4 && d1[3] === '2026-09-01', String(d1[3]))

// 2. Se hoje ja e terca, a primeira e HOJE.
const ter = new Date(2026, 7, 11)
ok('terca -> hoje', proximasDatas(ter, 1)[0] === '2026-08-11')

// 3. Quarta 12/08 -> pula pra terca seguinte.
const qua = new Date(2026, 7, 12)
ok('quarta -> terca seguinte', proximasDatas(qua, 1)[0] === '2026-08-18')

// 4. Virada de mes/ano nao quebra.
const fim = new Date(2026, 11, 29) // terca 29/12/2026
const dz = proximasDatas(fim, 2)
ok('vira o ano', dz[0] === '2026-12-29' && dz[1] === '2027-01-05', dz.join(' '))

// 5. Rotacao nao repete tipo colado e cobre os tres tipos.
const tipos = [0,1,2,3].map(tipoDaPosicao)
ok('rotacao sem repeticao colada', tipos.every((t, i) => i === 0 || t !== tipos[i-1]), tipos.join(','))
ok('rotacao cobre os tres tipos', new Set(tipos).size === 3, tipos.join(','))

// 6. Grupos.
const hoje = new Date(2026, 7, 11)
ok('publicado vence atraso', grupoDoPost({ scheduled_for: '2026-08-01', published_at: '2026-08-05T10:00:00Z' }, hoje) === 'publicado')
ok('atrasado', grupoDoPost({ scheduled_for: '2026-08-04', published_at: null }, hoje) === 'atrasado')
ok('hoje', grupoDoPost({ scheduled_for: '2026-08-11', published_at: null }, hoje) === 'hoje')
ok('semana', grupoDoPost({ scheduled_for: '2026-08-18', published_at: null }, hoje) === 'semana')
ok('depois', grupoDoPost({ scheduled_for: '2026-08-25', published_at: null }, hoje) === 'depois')
ok('avulso', grupoDoPost({ scheduled_for: null, published_at: null }, hoje) === 'avulso')

// 7. Fuso: '2026-08-11' nao pode virar 10/08 no Brasil.
ok('rotulo hoje', rotuloDaData('2026-08-11', hoje) === 'hoje', rotuloDaData('2026-08-11', hoje))
ok('rotulo amanha', rotuloDaData('2026-08-12', hoje) === 'amanhã', rotuloDaData('2026-08-12', hoje))
ok('rotulo ontem', rotuloDaData('2026-08-10', hoje) === 'era ontem', rotuloDaData('2026-08-10', hoje))

// 8. Resumo: atrasado fala mais alto que "pra hoje".
const r = resumoDaAgenda([
  { scheduled_for: '2026-08-04', published_at: null },
  { scheduled_for: '2026-08-11', published_at: null },
  { scheduled_for: '2026-08-18', published_at: null },
  { scheduled_for: '2026-08-01', published_at: '2026-08-01T10:00:00Z' },
], hoje)
ok('resumo conta certo', r.atrasados === 1 && r.paraHoje === 1 && r.pendentes === 3, JSON.stringify(r))
ok('resumo prioriza atraso', r.mensagem.includes('passou da data'), r.mensagem)

const vazio = resumoDaAgenda([], hoje)
ok('agenda vazia convida a montar', vazio.pendentes === 0 && vazio.mensagem.includes('vazio'), vazio.mensagem)

console.log(falhas === 0 ? '\nTUDO OK' : `\n${falhas} FALHA(S)`)
process.exit(falhas === 0 ? 0 : 1)
