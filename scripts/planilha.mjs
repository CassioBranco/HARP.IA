// ============================================================
// ANCOREO — gerador do PAINEL (planilha de acompanhamento)
//
// Por que existe: o ESTADO.md é honesto mas é técnico. O Cássio pediu uma
// planilha pra bater o olho e saber em que passo estamos, sem ler documento.
//
// Duas fontes, e a planilha diz qual é qual em cada linha:
//
//   1. VERIFICADO — sai das sondas do ESTADO.md, que testam o código de verdade.
//      Se está "PRONTO" aqui, tem chamador no código. Não é opinião.
//   2. PLANO — a fila do que falta. Isso é combinado, não é verificável, e a
//      planilha nunca finge o contrário. Um plano não mente; um plano que se
//      apresenta como fato, sim.
//
// Gera dois arquivos:
//   PAINEL.csv  abre no Excel (separador ";" e BOM, senão o Excel em português
//               joga tudo numa coluna só e come os acentos)
//   PAINEL.md   é o que eu leio e mostro no começo de cada sessão
//
//   node scripts/planilha.mjs
//
// Não lê nem escreve segredo nenhum.
// ============================================================
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const LANCAMENTO = '2026-09-01'

// ── 1. Sondas: a parte verificada ────────────────────────────
// Regenera o ESTADO.md antes de ler, senão a planilha herda uma foto velha.
try {
  execFileSync('node', ['scripts/estado.mjs'], { stdio: ['ignore', 'pipe', 'pipe'] })
} catch (e) {
  throw new Error(`scripts/estado.mjs falhou. A planilha seria chute: ${String(e.stderr || e.message).trim()}`)
}

const estado = readFileSync('ESTADO.md', 'utf8')

// Sonda apagada não diz quando vai acender — isso é combinado, não código.
// Aqui a gente pendura o prazo em cima do trecho que identifica a sonda, pra
// planilha não ter uma coluna "quando" vazia justo nas linhas que faltam.
const PRAZOS = [
  [/AEO usa medição real/i, 'S2 · 16 a 23/08'],
  [/API do Google/i, 'esperando o Google liberar'],
  [/^Loja/i, 'depois do lançamento'],
]

const sondas = []
let pilarAtual = ''
for (const linha of estado.split('\n')) {
  const cabecalho = linha.match(/^###\s+(.+)$/)
  if (cabecalho) { pilarAtual = cabecalho[1].trim(); continue }
  const sonda = linha.match(/^-\s+(\*\*ligado\*\*|`NÃO LIGADO`|`SONDA QUEBRADA`)\s+—\s+(.+)$/)
  if (!sonda) continue
  const ligado = sonda[1].includes('ligado') && !sonda[1].includes('NÃO')
  const quebrada = sonda[1].includes('QUEBRADA')
  const oQue = sonda[2].trim()
  const prazo = PRAZOS.find(([re]) => re.test(oQue))
  sondas.push({
    pilar: pilarAtual,
    oQue,
    situacao: quebrada ? 'SONDA QUEBRADA' : ligado ? 'PRONTO' : 'FALTA',
    fonte: 'verificado no código',
    quando: ligado ? 'feito' : (prazo ? prazo[1] : ''),
  })
}

// Se o formato do ESTADO.md mudar e a regex parar de casar, a planilha sairia
// vazia e limpinha — verde por ausência de evidência. Foi assim que a primeira
// versão do estado.mjs mentiu sobre o AEO. Não de novo.
if (sondas.length < 10) {
  throw new Error(`Só ${sondas.length} sondas lidas do ESTADO.md. O formato mudou — conserte a leitura antes de confiar nesta planilha.`)
}

// ── 2. Fila: a parte planejada ───────────────────────────────
// Espelha a lista de trabalho. Não é verificável por definição: é combinado.
const SPRINTS = {
  S1: 'S1 · até 15/08',
  S2: 'S2 · 16 a 23/08',
  S3: 'S3 · 24 a 31/08',
  agora: 'agora',
  pos: 'depois do lançamento',
}

const FILA = [
  // Portões humanos primeiro: é o que trava tudo o mais.
  { pilar: 'Google Perfil', oQue: 'Você criar a senha do robô semanal no Vercel (CRON_SECRET)', situacao: 'ESPERANDO VOCÊ', quando: SPRINTS.agora },
  { pilar: 'Google Perfil', oQue: 'Você confirmar se a chave de e-mail (RESEND) já está no Vercel', situacao: 'ESPERANDO VOCÊ', quando: SPRINTS.agora },
  { pilar: 'Google Perfil', oQue: 'Sessão de teste T5: publicar um post no seu Perfil de verdade, 20 min', situacao: 'ESPERANDO VOCÊ', quando: SPRINTS.agora },

  { pilar: 'Métricas', oQue: 'Contar visitas de robô de IA no site do cliente (medição real, custo zero)', situacao: 'FALTA', quando: SPRINTS.S2 },
  { pilar: 'Métricas', oQue: 'Posição real das palavras-chave, puxada do Search Console', situacao: 'FALTA', quando: SPRINTS.S2 },

  { pilar: 'Site builder', oQue: 'Tela de domínio próprio no painel (hoje o cliente não tem onde apontar o DNS)', situacao: 'FALTA', quando: SPRINTS.S2 },
  { pilar: 'Site builder', oQue: 'Bloco de resposta direta abaixo do título: o trecho que a IA copia ao citar', situacao: 'FALTA', quando: SPRINTS.S2 },
  { pilar: 'Site builder', oQue: 'Content-Signal: separar "pode me citar" de "pode me usar pra treinar"', situacao: 'FALTA', quando: SPRINTS.S3 },
  { pilar: 'Site builder', oQue: 'Site lento não publica (trava acima de 2,5 segundos)', situacao: 'FALTA', quando: SPRINTS.S3 },
  { pilar: 'Site builder', oQue: 'Avisar quando uma página fica a mais de 3 cliques da home', situacao: 'FALTA', quando: SPRINTS.S3 },

  { pilar: 'Onboarding', oQue: 'Descobrir por que 8 sites são gerados e só 1 é publicado', situacao: 'FALTA', quando: SPRINTS.S3 },
  { pilar: 'Blog builder', oQue: 'Publicar 5 posts de verdade e conferir os links entre eles', situacao: 'FALTA', quando: SPRINTS.S3 },

  { pilar: 'Fora do MVP', oQue: 'Cobrança da assinatura (o beta é grátis, então não corre)', situacao: 'FORA DO MVP', quando: SPRINTS.pos },
].map(l => ({ ...l, fonte: 'plano' }))

const linhas = [...sondas, ...FILA].map((l, i) => ({ n: i + 1, ...l }))

// ── 3. Contas ────────────────────────────────────────────────
const doMvp = linhas.filter(l => l.pilar !== 'Fora do MVP' && l.situacao !== 'FORA DO MVP')
const prontos = doMvp.filter(l => l.situacao === 'PRONTO').length
const esperandoVoce = doMvp.filter(l => l.situacao === 'ESPERANDO VOCÊ').length
const pct = Math.round((prontos / doMvp.length) * 100)

const hoje = new Date()
const hojeISO = hoje.toISOString().slice(0, 10)
const diasPraLancar = Math.round((new Date(LANCAMENTO) - new Date(hojeISO)) / 86400000)

// Barra de progresso em texto: dá a noção em meio segundo, sem ler número.
const CHEIOS = Math.round(pct / 5)
const barra = '█'.repeat(CHEIOS) + '░'.repeat(20 - CHEIOS)

// ── 4. CSV pro Excel ─────────────────────────────────────────
const csvCampo = (v) => {
  const s = String(v ?? '')
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csv = [
  ['Nº', 'Pilar', 'O que é', 'Situação', 'Como sabemos', 'Quando'],
  ...linhas.map(l => [l.n, l.pilar, l.oQue, l.situacao, l.fonte, l.quando]),
].map(cols => cols.map(csvCampo).join(';')).join('\r\n')

writeFileSync('PAINEL.csv', '﻿' + csv, 'utf8')

// ── 5. Painel em markdown ────────────────────────────────────
const ordemPilar = ['Onboarding', 'Site builder', 'Blog builder', 'Métricas', 'GBP', 'Google Perfil', 'Fora do MVP']
const nomeBonito = { GBP: 'Google Perfil', 'Métricas': 'Métricas de SEO, GEO e AEO' }

const porPilar = new Map()
for (const l of linhas) {
  const chave = nomeBonito[l.pilar] || l.pilar
  if (!porPilar.has(chave)) porPilar.set(chave, [])
  porPilar.get(chave).push(l)
}
const chavesOrdenadas = [...porPilar.keys()].sort(
  (a, b) => ordemPilar.indexOf(Object.keys(nomeBonito).find(k => nomeBonito[k] === a) || a)
         - ordemPilar.indexOf(Object.keys(nomeBonito).find(k => nomeBonito[k] === b) || b)
)

const SELO = {
  'PRONTO': 'PRONTO',
  'FALTA': 'falta',
  'ESPERANDO VOCÊ': '**ESPERANDO VOCÊ**',
  'FORA DO MVP': 'fora do MVP',
  'SONDA QUEBRADA': '**SONDA QUEBRADA**',
}

let md = `# PAINEL — em que passo estamos

> **ARQUIVO GERADO. Não edite à mão.** Rode \`node scripts/planilha.mjs\`.
> Para abrir no Excel: **PAINEL.csv**, na mesma pasta.
> Última geração: **${hojeISO}**

\`${barra}\` **${pct}%** — ${prontos} de ${doMvp.length} itens do MVP prontos
**${diasPraLancar} dias** para o lançamento (01/09)${esperandoVoce ? `
**${esperandoVoce} ${esperandoVoce === 1 ? 'item depende' : 'itens dependem'} de você** para destravar` : ''}

A coluna **como sabemos** é o que separa esta planilha de uma lista de desejos.
_Verificado no código_ quer dizer que um teste automático achou a coisa
funcionando de verdade. _Plano_ quer dizer que combinamos fazer, e só.

`

for (const chave of chavesOrdenadas) {
  const itens = porPilar.get(chave)
  const feitos = itens.filter(l => l.situacao === 'PRONTO').length
  md += `## ${chave} — ${feitos}/${itens.length}\n\n`
  md += `| nº | o que é | situação | como sabemos | quando |\n|---:|---|---|---|---|\n`
  for (const l of itens) {
    md += `| ${l.n} | ${l.oQue.replace(/\|/g, '\\|')} | ${SELO[l.situacao]} | ${l.fonte} | ${l.quando || '—'} |\n`
  }
  md += '\n'
}

md += `---

Detalhe técnico do que está ligado: [ESTADO.md](ESTADO.md) ·
O que mudou e quando: [DIARIO.md](DIARIO.md) ·
Definição de pronto: [MVP.md](MVP.md)
`

writeFileSync('PAINEL.md', md)
console.log(`PAINEL gerado — ${pct}% (${prontos}/${doMvp.length}), ${esperandoVoce} esperando o Cássio, ${diasPraLancar} dias pro lançamento`)
