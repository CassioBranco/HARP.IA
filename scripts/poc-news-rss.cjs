/**
 * PoC — Notícias frescas por nicho + cidade via Google News RSS (sem conta, sem login).
 *
 * Uso:
 *   node scripts/poc-news-rss.cjs "academia de ginástica" "Marília"
 *   node scripts/poc-news-rss.cjs "dentista" "Bauru"
 *
 * Objetivo: provar que dá pra puxar manchetes recentes da área do cliente
 * pra alimentar newsjacking de blog — substituto melhor que o Google Alerts.
 */

// Node 18+ tem fetch nativo. Sem dependências externas.

/** Monta a URL do feed RSS do Google News pra uma busca em pt-BR. */
function buildFeedUrl(query) {
  const q = encodeURIComponent(query)
  return `https://news.google.com/rss/search?q=${q}&hl=pt-BR&gl=BR&ceid=BR:pt`
}

/** Extrai os <item> de um XML de RSS sem libs (regex simples, suficiente pro PoC). */
function parseItems(xml) {
  const items = []
  const blocks = xml.split('<item>').slice(1)
  for (const block of blocks) {
    const body = block.split('</item>')[0]
    const pick = (tag) => {
      const m = body.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
      if (!m) return ''
      return m[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim()
    }
    items.push({
      title: pick('title'),
      link: pick('link'),
      pubDate: pick('pubDate'),
      source: pick('source'),
    })
  }
  return items
}

/** Dias desde a publicação (pra filtrar só o que é fresco). */
function daysAgo(pubDate) {
  const t = Date.parse(pubDate)
  if (Number.isNaN(t)) return null
  return Math.floor((nowMs - t) / 86_400_000)
}

const nowMs = Date.parse(process.env.POC_NOW || '') || Date.parse('2026-06-17T12:00:00Z')

async function fetchNews(query) {
  const url = buildFeedUrl(query)
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (ANCOREO news PoC)' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)
  const xml = await res.text()
  return parseItems(xml)
}

/**
 * Estratégia de busca: combina nicho + cidade pra notícia local,
 * e o nicho sozinho pra tendência ampla da área. O newsjacking local
 * costuma render mais pra GEO/AEO.
 */
async function run() {
  const niche = process.argv[2] || 'academia de ginástica'
  const city = process.argv[3] || 'Marília'

  const queries = [
    { label: `${niche} + ${city} (local)`, q: `"${niche}" "${city}"` },
    { label: `${niche} (tendência da área)`, q: `${niche}` },
    { label: `${city} (contexto local amplo)`, q: `"${city}"` },
  ]

  for (const { label, q } of queries) {
    console.log(`\n${'='.repeat(70)}\n▶ ${label}\n  busca: ${q}\n${'='.repeat(70)}`)
    try {
      const items = await fetchNews(q)
      const fresh = items
        .map((it) => ({ ...it, age: daysAgo(it.pubDate) }))
        .filter((it) => it.age === null || it.age <= 30)
        .slice(0, 8)

      if (!fresh.length) {
        console.log('  (nada recente)')
        continue
      }
      for (const it of fresh) {
        const age = it.age === null ? '?' : it.age === 0 ? 'hoje' : `${it.age}d`
        console.log(`\n  • [${age}] ${it.title}`)
        console.log(`    fonte: ${it.source || '—'}`)
      }
    } catch (e) {
      console.log(`  ERRO: ${e.message}`)
    }
  }
  console.log('')
}

run()
