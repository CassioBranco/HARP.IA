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
// --untracked é obrigatório e não é detalhe: sem ele o git grep ignora arquivo
// que ainda não foi commitado, e uma rota escrita agora aparece como
// inexistente — enquanto as sondas de existsSync, que olham o disco, dizem que
// existe. Duas noções de realidade no mesmo documento. O ESTADO descreve a
// árvore de trabalho, que é o que roda em `npm run dev`. Arquivo em .gitignore
// continua de fora, que é o certo.
const grepCount = (pattern, paths) => {
  try {
    const out = execFileSync('git', ['grep', '-l', '--untracked', '-E', pattern, '--', ...paths.split(' ')], {
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
    pilar: 'GBP',
    // Sem alguém ESCREVENDO published_at não existe cadência honesta nem
    // métrica de GBP. A coluna e o CHECK existiam desde 18/06 e nenhuma linha
    // gravava; por isso a sonda cobra o escritor, não a existência do campo.
    nome: 'Cliente registra que publicou no perfil (published_at é escrito)',
    ok: () => grepCount('published_at', 'app/api/gbp') > 0
           && grepCount('/api/gbp/publicado', 'app') > 0,
  },
  {
    pilar: 'GBP',
    // A coluna scheduled_for sozinha não prova nada: só vale se algo GRAVA
    // data (a rota do mês) e se a tela LÊ essa data pra montar a agenda.
    // Cobrar os dois lados é o que impede o doc de jurar que existe
    // calendário quando existe apenas uma coluna vazia.
    nome: 'Calendário do mês: posts saem com data marcada',
    ok: () => existsSync('app/api/ai/gbp/mes/route.ts')
           && grepCount('scheduled_for', 'app/api/ai/gbp/mes') > 0
           && grepCount('resumoDaAgenda|grupoDoPost', 'app/(dashboard)/gbp') > 0,
  },
  {
    pilar: 'GBP',
    // O link só serve pra alguma coisa se (a) alguém LÊ o que ele carrega,
    // (b) o place_id for GRAVADO — foi coluna morta por dois meses — e
    // (c) der pra vincular DEPOIS, no painel. Sem o terceiro, o onboarding
    // manda pro painel e o painel manda pro onboarding, e ninguém vincula.
    nome: 'Link do Perfil é lido, guardado com place_id e vinculável no painel',
    ok: () => existsSync('lib/seo/gpe-link.ts')
           && grepCount('gbp_place_id', 'app/onboarding app/api/gbp') > 0
           && existsSync('app/api/gbp/vincular/route.ts'),
  },
  {
    pilar: 'GBP',
    // Rota de lembrete escrita não é lembrete enviado. Sem entrada de cron
    // em vercel.json ninguém chama a rota, e o doc não pode dizer que o
    // cliente é avisado. A sonda só acende quando o agendamento existe.
    nome: 'Lembrete semanal do post sai sozinho (rota + agendamento)',
    ok: () => existsSync('app/api/cron/gbp-lembrete/route.ts')
           && grepCount('gbp-lembrete', 'vercel.json') > 0,
  },
  {
    pilar: 'GBP',
    // A ponte só existe se os DOIS lados tiverem quem os chame. A rota
    // /do-artigo sozinha é código morto: quem publica artigo tem que
    // dispará-la. E o caminho de volta (post do perfil vira pauta de
    // artigo) tem que ter um link real na tela, não só a rota aceitando
    // ?pauta=. Cobrar os dois lados é o que impede o doc de jurar que
    // "blog e Google conversam" quando só uma direção foi ligada.
    nome: 'Ponte blog ↔ Perfil: artigo publicado vira post, post vira pauta',
    ok: () => existsSync('app/api/ai/gbp/do-artigo/route.ts')
           && grepCount('api/ai/gbp/do-artigo', 'app/(dashboard)') > 0
           && grepCount('blog/new\\?pauta=', 'app/(dashboard)/gbp') > 0
           && grepCount('searchParams.get\\(.pauta.\\)', 'app/(dashboard)/blog') > 0,
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
