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

// Serializa o perfil do onboarding em texto estruturado para o user prompt
export function serializeProfile(profile: Record<string, unknown>): string {
  return JSON.stringify(profile, null, 2)
}
