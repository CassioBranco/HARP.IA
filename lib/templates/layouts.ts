// Identidade dos 10 modelos. O CATÁLOGO de verdade (nome, descrição, cores,
// filtros) mora em app/templates/model-data.ts, que é o que a tela de escolha
// usa. Aqui ficam só os tipos: existia uma segunda lista completa neste
// arquivo, sem nenhum leitor, já com nomes divergentes do catálogo real
// ("Tech Neon" contra "Tech"). Duas listas da mesma coisa é uma que mente.
export type LayoutId =
  | 'clean'
  | 'bold'
  | 'profissional'
  | 'portfolio'
  | 'acolhedor'
  | 'conversao'
  | 'magazine'
  | 'academia'
  | 'jovem'
  | 'tech'
