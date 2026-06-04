-- Seed de quotas por plano.
-- Editavel via painel admin durante beta sem deploy.
-- monthly_limit NULL = ilimitado (fair use).
-- hard_cap_daily sempre ativo (anti-abuso bot/scraping).

INSERT INTO plan_quotas (plan, resource, monthly_limit, hard_cap_daily) VALUES
  -- Starter (R$97/mes)
  ('starter', 'site_generation', 1,    3),
  ('starter', 'blog_post',       4,    5),
  ('starter', 'gbp_post',        30,   10),
  ('starter', 'audit_run',       1,    2),
  ('starter', 'translation',     0,    0),

  -- Pro (R$197/mes)
  ('pro',     'site_generation', 3,    5),
  ('pro',     'blog_post',       20,   10),
  ('pro',     'gbp_post',        NULL, 30),
  ('pro',     'audit_run',       4,    5),
  ('pro',     'translation',     5,    3),

  -- Agency (R$297/mes)
  ('agency',  'site_generation', NULL, 10),
  ('agency',  'blog_post',       NULL, 50),
  ('agency',  'gbp_post',        NULL, 100),
  ('agency',  'audit_run',       NULL, 20),
  ('agency',  'translation',     NULL, 30);
