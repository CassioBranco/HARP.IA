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
//
// Telemetria do SITE PUBLICADO do cliente (visitante anônimo, outro host):
//  site_view                 → visita a uma página do site do cliente.
//                              tenant_id e props.domain são resolvidos NO SERVIDOR
//                              a partir do Host da requisição (o visitante não
//                              consegue forjar visita pro site de outro cliente).
//                              props.kind = home | blog | post | loja | produto

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
  'site_view',
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

export const ANALYTICS_EVENT_SET: ReadonlySet<string> = new Set(ANALYTICS_EVENTS)
