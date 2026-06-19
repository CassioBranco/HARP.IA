-- ============================================================
-- Seed de plan_quotas — cotas por plano (CLAUDE.md §3).
-- Sem essas linhas, o check de cota em /api/generate/site lê
-- a tabela vazia e PULA o hard cap (proteção anti-abuso inativa).
-- monthly_limit NULL = ilimitado (fair use). hard_cap_daily = anti-bot.
-- Idempotente: upsert na PK (plan, resource).
-- ============================================================

insert into plan_quotas (plan, resource, monthly_limit, hard_cap_daily) values
  -- Starter R$97 — caps baixos geram upgrade natural
  ('starter', 'site_generation', 1,    5),
  ('starter', 'blog_post',       4,    5),
  ('starter', 'gbp_post',        30,   5),
  ('starter', 'audit_run',       1,    5),
  ('starter', 'translation',     0,    5),
  -- Pro R$197 — fair use abundante
  ('pro',     'site_generation', 3,    15),
  ('pro',     'blog_post',       20,   15),
  ('pro',     'gbp_post',        NULL, 15),
  ('pro',     'audit_run',       4,    15),
  ('pro',     'translation',     5,    15),
  -- Agency R$297 — ilimitado (fair use), só hard cap diário anti-abuso
  ('agency',  'site_generation', NULL, 50),
  ('agency',  'blog_post',       NULL, 50),
  ('agency',  'gbp_post',        NULL, 50),
  ('agency',  'audit_run',       NULL, 50),
  ('agency',  'translation',     NULL, 50)
on conflict (plan, resource) do update
  set monthly_limit  = excluded.monthly_limit,
      hard_cap_daily = excluded.hard_cap_daily,
      updated_at     = now();
