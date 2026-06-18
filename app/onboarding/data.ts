// ============================================================
// HARPIA — Dados do onboarding v2 (7 telas)
// Portado 1:1 do protótipo aprovado (design_handoff_harpia/onboarding/onboarding.html).
// Visual e textos NÃO devem ser alterados aqui sem aprovação.
// ============================================================

import type { Objetivo, Porte } from '@/lib/onboarding/types'

// ── Tela 1 — Objetivo (sugere modelo + paleta) ──────────────
// [id, título, ícone phosphor, descrição]
export const GOALS: [Objetivo, string, string, string][] = [
  ['servico_agendamento', 'Serviço ou agendamento', 'ph-calendar-check', 'Captar clientes e marcar atendimentos.'],
  ['institucional', 'Institucional ou corporativo', 'ph-buildings', 'Passar credibilidade e mostrar a empresa.'],
  ['portfolio', 'Portfólio ou criativo', 'ph-images', 'Apresentar trabalhos com imagem e vídeo.'],
  ['loja', 'Loja ou vendas', 'ph-shopping-bag', 'Vender com catálogo ou loja virtual.'],
]

// ── Tela 3 — Categorias e nichos ────────────────────────────
// [id, label, ícone, nichos[]]
export const CATS: [string, string, string, string[]][] = [
  ['saude', 'Saúde', 'ph-heartbeat', ['Clínica médica', 'Odontologia', 'Psicologia', 'Fisioterapia', 'Veterinária', 'Nutrição', 'Óptica']],
  ['servicos', 'Serviços', 'ph-wrench', ['Chaveiro', 'Eletricista', 'Encanador', 'Reformas', 'Dedetização', 'Limpeza', 'Jardinagem']],
  ['automotivo', 'Automotivo', 'ph-car', ['Mecânica', 'Auto elétrica', 'Funilaria e pintura', 'Lava-rápido', 'Borracharia', 'Som e acessórios']],
  ['beleza', 'Beleza', 'ph-scissors', ['Salão', 'Barbearia', 'Estética', 'Manicure', 'Tatuagem', 'Depilação']],
  ['alimentacao', 'Alimentação', 'ph-fork-knife', ['Restaurante', 'Lanchonete', 'Confeitaria', 'Pizzaria', 'Cafeteria', 'Hamburgueria']],
  ['educacao', 'Educação', 'ph-graduation-cap', ['Escola de idiomas', 'Reforço escolar', 'Curso técnico', 'Música', 'Autoescola']],
  ['profissional', 'Profissional', 'ph-briefcase', ['Advocacia', 'Contabilidade', 'Arquitetura', 'Consultoria', 'Marketing', 'Imobiliária']],
  ['comercio', 'Comércio', 'ph-storefront', ['Loja de roupas', 'Pet shop', 'Papelaria', 'Loja de materiais', 'Farmácia', 'Floricultura']],
  ['eventos', 'Eventos & Lazer', 'ph-confetti', ['Buffet', 'Fotografia', 'Aluguel de festa', 'Academia', 'Estúdio de dança']],
]

// ── Tela 3 — Registro profissional condicional (regulados) ──
export const REGULATED: Record<string, string> = {
  'Clínica médica': 'Número do CRM',
  Odontologia: 'Número do CRO',
  Psicologia: 'Número do CRP',
  Fisioterapia: 'Número do CREFITO',
  Veterinária: 'Número do CRMV',
  Nutrição: 'Número do CRN',
  Advocacia: 'Número da OAB',
  Contabilidade: 'Número do CRC',
  Arquitetura: 'Número do CAU',
}

// ── Tela 4 — Porte (adapta o campo de área) ─────────────────
// [id, título, ícone, descrição]
export const PORTES: [Porte, string, string, string][] = [
  ['mei_autonomo', 'MEI ou autônomo', 'ph-user', 'Sou eu que toco. Foco no meu bairro e cidade.'],
  ['micro_pequena', 'Micro ou pequena', 'ph-users-three', 'Equipe pequena. Atendo minha cidade e a região.'],
  ['media', 'Média', 'ph-buildings', 'Vários profissionais. Atendo outras cidades e estados.'],
  ['grande', 'Grande', 'ph-globe-hemisphere-west', 'Operação ampla, atendimento nacional ou B2B.'],
]

// ── Tela 6 — Conhecimento guiado (E-E-A-T) ──────────────────
// [pergunta, placeholder de exemplo]
export const KQUESTIONS: [string, string][] = [
  [
    'O que seus clientes mais perguntam, e o que você responde?',
    'Ex.: Perguntam se clareamento estraga o dente. Não estraga quando feito por dentista; o que sensibiliza é o produto de farmácia sem acompanhamento.',
  ],
  [
    'Um truque ou detalhe da sua área que poucos sabem?',
    'Ex.: Pneu com mais de 5 anos resseca mesmo sem rodar; dá pra ver pela data gravada na lateral (semana e ano).',
  ],
]

// ── Mapa label do nicho → slug legado (preset/geração) ──────
// Best-effort: o cliente reescolhe o nicho no seletor de modelo; isto é só uma dica.
export const NICHE_SLUG: Record<string, string> = {
  'Clínica médica': 'clinica',
  Odontologia: 'odontologia',
  Psicologia: 'psicologia',
  Fisioterapia: 'fisioterapia',
  Veterinária: 'veterinaria',
  Nutrição: 'nutricao',
  Advocacia: 'advocacia',
  Contabilidade: 'contabilidade',
  Consultoria: 'consultoria',
  Arquitetura: 'arquitetura',
  Imobiliária: 'imobiliaria',
  Marketing: 'servicos',
  Salão: 'salao',
  Barbearia: 'barbearia',
  Estética: 'estetica',
  Restaurante: 'restaurante',
  Lanchonete: 'lanchonete',
  Confeitaria: 'padaria',
  Pizzaria: 'restaurante',
  Cafeteria: 'lanchonete',
  Hamburgueria: 'restaurante',
  'Escola de idiomas': 'idiomas',
  'Reforço escolar': 'escola',
  'Curso técnico': 'escola',
  Academia: 'academia',
}

// Deriva o slug legado a partir do nome do nicho (fallback 'servicos')
export function nicheToSlug(niche: string): string {
  return NICHE_SLUG[niche] ?? 'servicos'
}

// Deriva o tipo de área a partir do porte
export function areaTipoFromPorte(porte: Porte): 'local' | 'regional' | 'nacional' {
  if (porte === 'mei_autonomo' || porte === 'micro_pequena') return 'local'
  if (porte === 'media') return 'regional'
  return 'nacional'
}

// Categoria (id) que contém um dado nicho/label
export function catOfNiche(label: string): string | null {
  const f = CATS.find((c) => c[3].includes(label))
  return f ? f[0] : null
}

// Adivinha o nicho a partir do texto livre "o que você faz".
// Best-effort por palavras-chave. Retorna null quando não dá pra inferir
// com confiança (melhor nenhum palpite do que um errado).
export function guessNiche(text: string): string | null {
  const t = (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  if (t.trim().length < 3) return null
  const KW: [RegExp, string][] = [
    [/(clinic|medic|consultori|pediatr|cardiolog|dermatolog|ortoped)/, 'Clínica médica'],
    [/(dent|odonto|ortodont|implante dent)/, 'Odontologia'],
    [/(psicolog|terapeut|terapia)/, 'Psicologia'],
    [/(fisioterap|\bfisio\b|pilates)/, 'Fisioterapia'],
    [/(veterinari|veterinar)/, 'Veterinária'],
    [/(nutri|dieta)/, 'Nutrição'],
    [/(otic|optic|oculos|lente de grau)/, 'Óptica'],
    [/(chaveiro|chave)/, 'Chaveiro'],
    [/(eletricist|instalacao eletric)/, 'Eletricista'],
    [/(encanad|hidraulic)/, 'Encanador'],
    [/(reforma|pedreiro|construc|\bobra)/, 'Reformas'],
    [/(dedetiz|controle de pragas|\bpragas)/, 'Dedetização'],
    [/(limpeza|faxina|diarist)/, 'Limpeza'],
    [/(jardin|paisag)/, 'Jardinagem'],
    [/(mecanic|oficina)/, 'Mecânica'],
    [/(auto.?eletric)/, 'Auto elétrica'],
    [/(funilaria|lanternag|pintura de carr)/, 'Funilaria e pintura'],
    [/(lava.?rapid|lavagem de carr|estetica automot)/, 'Lava-rápido'],
    [/(borrach|\bpneu)/, 'Borracharia'],
    [/(insulfilm|som automot|acessorio.*autom)/, 'Som e acessórios'],
    [/(salao|cabelei|cabelo)/, 'Salão'],
    [/(barbear|barbeiro)/, 'Barbearia'],
    [/(estetic|skincare|limpeza de pele)/, 'Estética'],
    [/(manicure|\bunha|nail)/, 'Manicure'],
    [/(tatuage|tattoo)/, 'Tatuagem'],
    [/(depila|\bcera\b)/, 'Depilação'],
    [/(restaurante|almoco|\bjantar|comida)/, 'Restaurante'],
    [/(lanchonet|\blanche|salgad)/, 'Lanchonete'],
    [/(confeitar|\bbolo|\bdoce)/, 'Confeitaria'],
    [/(pizza)/, 'Pizzaria'],
    [/(cafeteria|\bcafe\b|coffee)/, 'Cafeteria'],
    [/(hamburg|burguer|burger)/, 'Hamburgueria'],
    [/(idioma|ingles|espanhol)/, 'Escola de idiomas'],
    [/(reforco escolar|aula particular)/, 'Reforço escolar'],
    [/(curso tecnic|profissionaliz)/, 'Curso técnico'],
    [/(autoescola|auto.?escola|\bcnh\b|habilita)/, 'Autoescola'],
    [/(advog|advocac|juridic|\bdireito)/, 'Advocacia'],
    [/(contabil|contador)/, 'Contabilidade'],
    [/(arquitet)/, 'Arquitetura'],
    [/(consultor)/, 'Consultoria'],
    [/(marketing|trafego|social media|agencia)/, 'Marketing'],
    [/(imobili|imovel|imoveis|corretor de imov)/, 'Imobiliária'],
    [/(roupa|\bmoda|vestuario|boutique)/, 'Loja de roupas'],
    [/(pet.?shop)/, 'Pet shop'],
    [/(papelaria)/, 'Papelaria'],
    [/(material de constru|materiais de constru)/, 'Loja de materiais'],
    [/(farmacia|drogaria)/, 'Farmácia'],
    [/(flores|floricultura|buque)/, 'Floricultura'],
    [/(buffet|bufe)/, 'Buffet'],
    [/(fotograf)/, 'Fotografia'],
    [/(aluguel de festa|decoracao de festa)/, 'Aluguel de festa'],
    [/(academia|crossfit|muscula)/, 'Academia'],
    [/(\bdanca|ballet|zumba)/, 'Estúdio de dança'],
  ]
  for (const [re, label] of KW) if (re.test(t)) return label
  return null
}

// Slug do domínio a partir do nome do negócio
export function slugifyBusiness(name: string): string {
  return (
    (name || 'seunegocio')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 30) || 'seunegocio'
  )
}

// Normaliza o domínio que o cliente digitou: tira http(s)://, "www.", caminho,
// espaços e deixa minúsculo. Ex.: "https://www.MeuNegocio.com.br/" -> "meunegocio.com.br"
export function cleanDomain(raw: string): string {
  return (raw || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '')
}

// Validação leve de domínio (label.tld, aceita subníveis tipo .com.br)
export function isValidDomain(raw: string): boolean {
  const d = cleanDomain(raw)
  return /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(d)
}
