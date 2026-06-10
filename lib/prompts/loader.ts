import { createServerClient } from '@/lib/supabase/server'

// Monta o system prompt final concatenando as 3 camadas:
// global → agent → niche
export async function buildSystemPrompt(
  agent: string,
  niche?: string
): Promise<string> {
  const supabase = await createServerClient()

  const { data: rows } = await supabase
    .from('prompt_templates')
    .select('scope, content')
    .eq('is_active', true)
    .or(
      `scope.eq.global,` +
      `and(scope.eq.agent,agent.eq.${agent}),` +
      `and(scope.eq.niche,niche.eq.${niche ?? ''})`
    )
    .order('scope', { ascending: true }) // global → agent → niche

  if (!rows || rows.length === 0) {
    throw new Error(`Nenhum prompt ativo encontrado para agent=${agent} niche=${niche}`)
  }

  // Ordem: global primeiro, depois agent, depois niche
  const ORDER = { global: 0, agent: 1, niche: 2 }
  const sorted = [...rows].sort(
    (a, b) => (ORDER[a.scope as keyof typeof ORDER] ?? 9) - (ORDER[b.scope as keyof typeof ORDER] ?? 9)
  )

  return sorted.map(r => r.content.trim()).join('\n\n---\n\n')
}

// Serializa o perfil do onboarding em texto estruturado para o user prompt
export function serializeProfile(profile: Record<string, unknown>): string {
  return JSON.stringify(profile, null, 2)
}
