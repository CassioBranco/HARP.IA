-- Onboarding tela 1 — sub-modo de loja quando objetivo='loja'.
-- 'checkout' = vende no site (E2); 'catalogo' = vitrine, fecha pelo WhatsApp (E1).
-- Nullable: só preenchido quando o objetivo é loja.
ALTER TABLE onboarding_profiles
  ADD COLUMN IF NOT EXISTS loja_modo TEXT
  CHECK (loja_modo IN ('checkout','catalogo'));
