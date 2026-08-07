// ============================================================
// ANCOREO — gerador do ESTADO.md
//
// Por que existe: a documentação escrita à mão MENTE. Em 07/08/2026 o
// ESTADO-MVP.md afirmava que a loja funcionava; o código tinha o botão de
// comprar `disabled` e três módulos inteiros sem um único importador. Doc em
// prosa envelhece sozinha; fato gerado, não.
//
// Regra: ninguém edita ESTADO.md na mão. Se um número está errado, o erro
// está aqui ou no código — conserta na origem e roda de novo.
//
//   node scripts/estado.mjs
//
// Lê .env.local só em memória pra consultar o Supabase. NENHUM valor de
// segredo é impresso ou gravado em lugar nenhum.
// ============================================================
import { execSync, execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const sh = (cmd) => {
  try { return execSync(cmd, { encoding: 'utf8' }).trim() } catch { return '' }
}

// ── .env.local → process.env (sem imprimir nada) ─────────────
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

// ============================================================
// SONDAS DE CÓDIGO
// Cada sonda é uma afirmação verificável por grep. É isto que impede o
// documento de mentir: a frase só aparece como "ligado" se o grep achar.
// ============================================================
// git grep sai com 1 quando não acha (normal) e com 2+ quando quebra de verdade.
// Distinguir os dois é obrigatório: numa sonda invertida ("NÃO deve existir"),
// um grep quebrado silenciosamente vira um "está tudo certo" falso — foi
// exatamente assim que a primeira versão deste script mentiu sobre o AEO.
const grepCount = (pattern, paths) => {
  try {
    const out = execFileSync('git', ['grep', '-l', '-E', pattern, '--', ...paths.split(' ')], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
    return out.split('\n').filter(Boolean).length
  } catch (e) {
    if (e.status === 1) return 0                    // não achou: resposta legítima
    throw new Error(`git grep falhou (${pattern}): ${String(e.stderr || e.message).trim()}`)
  }
}

const SONDAS = [
  {
    pilar: 'Onboarding',
    nome: 'Fluxo de onboarding existe e grava perfil',
    ok: () => existsSync('app/onboarding/page.tsx') && grepCount('onboarding_profiles', 'app lib') > 0,
  },
  {
    pilar: 'Site builder',
    nome: 'Geração de site por IA está ligada ao onboarding',
    ok: () => grepCount('api/generate/site', 'app components lib') > 1,
  },
  {
    pilar: 'Site builder',
    nome: 'Publicação de site tem rota e chamador',
    ok: () => existsSync('app/api/publish/route.ts') && grepCount("api/publish'", 'app components') > 0,
  },
  {
    pilar: 'Blog builder',
    nome: 'Editor de post chama a rota de publicação de blog',
    ok: () => grepCount('api/publish/blog', 'app components') > 0,
  },
  {
    pilar: 'Métricas',
    nome: 'Painel lê score real da API (não hardcoded)',
    ok: () => grepCount('api/score/', 'app/(dashboard)') > 0,
  },
  {
    pilar: 'Métricas',
    nome: 'Score é persistido em histórico (score_snapshots)',
    ok: () => grepCount('saveScoreSnapshot', 'app lib') > 1,
  },
  {
    pilar: 'Métricas',
    nome: 'AEO usa medição real (hoje: amostra sintética)',
    ok: () => grepCount('isSample', 'lib/aeo') === 0,
  },
  {
    pilar: 'GBP',
    nome: 'Existe integração com a API do Google (OAuth + publicação)',
    // NÃO usar 'googleapis' solto: casa com fonts.googleapis.com dos templates
    // e o doc passa a jurar que a integração existe. Padrão específico dos
    // endpoints do Business Profile + presença de um callback OAuth.
    ok: () => grepCount('mybusinessbusinessinformation|businessprofileperformance|mybusinessaccountmanagement', 'app lib package.json') > 0
           && grepCount('oauth', 'app/api') > 0,
  },
  {
    pilar: 'GBP',
    nome: 'Rascunho de post do Google é gerado por IA',
    ok: () => existsSync('app/api/ai/gbp/route.ts'),
  },
  {
    pilar: 'Fora do MVP',
    nome: 'Loja: botão de compra ligado ao checkout',
    ok: () => grepCount('startCheckout', 'app components') > 0,
  },
  {
    pilar: 'Fora do MVP',
    nome: 'Loja: painel de produtos existe',
    ok: () => grepCount('createProduct|listProductsForSite', 'app components') > 0,
  },
]

// ============================================================
// BANCO
// ============================================================
async function contarBanco() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const db = createClient(url, key, { auth: { persistSession: false } })
  const tabelas = [
    'tenants', 'onboarding_profiles', 'sites', 'blog_posts',
    'score_snapshots', 'gbp_posts', 'leads', 'products', 'orders',
  ]
  const out = {}
  for (const t of tabelas) {
    const { count, error } = await db.from(t).select('*', { count: 'exact', head: true })
    out[t] = error ? '—' : count
  }
  const { count: pub } = await db.from('sites')
    .select('*', { count: 'exact', head: true }).eq('status', 'published')
  out['sites (publicados)'] = pub ?? '—'
  return out
}

// ============================================================
// MONTAGEM
// ============================================================
const hoje = new Date().toISOString().slice(0, 10)
const branch = sh('git rev-parse --abbrev-ref HEAD')
const commits = sh('git log -5 --pretty=format:"- `%h` %s _(%ar)_"')
const sujo = sh('git status --porcelain')
const naoEnviado = sh('git log origin/' + branch + '..' + branch + ' --oneline')

// Sonda que quebra vira ERRO visível, nunca um falso "ligado" nem um falso
// "não ligado". Documento que não sabe precisa dizer que não sabe.
const resultados = SONDAS.map(s => {
  try { return { ...s, estado: s.ok() ? 'ligado' : 'nao' } }
  catch (e) { return { ...s, estado: 'erro', erro: e.message } }
})
const porPilar = {}
for (const r of resultados) (porPilar[r.pilar] ??= []).push(r)

const banco = await contarBanco()

let md = `# ESTADO — ANCOREO

> **ARQUIVO GERADO. Não edite à mão.** Rode \`node scripts/estado.mjs\`.
> Cada linha abaixo foi verificada contra o código e o banco, não contra outro documento.
> Última geração: **${hoje}**

## Sondas por pilar do MVP

Uma sonda é uma afirmação que o script testa por grep no código. \`ligado\` só
aparece se o grep encontrar o chamador — módulo escrito e sem ninguém chamando
conta como **não ligado**.

`

for (const [pilar, itens] of Object.entries(porPilar)) {
  md += `### ${pilar}\n\n`
  for (const i of itens) {
    const selo = i.estado === 'ligado' ? '**ligado**'
      : i.estado === 'nao' ? '`NÃO LIGADO`'
      : '`SONDA QUEBRADA`'
    md += `- ${selo} — ${i.nome}${i.erro ? `\n  - ${i.erro}` : ''}\n`
  }
  md += '\n'
}

if (banco) {
  md += `## Banco (produção, contagem real)\n\n| tabela | linhas |\n|---|---:|\n`
  for (const [t, n] of Object.entries(banco)) md += `| ${t} | ${n} |\n`
  md += `\nZero linhas não significa quebrado: significa que ninguém exercitou aquele caminho ainda. Cruze com as sondas acima antes de concluir.\n\n`
} else {
  md += `## Banco\n\nNão consultado (faltou \`NEXT_PUBLIC_SUPABASE_URL\` ou \`SUPABASE_SERVICE_ROLE_KEY\` no ambiente).\n\n`
}

md += `## Git

Branch: \`${branch}\`

${commits || '_sem commits_'}

**Trabalho não commitado:** ${sujo ? '\n\n```\n' + sujo + '\n```' : 'nenhum'}

**Commits locais não enviados:** ${naoEnviado ? '\n\n```\n' + naoEnviado + '\n```' : 'nenhum'}

---

Próximos passos e definição de pronto: [MVP.md](MVP.md) · Como trabalhamos: [RITUAL.md](RITUAL.md)
`

writeFileSync('ESTADO.md', md)
const quebradas = resultados.filter(r => r.estado === 'erro').length
console.log(
  'ESTADO.md gerado —',
  resultados.filter(r => r.estado === 'ligado').length, 'de', resultados.length, 'sondas ligadas' +
  (quebradas ? ` (${quebradas} QUEBRADA(S) — conserte antes de confiar no doc)` : '')
)
