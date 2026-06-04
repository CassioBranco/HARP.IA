# NICHOS — Projeto HARPIA
> Fonte de verdade de todos os presets de nicho. Define schema JSON-LD, seções obrigatórias, CTA, paleta, restrições de conteúdo e keywords padrão.
> A IA de geração (Agente Onboarding + Agente Blog) DEVE consultar este documento antes de gerar qualquer texto — especialmente as restrições de conteúdo por nicho.
> Última atualização: 2026-06-04

---

## COMO USAR

Cada nicho tem:
- **Schema JSON-LD** → tipo correto para structured data
- **CTA principal** → verbo de posse obrigatório (nunca "Clique aqui")
- **Seções obrigatórias** → o que a IA gera para esse preset
- **Restrições de conteúdo** → o que a IA NÃO PODE escrever (compliance regulatório)
- **Keywords padrão** → pré-populadas no onboarding, cliente pode editar
- **Paleta** → vibe visual do nicho

---

## GRUPO 1 — PROFISSÕES REGULADAS
> Profissões com restrições significativas a tráfego pago. SEO orgânico é o canal principal ou único viável.

---

### `advocacia` — Escritório de Advocacia / Advogado
**Órgão regulador:** OAB — Provimento 205/2021 (CFOAB)
**Schema JSON-LD:** `LegalService` + `Attorney` (Person) ou `LawFirm` (Organization)
**CTA principal:** "Agendar consulta" / "Falar com advogado"
**Paleta:** Azul-marinho profundo + dourado — sobriedade, autoridade, confiança

**Seções obrigatórias:**
1. Hero — área de atuação + cidade + CTA consulta
2. Áreas de Atuação — serviços jurídicos (sem prometer resultado)
3. Sobre o Escritório / Advogado — formação, OAB, experiência
4. Processo de Atendimento — como funciona a consulta (transparência)
5. Depoimentos — testemunhos de clientes (sem mencionar caso ou resultado)
6. FAQ — ≥6 perguntas frequentes da área de atuação
7. Contato — formulário + WhatsApp + endereço (para LocalBusiness schema)

**⚠️ RESTRIÇÕES DE CONTEÚDO — OAB Provimento 205/2021:**
- **PROIBIDO** prometer resultado: nunca usar "garanto", "você vai ganhar", "chance alta de vitória"
- **PROIBIDO** mencionar honorários, valores, descontos, formas de pagamento, parcelamento
- **PROIBIDO** usar casos concretos de clientes para atrair novos clientes
- **PROIBIDO** linguagem mercantilista: "promoção", "melhor preço", "mais barato que..."
- **PROIBIDO** sensacionalismo: "especialista número 1", "escritório mais premiado"
- **PROIBIDO** comparar com outros advogados ou escritórios
- **PERMITIDO** mencionar formação, pós-graduação, anos de experiência
- **PERMITIDO** listar áreas de atuação de forma informativa
- **PERMITIDO** publicidade informativa e discreta sobre a especialidade
- ⚠️ OABs estaduais variam — OAB/DF proibiu Google Ads; gerar nota de aviso ao cliente sobre consultar sua seccional

**Keywords padrão sugeridas:**
- `advogado [área] [cidade]` (ex: advogado trabalhista sorocaba)
- `escritório de advocacia [cidade]`
- `consulta jurídica [cidade]`
- `advogado [área] próximo`

---

### `contabilidade` — Escritório de Contabilidade / Contador
**Órgão regulador:** CFC — NBC PG 01 (Código de Ética Profissional do Contabilista)
**Schema JSON-LD:** `AccountingService` (LocalBusiness subtype)
**CTA principal:** "Solicitar proposta" / "Falar com contador"
**Paleta:** Azul-escuro + verde-discreto — seriedade, precisão, confiança financeira

**Seções obrigatórias:**
1. Hero — tipo de serviço + cidade + CTA proposta
2. Serviços Contábeis — BPO, abertura de empresa, folha, fiscal, contábil
3. Sobre o Escritório — CRC, equipe, tempo de mercado
4. Quem Atendemos — segmentos (MEI, PME, e-commerce, etc.)
5. Depoimentos
6. FAQ — ≥6 perguntas frequentes (abertura de empresa, simples nacional, etc.)
7. Contato

**⚠️ RESTRIÇÕES DE CONTEÚDO — CFC NBC PG 01:**
- **PROIBIDO** usar preço como apelo principal ou comparar com concorrentes
- **PROIBIDO** afirmações desproporcionais: "melhor contador de [cidade]"
- **PROIBIDO** prometer economia de impostos como garantia ("vou reduzir seus impostos X%")
- **PERMITIDO** mencionar expertise, certificações, CRC, número de clientes atendidos
- **PERMITIDO** conteúdo técnico-educativo sobre obrigações fiscais
- Restrição prática: conteúdo deve ser técnico e informativo

**Keywords padrão sugeridas:**
- `contador [cidade]`
- `escritório contabilidade [cidade]`
- `abertura de empresa [cidade]`
- `contador para MEI [cidade]`
- `BPO financeiro [cidade]`

---

### `psicologia` — Consultório de Psicologia / Psicólogo
**Órgão regulador:** CFP — Código de Ética + Nota Técnica CFP 01/2022
**Schema JSON-LD:** `MedicalBusiness` + `Psychologist` (Person) ou `MentalHealthBusiness`
**CTA principal:** "Agendar sessão" / "Iniciar atendimento"
**Paleta:** Verde-sálvia + bege-quente — acolhimento, calma, segurança

**Seções obrigatórias:**
1. Hero — abordagem terapêutica + cidade + CTA sessão
2. Abordagens e Especialidades — TCC, psicanálise, EMDR, etc.
3. Para Quem Atendo — adultos, crianças, casais, organizações
4. Sobre a Psicóloga/Psicólogo — formação, CRP, especializações
5. Como Funciona — processo de atendimento (online/presencial)
6. FAQ — ≥6 perguntas (o que é terapia, quanto tempo dura, etc.)
7. Contato

**⚠️ RESTRIÇÕES DE CONTEÚDO — CFP Código de Ética:**
- **PROIBIDO** usar termos de preço como apelo: "valor acessível", "preço social", "desconto"
- **PROIBIDO** cupons promocionais ou sorteios
- **PROIBIDO** explorar vulnerabilidades do público: "está sofrendo? me chame agora"
- **PROIBIDO** prometer resultado terapêutico específico
- **PROIBIDO** depoimentos de pacientes sem total anonimato e descaracterização
- **PERMITIDO** informar abordagens terapêuticas, formação, CRP
- **PERMITIDO** conteúdo educativo sobre saúde mental
- CRP obrigatório em destaque no site

**Keywords padrão sugeridas:**
- `psicólogo [cidade]`
- `terapia [abordagem] [cidade]`
- `psicólogo [especialidade] [cidade]` (ex: psicólogo infantil sorocaba)
- `terapia online [cidade/estado]`

---

### `odontologia` — Clínica Odontológica / Dentista
**Órgão regulador:** CFO — Código de Ética Odontológica + Resolução CFO-196/2019
**Schema JSON-LD:** `Dentist` (HealthcareBusiness subtype)
**CTA principal:** "Agendar consulta" / "Marcar avaliação"
**Paleta:** Branco + azul-claro — limpeza, higiene, saúde, claridade

**Seções obrigatórias:**
1. Hero — especialidade principal + cidade + CTA avaliação
2. Tratamentos — implante, ortodontia, clareamento, etc.
3. Diferenciais — tecnologia, equipe, infraestrutura
4. Sobre o Dentista/Clínica — CRO, formação, especializações
5. Antes e Depois — com contexto educativo (permitido pela R. CFO-196/2019)
6. FAQ — ≥6 perguntas sobre os procedimentos
7. Contato + mapa

**⚠️ RESTRIÇÕES DE CONTEÚDO — CFO:**
- **PROIBIDO** garantir resultado de tratamento ou comparar com outros dentistas
- **PROIBIDO** divulgar preços como apelo principal (atenção: decisão do CADE mar/2025 abre brecha — aguardar consolidação)
- **PROIBIDO** sensacionalismo
- **PERMITIDO** antes e depois com contexto educativo, sem manipulação de imagem
- **PERMITIDO** mencionar tecnologia, cursos e certificações
- CRO obrigatório no site

**Keywords padrão sugeridas:**
- `dentista [cidade]`
- `clínica odontológica [cidade]`
- `implante dentário [cidade]`
- `ortodontista [cidade]`
- `clareamento dental [cidade]`

---

## GRUPO 2 — SAÚDE (extensões da `clinica`)
> A `clinica` genérica cobre médicos gerais. Os presets abaixo cobrem profissionais de saúde com especificidade suficiente para justificar template próprio.

---

### `clinica` — Clínica / Consultório Médico *(já existia)*
**Órgão regulador:** CFM — Resolução CFM nº 2.336/2023
**Schema JSON-LD:** `HealthcareBusiness` > `Physician` / `MedicalClinic`
**CTA principal:** "Agendar consulta"
**Paleta:** Teal (azul-esverdeado) — calma, confiança, saúde

**⚠️ RESTRIÇÕES de conteúdo — CFM 2336/2023:**
- **PROIBIDO** garantir ou insinuar resultado de tratamento
- **PROIBIDO** antes/depois irresponsável — permitido apenas educativo, sem manipulação, com variedade de resultados
- **PROIBIDO** "práticas revolucionárias" sem reconhecimento do CFM
- **PROIBIDO** alegar especialidade sem RQE registrado no CRM
- CRM e RQE obrigatórios no site

---

### `fisioterapia` — Clínica de Fisioterapia
**Órgão regulador:** COFFITO
**Schema JSON-LD:** `HealthcareBusiness` + `PhysicalTherapist`
**CTA principal:** "Agendar avaliação" / "Iniciar tratamento"
**Paleta:** Verde-claro + branco — movimento, saúde, recuperação

**Seções obrigatórias:**
1. Hero — especialidade + cidade + CTA avaliação
2. Especialidades — ortopédica, neurológica, esportiva, pélvica, etc.
3. Processo de Atendimento — avaliação → plano → sessões
4. Sobre o Fisioterapeuta — CREFITO, formação
5. Depoimentos
6. FAQ — ≥6 perguntas
7. Contato

**⚠️ RESTRIÇÕES:** Sem promessas de cura; sem técnicas não reconhecidas; depoimentos sem identificar paciente.

**Keywords padrão:** `fisioterapeuta [cidade]`, `fisioterapia [especialidade] [cidade]`, `clínica fisioterapia [cidade]`

---

### `veterinaria` — Clínica Veterinária / Pet Shop
**Órgão regulador:** CFMV — Resolução CFMV 1649/2025
**Schema JSON-LD:** `VeterinaryCare` (LocalBusiness subtype)
**CTA principal:** "Agendar consulta" / "Marcar atendimento"
**Paleta:** Verde + laranja-suave — natureza, cuidado, carinho

**Seções obrigatórias:**
1. Hero — especialidade + cidade + CTA consulta
2. Serviços — consulta, vacinas, cirurgia, internação, banho/tosa
3. Espécies Atendidas — cães, gatos, exóticos
4. Sobre a Equipe — CRMV, especializações
5. Estrutura — equipamentos, internação
6. FAQ — ≥6 perguntas
7. Contato + plantão 24h (se aplicável)

**⚠️ RESTRIÇÕES — CFMV 1649/2025:**
- **PERMITIDO** divulgar preços de consultas e vacinas (novidade de 2025)
- **PROIBIDO** divulgar valores de cirurgias
- **PROIBIDO** casos clínicos sem autorização do tutor
- **PROIBIDO** promessas de resultado

**Keywords padrão:** `veterinário [cidade]`, `clínica veterinária [cidade]`, `pet shop [cidade]`

---

## GRUPO 3 — NICHOS ORIGINAIS (mantidos, expandidos)

| Preset | Schema | CTA | Restrição |
|--------|--------|-----|-----------|
| `imobiliaria` | `RealEstateAgent` | "Agendar visita" | Nenhuma regulatória |
| `servicos` | `LocalBusiness` | "Solicitar orçamento" | Nenhuma regulatória |
| `institucional` | `Organization` | "Falar com especialista" | Nenhuma regulatória |
| `restaurante` | `Restaurant` | "Ver cardápio" | Nenhuma regulatória |
| `salao` | `BeautySalon` | "Agendar horário" | Nenhuma regulatória |
| `escola` | `EducationalOrganization` | "Conhecer cursos" | Nenhuma regulatória |
| `landing` | `WebPage` | Personalizado | Nenhuma regulatória |

---

## TABELA CONSOLIDADA — TODOS OS PRESETS

| Preset | Grupo | Schema JSON-LD | Conselho | Restrição conteúdo |
|--------|-------|----------------|----------|--------------------|
| `advocacia` | Regulada | `LegalService` | OAB | 🔴 Forte |
| `contabilidade` | Regulada | `AccountingService` | CFC | 🟡 Moderada |
| `psicologia` | Regulada | `MentalHealthBusiness` | CFP | 🔴 Forte |
| `odontologia` | Saúde | `Dentist` | CFO | 🔴 Forte |
| `clinica` | Saúde | `HealthcareBusiness` | CFM | 🔴 Forte |
| `fisioterapia` | Saúde | `HealthcareBusiness` | COFFITO | 🟡 Moderada |
| `veterinaria` | Saúde | `VeterinaryCare` | CFMV | 🟡 Moderada |
| `imobiliaria` | Original | `RealEstateAgent` | — | ⚪ Nenhuma |
| `servicos` | Original | `LocalBusiness` | — | ⚪ Nenhuma |
| `institucional` | Original | `Organization` | — | ⚪ Nenhuma |
| `restaurante` | Original | `Restaurant` | — | ⚪ Nenhuma |
| `salao` | Original | `BeautySalon` | — | ⚪ Nenhuma |
| `escola` | Original | `EducationalOrganization` | — | ⚪ Nenhuma |
| `landing` | Original | `WebPage` | — | ⚪ Nenhuma |

**Total: 14 presets** (era 8, adicionamos: advocacia, contabilidade, psicologia, odontologia, fisioterapia, veterinaria)

---

## INSTRUÇÃO PARA AGENTES DE IA

Antes de gerar qualquer texto para um site:

1. Identifique o `preset` do site
2. Consulte a seção correspondente neste documento
3. Aplique o Schema JSON-LD correto
4. **Respeite as RESTRIÇÕES DE CONTEÚDO** — elas não são opcionais. Violação pode gerar processo disciplinar para o cliente.
5. Use as keywords padrão como ponto de partida (o cliente pode ter refinado no onboarding)
6. Use o CTA principal definido aqui (não invente CTAs mercantilistas para nichos regulados)

---

*Fim do documento. Atualizar sempre que um novo preset for adicionado ou uma regulação mudar.*
