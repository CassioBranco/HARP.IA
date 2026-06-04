-- ============================================================
-- HARPIA — Schema inicial (17 tabelas + RLS multi-tenant)
-- Rodar no Supabase: SQL Editor → cola tudo → Run
-- Gerado pelo padrão supabase-dba. Ver CLAUDE.md §4.
-- ============================================================

-- Extensão para embeddings (RAG / knowledge_vault)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- MULTI-TENANT BASE
-- ============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT CHECK (plan IN ('starter','pro','agency')) DEFAULT 'starter',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','editor')) DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SITES E CONTEÚDO
-- ============================================================
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  domain TEXT UNIQUE,
  preset TEXT CHECK (preset IN ('clinica','imobiliaria','servicos','institucional','restaurante','salao','escola','landing')),
  palette_index INT DEFAULT 0,
  status TEXT CHECK (status IN ('draft','published','archived')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  schema_type TEXT,
  intent TEXT CHECK (intent IN ('informacional','comercial','transacional','navegacional')) DEFAULT 'transacional',
  intent_secondary TEXT CHECK (intent_secondary IN ('informacional','comercial','transacional','navegacional')),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, slug)
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB,
  order_index INT DEFAULT 0,
  locked BOOLEAN DEFAULT false
);

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  original_url TEXT,
  webp_url TEXT,
  alt_text TEXT,
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  schema_faq JSONB,
  intent TEXT CHECK (intent IN ('informacional','comercial','transacional','navegacional')) DEFAULT 'informacional',
  intent_secondary TEXT CHECK (intent_secondary IN ('informacional','comercial','transacional','navegacional')),
  status TEXT CHECK (status IN ('draft','review','published')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, slug)
);

-- Grafo de links internos (anti-página-órfã — Regra 7)
CREATE TABLE internal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('page','blog_post')) NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT CHECK (target_type IN ('page','blog_post')) NOT NULL,
  target_id UUID NOT NULL,
  anchor_text TEXT,
  auto_created BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id)
);
CREATE INDEX idx_internal_links_target ON internal_links (target_type, target_id);
CREATE INDEX idx_internal_links_site ON internal_links (site_id);

-- ============================================================
-- ONBOARDING (área de atuação por raio)
-- ============================================================
CREATE TABLE onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  business_name TEXT,
  niche TEXT,
  city TEXT,
  state TEXT,
  service_radius_km INT,
  coverage_areas TEXT[],
  services JSONB,
  differentials TEXT,
  target_audience TEXT,
  pain_points TEXT,
  credentials TEXT[],
  years_experience INT,
  cases TEXT,
  keywords_primary TEXT[],
  keywords_secondary TEXT[],
  tone TEXT,
  gbp_connected BOOLEAN DEFAULT false,
  gbp_place_id TEXT,
  gbp_data JSONB,
  completeness_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- IA
-- ============================================================
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT CHECK (scope IN ('global','agent','niche')) NOT NULL,
  agent TEXT,
  niche TEXT,
  version INT DEFAULT 1,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ia_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  site_id UUID REFERENCES sites(id),
  agent TEXT NOT NULL,
  prompt_snapshot TEXT,
  input_data JSONB,
  output_data JSONB,
  tokens_used INT,
  duration_ms INT,
  status TEXT CHECK (status IN ('pending','running','done','failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SCORE / QUOTAS / BILLING
-- ============================================================
CREATE TABLE score_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT UNIQUE NOT NULL,
  description TEXT,
  weight NUMERIC DEFAULT 1.0,
  scope TEXT CHECK (scope IN ('site','page','blog')),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE plan_quotas (
  plan TEXT NOT NULL CHECK (plan IN ('starter','pro','agency')),
  resource TEXT NOT NULL CHECK (resource IN ('blog_post','gbp_post','site_generation','audit_run','translation')),
  monthly_limit INT,
  hard_cap_daily INT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (plan, resource)
);

CREATE TABLE tenant_usage (
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  resource TEXT NOT NULL,
  count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tenant_id, period_start, resource)
);

-- ============================================================
-- AUDITORIA
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COFRE DE CONHECIMENTO (RAG)
-- ============================================================
CREATE TABLE knowledge_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_knowledge_vault_embedding ON knowledge_vault USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- RLS — ISOLAMENTO MULTI-TENANT
-- Cada tenant só enxerga os próprios dados.
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_vault ENABLE ROW LEVEL SECURITY;

-- Helper: tenant_id do usuário logado
-- (subquery em users a partir do auth.uid())

-- tenants: o usuário vê só o próprio tenant
CREATE POLICY tenant_self ON tenants
  USING (id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- users: vê usuários do mesmo tenant
CREATE POLICY users_same_tenant ON users
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Tabelas com tenant_id: isolamento padrão
CREATE POLICY tenant_isolation ON sites
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON pages
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON sections
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON images
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON blog_posts
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON internal_links
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON onboarding_profiles
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON ia_generations
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON subscriptions
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON tenant_usage
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY tenant_isolation ON knowledge_vault
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- ============================================================
-- FIM. 17 tabelas criadas com isolamento multi-tenant.
-- prompt_templates, score_rules, plan_quotas, audit_logs são
-- de configuração/sistema (sem tenant_id) — acesso controlado
-- pela aplicação (service_role), não expostas ao cliente.
-- ============================================================
