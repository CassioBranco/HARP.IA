-- Migration: expandir presets de 8 para 14 nichos
-- Data: 2026-06-04
-- Motivo: adicionar nichos regulados (advocacia, contabilidade, psicologia)
--         e nichos de saúde específicos (odontologia, fisioterapia, veterinaria)

-- 1. Atualizar constraint da tabela sites
ALTER TABLE sites
  DROP CONSTRAINT IF EXISTS sites_preset_check;

ALTER TABLE sites
  ADD CONSTRAINT sites_preset_check
  CHECK (preset IN (
    -- Profissões reguladas (grupo 1)
    'advocacia',
    'contabilidade',
    'psicologia',
    -- Saúde (grupo 2)
    'clinica',
    'odontologia',
    'fisioterapia',
    'veterinaria',
    -- Originais (grupo 3)
    'imobiliaria',
    'servicos',
    'institucional',
    'restaurante',
    'salao',
    'escola',
    'landing'
  ));

-- 2. Atualizar constraint da tabela onboarding_profiles (campo niche)
ALTER TABLE onboarding_profiles
  DROP CONSTRAINT IF EXISTS onboarding_profiles_niche_check;

-- niche é campo livre (TEXT), sem constraint — armazena o valor selecionado pelo usuário.
-- Validação acontece no frontend + na API, não no banco (permite flexibilidade futura).

-- 3. Inserir regras de score para os novos nichos na tabela score_rules
-- (complementa os dados de seed existentes)
INSERT INTO score_rules (rule_key, description, weight, scope, is_active)
VALUES
  ('schema_legalservice',         'Schema LegalService presente (advocacia)',         1.5, 'site', true),
  ('schema_accountingservice',    'Schema AccountingService presente (contabilidade)', 1.5, 'site', true),
  ('schema_mentalhealth',         'Schema MentalHealthBusiness presente (psicologia)', 1.5, 'site', true),
  ('schema_dentist',              'Schema Dentist presente (odontologia)',             1.5, 'site', true),
  ('schema_veterinarycare',       'Schema VeterinaryCare presente (veterinaria)',      1.5, 'site', true),
  ('compliance_regulated_niche',  'Site de nicho regulado: restrições de conteúdo aplicadas', 2.0, 'site', true),
  ('credential_present',          'Número de registro profissional (OAB/CRC/CRP/CRO/CRMV) presente no site', 1.5, 'site', true)
ON CONFLICT (rule_key) DO NOTHING;

-- Notas para o próximo dev:
-- • Os templates visuais de cada nicho ficam em components/templates/{preset}/
-- • As paletas ficam em design/paletas/{preset}-{0|1|2}.css
-- • A documentação completa de restrições de conteúdo está em docs/NICHOS.md
