// Saneamento do conteúdo gerado pela IA, aplicado ANTES de salvar/retornar.
// Reforça regras de voz do Bloco 0 que o modelo às vezes viola:
//   - zero em-dash / en-dash (regra de voz da marca)
//   - placeholder "[NÃO INFORMADO]" nunca vaza pro texto final
// É uma rede de segurança determinística — não substitui o prompt, complementa.

// Remove o placeholder de campo ausente (com ou sem acento/colchetes) e limpa
// pontuação/espaço que sobra ao redor.
function stripPlaceholder(s: string): string {
  return s
    .replace(/\[?\s*N[ÃA]O\s+INFORMADO\s*\]?/gi, '')
    .replace(/\(\s*\)/g, '')        // parênteses que ficaram vazios
    .replace(/\s{2,}/g, ' ')        // espaços duplicados
    .replace(/\s+([,.;:!?])/g, '$1') // espaço antes de pontuação
    .replace(/([,;:])\s*\1/g, '$1')  // pontuação duplicada (", ,")
    .trim()
}

// Troca em-dash/en-dash por vírgula (quando cercado de espaço) ou hífen (entre
// caracteres, ex.: faixas/números), depois normaliza vírgulas/espaços duplicados.
function stripDashes(s: string): string {
  return s
    .replace(/\s+[—–]\s+/g, ', ')   // "a — b"  -> "a, b"
    .replace(/[—–]/g, '-')           // resto vira hífen comum
    .replace(/,\s*,/g, ',')          // ", ," -> ","
    .replace(/\s{2,}/g, ' ')
}

export function sanitizeText(s: string): string {
  return stripPlaceholder(stripDashes(s))
}

// Aplica sanitizeText em todas as strings de um valor (objeto/array/string),
// preservando a estrutura. Usado nos parsers de saída dos endpoints de IA.
export function deepSanitize<T>(value: T): T {
  if (typeof value === 'string') return sanitizeText(value) as unknown as T
  if (Array.isArray(value)) return value.map(deepSanitize) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = deepSanitize(v)
    return out as T
  }
  return value
}
