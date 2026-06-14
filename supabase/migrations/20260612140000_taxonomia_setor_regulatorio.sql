-- ============================================================
-- HARPIA — Taxonomia de nichos: Setor → Profissão + módulo regulatório
-- Substitui os 14 nichos soltos por 10 setores + tabela de profissões
-- + 3 módulos de restrição de conselho (forte/moderada/leve).
-- Idempotente.
-- ============================================================

-- 1. Amplia o CHECK de scope: + 'setor' e 'regulatorio'
ALTER TABLE prompt_templates DROP CONSTRAINT IF EXISTS prompt_templates_scope_check;
ALTER TABLE prompt_templates ADD CONSTRAINT prompt_templates_scope_check
  CHECK (scope IN ('global','agent','objetivo','setor','regulatorio','niche'));

-- 2. Novas colunas no perfil do onboarding
ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS setor TEXT;
ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS profissao TEXT;
ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS registro_profissional TEXT;

-- 3. Tabela de profissões (alimenta o menu do onboarding e o assembler de prompt)
CREATE TABLE IF NOT EXISTS niche_taxonomy (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissao_key TEXT UNIQUE NOT NULL,            -- slug, ex: 'dentista'
  label         TEXT NOT NULL,                   -- exibição, ex: 'Dentista'
  setor         TEXT NOT NULL,                   -- chave do setor
  schema_type   TEXT NOT NULL,                   -- schema.org
  regulado      BOOLEAN DEFAULT false,
  conselho      TEXT,                            -- ex: 'CFO'
  doc_label     TEXT,                            -- label do campo extra, ex: 'CRO'
  restricao     TEXT CHECK (restricao IN ('forte','moderada','leve')),
  ordem         INT DEFAULT 0,                   -- ordenação no menu
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Taxonomia é config pública (não sensível): leitura liberada, escrita só service_role
GRANT SELECT ON niche_taxonomy TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON niche_taxonomy TO service_role;
REVOKE INSERT, UPDATE, DELETE ON niche_taxonomy FROM anon, authenticated;

-- ============================================================
-- 4. Os 10 SETORES (substituem os 14 nichos)
-- ============================================================
DELETE FROM prompt_templates WHERE scope IN ('niche','setor','regulatorio');

INSERT INTO prompt_templates (scope, agent, objetivo, niche, version, content) VALUES

('setor', 'onboarding', NULL, 'saude', 1, $PROMPT$
SETOR: Saúde & Bem-estar
Schema JSON-LD base: MedicalBusiness (especialize por profissão: Dentist, Physiotherapy, etc.).
Tom: profissional e acolhedor. Paciente = pessoa, nunca "usuário". Cuidado acima de venda.
Credencial do conselho é obrigatória no bloco de autoridade e no rodapé.
FAQ deve incluir: como é a primeira consulta/avaliação, como agendar, convênios/planos atendidos.
$PROMPT$),

('setor', 'onboarding', NULL, 'juridico_financeiro', 1, $PROMPT$
SETOR: Jurídico & Financeiro
Schema JSON-LD base: LegalService ou AccountingService / FinancialService.
Tom: sério, técnico mas acessível. Autoridade sem arrogância. Segurança e confiança são os valores centrais.
Credencial do conselho obrigatória. Conteúdo informativo (direitos, obrigações fiscais) é bem-vindo e gera autoridade.
FAQ deve incluir: como funciona a consulta/proposta inicial, documentos necessários, áreas de atuação.
$PROMPT$),

('setor', 'onboarding', NULL, 'beleza', 1, $PROMPT$
SETOR: Beleza & Estética
Schema JSON-LD base: HealthAndBeautyBusiness (BeautySalon, HairSalon, etc.).
Tom: moderno, estético, confiante. Resultado visual importa.
Portfólio / antes-e-depois é seção valorizada. Profissionais com nome e especialidade em destaque.
FAQ deve incluir: como agendar, duração do procedimento, cuidados antes e depois.
$PROMPT$),

('setor', 'onboarding', NULL, 'alimentacao', 1, $PROMPT$
SETOR: Alimentação
Schema JSON-LD base: FoodEstablishment (Restaurant, Bakery, CafeOrCoffeeShop, etc.).
Tom: apetitoso, sensorial, acolhedor. Descreve sabores e ambiente.
Horários de funcionamento em destaque obrigatório. Mencionar bairro/região. Foto do produto/ambiente como hero.
FAQ deve incluir: horários, reservas/pedidos, opções para restrições alimentares, delivery.
$PROMPT$),

('setor', 'onboarding', NULL, 'casa_construcao', 1, $PROMPT$
SETOR: Casa & Construção
Schema JSON-LD base: HomeAndConstructionBusiness (ou ProfessionalService p/ projeto).
Tom: confiável, técnico, focado em resolver o problema do cliente. Prova de trabalho feito importa.
Área de atuação e raio de cobertura em destaque. Diferenciais concretos (garantia, prazo, anos de experiência).
FAQ deve incluir: como solicitar orçamento, prazo de execução, área de cobertura, garantia do serviço.
$PROMPT$),

('setor', 'onboarding', NULL, 'automotivo', 1, $PROMPT$
SETOR: Automotivo
Schema JSON-LD base: AutomotiveBusiness (AutoRepair, etc.).
Tom: direto, confiável, técnico-acessível. Agilidade e confiança são os apelos.
Serviços com clareza (o que faz, para qual tipo de veículo). Horário e localização em destaque.
FAQ deve incluir: como agendar/levar o veículo, formas de pagamento, garantia do serviço, marcas atendidas.
$PROMPT$),

('setor', 'onboarding', NULL, 'educacao', 1, $PROMPT$
SETOR: Educação
Schema JSON-LD base: EducationalOrganization.
Tom: inspirador, acessível, focado em resultado de carreira/vida (sem usar a palavra "transformação").
Catálogo de cursos com modalidade (Presencial/EAD/Híbrido) e carga horária. Depoimentos com resultado concreto.
FAQ deve incluir: como funciona a matrícula, certificado reconhecido, modalidades, valores/condições.
$PROMPT$),

('setor', 'onboarding', NULL, 'imobiliario', 1, $PROMPT$
SETOR: Imobiliário
Schema JSON-LD base: RealEstateAgent.
Tom: confiante, experiente, local. Conhecimento do bairro é o diferencial.
CRECI obrigatório no rodapé. Mencionar 3-5 bairros ou regiões de atuação explicitamente. Hero com imóvel/cidade, nunca foto de escritório.
FAQ deve incluir: documentação necessária, como funciona a avaliação, financiamento, regiões atendidas.
$PROMPT$),

('setor', 'onboarding', NULL, 'comercio', 1, $PROMPT$
SETOR: Comércio / Loja
Schema JSON-LD base: Store + ItemList; cada produto = Product (price/offers só se informado).
ESCOPO: catálogo/vitrine SEM checkout. Conversão por contato (WhatsApp, telefone) ou visita à loja.
NÃO usar "compre online", "adicione ao carrinho". CTA leva ao contato.
Descrição de produto rica em keyword + cidade (SEO de "onde comprar X em [cidade]"). Bairro e formas de entrega/retirada.
FAQ deve incluir: formas de pagamento, entrega/retirada, trocas, horário e localização.
$PROMPT$),

('setor', 'onboarding', NULL, 'servicos', 1, $PROMPT$
SETOR: Serviços & Profissional (curinga)
Schema JSON-LD base: ProfessionalService ou LocalBusiness.
Tom: direto, competente, confiável. Adapte o vocabulário à profissão específica informada no perfil.
Área de atuação e raio de cobertura em destaque. Diferenciais concretos (tempo de resposta, garantia, experiência).
FAQ deve incluir: como contratar/solicitar orçamento, prazo de atendimento, área de cobertura.
$PROMPT$);

-- ============================================================
-- 5. Os 3 MÓDULOS REGULATÓRIOS (injetados quando a profissão é regulada)
-- ============================================================
INSERT INTO prompt_templates (scope, agent, objetivo, niche, version, content) VALUES

('regulatorio', 'onboarding', NULL, 'forte', 1, $PROMPT$
RESTRIÇÃO DE CONSELHO — NÍVEL FORTE (Medicina/CFM, Odontologia/CFO, Psicologia/CFP, Advocacia/OAB).
Estas regras são INVIOLÁVEIS — violá-las expõe o cliente a processo ético no conselho:
- NUNCA prometer ou garantir resultado ("vai curar", "sorriso garantido", "ganha a causa", "recuperação certa").
- NUNCA usar preço, desconto ou promoção como apelo principal.
- NUNCA fazer comparativo com outros profissionais ou estabelecimentos.
- NUNCA usar "antes e depois" sensacionalista nem prometer estética.
- SEMPRE exibir o registro do conselho (campo `registro_profissional`) no rodapé e no bloco de autoridade.
- Tom sóbrio e informativo. A autoridade vem da competência demonstrada, não de superlativos.
$PROMPT$),

('regulatorio', 'onboarding', NULL, 'moderada', 1, $PROMPT$
RESTRIÇÃO DE CONSELHO — NÍVEL MODERADO (Fisio/COFFITO, Nutrição/CFN, Veterinária/CFMV, Fono/CFFa, Enfermagem/COFEN, Contabilidade/CFC).
- Credencial do conselho (campo `registro_profissional`) obrigatória no rodapé e na autoridade.
- Não garantir resultado nem tempo de recuperação específico.
- Não usar preço como apelo principal; conteúdo informativo é bem-vindo.
- Evitar comparativos diretos com concorrentes.
$PROMPT$),

('regulatorio', 'onboarding', NULL, 'leve', 1, $PROMPT$
RESTRIÇÃO DE CONSELHO — NÍVEL LEVE (Arquitetura/CAU, Engenharia/CONFEA-CREA, Corretagem/COFECI-CRECI).
- Exibir o registro do conselho (campo `registro_profissional`) no rodapé.
- Publicidade mais livre, mas manter veracidade: não prometer o que não pode entregar.
$PROMPT$);

-- ============================================================
-- 6. Seed da TABELA DE PROFISSÕES (menu + mapeamento)
--    Reguladas marcadas com conselho/doc/restrição. Demais = livres.
-- ============================================================
DELETE FROM niche_taxonomy;

INSERT INTO niche_taxonomy (profissao_key, label, setor, schema_type, regulado, conselho, doc_label, restricao, ordem) VALUES
-- SAÚDE
('medico',         'Médico / Clínica',          'saude', 'MedicalBusiness',      true,  'CFM',     'CRM',     'forte',    10),
('dentista',       'Dentista',                  'saude', 'Dentist',              true,  'CFO',     'CRO',     'forte',    11),
('psicologo',      'Psicólogo',                 'saude', 'MedicalBusiness',      true,  'CFP',     'CRP',     'forte',    12),
('fisioterapeuta', 'Fisioterapeuta',            'saude', 'Physiotherapy',        true,  'COFFITO', 'CREFITO', 'moderada', 13),
('nutricionista',  'Nutricionista',             'saude', 'MedicalBusiness',      true,  'CFN',     'CRN',     'moderada', 14),
('veterinario',    'Veterinário',               'saude', 'VeterinaryCare',       true,  'CFMV',    'CRMV',    'moderada', 15),
('fonoaudiologo',  'Fonoaudiólogo',             'saude', 'MedicalBusiness',      true,  'CFFa',    'CRFa',    'moderada', 16),
('enfermeiro',     'Enfermeiro',                'saude', 'MedicalBusiness',      true,  'COFEN',   'COREN',   'moderada', 17),
('terapeuta',      'Terapeuta / Bem-estar',     'saude', 'MedicalBusiness',      false, NULL,      NULL,      NULL,       18),
-- JURÍDICO & FINANCEIRO
('advogado',       'Advogado',                  'juridico_financeiro', 'LegalService',      true,  'OAB', 'OAB', 'forte',    20),
('contador',       'Contador',                  'juridico_financeiro', 'AccountingService', true,  'CFC', 'CRC', 'moderada', 21),
('consultor_fin',  'Consultor Financeiro',      'juridico_financeiro', 'FinancialService',  false, NULL,  NULL,  NULL,       22),
('despachante',    'Despachante',               'juridico_financeiro', 'ProfessionalService', false, NULL, NULL,  NULL,       23),
-- BELEZA & ESTÉTICA
('salao',          'Salão de Beleza',           'beleza', 'BeautySalon',  false, NULL, NULL, NULL, 30),
('barbearia',      'Barbearia',                 'beleza', 'HairSalon',    false, NULL, NULL, NULL, 31),
('esteticista',    'Estética / Spa',            'beleza', 'DaySpa',       false, NULL, NULL, NULL, 32),
('manicure',       'Manicure / Nail Designer',  'beleza', 'NailSalon',    false, NULL, NULL, NULL, 33),
('depilacao',      'Depilação',                 'beleza', 'HealthAndBeautyBusiness', false, NULL, NULL, NULL, 34),
-- ALIMENTAÇÃO
('restaurante',    'Restaurante',               'alimentacao', 'Restaurant',        false, NULL, NULL, NULL, 40),
('lanchonete',     'Lanchonete / Hamburgueria', 'alimentacao', 'FastFoodRestaurant', false, NULL, NULL, NULL, 41),
('padaria',        'Padaria',                   'alimentacao', 'Bakery',            false, NULL, NULL, NULL, 42),
('cafeteria',      'Cafeteria',                 'alimentacao', 'CafeOrCoffeeShop',  false, NULL, NULL, NULL, 43),
('pizzaria',       'Pizzaria',                  'alimentacao', 'Restaurant',        false, NULL, NULL, NULL, 44),
('doceria',        'Doceria / Confeitaria',     'alimentacao', 'Bakery',            false, NULL, NULL, NULL, 45),
('bar',            'Bar',                       'alimentacao', 'BarOrPub',          false, NULL, NULL, NULL, 46),
-- CASA & CONSTRUÇÃO
('arquiteto',      'Arquiteto',                 'casa_construcao', 'ProfessionalService',        true,  'CAU',    'CAU',  'leve', 50),
('engenheiro',     'Engenheiro Civil',          'casa_construcao', 'ProfessionalService',        true,  'CONFEA', 'CREA', 'leve', 51),
('pedreiro',       'Pedreiro / Reforma',        'casa_construcao', 'HomeAndConstructionBusiness', false, NULL, NULL, NULL, 52),
('eletricista',    'Eletricista',               'casa_construcao', 'Electrician',                 false, NULL, NULL, NULL, 53),
('encanador',      'Encanador',                 'casa_construcao', 'Plumber',                     false, NULL, NULL, NULL, 54),
('pintor',         'Pintor',                    'casa_construcao', 'HousePainter',                false, NULL, NULL, NULL, 55),
('marceneiro',     'Marceneiro',                'casa_construcao', 'HomeAndConstructionBusiness', false, NULL, NULL, NULL, 56),
('dedetizadora',   'Dedetizadora',              'casa_construcao', 'HomeAndConstructionBusiness', false, NULL, NULL, NULL, 57),
-- AUTOMOTIVO
('oficina',        'Oficina Mecânica',          'automotivo', 'AutoRepair',        false, NULL, NULL, NULL, 60),
('borracharia',    'Borracharia',               'automotivo', 'AutomotiveBusiness', false, NULL, NULL, NULL, 61),
('autocenter',     'Auto Center',               'automotivo', 'AutomotiveBusiness', false, NULL, NULL, NULL, 62),
('lavarapido',     'Lava-Rápido / Estética Automotiva', 'automotivo', 'AutoWash',  false, NULL, NULL, NULL, 63),
('funilaria',      'Funilaria e Pintura',       'automotivo', 'AutoBodyShop',      false, NULL, NULL, NULL, 64),
-- EDUCAÇÃO
('escola',         'Escola',                    'educacao', 'School',                false, NULL, NULL, NULL, 70),
('curso',          'Curso Livre / Profissionalizante', 'educacao', 'EducationalOrganization', false, NULL, NULL, NULL, 71),
('idiomas',        'Escola de Idiomas',         'educacao', 'LanguageSchool',        false, NULL, NULL, NULL, 72),
('autoescola',     'Autoescola',                'educacao', 'DrivingSchool',         false, NULL, NULL, NULL, 73),
('reforco',        'Reforço Escolar',           'educacao', 'EducationalOrganization', false, NULL, NULL, NULL, 74),
-- IMOBILIÁRIO
('imobiliaria',    'Imobiliária / Corretor',    'imobiliario', 'RealEstateAgent', true, 'COFECI', 'CRECI', 'leve', 80),
-- COMÉRCIO / LOJA
('loja_roupa',     'Loja de Roupas',            'comercio', 'ClothingStore',     false, NULL, NULL, NULL, 90),
('petshop',        'Pet Shop',                  'comercio', 'PetStore',          false, NULL, NULL, NULL, 91),
('floricultura',   'Floricultura',              'comercio', 'Florist',           false, NULL, NULL, NULL, 92),
('otica',          'Ótica',                     'comercio', 'Store',             false, NULL, NULL, NULL, 93),
('moveis',         'Loja de Móveis',            'comercio', 'FurnitureStore',    false, NULL, NULL, NULL, 94),
('eletronicos',    'Eletrônicos',              'comercio', 'ElectronicsStore',  false, NULL, NULL, NULL, 95),
-- SERVIÇOS & PROFISSIONAL (curinga)
('fotografo',      'Fotógrafo',                 'servicos', 'ProfessionalService', false, NULL, NULL, NULL, 100),
('eventos',        'Eventos / Buffet',          'servicos', 'ProfessionalService', false, NULL, NULL, NULL, 101),
('limpeza',        'Limpeza / Diarista',        'servicos', 'ProfessionalService', false, NULL, NULL, NULL, 102),
('consultoria',    'Consultoria',               'servicos', 'ProfessionalService', false, NULL, NULL, NULL, 103),
('marketing',      'Marketing / Agência',       'servicos', 'ProfessionalService', false, NULL, NULL, NULL, 104),
('personal',       'Personal Trainer',          'servicos', 'ProfessionalService', false, NULL, NULL, NULL, 105);
