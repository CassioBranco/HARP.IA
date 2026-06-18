// ============================================================
// HARPIA — Contrato de dados do onboarding v2 (7 telas)
// Fonte da verdade dos campos que o front (protótipo) liga ao banco.
// Os nomes batem 1:1 com as colunas de onboarding_profiles.
// ============================================================

// ── Enums (espelham os CHECK do banco) ──────────────────────
export type Objetivo =
  | 'servico_agendamento'
  | 'institucional'
  | 'portfolio'
  | 'loja'

export type Porte =
  | 'mei_autonomo'
  | 'micro_pequena'
  | 'media'
  | 'grande'

export type AreaTipo = 'local' | 'regional' | 'nacional'

export type GpeModo = 'vincular' | 'criar' | 'sem'

// 'proprio'     = não tem domínio, a plataforma compra e configura
// 'tenho'       = já tem um domínio próprio, vai apontar o DNS pra cá
// 'subdominio'  = subdomínio grátis em harpia.site (SEO inferior)
export type DominioModo = 'proprio' | 'tenho' | 'subdominio'

// Item da seção "Seu conhecimento vale ouro" (E-E-A-T)
export interface ConhecimentoItem {
  pergunta: string
  resposta: string
}

// Paleta extraída da logo / escolhida
export interface Paleta {
  primary?: string
  accent?: string
  bg?: string
  [key: string]: string | undefined
}

// ── Entrada do autosave (tudo opcional — salva parcial por tela) ──
export interface OnboardingProfileInput {
  // Tela 1 — Objetivo
  objetivo?: Objetivo | null
  // Tela 2 — Nome
  business_name?: string | null
  // Tela 3 — Segmento
  setor?: string | null
  profissao?: string | null
  segmento_custom?: string | null
  registro_profissional?: string | null // condicional: profissão regulada
  niche?: string | null              // slug legado (compat /templates + geração)
  differentials?: string | null      // texto livre "o que você faz" (voz do cliente)
  // Tela 4 — Porte + Área
  porte?: Porte | null
  area_tipo?: AreaTipo | null
  service_radius_km?: number | null
  coverage_areas?: string[] | null
  city?: string | null
  state?: string | null
  // Tela 5 — Google Perfil de Empresa
  gpe_modo?: GpeModo | null
  gpe_link?: string | null
  // Tela 6 — Conhecimento (E-E-A-T)
  conhecimento?: ConhecimentoItem[] | null
  // Tela 7 — Domínio + identidade visual
  dominio_modo?: DominioModo | null
  dominio?: string | null
  logo_url?: string | null
  favicon_url?: string | null
  paleta?: Paleta | null
  // Geral
  tone?: string | null
}

// Resultado do autosave
export interface SaveResult {
  ok: boolean
  id?: string
  completeness?: number
  error?: string
}

// Campos que pesam no cálculo de completude (libera a geração ≥ 70%)
export const COMPLETENESS_FIELDS: (keyof OnboardingProfileInput)[] = [
  'objetivo',
  'business_name',
  'profissao',
  'porte',
  'city',
  'gpe_modo',
  'conhecimento',
  'dominio_modo',
]
