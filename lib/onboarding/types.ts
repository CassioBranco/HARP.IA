// ============================================================
// ANCOREO — Contrato de dados do onboarding v2 (7 telas)
// Fonte da verdade dos campos que o front (protótipo) liga ao banco.
// Os nomes batem 1:1 com as colunas de onboarding_profiles.
// ============================================================

// ── Enums (espelham os CHECK do banco) ──────────────────────
export type Objetivo =
  | 'servico_agendamento'
  | 'institucional'
  | 'portfolio'
  | 'loja'

// Sub-modo quando objetivo='loja': 'checkout' = vende no site (E2);
// 'catalogo' = vitrine, cliente fecha pelo WhatsApp (E1).
export type LojaModo = 'checkout' | 'catalogo'

export type Porte =
  | 'mei_autonomo'
  | 'micro_pequena'
  | 'media'
  | 'grande'

export type AreaTipo = 'local' | 'regional' | 'nacional'

export type GpeModo = 'vincular' | 'criar' | 'sem'

// 'proprio'     = não tem domínio, a plataforma compra e configura
// 'tenho'       = já tem um domínio próprio, vai apontar o DNS pra cá
// 'subdominio'  = subdomínio grátis em ancoreo.com.br (SEO inferior).
//                 ATENÇÃO infra: exige wildcard *.ancoreo.com.br no Vercel
//                 + CNAME curinga no Registro.br (gate do Cássio).
export type DominioModo = 'proprio' | 'tenho' | 'subdominio'

// Item da seção "Seu conhecimento vale ouro" (E-E-A-T)
export interface ConhecimentoItem {
  pergunta: string
  resposta: string
}

// Serviço listado pelo dono. Ele dá o nome; a descrição quem escreve é a IA
// na geração (por isso nasce vazia). O nome é fato do negócio e não pode ser
// inventado — é a diferença entre o site falar dos serviços que existem e
// falar dos serviços que o modelo achou plausível pro segmento.
export interface ServicoItem {
  name: string
  description: string
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
  loja_modo?: LojaModo | null   // só quando objetivo='loja'
  // Tela 2 — Nome
  business_name?: string | null
  // Tela 3 — Segmento
  setor?: string | null
  profissao?: string | null
  segmento_custom?: string | null
  registro_profissional?: string | null // condicional: profissão regulada
  niche?: string | null              // slug legado (compat /templates + geração)
  differentials?: string | null      // texto livre "o que você faz" (voz do cliente)
  services?: ServicoItem[] | null    // lista de serviços, um por linha (fato, não invenção)
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
  // place_id (ChIJ…) ou cid lido do próprio link. É o que vai permitir ligar
  // na Business Profile API sem pedir nada de novo ao cliente, quando o
  // acesso sair. Sem ele, o link é só um texto que ninguém consulta.
  gbp_place_id?: string | null
  // Tela 6 — Conhecimento (E-E-A-T)
  conhecimento?: ConhecimentoItem[] | null
  target_audience?: string | null    // pra quem ele atende (voz do cliente)
  // O que a pessoa digita no Google não é o nome da profissão, é o problema
  // que ela está tentando resolver. Sem isso o site só sabe se descrever, e
  // não sabe responder busca nenhuma. Vira matéria-prima de FAQ e títulos.
  pain_points?: string | null
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
