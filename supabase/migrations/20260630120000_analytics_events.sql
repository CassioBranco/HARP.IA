-- Telemetria de funil (onboarding + criação de site).
--
-- LGPD (privacy-by-design):
--  • Minimização: sem PII, sem IP, sem user-agent cru. Só evento + contexto pobre.
--  • session_id = id aleatório (cookie httpOnly), NÃO derivado de identidade.
--  • tenant_id é OPCIONAL (atividade da própria conta do assinante) e é anulado
--    se o tenant for apagado (on delete set null) — viabiliza o direito ao esquecimento.
--  • device = classe grossa (mobile/tablet/desktop), sem fingerprint.
--  • Base legal: legítimo interesse p/ melhoria do produto (métricas agregadas),
--    com opt-out (cookie aco_no_track). Banner de consentimento entra no cartão S04.
--  • Retenção sugerida: 12 meses (limpeza periódica — cartão futuro).
--
-- Acesso: dado de PLATAFORMA. RLS nega por padrão; leitura só server-side via
-- service_role (painel interno). Nenhuma policy p/ anon/authenticated.

create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event       text not null,
  session_id  text,
  tenant_id   uuid references public.tenants(id) on delete set null,
  step        text,
  path        text,
  device      text check (device in ('mobile','tablet','desktop')),
  props       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_event_time_idx on public.analytics_events (event, created_at desc);
create index if not exists analytics_events_session_idx     on public.analytics_events (session_id);
create index if not exists analytics_events_tenant_idx       on public.analytics_events (tenant_id);

alter table public.analytics_events enable row level security;

-- RLS sem policies = ninguém comum lê/escreve. service_role ignora RLS (ingest/leitura server-side).
revoke all on public.analytics_events from anon, authenticated;
grant all on public.analytics_events to service_role;

comment on table public.analytics_events is
  'Telemetria de funil (onboarding/criação de site). LGPD: pseudônimo, 1st-party, sem PII/IP. Base legal: legítimo interesse + opt-out. Leitura só via service_role.';
