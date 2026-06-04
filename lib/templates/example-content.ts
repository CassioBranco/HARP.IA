// Conteúdo de exemplo por nicho — usado no preview antes da IA gerar o real.
// Quando o Agente Onboarding gerar os textos, eles substituem este conteúdo
// via a tabela `sections` no banco.

export type SiteContent = {
  businessName: string
  tagline: string
  heroHeadline: string
  heroSub: string
  ctaLabel: string
  ctaPhone: string
  city: string
  state: string
  services: Array<{ name: string; description: string; icon: string }>
  about: string
  yearsExperience: number
  credential: string
  testimonials: Array<{ name: string; text: string; rating: number }>
  faqs: Array<{ question: string; answer: string }>
  address: string
  whatsapp: string
  email: string
  schemaType: string
}

const EXAMPLES: Record<string, SiteContent> = {
  advocacia: {
    businessName: 'Escritório Silva & Associados',
    tagline: 'Assessoria jurídica com 18 anos de experiência em Sorocaba',
    heroHeadline: 'Seu problema jurídico tem solução. Fale com um advogado agora.',
    heroSub: 'Atuamos em direito trabalhista, cível e previdenciário. Atendimento presencial e online em Sorocaba e região.',
    ctaLabel: 'Agendar consulta',
    ctaPhone: '(15) 99123-4567',
    city: 'Sorocaba', state: 'SP',
    services: [
      { name: 'Direito Trabalhista', description: 'Rescisão indevida, hora extra, assédio moral, FGTS e verbas rescisórias. Análise gratuita do seu caso.', icon: '⚖️' },
      { name: 'Direito Previdenciário', description: 'Aposentadoria, BPC/LOAS, pensão por morte e revisão de benefícios do INSS negados ou cortados.', icon: '🏛️' },
      { name: 'Direito Cível', description: 'Contratos, indenizações, dívidas e relações de consumo. Defendemos seus direitos com eficiência.', icon: '📋' },
    ],
    about: 'Com 18 anos de atuação em Sorocaba, o escritório Silva & Associados é referência em direito trabalhista e previdenciário na região. Nossa equipe de 4 advogados especializados atende mais de 500 famílias anualmente com dedicação e transparência.',
    yearsExperience: 18,
    credential: 'OAB/SP 123.456',
    testimonials: [
      { name: 'Roberto M.', text: 'Consegui minha aposentadoria após 3 negativas do INSS. Excelente trabalho!', rating: 5 },
      { name: 'Carla S.', text: 'Atendimento rápido e eficiente no processo trabalhista. Recomendo muito.', rating: 5 },
      { name: 'Marcos T.', text: 'Profissional, transparente e competente. Me orientaram em tudo.', rating: 5 },
    ],
    faqs: [
      { question: 'Quanto custa uma consulta com advogado?', answer: 'A consulta inicial é gratuita para análise do seu caso. Os honorários são definidos conforme a complexidade e o tipo de ação, e sempre informados com transparência antes de qualquer contratação.' },
      { question: 'Preciso ir ao escritório pessoalmente?', answer: 'Não necessariamente. Atendemos de forma presencial em Sorocaba e também por videochamada para toda a região. Você escolhe o formato mais conveniente.' },
      { question: 'Quanto tempo dura um processo trabalhista?', answer: 'O tempo médio de um processo trabalhista na 15ª Região (Campinas/Sorocaba) é de 12 a 24 meses. Em casos de acordo, pode ser encerrado em 3 a 6 meses.' },
      { question: 'O escritório atua fora de Sorocaba?', answer: 'Sim. Atuamos em toda a 15ª Região da Justiça do Trabalho, que inclui Sorocaba, Votorantim, Itu, Salto, Tatuí e cidades próximas.' },
      { question: 'Como funciona a cobrança pelos serviços jurídicos?', answer: 'Dependendo do tipo de ação, trabalhamos com honorários fixos, por êxito (pagamento apenas se ganhar) ou contrato de consultoria mensal para empresas. Tudo negociado previamente.' },
      { question: 'O que é um advogado especializado em direito previdenciário?', answer: 'É o profissional habilitado para atuar em processos do INSS, como aposentadorias, benefícios por incapacidade, pensão por morte e revisão de benefícios negados ou cortados. Domina as regras da Previdência Social.' },
    ],
    address: 'Rua Barão de Tatuí, 230 — Centro, Sorocaba/SP',
    whatsapp: '5515991234567',
    email: 'contato@silvaadvogados.com.br',
    schemaType: 'LegalService',
  },

  servicos: {
    businessName: 'Silva Serviços',
    tagline: 'Serviços especializados com qualidade e pontualidade em Sorocaba',
    heroHeadline: 'Serviço de qualidade, prazo cumprido e preço justo.',
    heroSub: 'Atendemos residências e empresas em Sorocaba e região com mais de 10 anos de experiência no mercado.',
    ctaLabel: 'Solicitar orçamento',
    ctaPhone: '(15) 99123-4567',
    city: 'Sorocaba', state: 'SP',
    services: [
      { name: 'Serviço Principal', description: 'Descrição completa do serviço principal que você oferece. Inclua o que o cliente recebe e o resultado esperado.', icon: '🔧' },
      { name: 'Serviço Secundário', description: 'Outro serviço que você presta, complementar ao principal. Ajuda o cliente a entender o escopo do seu trabalho.', icon: '⚙️' },
      { name: 'Serviço Adicional', description: 'Serviço adicional que diferencia você da concorrência. Pode ser urgência, garantia, suporte ou outro benefício.', icon: '✅' },
    ],
    about: 'Com mais de 10 anos no mercado de Sorocaba, nossa empresa é reconhecida pela qualidade dos serviços, pontualidade e atendimento transparente. Já atendemos mais de 300 clientes satisfeitos na cidade e região.',
    yearsExperience: 10,
    credential: 'CNPJ 12.345.678/0001-90',
    testimonials: [
      { name: 'Ana P.', text: 'Serviço impecável, prazo cumprido e ótimo custo-benefício. Já contratei 3 vezes.', rating: 5 },
      { name: 'João R.', text: 'Profissional, pontual e deixou tudo perfeito. Super recomendo!', rating: 5 },
      { name: 'Fernanda L.', text: 'Atendimento rápido e preço justo. Resolveram meu problema no mesmo dia.', rating: 5 },
    ],
    faqs: [
      { question: 'Qual é o prazo de atendimento?', answer: 'O prazo de atendimento varia conforme o tipo de serviço e a agenda. Em geral, agendamos dentro de 24 a 72 horas. Para urgências, temos disponibilidade especial — entre em contato para verificar.' },
      { question: 'Vocês atendem fora de Sorocaba?', answer: 'Sim, atendemos Sorocaba e cidades próximas como Votorantim, Salto, Itu e Tatuí. Para outros municípios, consulte disponibilidade e custo de deslocamento.' },
      { question: 'Como funciona o orçamento?', answer: 'O orçamento é gratuito e sem compromisso. Entre em contato pelo WhatsApp ou formulário, descreva o serviço e enviaremos um retorno em até 2 horas em dias úteis.' },
      { question: 'Os serviços têm garantia?', answer: 'Sim. Todos os nossos serviços têm garantia de 90 dias para defeitos de execução. Em caso de problema, retornamos sem custo adicional para resolver.' },
      { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos PIX, cartão de débito e crédito (em até 6x sem juros), dinheiro e transferência bancária. O pagamento é combinado no fechamento do orçamento.' },
      { question: 'É necessário agendar com antecedência?', answer: 'Para garantir o melhor atendimento, recomendamos agendamento com pelo menos 48 horas de antecedência. Em casos urgentes, verificamos disponibilidade para atendimento no mesmo dia.' },
    ],
    address: 'Sorocaba/SP — Atendemos em toda a cidade e região',
    whatsapp: '5515991234567',
    email: 'contato@silvaservicos.com.br',
    schemaType: 'LocalBusiness',
  },

  clinica: {
    businessName: 'Clínica Dr. Saúde',
    tagline: 'Cuidado médico especializado com humanização em Sorocaba',
    heroHeadline: 'Sua saúde merece atenção especializada e atendimento humano.',
    heroSub: 'Consultas, exames e acompanhamento médico em Sorocaba. Agendamento rápido, sem filas.',
    ctaLabel: 'Agendar consulta',
    ctaPhone: '(15) 3300-0000',
    city: 'Sorocaba', state: 'SP',
    services: [
      { name: 'Consultas Médicas', description: 'Atendimento com hora marcada, sem longas esperas. Consultórios equipados e equipe acolhedora.', icon: '🩺' },
      { name: 'Exames e Diagnósticos', description: 'Resultados rápidos com tecnologia de ponta. Laudo emitido pelo próprio especialista.', icon: '🔬' },
      { name: 'Acompanhamento Contínuo', description: 'Seguimos sua saúde ao longo do tempo, com prontuário digital e histórico completo.', icon: '📋' },
    ],
    about: 'A Clínica Dr. Saúde atua em Sorocaba há 12 anos com foco em medicina preventiva e atendimento humanizado. Nossa equipe é formada por especialistas registrados no CRM/SP com sólida formação em instituições de referência.',
    yearsExperience: 12,
    credential: 'CRM/SP 123456',
    testimonials: [
      { name: 'Maria C.', text: 'Atendimento excelente, médico atencioso e sem espera. Recomendo para toda a família.', rating: 5 },
      { name: 'Pedro H.', text: 'Diagnóstico preciso e rápido. Me senti acolhido durante todo o processo.', rating: 5 },
      { name: 'Lúcia M.', text: 'Clínica limpa, organizada e com profissionais competentes. Parabéns!', rating: 5 },
    ],
    faqs: [
      { question: 'Como agendar uma consulta?', answer: 'Você pode agendar pelo telefone, WhatsApp ou pelo formulário do site. O agendamento é confirmado em até 2 horas em dias úteis.' },
      { question: 'A clínica atende por plano de saúde?', answer: 'Atendemos pelos principais planos da região. Entre em contato para confirmar se o seu plano está credenciado.' },
      { question: 'Quanto tempo dura uma consulta?', answer: 'As consultas têm duração mínima de 30 minutos. Valorizamos um atendimento sem pressa para que todas as dúvidas sejam respondidas.' },
      { question: 'A clínica atende crianças?', answer: 'Sim, temos pediatra disponível para atendimento infantil. O agendamento pode ser feito pelos mesmos canais.' },
      { question: 'Os resultados de exames ficam disponíveis online?', answer: 'Sim. Os laudos são enviados por email e também ficam disponíveis no portal do paciente, acessível 24 horas.' },
      { question: 'Como funciona o retorno médico?', answer: 'As consultas de retorno têm valor diferenciado. O médico define o prazo ideal de retorno conforme cada caso.' },
    ],
    address: 'Av. Dom Aguirre, 500 — Centro, Sorocaba/SP',
    whatsapp: '5515933000000',
    email: 'agendamento@clinicadrsaude.com.br',
    schemaType: 'MedicalClinic',
  },
}

// Fallback genérico para nichos sem conteúdo de exemplo específico
const GENERIC: SiteContent = EXAMPLES['servicos']

export function getExampleContent(preset: string): SiteContent {
  return EXAMPLES[preset] ?? GENERIC
}
