// ============================================================
// Teste A/B CEGO de modelos de IA para a geração de conteúdo do HARPIA.
// Gera o MESMO tema com 2 provedores, usando o MESMO prompt, e grava
// arquivos anonimizados (Modelo A / Modelo B) pro Dove pontuar sem
// saber qual é qual. O gabarito (qual modelo é A/B por tema) fica num
// arquivo separado, só revelado depois da nota.
//
// Critério honesto: a escolha do produto (Claude vs concorrente) deve
// vir de avaliação cega em PT-BR, não da opinião de nenhum fornecedor.
//
// USO:
//   node scripts/ab-test.mjs                      # Claude vs OpenAI (padrão)
//   node scripts/ab-test.mjs --rival gemini       # Claude vs Gemini
//   node scripts/ab-test.mjs "tema 1" "tema 2"    # temas custom
//
// CHAVES (em .env.local ou no ambiente):
//   ANTHROPIC_API_KEY  (Claude — obrigatória)
//   OPENAI_API_KEY     (rival OpenAI)
//   GEMINI_API_KEY     (rival Gemini, se --rival gemini)
// ============================================================

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Carrega .env.local de forma simples (sem dependência), se existir.
function loadEnv() {
  const p = join(process.cwd(), '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()

// Negócio fictício de teste (representa um cliente local típico).
const NEGOCIO = {
  businessName: 'Clínica Vida Plena',
  niche: 'clinica',
  city: 'Sorocaba',
  tone: 'profissional e acolhedor',
}

const TEMAS_PADRAO = [
  'quando levar a criança ao pediatra pela primeira vez',
  'clareamento dental estraga o dente?',
  'sinais de que você precisa de fisioterapia',
  'como escolher um bom dentista perto de você',
  'cuidados com a pele no inverno',
]

// O MESMO prompt para os dois modelos — mesma régua, comparação justa.
// (Espelha o contrato da rota /api/ai/blog do HARPIA.)
function buildPrompt(tema) {
  const system = `Você é um especialista em SEO/GEO/AEO. Escreve artigos de blog em português brasileiro com voz humana (anti-IA), sem gerundismo, sem em-dash, sem "no mundo atual" nem "jornada". Cada H2 é autossuficiente: a primeira frase responde a pergunta de forma citável isolada. FAQ com no mínimo 6 perguntas. Keyword principal nos primeiros 100 caracteres. Cite a cidade ao menos 2x por seção. 800 a 1200 palavras. Nunca invente dado.`
  const user = `Escreva um artigo de blog completo sobre: "${tema}"

Negócio: ${NEGOCIO.businessName} | Nicho: ${NEGOCIO.niche} | Cidade: ${NEGOCIO.city} | Tom: ${NEGOCIO.tone}

Estrutura: H1 (keyword + cidade, máx 60 chars), intro direta, 3-5 H2 autossuficientes, FAQ com 6 perguntas, CTA final com verbo de posse.
Responda só o artigo em HTML simples, sem comentários.`
  return { system, user }
}

// ── Provedores (fetch puro, sem SDK — script neutro de comparação) ──

async function genClaude(tema) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY ausente')
  const { system, user } = buildPrompt(tema)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.content?.find(b => b.type === 'text')?.text ?? ''
}

async function genOpenAI(tema) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY ausente')
  const { system, user } = buildPrompt(tema)
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-5.4',
      max_completion_tokens: 4096,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.choices?.[0]?.message?.content ?? ''
}

async function genGemini(tema) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY ausente')
  const { system, user } = buildPrompt(tema)
  const model = 'gemini-3.1-pro'
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
  const j = await res.json()
  return j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ?? ''
}

// ── Execução ────────────────────────────────────────────────
const args = process.argv.slice(2)
let rival = 'openai'
const rivalIdx = args.indexOf('--rival')
if (rivalIdx !== -1) { rival = args[rivalIdx + 1]; args.splice(rivalIdx, 2) }
const temas = args.length ? args : TEMAS_PADRAO

const genRival = rival === 'gemini' ? genGemini : genOpenAI
const nomeRival = rival === 'gemini' ? 'Gemini 3.1 Pro' : 'GPT-5.4'

const OUT = join(process.cwd(), 'ab-test-resultado')
mkdirSync(OUT, { recursive: true })

const gabarito = []

for (let i = 0; i < temas.length; i++) {
  const tema = temas[i]
  console.log(`\n[${i + 1}/${temas.length}] Gerando: "${tema}"…`)
  let claude, rivalTxt
  try {
    ;[claude, rivalTxt] = await Promise.all([genClaude(tema), genRival(tema)])
  } catch (e) {
    console.error('  Falhou:', e.message)
    continue
  }

  // Anonimiza: alterna quem é A/B por tema (par = Claude é A; ímpar = Claude é B).
  // Sem Math.random pra o gabarito ser reproduzível.
  const claudeEhA = i % 2 === 0
  const A = claudeEhA ? claude : rivalTxt
  const B = claudeEhA ? rivalTxt : claude

  const slug = String(i + 1).padStart(2, '0')
  writeFileSync(join(OUT, `tema-${slug}_MODELO-A.html`), A, 'utf8')
  writeFileSync(join(OUT, `tema-${slug}_MODELO-B.html`), B, 'utf8')
  gabarito.push({ tema: `tema-${slug}`, assunto: tema, A: claudeEhA ? 'Claude' : nomeRival, B: claudeEhA ? nomeRival : 'Claude' })
  console.log('  OK — Modelo A e Modelo B gravados.')
}

// Ficha de pontuação cega (o Dove preenche).
const ficha = `# Pontuação cega — Claude vs ${nomeRival}

Leia cada par (Modelo A / Modelo B) SEM olhar o gabarito.
Para cada tema, dê nota 1-5 em cada critério e marque qual preferiu.

| Tema | Voz humana (anti-IA) | Tom Dove | SEO/estrutura | PREFERIDO (A/B) |
|------|----------------------|----------|---------------|------------------|
${gabarito.map(g => `| ${g.tema} (${g.assunto}) |  |  |  |  |`).join('\n')}

Depois de pontuar TODOS, abra GABARITO.json pra revelar qual era qual.
`
writeFileSync(join(OUT, 'PONTUACAO-CEGA.md'), ficha, 'utf8')
writeFileSync(join(OUT, 'GABARITO.json'), JSON.stringify(gabarito, null, 2), 'utf8')

console.log(`\n✅ Pronto. Arquivos em: ${OUT}`)
console.log('   - tema-XX_MODELO-A.html / _MODELO-B.html (pro Dove ler)')
console.log('   - PONTUACAO-CEGA.md (ficha pra pontuar)')
console.log('   - GABARITO.json (só abrir DEPOIS de pontuar)')
