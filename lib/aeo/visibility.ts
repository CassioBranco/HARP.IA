// ============================================================
// ANCOREO — Painel AEO: camada de dados de visibilidade em IA.
//
// AEO monitoring (citação de marca em ChatGPT/Gemini/AI Mode,
// visitas de bots de IA, prompts monitorados) ainda é greenfield:
// NÃO há tabelas no Supabase pra isso. Estes tipos espelham o
// schema futuro pra que a fiação real seja um drop-in depois.
//
// Por enquanto `getAiVisibility` devolve dados de DEMONSTRAÇÃO
// (isSample=true) só pra dar forma à tela. A versão real vira
// uma função async que lê as tabelas ai_visibility_* + reusa
// buildSiteScores() de lib/seo/site-score para o sub-score AEO.
// ============================================================

export type CitationStatus = 'cited' | 'partial' | 'absent'

/** Uma pergunta real que clientes fazem às IAs; checamos se a marca aparece na resposta. */
export interface MonitoredPrompt {
  id: string
  prompt: string
  engines: string[]        // ex.: ['ChatGPT', 'Gemini']
  status: CitationStatus
}

export interface CompetitorScore {
  name: string
  score: number            // 0–100
  you?: boolean
}

export interface EngineCitation {
  engine: string
  pct: number              // % de respostas em que a marca aparece
}

export interface BotVisit {
  bot: string
  visits: number
}

export type ActionCta = 'generate' | 'apply' | 'howto'

export interface RecommendedAction {
  id: string
  impact: number           // ganho estimado de pontos no score
  title: string
  detail: string
  cta: ActionCta
}

export interface AiVisibility {
  score: number            // 0–100, sub-score AEO agregado
  scoreDelta: number       // variação em 30 dias
  trend: number[]          // série do score (mais antigo → mais recente)
  brandCitations: number
  citationsDelta: number
  botVisitsTotal: number
  botVisitsDelta: number   // % vs. semana anterior
  promptsUsed: number
  promptsLimit: number
  prompts: MonitoredPrompt[]
  competitors: CompetitorScore[]
  engines: EngineCitation[]
  botVisits: BotVisit[]
  actions: RecommendedAction[]
  isSample: boolean
}

/**
 * Dados de demonstração da tela. Determinístico por siteId (sem Math.random)
 * pra não piscar entre renders no server. Troque por leitura real das tabelas
 * de monitoramento quando o pipeline de tracking existir.
 */
export function getAiVisibility(siteId: string, bizName?: string): AiVisibility {
  const you = bizName?.trim() || 'Sua marca'
  return {
    score: 64,
    scoreDelta: 9,
    trend: [55, 56, 54, 58, 59, 61, 60, 63, 64],
    brandCitations: 28,
    citationsDelta: 4,
    botVisitsTotal: 1204,
    botVisitsDelta: -3,
    promptsUsed: 7,
    promptsLimit: 25,
    prompts: [
      { id: 'p1', prompt: 'melhor dentista para implante em Sorocaba', engines: ['ChatGPT', 'Gemini'], status: 'cited' },
      { id: 'p2', prompt: 'quanto custa implante dentário em Sorocaba', engines: ['ChatGPT'], status: 'partial' },
      { id: 'p3', prompt: 'ortodontia com alinhador perto de mim', engines: ['Gemini', 'AI Mode'], status: 'absent' },
      { id: 'p4', prompt: 'clínica odontológica que atende convênio Sorocaba', engines: ['ChatGPT'], status: 'cited' },
      { id: 'p5', prompt: 'vale a pena fazer clareamento a laser', engines: ['AI Mode'], status: 'absent' },
    ],
    competitors: [
      { name: you, score: 64, you: true },
      { name: 'OdontoMais', score: 52 },
      { name: 'Sorriso SP', score: 38 },
      { name: 'Dental Vida', score: 31 },
    ],
    engines: [
      { engine: 'ChatGPT', pct: 71 },
      { engine: 'Perplexity', pct: 33 },
      { engine: 'Gemini', pct: 40 },
      { engine: 'AI Mode', pct: 22 },
    ],
    botVisits: [
      { bot: 'GPTBot (OpenAI)', visits: 512 },
      { bot: 'Google-Extended', visits: 388 },
      { bot: 'PerplexityBot', visits: 201 },
      { bot: 'ClaudeBot', visits: 103 },
    ],
    actions: [
      { id: 'a1', impact: 6, title: 'Criar página respondendo "ortodontia com alinhador perto de mim"', detail: 'Prompt ausente em Gemini e AI Mode, com alto volume local.', cta: 'generate' },
      { id: 'a2', impact: 4, title: 'Adicionar FAQ com schema na Home', detail: 'IAs citam blocos de FAQ com JSON-LD com muito mais frequência.', cta: 'apply' },
      { id: 'a3', impact: 3, title: 'Publicar 3 avaliações no Google Perfil', detail: 'Reforça a entidade da marca citada pelas IAs.', cta: 'howto' },
    ],
    isSample: true,
  }
}
