// Formatação de preço da loja (centavos → moeda local). Reusado pela vitrine,
// PDP e cards — uma fonte só.
export function brl(cents: number, currency = 'BRL'): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`
  }
}
