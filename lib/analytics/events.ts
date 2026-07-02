// Telemetria — nomes de eventos (allowlist). Compartilhado client + server.
// A rota /api/track só aceita eventos desta lista (barreira contra dado arbitrário).
//
// Funil capturado:
//  onboarding_start          → entrou no onboarding
//  onboarding_step_view      → viu a tela N (props.step) — base do funil/abandono
//  onboarding_goal_select    → escolheu objetivo (props.objetivo)
//  onboarding_loja_modo_select → escolheu checkout/catalogo (props.loja_modo)
//  onboarding_generate_block → geração barrada (props.reason, props.seo_total)
//  onboarding_generate_click → clicou em gerar com SEO ok (props.seo_total, props.gpe_linked)
//  template_choose           → escolheu um template (props.layout)
//  template_preview          → abriu a prévia de um template em nova aba (props.layout)
//  site_created              → site criado de fato (props.layout)
//
// Abandono = sessões cujo maior step visto < 7 (não precisa de evento de saída).

export const ANALYTICS_EVENTS = [
  'onboarding_start',
  'onboarding_step_view',
  'onboarding_goal_select',
  'onboarding_loja_modo_select',
  'onboarding_generate_block',
  'onboarding_generate_click',
  'template_choose',
  'template_preview',
  'site_created',
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

export const ANALYTICS_EVENT_SET: ReadonlySet<string> = new Set(ANALYTICS_EVENTS)
