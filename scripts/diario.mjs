// ============================================================
// ANCOREO — gerador do DIARIO.md
//
// Por que existe: o ESTADO.md é uma FOTO do agora. Ele responde "onde
// estamos" e não responde "o que mudou desde a última vez que olhei".
// Sem essa segunda resposta, quem volta ao projeto depois de duas semanas
// tem que reconstruir a história de cabeça — que é o pedágio que o
// RITUAL.md inteiro existe pra eliminar.
//
// A fonte é o git, não a lembrança de ninguém. Commit não envelhece nem
// discorda de si mesmo: se está aqui, aconteceu, e a data é a de verdade.
//
//   node scripts/diario.mjs
//
// Não consulta banco nem rede. Não lê nem escreve segredo nenhum.
// ============================================================
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const sh = (cmd) => {
  try { return execSync(cmd, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim() } catch { return '' }
}

// Separadores improváveis de aparecer numa mensagem de commit. Sem isso o
// corpo multilinha se mistura com o próximo registro e o diário mente.
const REG = 'REG'
const CAMPO = ''

const bruto = sh(`git log --pretty=format:"${REG}%H${CAMPO}%h${CAMPO}%ad${CAMPO}%s${CAMPO}%b" --date=format:"%Y-%m-%d"`)

const commits = bruto.split(REG).filter(Boolean).map((linha) => {
  const [sha, curto, data, assunto, corpo = ''] = linha.split(CAMPO)
  return { sha, curto, data, assunto: assunto.trim(), corpo: corpo.trim() }
})

// ── Limpeza do assunto ───────────────────────────────────────
// Prefixo de convenção (`feat(editor):`, `fix:`) é sinal pra máquina, não
// pra quem lê. Some da coluna e vira etiqueta separada, que dá pra varrer
// com o olho.
const TIPOS = {
  feat: 'novo', fix: 'correção', docs: 'documento', chore: 'manutenção',
  refactor: 'reescrita', perf: 'velocidade', test: 'teste', revert: 'revertido',
  merge: 'junção', style: 'visual', build: 'build', ci: 'ci',
}

function separar(assunto) {
  const m = assunto.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/)
  if (!m || !TIPOS[m[1]]) return { etiqueta: '', escopo: '', texto: assunto }
  return { etiqueta: TIPOS[m[1]], escopo: m[2] || '', texto: m[3] }
}

// O "por que" mora no primeiro parágrafo do corpo. Pegar só a primeira frase
// não serve: nossos commits escrevem em frases curtas, e "O palco do editor
// tem ~600px." sozinho não explica nada. Levamos o parágrafo inteiro e só
// cortamos se ficar longo demais pra tabela — no fim de uma frase, nunca no
// meio de uma palavra.
const LIMITE = 400

function porque(corpo) {
  if (!corpo) return ''
  const paragrafo = corpo.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ' ').trim()
  if (!paragrafo || /^(Co-Authored-By|Signed-off-by):/i.test(paragrafo)) return ''
  if (paragrafo.length <= LIMITE) return paragrafo
  const cabe = paragrafo.slice(0, LIMITE)
  const ultimaFrase = cabe.lastIndexOf('. ')
  return ultimaFrase > 120 ? cabe.slice(0, ultimaFrase + 1) : cabe.trim() + '...'
}

// ── Agrupamento por mês ──────────────────────────────────────
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const porMes = new Map()
for (const c of commits) {
  const [ano, mes] = c.data.split('-')
  const chave = `${ano}-${mes}`
  if (!porMes.has(chave)) porMes.set(chave, [])
  porMes.get(chave).push(c)
}

// ── Estado de envio ──────────────────────────────────────────
const branch = sh('git rev-parse --abbrev-ref HEAD')
const naoEnviados = new Set(
  sh(`git log origin/${branch}..${branch} --pretty=format:%H`).split('\n').filter(Boolean)
)

const hoje = new Date().toISOString().slice(0, 10)
const primeiro = commits.length ? commits[commits.length - 1].data : '—'
const ultimo = commits.length ? commits[0].data : '—'
const diasComTrabalho = new Set(commits.map(c => c.data)).size

// ── Montagem ─────────────────────────────────────────────────
let md = `# DIÁRIO — ANCOREO

> **ARQUIVO GERADO. Não edite à mão.** Rode \`node scripts/diario.mjs\`.
> Cada linha é um commit real. A data é a do commit, não a da lembrança.
> Última geração: **${hoje}**

Onde estamos hoje: [ESTADO.md](ESTADO.md) · Onde queremos chegar: [MVP.md](MVP.md) · Como trabalhamos: [RITUAL.md](RITUAL.md)

## Resumo

| | |
|---|---|
| Alterações registradas | **${commits.length}** |
| Primeira | ${primeiro} |
| Última | ${ultimo} |
| Dias com trabalho | ${diasComTrabalho} |
| Ainda não enviadas pro ar | ${naoEnviados.size === 0 ? 'nenhuma' : `**${naoEnviados.size}**`} |

Uma linha aqui não quer dizer que a coisa funciona para o cliente. Quer dizer
que o código mudou. Se funciona ou não, quem responde é o ESTADO.md, que testa
o código em vez de acreditar nele.

`

// O "por que" só entra nas mudanças recentes. Em commit antigo ele vira ruído:
// ninguém precisa do raciocínio de junho pra decidir alguma coisa hoje.
const recentes = new Set(commits.slice(0, 15).map(c => c.sha))

for (const [chave, itens] of porMes) {
  const [ano, mes] = chave.split('-')
  md += `## ${MESES[Number(mes) - 1]} de ${ano}\n\n`
  md += `| data | | mudança |\n|---|---|---|\n`
  for (const c of itens) {
    const { etiqueta, texto } = separar(c.assunto)
    const pendente = naoEnviados.has(c.sha) ? ' _(no computador, ainda não no ar)_' : ''
    md += `| ${c.data} | ${etiqueta || '—'} | ${texto.replace(/\|/g, '\\|')}${pendente} |\n`
  }
  md += '\n'

  const explicaveis = itens.filter(c => recentes.has(c.sha) && porque(c.corpo))
  if (explicaveis.length) {
    md += `<details>\n<summary>Por que cada uma dessas mudanças foi feita</summary>\n\n`
    for (const c of explicaveis) {
      const { texto } = separar(c.assunto)
      md += `**${c.data} — ${texto}**\n\n${porque(c.corpo)}\n\n`
    }
    md += `</details>\n\n`
  }
}

md += `---

## Como ler isto

**Etiqueta** diz a natureza da mudança:

| etiqueta | quer dizer |
|---|---|
| novo | funcionalidade que não existia |
| correção | algo estava quebrado e passou a funcionar |
| reescrita | mesmo comportamento, código melhor por dentro |
| velocidade | mesma coisa, mais rápido |
| documento | só texto mudou, o produto está igual |
| revertido | uma mudança anterior foi desfeita porque quebrou algo |
| manutenção · teste · build · ci | encanamento interno, invisível pro cliente |

**"no computador, ainda não no ar"** quer dizer que a mudança existe aqui mas
ninguém de fora consegue ver ainda. Some sozinho quando sobe.
`

writeFileSync('DIARIO.md', md)
console.log(`DIARIO.md gerado — ${commits.length} alterações, ${diasComTrabalho} dias de trabalho`)
