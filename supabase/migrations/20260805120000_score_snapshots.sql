-- Histórico do score SEO/GEO/AEO/EEAT.
--
-- Problema que resolve: /api/score/[siteId] calcula o score a cada visita ao
-- painel e joga fora. Sem histórico, o cliente vê um número solto e não
-- consegue provar que melhorou — que é justamente o que ele compra.
--
-- Granularidade: UM ponto por site por dia (unique em site_id, day). O painel
-- chama a rota várias vezes ao dia; o upsert só reescreve o ponto de hoje.
-- Isso mantém a série limpa e o volume previsível (365 linhas/site/ano).
--
-- Acesso: o dono LÊ (policy de select por tenant). Escrita é só do servidor
-- via service_role — histórico é registro do sistema, não pode ser forjado
-- pelo cliente logado.

create table if not exists public.score_snapshots (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references public.sites(id)   on delete cascade,
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  -- dia em UTC: mesma base do eixo dos gráficos do painel
  day        date not null default (now() at time zone 'utc')::date,
  overall    smallint not null check (overall between 0 and 100),
  seo        smallint not null check (seo     between 0 and 100),
  geo        smallint not null check (geo     between 0 and 100),
  aeo        smallint not null check (aeo     between 0 and 100),
  eeat       smallint not null check (eeat    between 0 and 100),
  -- rule_keys que falharam nesse dia: permite mostrar "o que você corrigiu"
  failing    text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists score_snapshots_site_day_key
  on public.score_snapshots (site_id, day);

create index if not exists score_snapshots_site_day_idx
  on public.score_snapshots (site_id, day desc);

alter table public.score_snapshots enable row level security;

-- Só leitura pro dono. Sem policy de insert/update/delete: quem grava é o
-- service_role (que ignora RLS) dentro de /api/score.
create policy tenant_read on public.score_snapshots
  for select using (tenant_id = (select tenant_id from public.users where id = auth.uid()));

grant select on public.score_snapshots to authenticated;
grant all    on public.score_snapshots to service_role;

comment on table public.score_snapshots is
  'Histórico diário do score SEO/GEO/AEO/EEAT por site. 1 linha por site/dia (upsert). Leitura pelo dono via RLS; escrita só server-side.';
