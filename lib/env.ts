// Havia aqui um validador de variáveis de ambiente com zod que ninguém
// chamava: prometia derrubar o app na partida se faltasse chave, e na prática
// nunca rodou. Quem checa de verdade é hasSupabaseEnv, usado no layout e nas
// rotas. Validação que ninguém executa é pior que nenhuma, porque dá a
// impressão de que o problema está coberto.
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
