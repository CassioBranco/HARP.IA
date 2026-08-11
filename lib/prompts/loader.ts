import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────────────────────
// Loader de prompts — modelo de 2 eixos (Objetivo × Nicho)
//
// Monta o system prompt concatenando camadas, da mais geral à mais específica:
//   global      → regras gerais (SEO/GEO/AEO, anti-IA, FAQ, CTA)
//   agent       → contrato de saída do agente (estrutura do JSON)
//   objetivo    → estrutura/CTA/schema base (Serviço, Institucional, Portfólio, Loja)
//   setor       → vocabulário + schema do setor (10 setores cobrem todo negócio local)
//   regulatorio → restrições do conselho, injetadas só se a profissão for regulada
//   + injeção da profissão específica (nome livre) como instrução de vocabulário
//
// A profissão (niche) é resolvida via tabela `niche_taxonomy`:
//   profissão → setor + flag regulado + nível de restrição.
// Profissão fora da tabela cai no fallback gracioso (IA infere o vocabulário).
//
// Tabelas de config são lidas via service_role (admin), nunca pela sessão do cliente.
// ─────────────────────────────────────────────────────────────────────────────

type PromptRow = {
  scope: string
  agent: string | null
  objetivo: string | null
  niche: string | null
  content: string
}

type TaxonomyRow = {
  profissao_key: string
  label: string
  setor: string
  regulado: boolean
  restricao: string | null
}

export async function buildSystemPrompt(
  agent: string,
  niche?: string | null,
  objetivo?: string | null
): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('prompt_templates')
    .select('scope, agent, objetivo, niche, content')
    .eq('is_active', true)

  if (error) throw new Error(`Falha ao carregar prompt_templates: ${error.message}`)

  const rows = (data ?? []) as PromptRow[]
  if (rows.length === 0) throw new Error('Nenhum prompt ativo encontrado')

  // Resolve a profissão → setor + restrição (tolerante a tabela ausente)
  let taxo: TaxonomyRow | null = null
  if (niche) {
    const { data: tx } = await supabase
      .from('niche_taxonomy')
      .select('profissao_key, label, setor, regulado, restricao')
      .eq('profissao_key', niche)
      .eq('is_active', true)
      .maybeSingle()
    taxo = (tx as TaxonomyRow | null) ?? null
  }

  const take = (pred: (r: PromptRow) => boolean) =>
    rows.filter(pred).map(r => r.content.trim()).filter(Boolean)

  const layers: string[] = []

  // 1. Global — regras inegociáveis
  layers.push(...take(r => r.scope === 'global'))

  // 2. Agente — contrato de saída (estrutura do JSON)
  layers.push(...take(r => r.scope === 'agent' && r.agent === agent))

  // 3. Objetivo — estrutura/CTA/schema base
  if (objetivo) layers.push(...take(r => r.scope === 'objetivo' && r.objetivo === objetivo))

  // 4. Setor — vocabulário + schema do setor
  if (taxo) {
    layers.push(...take(r => r.scope === 'setor' && r.niche === taxo!.setor))

    // 5. Módulo regulatório — só para profissão regulada
    if (taxo.regulado && taxo.restricao) {
      layers.push(...take(r => r.scope === 'regulatorio' && r.niche === taxo!.restricao))
    }

    // 6. Injeta a profissão específica para afinar o vocabulário
    layers.push(`PROFISSÃO ESPECÍFICA: ${taxo.label}. Use o vocabulário exato dessa profissão.`)
  } else if (niche) {
    // Fallback gracioso: profissão fora da taxonomia (texto livre / setor novo).
    // Cobre também o legado (nichos antigos) e o caso de a migração não ter rodado.
    const legacySetor = take(r => r.scope === 'setor' && r.niche === niche)
    if (legacySetor.length) {
      layers.push(...legacySetor)
    } else {
      layers.push(
        `PROFISSÃO/NICHO: "${niche}" — sem mapeamento cadastrado. ` +
        `Infira o vocabulário técnico do setor, o schema JSON-LD mais adequado e o CTA ideal a partir da descrição livre do negócio no perfil. ` +
        `Se for área regulada (saúde, jurídico, financeiro, engenharia), aplique as restrições do conselho: ` +
        `não prometa resultado, não use preço como apelo principal, não faça comparativos, exiba o registro profissional.`
      )
    }
  }

  const result = layers.filter(Boolean).join('\n\n---\n\n')
  if (!result) throw new Error('Nenhuma camada de prompt aplicável')
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Serialização do perfil para o user prompt
//
// Antes isto era `JSON.stringify(profile)`: o modelo recebia um despejo cru da
// linha do banco — nome de coluna em inglês, enum interno ('mei_autonomo'),
// campos de encanamento (id, tenant_id, completeness_score) e uma parede de
// nulls dos campos que o onboarding ainda não coleta. Duas consequências:
//   1. o modelo não sabia PARA QUE serve cada campo (que `conhecimento` são as
//      palavras do próprio dono, que `coverage_areas` são os bairros a citar);
//   2. a parede de null ensinava que o negócio não tem nada a dizer, e a saída
//      voltava vaga.
//
// Agora: briefing rotulado em português, só com o que está preenchido, e o
// rótulo diz o que fazer com o campo. Campo vazio some — a REGRA DE FATOS do
// prompt já manda usar marcador [ ] quando o dado não existir.
// ─────────────────────────────────────────────────────────────────────────────

// Enums internos → texto que o modelo entende sem adivinhar.
const PORTE_LABEL: Record<string, string> = {
  mei_autonomo:  'MEI ou autônomo (uma pessoa só)',
  micro_pequena: 'micro ou pequena empresa (2 a 49 pessoas)',
  media:         'média empresa (50 a 249 pessoas)',
  grande:        'grande empresa (250+ pessoas)',
}

const OBJETIVO_LABEL: Record<string, string> = {
  servico_agendamento: 'captar clientes e marcar atendimentos',
  institucional:       'passar credibilidade e apresentar a empresa',
  portfolio:           'apresentar trabalhos e portfólio',
  loja:                'vender produtos',
}

const AREA_LABEL: Record<string, string> = {
  local:     'atende a própria cidade e bairros vizinhos',
  regional:  'atende a região e cidades vizinhas',
  nacional:  'atende o país inteiro',
}

// Campos de encanamento e de identidade visual: não ajudam a escrever texto.
const IGNORAR = new Set([
  'id', 'tenant_id', 'site_id', 'created_at', 'updated_at',
  'completeness_score', 'gbp_connected', 'gbp_data', 'gbp_place_id',
  'paleta', 'logo_url', 'favicon_url', 'dominio_modo', 'loja_modo',
  'setor', 'gpe_modo', 'conhecimento',
])

// Ordem = ordem de leitura do briefing. Primeiro quem o negócio é, depois o
// que ele sabe, depois onde ele atende, por último preferências de forma.
const CAMPOS: [string, string][] = [
  ['business_name',         'NOME DO NEGÓCIO'],
  ['profissao',             'PROFISSÃO / ATIVIDADE'],
  ['segmento_custom',       'SEGMENTO (descrito pelo próprio dono)'],
  ['niche',                 'NICHO (código interno, use só como dica de vocabulário)'],
  ['objetivo',              'OBJETIVO DO SITE'],
  ['differentials',         'O QUE O NEGÓCIO FAZ (nas palavras do dono)'],
  ['services',              'SERVIÇOS OFERECIDOS (use exatamente estes; não invente outros)'],
  ['target_audience',       'PARA QUEM ELE ATENDE'],
  ['pain_points',           'PROBLEMAS QUE O CLIENTE CHEGA TENTANDO RESOLVER (material do FAQ e dos títulos: a busca acontece pelo problema, não pelo nome da profissão)'],
  ['cases',                 'CASOS E RESULTADOS REAIS'],
  ['credentials',           'CREDENCIAIS'],
  ['registro_profissional', 'REGISTRO PROFISSIONAL (número real e verificável — exiba no texto, é sinal de autoridade)'],
  ['years_experience',      'ANOS DE EXPERIÊNCIA'],
  ['city',                  'CIDADE'],
  ['state',                 'ESTADO (UF)'],
  ['coverage_areas',        'BAIRROS E CIDADES ATENDIDAS (cite pelo nome no texto — é o que faz o site aparecer nas buscas locais)'],
  ['service_radius_km',     'RAIO DE ATENDIMENTO (km)'],
  ['area_tipo',             'ALCANCE'],
  ['porte',                 'PORTE'],
  ['keywords_primary',      'PALAVRA-CHAVE PRINCIPAL (precisa aparecer no título e nos primeiros 100 caracteres)'],
  ['keywords_secondary',    'PALAVRAS-CHAVE SECUNDÁRIAS'],
  ['gpe_link',              'GOOGLE PERFIL DE EMPRESA'],
  ['dominio',               'DOMÍNIO'],
  ['social_links',          'REDES E CONTATO'],
  ['tone',                  'TOM DE VOZ'],
]

// Vazio = não entra no briefing. '', null, [], {} e 0 contam como vazio
// (0 ano de experiência não é fato útil, é campo não preenchido).
function vazio(v: unknown): boolean {
  if (v === null || v === undefined || v === '' || v === 0) return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}

function formatarValor(chave: string, v: unknown): string {
  if (chave === 'porte'     && typeof v === 'string') return PORTE_LABEL[v]    ?? v
  if (chave === 'objetivo'  && typeof v === 'string') return OBJETIVO_LABEL[v] ?? v
  if (chave === 'area_tipo' && typeof v === 'string') return AREA_LABEL[v]     ?? v

  if (Array.isArray(v)) {
    return v
      .map(item => {
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          // serviço: { name, description }
          if (typeof o['name'] === 'string') {
            const desc = typeof o['description'] === 'string' && o['description'] ? ` — ${o['description']}` : ''
            return `${o['name']}${desc}`
          }
          return JSON.stringify(item)
        }
        return String(item)
      })
      .filter(Boolean)
      .map(linha => `  - ${linha}`)
      .join('\n')
  }

  if (v && typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .filter(([, val]) => !vazio(val))
      .map(([k, val]) => `  - ${k}: ${String(val)}`)
      .join('\n')
  }

  return String(v)
}

// Bloco separado: são respostas escritas pelo dono, na voz dele. É o material
// de maior valor do perfil (E-E-A-T) e o único que a concorrência não tem.
function blocoConhecimento(v: unknown): string {
  if (!Array.isArray(v) || v.length === 0) return ''
  const pares = v
    .filter((i): i is Record<string, unknown> => Boolean(i) && typeof i === 'object')
    .map(i => ({ p: String(i['pergunta'] ?? '').trim(), r: String(i['resposta'] ?? '').trim() }))
    // Resposta de uma palavra ("clareamento") não é conhecimento: é campo
    // preenchido pra passar da tela. Apresentá-la como "o material mais
    // valioso do perfil" faz o modelo inventar contexto em cima do vazio —
    // exatamente o que a REGRA DE FATOS proíbe. Fora do briefing ela vira
    // ausência honesta, e o modelo usa marcador [ ] no lugar.
    .filter(i => i.p && i.r.length >= 25)
  if (pares.length === 0) return ''

  return [
    'CONHECIMENTO DO PRÓPRIO DONO (respostas escritas por ele, na voz dele).',
    'Este é o material mais valioso do perfil: é informação que a concorrência',
    'não tem e que a IA não conseguiria inventar. Aproveite no FAQ e no texto',
    'institucional, preservando o sentido e os detalhes concretos. Pode adaptar',
    'a forma; não contradiga nem generalize o conteúdo.',
    ...pares.map(({ p, r }) => `\n  P: ${p}\n  R: ${r}`),
  ].join('\n')
}

export function serializeProfile(profile: Record<string, unknown>): string {
  const blocos: string[] = []

  for (const [chave, rotulo] of CAMPOS) {
    if (IGNORAR.has(chave)) continue
    const valor = profile[chave]
    if (vazio(valor)) continue
    const texto = formatarValor(chave, valor)
    if (!texto.trim()) continue
    blocos.push(texto.includes('\n') ? `${rotulo}:\n${texto}` : `${rotulo}: ${texto}`)
  }

  const conhecimento = blocoConhecimento(profile['conhecimento'])
  if (conhecimento) blocos.push(conhecimento)

  if (blocos.length === 0) return '(perfil sem informações preenchidas)'
  return blocos.join('\n\n')
}
