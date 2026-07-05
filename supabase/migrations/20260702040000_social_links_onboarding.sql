-- ============================================================
-- ANCOREO — social_links em onboarding_profiles
--
-- A coluna já é usada pelo código (BrandPanel do editor grava,
-- build-site-content.ts lê pra montar o SiteContent), mas nunca
-- foi versionada em migration — foi criada direto no banco.
-- Esta migration formaliza a coluna no versionamento.
--
-- Formato: { "whatsapp": "5515991234567", "instagram": "...",
--            "facebook": "...", "tiktok": "...", "youtube": "...",
--            "linkedin": "...", "site_externo": "..." }
-- O campo "whatsapp" alimenta o botão flutuante de redes E o widget
-- de chat/FAQ dos sites publicados (link wa.me).
--
-- Idempotente. NÃO aplicada — apenas escrita/versionada.
-- ============================================================

ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
