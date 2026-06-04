# Acordo de Processamento de Dados (DPA) — [NOME_COMERCIAL]

**Última atualização:** [DATA_PUBLICACAO]
**Versão:** 1.0
**Operadora (DPO):** Dicas do Dove (Anderson Marques), CNPJ [CNPJ], com sede em Sorocaba/SP
**URL canônica:** https://[DOMINIO]/harpia/dpa

---

## Preâmbulo

Este Acordo de Processamento de Dados ("DPA") complementa os [Termos de Uso](https://[DOMINIO]/harpia/termos) e a [Política de Privacidade](https://[DOMINIO]/harpia/privacy) da [NOME_COMERCIAL] e disciplina o tratamento de **dados pessoais de terceiros** (visitantes, leads, contatos) coletados pelo Cliente através da Plataforma.

Este DPA é especialmente relevante para clientes dos planos **Pro** e **Agency**, que usam a Plataforma para criar e operar sites e canais de captação de dados de terceiros. Ele é firmado nos termos do **Art. 39 da Lei nº 13.709/2018 (LGPD)**.

Ao usar a Plataforma para coletar dados pessoais de terceiros (por exemplo, formulários de contato, agendamentos, captação de leads, dados de visitantes do GBP), o Cliente automaticamente adere a este DPA.

---

## 1. Definições

| Termo | Significado conforme LGPD |
|-------|---------------------------|
| **Controlador** | O Cliente. Quem decide sobre o tratamento dos dados pessoais de terceiros coletados pelo seu site |
| **Operador** | A [NOME_COMERCIAL] (Dicas do Dove). Quem trata os dados em nome do Controlador |
| **Subprocessador** | Terceiros contratados pelo Operador (Vercel, Supabase, Cloudflare, Anthropic, etc.) |
| **Titular** | Pessoa natural a quem se referem os dados (visitante do site do Cliente, lead, contato) |
| **Tratamento** | Qualquer operação com dados pessoais (coleta, armazenamento, transmissão, eliminação, etc.) |
| **Dados Pessoais** | Informação relacionada a pessoa natural identificada ou identificável (LGPD Art. 5º, I) |
| **Incidente** | Ocorrência que possa acarretar risco aos titulares (vazamento, acesso indevido, perda) |
| **ANPD** | Autoridade Nacional de Proteção de Dados |

---

## 2. Objeto

A [NOME_COMERCIAL] tratará dados pessoais de terceiros coletados pelo Cliente através da Plataforma, **estritamente conforme as instruções documentadas** do Cliente e as finalidades declaradas no momento da coleta.

### 2.1. Papéis
- **Cliente = Controlador**: define as finalidades, decide quais dados coletar, mantém política de privacidade do site, atende às solicitações dos titulares em primeira linha
- **[NOME_COMERCIAL] = Operador**: hospeda, processa, transmite e elimina os dados conforme instruído pelo Cliente

### 2.2. Limites do tratamento
A [NOME_COMERCIAL] **não usa** os dados pessoais coletados pelos sites dos clientes para:
- Treinamento de modelos de IA
- Marketing próprio ou de terceiros
- Análise comportamental para terceiros
- Qualquer finalidade não autorizada pelo Cliente

---

## 3. Detalhes do Tratamento (Anexo I)

### 3.1. Categorias de titulares
- Visitantes dos sites publicados pelo Cliente
- Leads que preenchem formulários de contato no site do Cliente
- Pessoas que avaliam o negócio do Cliente no Google Business Profile
- Pessoas que agendam serviços, fazem reservas, solicitam orçamentos

### 3.2. Categorias de dados pessoais tratados (a depender do que o Cliente configura)
- Nome, e-mail, telefone (formulários)
- Mensagens, textos livres, descrições de necessidade
- IP, navegador, geolocalização aproximada
- Cookies analíticos do site do Cliente (se Cliente ativar)
- Dados de avaliação (GBP)

### 3.3. Dados sensíveis
A Plataforma **não foi desenhada para coletar dados sensíveis** (LGPD Art. 5º, II). O Cliente é responsável por NÃO configurar formulários que solicitem:
- Dados de saúde
- Origem racial ou étnica
- Convicção religiosa, política, filosófica
- Orientação sexual
- Dados genéticos ou biométricos

Caso o Cliente precise coletar dados sensíveis, deve buscar consultoria jurídica específica e adequar o consentimento.

### 3.4. Finalidades
- Permitir comunicação entre o titular e o Cliente
- Permitir agendamento, reserva ou contato
- Análise estatística do site (quando configurado pelo Cliente)
- Sincronização com GBP

### 3.5. Duração do tratamento
- Enquanto o Cliente mantiver o contrato ativo com a Plataforma
- Após cancelamento: dados ficam disponíveis para exportação por 30 dias
- Após 30 dias: arquivamento em cold storage por 6 meses
- Após 6 meses: eliminação definitiva
- Cliente pode solicitar eliminação imediata a qualquer momento

---

## 4. Obrigações da [NOME_COMERCIAL] (Operador)

### 4.1. Tratar dados estritamente conforme instruções do Cliente
- Não usar dados para finalidades não autorizadas
- Notificar o Cliente caso uma instrução violar a LGPD

### 4.2. Garantir segurança técnica e administrativa
- Criptografia em trânsito (TLS 1.3) e em repouso
- Controle de acesso por princípio do menor privilégio
- Isolamento por tenant (Row Level Security do Supabase)
- Backup criptografado
- Monitoramento contínuo

### 4.3. Garantir confidencialidade
- Todos os funcionários, prestadores e Subprocessadores assumem compromisso de confidencialidade
- Acesso a dados pessoais apenas para finalidades operacionais necessárias

### 4.4. Auxiliar o Cliente no cumprimento da LGPD
- Disponibilizar relatórios técnicos sobre o tratamento
- Auxiliar no atendimento a solicitações de titulares (acesso, correção, eliminação)
- Auxiliar na resposta a incidentes
- Auxiliar na elaboração de Relatórios de Impacto à Proteção de Dados (RIPD), quando solicitado

### 4.5. Notificar incidentes
Em caso de incidente de segurança que possa acarretar risco aos titulares:
- Notificar o Cliente em **até 48 horas** após a tomada de conhecimento
- Fornecer todas as informações relevantes (natureza, dados afetados, medidas adotadas)
- Auxiliar o Cliente na notificação à ANPD e aos titulares (responsabilidade primária do Cliente)

### 4.6. Eliminar dados ao fim do tratamento
- Conforme prazos da seção 3.5
- Mediante solicitação expressa do Cliente
- Após eliminação, fornecer comprovante de exclusão

---

## 5. Obrigações do Cliente (Controlador)

### 5.1. Atuar como Controlador legítimo
- Coletar dados apenas para finalidades legítimas, específicas e informadas
- Manter base legal válida para cada tratamento (consentimento, legítimo interesse, execução de contrato, etc.)
- Não usar a Plataforma para finalidades ilícitas

### 5.2. Manter política de privacidade própria
- O Cliente é responsável por publicar política de privacidade no SEU site
- A Plataforma fornece um **template auxiliar** que o Cliente deve revisar e personalizar
- Cliente declara, ao usar a Plataforma, que assume essa responsabilidade

### 5.3. Atender solicitações de titulares em primeira linha
- Solicitações de acesso, correção, eliminação, etc., devem ser endereçadas primeiro ao Cliente
- A [NOME_COMERCIAL] auxilia o Cliente, mas não responde diretamente aos titulares

### 5.4. Notificar incidentes detectados pelo lado do Cliente
- Caso o Cliente identifique vazamento ou incidente, deve notificar a [NOME_COMERCIAL] em até 24 horas

### 5.5. Indicar Encarregado próprio (se aplicável)
- Conforme porte e atividade, o Cliente pode ser obrigado a designar um Encarregado próprio (Art. 41 LGPD)
- A [NOME_COMERCIAL] não substitui o Encarregado do Cliente

### 5.6. Não cadastrar dados sensíveis sem base legal específica
- Caso precise, o Cliente assume integralmente os riscos
- A Plataforma pode bloquear configurações claramente impróprias

### 5.7. Manter dados de contato atualizados
- Para receber notificações de incidente, mudanças no DPA, etc.

---

## 6. Subprocessadores

Para operar a Plataforma, a [NOME_COMERCIAL] contrata os seguintes Subprocessadores:

| Subprocessador | Função | Localização | Política |
|----------------|--------|-------------|----------|
| **Supabase** | Banco de dados, autenticação, storage | Brasil ou EUA (conforme região do Cliente) | https://supabase.com/privacy |
| **Vercel** | Hospedagem do painel administrativo | Global (CDN), datacenter primário EUA | https://vercel.com/legal/privacy-policy |
| **Cloudflare** | CDN, hospedagem dos sites publicados, storage de imagens (R2), DNS, registrar de domínios | Global (300+ cidades) | https://www.cloudflare.com/privacypolicy/ |
| **Anthropic** | Processamento de IA (geração de textos) | EUA | https://www.anthropic.com/legal/privacy |
| **Stripe** | Processamento de pagamentos | EUA + subsidiária Brasil | https://stripe.com/br/privacy |
| **Resend** | Envio de e-mails transacionais | EUA | https://resend.com/legal/privacy-policy |
| **Inngest** | Processamento de tarefas assíncronas | EUA | https://www.inngest.com/privacy |
| **Sentry** | Monitoramento de erros | EUA | https://sentry.io/privacy/ |
| **PostHog** | Análise de comportamento | EUA / UE | https://posthog.com/privacy |
| **Google** | APIs autorizadas pelo Cliente (GBP, Analytics, Search Console) | Global | https://policies.google.com/privacy |
| **eNotas / NFE.io** | Emissão de notas fiscais | Brasil | (verificar provedor escolhido) |

### 6.1. Notificação de mudança de Subprocessadores
- A [NOME_COMERCIAL] manterá esta lista atualizada nesta URL
- Mudanças significativas (adição/remoção de Subprocessador que trata dados pessoais) terão aviso prévio de **30 dias** por e-mail para clientes Pro/Agency
- Se o Cliente discordar, pode rescindir o contrato sem ônus

### 6.2. Garantias contratuais
- Cada Subprocessador é contratualmente obrigado a:
  - Tratar dados estritamente conforme as instruções da [NOME_COMERCIAL]
  - Manter padrão de segurança equivalente ou superior ao deste DPA
  - Notificar incidentes
  - Permitir auditoria
  - Eliminar dados ao fim do tratamento

---

## 7. Transferência internacional

Conforme mencionado, alguns Subprocessadores processam dados em servidores fora do Brasil.

A transferência é permitida pelo Art. 33 da LGPD pelos seguintes fundamentos:
- **Cumprimento de obrigação contratual** (Art. 33, VI)
- **Garantias contratuais específicas** (Cláusulas Contratuais Padrão e equivalentes)
- **Consentimento específico do titular** quando aplicável

Caso a ANPD publique listas oficiais de países com nível adequado de proteção ou modelos de contratos padrão, a [NOME_COMERCIAL] atualizará as práticas.

---

## 8. Direitos dos Titulares

### 8.1. Responsabilidade primária do Cliente
Como Controlador, o Cliente é responsável por atender às solicitações dos titulares (acesso, correção, eliminação, portabilidade, etc.) em até 15 dias.

### 8.2. Auxílio da [NOME_COMERCIAL]
A Plataforma disponibiliza ferramentas para o Cliente atender essas solicitações:
- Exportação de dados de um titular específico (formato JSON/CSV)
- Eliminação de dados de um titular específico
- Anonimização sob demanda

### 8.3. Solicitações recebidas diretamente pela [NOME_COMERCIAL]
Se um titular contatar diretamente a [NOME_COMERCIAL], a Plataforma:
- Encaminhará o pedido para o Cliente responsável
- Notificará o titular do encaminhamento
- Não responderá diretamente, exceto se houver risco de não atendimento pelo Cliente

---

## 9. Auditoria

### 9.1. Direito de auditoria
O Cliente Pro/Agency tem direito a auditar a conformidade da [NOME_COMERCIAL] com este DPA, mediante:
- Aviso prévio de **30 dias**
- Custos por conta do Cliente
- Limite de **1 auditoria por ano**, salvo em caso de incidente comprovado

### 9.2. Forma da auditoria
- Análise de relatórios de conformidade fornecidos pela [NOME_COMERCIAL]
- Questionário escrito (resposta em até 30 dias)
- Auditoria presencial em caso justificado (custo por conta do Cliente)

### 9.3. Confidencialidade
Toda informação obtida na auditoria é confidencial.

---

## 10. Vigência e Encerramento

### 10.1. Vigência
Este DPA vigora enquanto vigorar o contrato principal entre Cliente e [NOME_COMERCIAL].

### 10.2. Encerramento
Após o encerramento do contrato principal:
- A [NOME_COMERCIAL] manterá os dados em modo recuperável por 30 dias
- Em seguida, manterá em cold storage por 6 meses
- Após 6 meses, eliminará definitivamente
- O Cliente pode solicitar eliminação antecipada a qualquer momento

### 10.3. Cláusulas sobreviventes
As obrigações de confidencialidade, notificação de incidente e auxílio em processos judiciais sobrevivem ao encerramento.

---

## 11. Responsabilidade

### 11.1. Responsabilidade do Operador
A [NOME_COMERCIAL] responde nos termos do Art. 42 da LGPD em caso de descumprimento deste DPA.

### 11.2. Responsabilidade do Controlador
O Cliente responde diretamente perante titulares e ANPD pelas finalidades, bases legais e instruções que define.

### 11.3. Limitação contratual
Sem prejuízo das responsabilidades legais e LGPD, as limitações de responsabilidade dos [Termos de Uso](https://[DOMINIO]/harpia/termos) se aplicam também a este DPA.

---

## 12. Disposições Gerais

### 12.1. Hierarquia
Em caso de conflito entre este DPA e os Termos de Uso, prevalece este DPA para matéria de proteção de dados.

### 12.2. Modificações
A [NOME_COMERCIAL] pode atualizar este DPA com aviso prévio de 30 dias por e-mail. Se o Cliente discordar, pode rescindir sem ônus.

### 12.3. Foro
Comarca de **Sorocaba/SP**, com renúncia a qualquer outro, ressalvado direito do consumidor pessoa física.

### 12.4. Contato
**Encarregado (DPO)**: [NOME_DPO]
**E-mail**: dicasdodove@gmail.com
**Endereço**: [ENDERECO_COMPLETO], Sorocaba/SP

---

*DPA elaborado em conformidade com a LGPD (Lei nº 13.709/2018), com inspiração nas Cláusulas Contratuais Padrão da União Europeia (SCCs) adaptadas à realidade brasileira.*
