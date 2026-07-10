// Conteúdo de exemplo por nicho — usado no preview antes da IA gerar o real.

export type BlogPost = {
  title: string
  excerpt: string
  date: string
  image: string
  slug: string
}

export type PortfolioItem = {
  title: string
  image: string
  category?: string
}

export type Course = {
  name: string
  hours: number
  modality: 'Presencial' | 'EAD' | 'Híbrido'
  description: string
  image: string
  price?: string
}

export type Stat = {
  value: string
  label: string
}

export type TeamMember = {
  name: string
  role: string
  image: string
}

export type SiteContent = {
  businessName: string
  tagline: string
  heroHeadline: string
  heroSub: string
  ctaLabel: string
  ctaPhone: string
  city: string
  state: string
  services: Array<{ name: string; description: string; icon: string; image?: string }>
  about: string
  yearsExperience: number
  credential: string
  testimonials: Array<{ name: string; text: string; rating: number; photoUrl?: string; date?: string }>
  faqs: Array<{ question: string; answer: string }>
  address: string
  whatsapp: string
  email: string
  schemaType: string
  // Layout-specific optional fields
  blogPosts: BlogPost[]
  portfolioItems?: PortfolioItem[]
  courses?: Course[]
  stats?: Stat[]
  team?: TeamMember[]
  problemStatement?: string
  solutionStatement?: string
  heroImage?: string
  aboutImage?: string
  // Ponto focal da imagem dentro do molde de proporção fixa do template.
  // String CSS pronta p/ object-position (ex.: "50% 30%"). Default "50% 50%" (centro).
  // O cliente ajusta só a POSIÇÃO; a proporção do quadro é travada pelo design.
  heroImagePos?: string
  aboutImagePos?: string
  // Identidade visual do cliente
  logoUrl?: string
  faviconUrl?: string
  socials?: {
    instagram?: string
    facebook?: string
    whatsapp?: string
    tiktok?: string
    youtube?: string
    linkedin?: string
    site_externo?: string
  }
  // Google Perfil de Empresa (Maps / Business Profile) — alimenta schema + botões
  gbpLink?: string
  gbpPlaceId?: string
  // Agendamento (BookingWidget): preenchidos pelo buildSiteContent a partir
  // de sites.id + sites.booking_enabled. O widget precisa do siteId pra
  // postar a solicitação em /api/booking. Conteúdo de exemplo não usa.
  siteId?: string
  bookingEnabled?: boolean
  // Captura de leads (LeadCaptureBar): faixa inline no fim da página quando
  // sites.leads_enabled = true. A barra posta em /api/leads usando o siteId.
  leadsEnabled?: boolean
}

// Imagens placeholder — picsum com seeds fixos por categoria
const IMG = {
  saude:      (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-saude-${s}/${w}/${h}`,
  juridico:   (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-jur-${s}/${w}/${h}`,
  alimento:   (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-food-${s}/${w}/${h}`,
  beleza:     (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-bel-${s}/${w}/${h}`,
  educacao:   (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-edu-${s}/${w}/${h}`,
  servicos:   (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-svc-${s}/${w}/${h}`,
  imoveis:    (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-imo-${s}/${w}/${h}`,
  jovem:      (s: string, w = 800, h = 600) => `https://picsum.photos/seed/harp-jov-${s}/${w}/${h}`,
}

const BLOG_POSTS_SAUDE: BlogPost[] = [
  { title: 'Como a prevenção reduz custos com saúde em 70%', excerpt: 'Consultas regulares evitam doenças graves e tratamentos caros. Veja como criar o hábito.', date: '2026-05-20', slug: 'prevencao-reduz-custos', image: IMG.saude('blog1', 600, 400) },
  { title: '5 sinais de que você precisa de uma avaliação médica hoje', excerpt: 'Sintomas que muita gente ignora mas que merecem atenção imediata de um especialista.', date: '2026-05-10', slug: 'sinais-avaliacao-medica', image: IMG.saude('blog2', 600, 400) },
  { title: 'Saúde mental e física: por que são inseparáveis', excerpt: 'Estudos confirmam que cuidar da mente melhora indicadores físicos e vice-versa.', date: '2026-04-28', slug: 'saude-mental-fisica', image: IMG.saude('blog3', 600, 400) },
]

const BLOG_POSTS_JURIDICO: BlogPost[] = [
  { title: 'Direitos trabalhistas: o que todo CLT precisa saber', excerpt: 'Horas extras, FGTS, 13º — entenda o que a lei garante e quando buscar um advogado.', date: '2026-05-18', slug: 'direitos-trabalhistas-clt', image: IMG.juridico('blog1', 600, 400) },
  { title: 'INSS negou seu benefício? Veja o que fazer', excerpt: 'Recurso administrativo, mandado de segurança ou ação judicial — conheça os caminhos.', date: '2026-05-05', slug: 'inss-negou-beneficio', image: IMG.juridico('blog2', 600, 400) },
  { title: 'Quando o distrato pode ser considerado demissão sem justa causa', excerpt: 'Entenda a linha tênue entre rescisão voluntária e demissão disfarçada.', date: '2026-04-22', slug: 'distrato-demissao', image: IMG.juridico('blog3', 600, 400) },
]

const BLOG_POSTS_BELEZA: BlogPost[] = [
  { title: 'Cronograma capilar: como montar o ideal para seu cabelo', excerpt: 'Hidratação, nutrição e reconstrução na frequência certa transformam qualquer fio.', date: '2026-05-22', slug: 'cronograma-capilar', image: IMG.beleza('blog1', 600, 400) },
  { title: 'Colorimetria: entenda o tom certo para seu subtom de pele', excerpt: 'Loiro frio, quente ou neutro? Veja como identificar e escolher a cor perfeita.', date: '2026-05-08', slug: 'colorimetria-tom-pele', image: IMG.beleza('blog2', 600, 400) },
  { title: '5 tratamentos que substituem a química agressiva', excerpt: 'Alternativas orgânicas e naturais que entregam resultado sem danificar os fios.', date: '2026-04-25', slug: 'tratamentos-sem-quimica', image: IMG.beleza('blog3', 600, 400) },
]

const BLOG_POSTS_SERVICOS: BlogPost[] = [
  { title: 'Como escolher um prestador de serviço confiável', excerpt: 'Registros, referências e garantias — o checklist que protege você antes de contratar.', date: '2026-05-15', slug: 'escolher-prestador-confiavel', image: IMG.servicos('blog1', 600, 400) },
  { title: '3 erros que encarecem seu projeto desnecessariamente', excerpt: 'Planejamento, materiais e prazo: onde mora o desperdício e como evitar.', date: '2026-05-02', slug: 'erros-que-encarecem-projeto', image: IMG.servicos('blog2', 600, 400) },
  { title: 'Garantia de serviço: o que a lei diz e o que você pode exigir', excerpt: 'CDC e Código Civil protegem o consumidor em serviços mal executados. Conheça seus direitos.', date: '2026-04-18', slug: 'garantia-servico-lei', image: IMG.servicos('blog3', 600, 400) },
]

const BLOG_POSTS_EDUCACAO: BlogPost[] = [
  { title: 'Como estudar online sem perder a disciplina', excerpt: 'Técnicas de gestão de tempo e ambiente que multiplicam a produtividade em cursos EAD.', date: '2026-05-19', slug: 'estudar-online-disciplina', image: IMG.educacao('blog1', 600, 400) },
  { title: 'Certificado reconhecido: o que realmente importa para o mercado', excerpt: 'MEC, conselhos de classe, validação internacional — entenda o que cada empregador busca.', date: '2026-05-06', slug: 'certificado-reconhecido', image: IMG.educacao('blog2', 600, 400) },
  { title: 'Lifelong learning: por que aprender nunca deve parar', excerpt: 'Profissionais que se atualizam continuamente ganham 40% mais ao longo da carreira.', date: '2026-04-20', slug: 'lifelong-learning', image: IMG.educacao('blog3', 600, 400) },
]

const BLOG_POSTS_IMOVEIS: BlogPost[] = [
  { title: 'Comprar ou alugar em 2026: a conta que poucos fazem', excerpt: 'Taxas, ITBI, financiamento e oportunidade de custo — simule antes de decidir.', date: '2026-05-21', slug: 'comprar-ou-alugar-2026', image: IMG.imoveis('blog1', 600, 400) },
  { title: 'O que verificar antes de assinar um contrato de locação', excerpt: 'Vistoria, garantias, reajuste e cláusulas abusivas — não assine sem ler este guia.', date: '2026-05-07', slug: 'verificar-contrato-locacao', image: IMG.imoveis('blog2', 600, 400) },
  { title: 'Valorização por bairro em Sorocaba: onde investir em 2026', excerpt: 'Infraestrutura, crescimento populacional e preço do m² — análise dos melhores bairros.', date: '2026-04-23', slug: 'valorizacao-bairros-sorocaba', image: IMG.imoveis('blog3', 600, 400) },
]

const STATS_DEFAULT: Stat[] = [
  { value: '12+', label: 'Anos de experiência' },
  { value: '500+', label: 'Clientes atendidos' },
  { value: '98%', label: 'Satisfação' },
  { value: '4.9★', label: 'Avaliação média' },
]

const TEAM_DEFAULT: TeamMember[] = [
  { name: 'Dr. Carlos Silva', role: 'Fundador & Especialista', image: IMG.servicos('team1', 400, 400) },
  { name: 'Ana Paula Costa', role: 'Especialista Sênior', image: IMG.servicos('team2', 400, 400) },
  { name: 'Marcos Oliveira', role: 'Atendimento ao Cliente', image: IMG.servicos('team3', 400, 400) },
]

const PORTFOLIO_DEFAULT: PortfolioItem[] = [
  { title: 'Projeto 1', image: IMG.servicos('port1', 600, 400), category: 'Residencial' },
  { title: 'Projeto 2', image: IMG.servicos('port2', 600, 400), category: 'Comercial' },
  { title: 'Projeto 3', image: IMG.servicos('port3', 600, 400), category: 'Industrial' },
  { title: 'Projeto 4', image: IMG.servicos('port4', 600, 400), category: 'Residencial' },
  { title: 'Projeto 5', image: IMG.servicos('port5', 600, 400), category: 'Comercial' },
  { title: 'Projeto 6', image: IMG.servicos('port6', 600, 400), category: 'Residencial' },
]

const EXAMPLES: Record<string, SiteContent> = {
  advocacia: {
    businessName: 'Silva & Associados Advogados',
    tagline: 'Assessoria jurídica com 18 anos de experiência em Sorocaba',
    heroHeadline: 'Seu problema jurídico tem solução. Fale com um advogado agora.',
    heroSub: 'Atuamos em direito trabalhista, cível e previdenciário. Consulta inicial gratuita. Atendimento presencial e online em Sorocaba e região.',
    ctaLabel: 'Agendar consulta gratuita',
    ctaPhone: '(15) 99123-4567',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.juridico('hero', 900, 600),
    aboutImage: IMG.juridico('about', 600, 500),
    services: [
      { name: 'Direito Trabalhista', description: 'Rescisão indevida, hora extra, assédio moral, FGTS e verbas rescisórias. Análise gratuita do seu caso.', icon: '⚖️' },
      { name: 'Direito Previdenciário', description: 'Aposentadoria, BPC/LOAS, pensão por morte e revisão de benefícios do INSS negados ou cortados.', icon: '🏛️' },
      { name: 'Direito Cível', description: 'Contratos, indenizações, dívidas e relações de consumo. Defendemos seus direitos com eficiência.', icon: '📋' },
    ],
    about: 'Com 18 anos de atuação em Sorocaba, o escritório Silva & Associados é referência em direito trabalhista e previdenciário. Nossa equipe de 4 advogados especializados atende mais de 500 famílias anualmente com dedicação e transparência.',
    yearsExperience: 18,
    credential: 'OAB/SP 123.456',
    stats: [
      { value: '18+', label: 'Anos de experiência' },
      { value: '500+', label: 'Famílias atendidas' },
      { value: '94%', label: 'Taxa de êxito' },
      { value: '4.9★', label: 'Google Avaliações' },
    ],
    testimonials: [
      { name: 'Roberto M.', text: 'Consegui minha aposentadoria após 3 negativas do INSS. Excelente trabalho, muito obrigado!', rating: 5 },
      { name: 'Carla S.', text: 'Atendimento rápido e eficiente no processo trabalhista. Recomendo muito.', rating: 5 },
      { name: 'Marcos T.', text: 'Profissional, transparente e competente. Me orientaram em tudo com clareza.', rating: 5 },
    ],
    faqs: [
      { question: 'Quanto custa uma consulta com advogado?', answer: 'A consulta inicial é gratuita para análise do seu caso. Os honorários são definidos conforme a complexidade da ação, sempre informados antes da contratação.' },
      { question: 'Preciso ir ao escritório pessoalmente?', answer: 'Não necessariamente. Atendemos de forma presencial em Sorocaba e também por videochamada para toda a região. Você escolhe o formato.' },
      { question: 'Quanto tempo dura um processo trabalhista?', answer: 'O tempo médio na 15ª Região é de 12 a 24 meses. Em casos de acordo, pode ser encerrado em 3 a 6 meses.' },
      { question: 'O escritório atua fora de Sorocaba?', answer: 'Sim. Atuamos em toda a 15ª Região da Justiça do Trabalho: Sorocaba, Votorantim, Itu, Salto, Tatuí e cidades próximas.' },
      { question: 'Como funciona a cobrança pelos serviços jurídicos?', answer: 'Trabalhamos com honorários fixos, por êxito ou contrato mensal para empresas. Tudo negociado e documentado previamente.' },
      { question: 'O que é um advogado especializado em direito previdenciário?', answer: 'É o profissional habilitado para atuar em processos do INSS: aposentadorias, benefícios por incapacidade, pensão por morte e revisão de benefícios negados.' },
    ],
    blogPosts: BLOG_POSTS_JURIDICO,
    team: [
      { name: 'Dr. João Silva', role: 'Sócio-fundador — OAB/SP 123.456', image: IMG.juridico('team1', 400, 400) },
      { name: 'Dra. Maria Costa', role: 'Especialista Trabalhista — OAB/SP 234.567', image: IMG.juridico('team2', 400, 400) },
      { name: 'Dr. Pedro Alves', role: 'Especialista Previdenciário — OAB/SP 345.678', image: IMG.juridico('team3', 400, 400) },
    ],
    address: 'Rua Barão de Tatuí, 230 — Centro, Sorocaba/SP',
    whatsapp: '5515991234567',
    email: 'contato@silvaadvogados.com.br',
    schemaType: 'LegalService',
  },

  contabilidade: {
    businessName: 'Contabilidade Central Sorocaba',
    tagline: 'Gestão contábil para MEIs, empresas e profissionais liberais',
    heroHeadline: 'Pague menos imposto com contabilidade feita do jeito certo.',
    heroSub: 'Abertura de empresa, declaração IR, folha de pagamento e planejamento tributário. Mais de 15 anos servindo negócios em Sorocaba.',
    ctaLabel: 'Solicitar proposta grátis',
    ctaPhone: '(15) 3222-1111',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.juridico('hero2', 900, 600),
    aboutImage: IMG.juridico('about2', 600, 500),
    services: [
      { name: 'Abertura de Empresa', description: 'MEI, Simples Nacional, Lucro Presumido — escolhemos o regime certo para você pagar menos imposto.', icon: '🏢' },
      { name: 'Declaração de IR', description: 'Pessoa física e jurídica. Retificações, malha fina e restituição maximizada dentro da lei.', icon: '📊' },
      { name: 'Folha de Pagamento', description: 'eSocial, FGTS, INSS e férias calculados com precisão. Zero multa por atraso.', icon: '💼' },
    ],
    about: 'Há 15 anos gerenciamos a contabilidade de mais de 200 empresas em Sorocaba. Nossa equipe de contadores registrados no CRC/SP atua com foco em planejamento tributário e conformidade legal.',
    yearsExperience: 15,
    credential: 'CRC/SP 123456/O',
    stats: [
      { value: '15+', label: 'Anos no mercado' },
      { value: '200+', label: 'Empresas ativas' },
      { value: 'R$2M+', label: 'Em impostos economizados' },
      { value: '4.8★', label: 'Avaliação Google' },
    ],
    testimonials: [
      { name: 'Fernanda R.', text: 'Abri meu negócio sem dor de cabeça nenhuma. Me explicaram tudo com clareza. Super recomendo!', rating: 5 },
      { name: 'Ricardo P.', text: 'Economizei quase R$8.000 no IR este ano com o planejamento deles. Vale cada centavo.', rating: 5 },
      { name: 'Lúcia M.', text: 'Atendimento rápido, transparente e sem surpresas. Finalmente dormi tranquila com o fiscal.', rating: 5 },
    ],
    faqs: [
      { question: 'Qual o valor da mensalidade contábil?', answer: 'Varia conforme porte e atividade da empresa. MEIs têm planos a partir de R$99/mês. Entre em contato para uma proposta personalizada.' },
      { question: 'Atendem MEI?', answer: 'Sim. Oferecemos planos específicos para MEI com emissão de DAS, declaração anual e orientação sobre faturamento limite.' },
      { question: 'Como funciona a troca de contador?', answer: 'Cuidamos de toda a burocracia da transferência. Você só nos passa os documentos e cuidamos do resto, sem interrupção nos serviços.' },
      { question: 'Declaração de IR pessoa física está inclusa?', answer: 'Temos planos que incluem o IR pessoa física do sócio. Consulte-nos sobre os pacotes disponíveis.' },
      { question: 'O atendimento é presencial ou online?', answer: 'Os dois. Temos escritório em Sorocaba e atendemos online via WhatsApp, e-mail e videoconferência.' },
      { question: 'Qual o prazo para abrir uma empresa?', answer: 'Em média 5 a 15 dias úteis, dependendo do município e tipo societário. MEI é aberto em até 24 horas.' },
    ],
    blogPosts: BLOG_POSTS_JURIDICO,
    team: [
      { name: 'Carlos Mendes', role: 'Contador Sênior — CRC/SP 123456', image: IMG.juridico('team1', 400, 400) },
      { name: 'Ana Ribeiro', role: 'Especialista Tributária', image: IMG.juridico('team2', 400, 400) },
      { name: 'Paulo Dias', role: 'Folha de Pagamento & eSocial', image: IMG.juridico('team3', 400, 400) },
    ],
    address: 'Rua Dom Aguirre, 100 — Centro, Sorocaba/SP',
    whatsapp: '5515932221111',
    email: 'contato@contabilidadecentral.com.br',
    schemaType: 'AccountingService',
  },

  psicologia: {
    businessName: 'Psicóloga Dra. Ana Luz',
    tagline: 'Psicoterapia individual, casal e familiar em Sorocaba e online',
    heroHeadline: 'Você não precisa carregar tudo sozinho. Estou aqui.',
    heroSub: 'Atendimento humanizado em psicoterapia cognitivo-comportamental. Presencial em Sorocaba e online para todo o Brasil.',
    ctaLabel: 'Agendar sessão experimental',
    ctaPhone: '(15) 99888-7766',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.saude('psico-hero', 900, 600),
    aboutImage: IMG.saude('psico-about', 600, 500),
    services: [
      { name: 'Psicoterapia Individual', description: 'Espaço seguro para trabalhar ansiedade, depressão, autoestima, relacionamentos e desenvolvimento pessoal.', icon: '🧠' },
      { name: 'Terapia de Casal', description: 'Comunicação, conflitos e reconexão. Para casais que querem crescer juntos ou atravessar crises com apoio.', icon: '💑' },
      { name: 'Atendimento Online', description: 'Sessões por videochamada para todo o Brasil. Mesma qualidade, mais comodidade e privacidade.', icon: '💻' },
    ],
    about: 'Psicóloga formada pela USP com especialização em Terapia Cognitivo-Comportamental. Atendo adultos, casais e famílias há 10 anos em Sorocaba, com abordagem acolhedora e baseada em evidências científicas. CRP 06/123456.',
    yearsExperience: 10,
    credential: 'CRP 06/123456',
    stats: [
      { value: '10+', label: 'Anos de prática clínica' },
      { value: '300+', label: 'Pacientes acompanhados' },
      { value: 'USP', label: 'Formação & especialização' },
      { value: '4.9★', label: 'Avaliações Google' },
    ],
    testimonials: [
      { name: 'C.L. (sigilo preservado)', text: 'A Dra. Ana mudou minha vida. Aprendi a lidar com a ansiedade de um jeito que nunca imaginei possível.', rating: 5 },
      { name: 'M.R. (sigilo preservado)', text: 'Nossa terapia de casal salvou nosso relacionamento. Ambiente muito acolhedor e profissional.', rating: 5 },
      { name: 'T.S. (sigilo preservado)', text: 'Começei com ceticismo e hoje sou um defensor da terapia. Faz uma diferença real no dia a dia.', rating: 5 },
    ],
    faqs: [
      { question: 'Qual a diferença entre psicólogo e psiquiatra?', answer: 'O psicólogo realiza psicoterapia — conversa estruturada com técnicas científicas. O psiquiatra é médico e pode prescrever medicamentos. Em muitos casos, os dois se complementam.' },
      { question: 'Quantas sessões são necessárias?', answer: 'Varia muito por pessoa e objetivo. Alguns resultados aparecem em 8 a 12 sessões; processos mais profundos podem durar mais. Avaliamos juntos ao longo do atendimento.' },
      { question: 'O atendimento online é tão eficaz quanto o presencial?', answer: 'Sim. Pesquisas mostram eficácia equivalente para a maioria das condições. O formato online oferece mais privacidade e comodidade sem perder a qualidade terapêutica.' },
      { question: 'Plano de saúde cobre sessões de psicólogo?', answer: 'Depende do plano. Muitos cobrem. Emito recibo padrão CFM/CRP para reembolso. Confirme com sua operadora antes de agendar.' },
      { question: 'Posso agendar uma sessão experimental?', answer: 'Sim. Ofereço uma primeira sessão de avaliação onde conversamos sobre seus objetivos e vejo como posso ajudar. Sem compromisso.' },
      { question: 'O sigilo terapêutico é garantido?', answer: 'Absolutamente. O Código de Ética do CFP garante sigilo total. Nada do que é dito em sessão é compartilhado sem sua autorização explícita, exceto risco imediato de vida.' },
    ],
    blogPosts: BLOG_POSTS_SAUDE,
    problemStatement: 'Ansiedade, estresse e dificuldades emocionais afetam sua qualidade de vida, relacionamentos e trabalho.',
    solutionStatement: 'Com psicoterapia baseada em evidências, você desenvolve ferramentas reais para viver com mais leveza e propósito.',
    address: 'Rua Teodoro Rodrigues, 45, sala 12 — Centro, Sorocaba/SP',
    whatsapp: '5515998887766',
    email: 'contato@dranaaluz.com.br',
    schemaType: 'MentalHealthBusiness',
  },

  clinica: {
    businessName: 'Clínica Vita Sorocaba',
    tagline: 'Cuidado médico especializado com humanização em Sorocaba',
    heroHeadline: 'Sua saúde merece atenção especializada e atendimento humano.',
    heroSub: 'Consultas, exames e acompanhamento médico em Sorocaba. Agendamento rápido, sem longas filas de espera.',
    ctaLabel: 'Agendar consulta',
    ctaPhone: '(15) 3300-0000',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.saude('clinica-hero', 900, 600),
    aboutImage: IMG.saude('clinica-about', 600, 500),
    services: [
      { name: 'Consultas Médicas', description: 'Atendimento com hora marcada, sem longas esperas. Consultórios equipados e equipe acolhedora para toda a família.', icon: '🩺' },
      { name: 'Exames e Diagnósticos', description: 'Resultados rápidos com tecnologia de ponta. Laudo emitido pelo próprio especialista no mesmo dia.', icon: '🔬' },
      { name: 'Acompanhamento Contínuo', description: 'Seguimos sua saúde ao longo do tempo, com prontuário digital e histórico completo sempre disponível.', icon: '📋' },
    ],
    about: 'A Clínica Vita atua em Sorocaba há 12 anos com foco em medicina preventiva e atendimento humanizado. Nossa equipe é formada por especialistas registrados no CRM/SP com sólida formação em instituições de referência.',
    yearsExperience: 12,
    credential: 'CRM/SP 123456 | RQE 78901',
    stats: [
      { value: '12+', label: 'Anos em Sorocaba' },
      { value: '8.000+', label: 'Pacientes ativos' },
      { value: '15', label: 'Especialidades' },
      { value: '4.9★', label: 'Google Avaliações' },
    ],
    testimonials: [
      { name: 'Maria C.', text: 'Atendimento excelente, médico atencioso e sem espera. Recomendo para toda a família.', rating: 5 },
      { name: 'Pedro H.', text: 'Diagnóstico preciso e rápido. Me senti acolhido durante todo o processo, da recepção ao laudo.', rating: 5 },
      { name: 'Lúcia M.', text: 'Clínica limpa, organizada e com profissionais competentes. O melhor atendimento que já tive.', rating: 5 },
    ],
    faqs: [
      { question: 'Como agendar uma consulta?', answer: 'Você pode agendar pelo telefone, WhatsApp ou pelo formulário do site. Confirmamos em até 2 horas em dias úteis.' },
      { question: 'A clínica atende por plano de saúde?', answer: 'Atendemos pelos principais planos da região: Unimed, Amil, SulAmérica, Bradesco Saúde. Entre em contato para confirmar o seu.' },
      { question: 'Quanto tempo dura uma consulta?', answer: 'As consultas têm duração mínima de 30 minutos. Valorizamos um atendimento sem pressa para que todas as dúvidas sejam respondidas.' },
      { question: 'A clínica atende crianças?', answer: 'Sim, temos pediatra disponível de segunda a sexta. O agendamento pode ser feito pelos mesmos canais.' },
      { question: 'Os resultados de exames ficam disponíveis online?', answer: 'Sim. Os laudos são enviados por e-mail e ficam no portal do paciente, acessível 24 horas pelo celular.' },
      { question: 'Como funciona o retorno médico?', answer: 'As consultas de retorno têm valor diferenciado. O médico define o prazo ideal conforme cada caso durante a consulta.' },
    ],
    blogPosts: BLOG_POSTS_SAUDE,
    team: [
      { name: 'Dr. Roberto Faria', role: 'Clínico Geral — CRM/SP 112233', image: IMG.saude('team1', 400, 400) },
      { name: 'Dra. Patrícia Lins', role: 'Cardiologista — CRM/SP 223344', image: IMG.saude('team2', 400, 400) },
      { name: 'Dr. Eduardo Mota', role: 'Pediatra — CRM/SP 334455', image: IMG.saude('team3', 400, 400) },
    ],
    address: 'Av. Dom Aguirre, 500 — Centro, Sorocaba/SP',
    whatsapp: '5515933000000',
    email: 'agendamento@clinicavita.com.br',
    schemaType: 'MedicalClinic',
  },

  odontologia: {
    businessName: 'Odonto Prime Sorocaba',
    tagline: 'Odontologia estética e preventiva para toda a família',
    heroHeadline: 'Sorriso bonito começa com cuidado especializado.',
    heroSub: 'Clareamento, facetas, implantes e ortodontia em Sorocaba. Atendimento sem dor, com tecnologia de ponta e parcelas sem juros.',
    ctaLabel: 'Agendar avaliação gratuita',
    ctaPhone: '(15) 3411-5555',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.saude('odonto-hero', 900, 600),
    aboutImage: IMG.saude('odonto-about', 600, 500),
    services: [
      { name: 'Implante Dentário', description: 'Substitua dentes ausentes com implantes de titânio de alta durabilidade. Resultado natural e permanente.', icon: '🦷' },
      { name: 'Clareamento Dental', description: 'Clareamento a laser ou em casa com moldeira. Resultados visíveis em uma única sessão.', icon: '✨' },
      { name: 'Ortodontia', description: 'Aparelho metálico, estético e alinhadores invisíveis (Invisalign). Para adolescentes e adultos.', icon: '😁' },
    ],
    about: 'A Odonto Prime é referência em odontologia estética e preventiva em Sorocaba há 9 anos. Equipe com 6 especialistas registrados no CRO/SP, em clínica equipada com tomógrafo 3D, laser odontológico e sistema CAD/CAM.',
    yearsExperience: 9,
    credential: 'CRO/SP 98765',
    stats: [
      { value: '9+', label: 'Anos em Sorocaba' },
      { value: '3.000+', label: 'Sorrisos transformados' },
      { value: '6', label: 'Especialistas' },
      { value: '4.9★', label: 'Avaliação Google' },
    ],
    testimonials: [
      { name: 'Juliana A.', text: 'Fiz facetas e o resultado ficou incrível! Natural, bonito e sem dor nenhuma no processo.', rating: 5 },
      { name: 'Rodrigo C.', text: 'Implante feito com todo cuidado e suporte. Recuperei a autoestima com meu sorriso.', rating: 5 },
      { name: 'Camila T.', text: 'O Invisalign mudou minha vida. Ninguém sabia que eu estava usando aparelho.', rating: 5 },
    ],
    faqs: [
      { question: 'O implante dentário dói?', answer: 'Não. O procedimento é realizado com anestesia local e é praticamente indolor. O pós-operatório é leve e controlado com medicação simples.' },
      { question: 'Quantas sessões de clareamento são necessárias?', answer: 'O clareamento a laser é feito em 1 sessão de 1h. O clareamento com moldeira caseira leva de 10 a 15 dias.' },
      { question: 'Plano de saúde cobre tratamentos odontológicos?', answer: 'Trabalhamos com os principais convênios odontológicos: Odontoprev, Amil Dental, SulAmérica e outros. Consulte a cobertura do seu plano.' },
      { question: 'Qual a diferença entre faceta e lente de contato dental?', answer: 'A lente de contato dental é mais fina e conservadora, sem necessidade de desgaste do dente. A faceta clássica exige um pequeno desgaste. O dentista indica a melhor opção.' },
      { question: 'Qual a durabilidade do implante?', answer: 'Com higienização adequada, o implante de titânio dura décadas — na prática, a vida toda para a maioria dos pacientes.' },
      { question: 'Atendem crianças?', answer: 'Sim. Temos odontopediatra para atendimento infantil a partir dos 2 anos, com ambiente acolhedor para deixar a criança à vontade.' },
    ],
    blogPosts: BLOG_POSTS_SAUDE,
    address: 'Rua General Osório, 890 — Centro, Sorocaba/SP',
    whatsapp: '5515934115555',
    email: 'contato@odontoprime.com.br',
    schemaType: 'Dentist',
  },

  fisioterapia: {
    businessName: 'Fisio Movimento Sorocaba',
    tagline: 'Reabilitação física e alívio de dores com fisioterapia especializada',
    heroHeadline: 'Dor não é normal. Você merece se mover sem limitação.',
    heroSub: 'Fisioterapia ortopédica, esportiva e pós-cirúrgica em Sorocaba. Avaliação gratuita e plano de tratamento individualizado.',
    ctaLabel: 'Agendar avaliação gratuita',
    ctaPhone: '(15) 3500-2200',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.saude('fisio-hero', 900, 600),
    aboutImage: IMG.saude('fisio-about', 600, 500),
    services: [
      { name: 'Fisioterapia Ortopédica', description: 'Tratamento de lesões musculares, articulares e pós-cirúrgico com técnicas baseadas em evidências.', icon: '🦴' },
      { name: 'Fisioterapia Esportiva', description: 'Reabilitação de atletas amadores e profissionais. Retorno ao esporte com segurança e performance.', icon: '🏃' },
      { name: 'RPG e Pilates Clínico', description: 'Reeducação postural e fortalecimento do core para prevenção e tratamento de dores crônicas.', icon: '🧘' },
    ],
    about: 'A Fisio Movimento atua em Sorocaba há 8 anos com foco em reabilitação ortopédica e esportiva. Equipe de 4 fisioterapeutas registrados no CREFITO com pós-graduação em terapia manual, RPG e Pilates Clínico.',
    yearsExperience: 8,
    credential: 'CREFITO 3/12345-F',
    stats: [
      { value: '8+', label: 'Anos de experiência' },
      { value: '1.200+', label: 'Pacientes reabilitados' },
      { value: '98%', label: 'Alta médica no prazo' },
      { value: '4.8★', label: 'Google Avaliações' },
    ],
    testimonials: [
      { name: 'Alexandre S.', text: 'Voltei a correr 6 meses após cirurgia no joelho. O trabalho deles é impressionante.', rating: 5 },
      { name: 'Beatriz N.', text: 'Dor lombar crônica de 3 anos resolvida em 2 meses de tratamento. Obrigada!', rating: 5 },
      { name: 'Henrique P.', text: 'Atenção individualizada, ambiente excelente e resultado real. Super recomendo.', rating: 5 },
    ],
    faqs: [
      { question: 'Plano de saúde cobre fisioterapia?', answer: 'Sim, a maioria dos planos cobre. Trabalhamos com Unimed, Amil, SulAmérica, Bradesco e outros. Confirme com seu plano a quantidade de sessões cobertas.' },
      { question: 'Quantas sessões são necessárias?', answer: 'Depende do diagnóstico. Em média, tratamentos ortopédicos levam de 10 a 20 sessões. Avaliamos e definimos o plano na primeira consulta.' },
      { question: 'Preciso de encaminhamento médico?', answer: 'Não é obrigatório para atendimento particular. Para planos de saúde, alguns exigem guia médica — confirme com sua operadora.' },
      { question: 'As sessões são individuais ou em grupo?', answer: 'São individuais. Cada paciente tem atenção exclusiva do fisioterapeuta durante toda a sessão.' },
      { question: 'Atendem crianças e idosos?', answer: 'Sim. Temos especialistas em fisioterapia pediátrica e geriátrica com abordagens específicas para cada faixa etária.' },
      { question: 'Como é feita a avaliação inicial?', answer: 'A avaliação é gratuita e dura cerca de 40 minutos. Analisamos postura, amplitude de movimento, dor e histórico para montar o plano de tratamento.' },
    ],
    blogPosts: BLOG_POSTS_SAUDE,
    address: 'Av. Independência, 1200 — Jardim Paulista, Sorocaba/SP',
    whatsapp: '5515935002200',
    email: 'contato@fisiomovimento.com.br',
    schemaType: 'HealthAndBeautyBusiness',
  },

  veterinaria: {
    businessName: 'Clínica Vet Pet Sorocaba',
    tagline: 'Saúde e bem-estar para cães, gatos e animais exóticos',
    heroHeadline: 'Seu pet merece o melhor cuidado veterinário de Sorocaba.',
    heroSub: 'Consultas, vacinas, cirurgias e internação 24h. Atendimento de emergência e equipe especializada em pequenos animais.',
    ctaLabel: 'Agendar consulta',
    ctaPhone: '(15) 3266-0099',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.saude('vet-hero', 900, 600),
    aboutImage: IMG.saude('vet-about', 600, 500),
    services: [
      { name: 'Consultas e Vacinação', description: 'Consultas clínicas, vacinação anual, vermifugação e exames preventivos para cães e gatos.', icon: '🐾' },
      { name: 'Cirurgias e Procedimentos', description: 'Centro cirúrgico completo: castração, ortopedia, oftalmologia e cirurgias de urgência.', icon: '🔬' },
      { name: 'Emergência 24h', description: 'Plantão veterinário 24 horas para atendimento de urgência e emergência. Não fechamos nunca.', icon: '🚑' },
    ],
    about: 'A Clínica Vet Pet atende em Sorocaba há 11 anos com equipe de 7 médicos veterinários registrados no CFMV. UTI veterinária, laboratório próprio, raio-X digital e ultrassonografia no mesmo local.',
    yearsExperience: 11,
    credential: 'CFMV 12345',
    stats: [
      { value: '11+', label: 'Anos cuidando de pets' },
      { value: '5.000+', label: 'Animais atendidos/ano' },
      { value: '24h', label: 'Emergências' },
      { value: '4.9★', label: 'Google Avaliações' },
    ],
    testimonials: [
      { name: 'Vanessa L.', text: 'Minha gata foi atendida de emergência às 2h e saiu bem. Gratidão pela dedicação de toda a equipe.', rating: 5 },
      { name: 'Gustavo F.', text: 'Castrei meu cachorro aqui. Recuperação perfeita, muito cuidado e atenção com ele e comigo.', rating: 5 },
      { name: 'Renata K.', text: 'Clínica completa, médicos competentes e estrutura impecável. É a minha referência em Sorocaba.', rating: 5 },
    ],
    faqs: [
      { question: 'Com que frequência devo levar meu pet ao veterinário?', answer: 'No mínimo uma vez por ano para check-up e atualização de vacinas. Pets com mais de 7 anos merecem visitas semestrais.' },
      { question: 'Quando castrar meu pet?', answer: 'O ideal para cães e gatos é entre 4 e 6 meses. O veterinário avalia o peso e condição do animal para definir o momento certo.' },
      { question: 'A clínica faz atendimento de animais exóticos?', answer: 'Sim. Atendemos répteis, aves, coelhos e pequenos mamíferos com médico especializado.' },
      { question: 'Quais vacinas meu cachorro precisa tomar?', answer: 'V10 ou V8 (múltipla), antirrábica e gripe canina são as principais. O protocolo completo é definido na consulta conforme idade e histórico.' },
      { question: 'O plano de saúde pet cobre consultas na clínica?', answer: 'Trabalhamos com os principais convênios pet do mercado. Consulte-nos sobre os planos aceitos.' },
      { question: 'Tem estacionamento?', answer: 'Sim, estacionamento próprio e gratuito para clientes. Fácil acesso pela Av. Independência.' },
    ],
    blogPosts: BLOG_POSTS_SAUDE,
    address: 'Av. Independência, 3300 — Vila Jardim, Sorocaba/SP',
    whatsapp: '5515932660099',
    email: 'contato@vetpetsorocaba.com.br',
    schemaType: 'VeterinaryCare',
  },

  imobiliaria: {
    businessName: 'Prime Imóveis Sorocaba',
    tagline: 'Compra, venda e locação de imóveis em Sorocaba e região',
    heroHeadline: 'O imóvel certo para cada momento da sua vida.',
    heroSub: 'Mais de 300 imóveis disponíveis em Sorocaba. Corretores especializados por bairro, financiamento facilitado e assessoria completa.',
    ctaLabel: 'Ver imóveis disponíveis',
    ctaPhone: '(15) 3900-1234',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.imoveis('hero', 900, 600),
    aboutImage: IMG.imoveis('about', 600, 500),
    services: [
      { name: 'Compra e Venda', description: 'Apartamentos, casas, terrenos e imóveis comerciais. Avaliação gratuita e assessoria jurídica completa.', icon: '🏠' },
      { name: 'Locação', description: 'Residencial e comercial. Análise de crédito rápida, contrato digital e suporte durante toda a locação.', icon: '🔑' },
      { name: 'Financiamento', description: 'Simulação gratuita com Caixa, Bradesco e Itaú. Aprovação mais rápida com nossa assessoria especializada.', icon: '💰' },
    ],
    about: 'A Prime Imóveis atua em Sorocaba desde 2010 com 14 corretores CRECI credenciados e carteira de mais de 300 imóveis ativos. Especialistas por bairro: Centro, Campolim, Além Ponte e toda a região.',
    yearsExperience: 14,
    credential: 'CRECI/SP J-23456',
    stats: [
      { value: '14+', label: 'Anos no mercado' },
      { value: '300+', label: 'Imóveis no portfólio' },
      { value: '1.200+', label: 'Negócios fechados' },
      { value: '4.8★', label: 'Google Avaliações' },
    ],
    testimonials: [
      { name: 'Fábio M.', text: 'Comprei meu primeiro apartamento com total segurança. Me explicaram cada detalhe do financiamento.', rating: 5 },
      { name: 'Simone R.', text: 'Aluguei meu ponto comercial em 15 dias. Corretora atenciosa e processo muito ágil.', rating: 5 },
      { name: 'Daniel P.', text: 'Venderam meu imóvel 40% mais rápido que a média da região. Profissionalismo total.', rating: 5 },
    ],
    faqs: [
      { question: 'Qual a comissão do corretor na venda?', answer: 'A comissão padrão CRECI é de 6% para imóveis urbanos e 8% para rurais, paga pelo vendedor. Na locação, o proprietário paga o equivalente a 1 aluguel.' },
      { question: 'Quanto tempo demora para financiar um imóvel?', answer: 'Com toda a documentação em mãos, a aprovação leva de 15 a 30 dias. Nossa equipe agiliza o processo com os bancos parceiros.' },
      { question: 'Posso usar o FGTS na compra?', answer: 'Sim, para imóvel residencial que seja seu primeiro, em cidade onde você trabalha há pelo menos 1 ano e com valor dentro dos limites do programa.' },
      { question: 'Como funciona a avaliação do meu imóvel?', answer: 'Nossa equipe visita o imóvel, analisa localização, metragem, estado de conservação e pesquisa imóveis comparáveis na região. Laudo em até 48h, gratuito.' },
      { question: 'A imobiliária cuida da locação após o contrato?', answer: 'Sim. Administramos o contrato, cobrança de aluguel, reajuste anual e intermediamos eventuais demandas do locatário.' },
      { question: 'Trabalham com imóveis na planta?', answer: 'Sim. Somos correspondentes das principais incorporadoras de Sorocaba e região, com acesso exclusivo a lançamentos.' },
    ],
    blogPosts: BLOG_POSTS_IMOVEIS,
    portfolioItems: [
      { title: 'Apto 3 dorm — Campolim', image: IMG.imoveis('port1', 600, 400), category: 'Venda' },
      { title: 'Casa 4 dorm — Além Ponte', image: IMG.imoveis('port2', 600, 400), category: 'Venda' },
      { title: 'Sala Comercial — Centro', image: IMG.imoveis('port3', 600, 400), category: 'Locação' },
      { title: 'Terreno 500m² — Vila Jardim', image: IMG.imoveis('port4', 600, 400), category: 'Venda' },
      { title: 'Apto Studio — Éden', image: IMG.imoveis('port5', 600, 400), category: 'Locação' },
      { title: 'Casa de Condomínio — Wanel Ville', image: IMG.imoveis('port6', 600, 400), category: 'Venda' },
    ],
    address: 'Rua Barão de Tatuí, 800 — Centro, Sorocaba/SP',
    whatsapp: '5515939001234',
    email: 'contato@primeimoveis.com.br',
    schemaType: 'RealEstateAgent',
  },

  restaurante: {
    businessName: 'Cantina do Bruno',
    tagline: 'Culinária italiana artesanal com sabor de família em Sorocaba',
    heroHeadline: 'Massa fresca, molho da nonna e aquele ambiente de domingo.',
    heroSub: 'Cantina italiana familiar com 16 anos em Sorocaba. Massas artesanais feitas todos os dias, vinhos selecionados e espaço para eventos.',
    ctaLabel: 'Reservar mesa',
    ctaPhone: '(15) 3444-7788',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.alimento('hero', 900, 600),
    aboutImage: IMG.alimento('about', 600, 500),
    services: [
      { name: 'Almoço & Jantar', description: 'Cardápio completo de segunda a domingo. Massas frescas, carnes, peixes e sobremesas artesanais.', icon: '🍝' },
      { name: 'Eventos & Confraternizações', description: 'Espaço climatizado para até 80 pessoas. Cardápio fechado e serviço exclusivo para seu evento.', icon: '🥂' },
      { name: 'Delivery via iFood', description: 'Peça pelo iFood ou WhatsApp. Entrega em até 45 min nas principais regiões de Sorocaba.', icon: '🛵' },
    ],
    about: 'A Cantina do Bruno nasceu em 2010 das receitas da família Ferreira, imigrantes italianos de terceira geração. Hoje somos referência em massa fresca artesanal em Sorocaba, com carta de vinhos italianos e ambiente familiar.',
    yearsExperience: 16,
    credential: 'CNPJ 12.345.678/0001-90 | Alvará 2026',
    stats: [
      { value: '16+', label: 'Anos de história' },
      { value: '500+', label: 'Pratos servidos/dia' },
      { value: '4.8★', label: 'iFood' },
      { value: '4.9★', label: 'Google' },
    ],
    testimonials: [
      { name: 'Patricia L.', text: 'A melhor massa fresca de Sorocaba, sem dúvida. O cacio e pepe é simplesmente perfeito.', rating: 5 },
      { name: 'Eduardo M.', text: 'Fizemos nossa confraternização de fim de ano aqui. Serviço impecável e comida deliciosa!', rating: 5 },
      { name: 'Isabela F.', text: 'Ambiente acolhedor, atendimento ótimo e sobremesas incríveis. Vira e mexe estou aqui.', rating: 5 },
    ],
    faqs: [
      { question: 'É necessário reservar mesa?', answer: 'Recomendamos reserva, especialmente fins de semana. Aceitamos walk-in conforme disponibilidade. Reserve pelo WhatsApp ou telefone.' },
      { question: 'Tem opções vegetarianas?', answer: 'Sim. Temos massas, risotos e pratos vegetarianos no cardápio. Consulte o cardápio do dia pelo WhatsApp.' },
      { question: 'Fazem delivery?', answer: 'Sim, pelo iFood e WhatsApp. Entregamos em Sorocaba com taxa de R$5 a R$12 conforme distância. Tempo médio: 40 minutos.' },
      { question: 'Aceitam eventos?', answer: 'Sim. Temos espaço para até 80 pessoas com cardápio fechado. Consulte disponibilidade e pacotes pelo WhatsApp.' },
      { question: 'Quais as formas de pagamento?', answer: 'Aceitamos PIX, débito, crédito (parcelamos em até 6x sem juros) e vale-refeição (VR, Alelo, Sodexo).' },
      { question: 'Tem estacionamento?', answer: 'Sim, estacionamento gratuito com manobrista nos fins de semana. Fácil acesso pela Av. São Paulo.' },
    ],
    blogPosts: BLOG_POSTS_SERVICOS,
    portfolioItems: [
      { title: 'Tagliatelle al Ragù', image: IMG.alimento('port1', 600, 400), category: 'Massas' },
      { title: 'Risotto ai Funghi', image: IMG.alimento('port2', 600, 400), category: 'Risotos' },
      { title: 'Tiramisu Artesanal', image: IMG.alimento('port3', 600, 400), category: 'Sobremesas' },
      { title: 'Ambiente Interno', image: IMG.alimento('port4', 600, 400), category: 'Espaço' },
      { title: 'Gnocchi della Nonna', image: IMG.alimento('port5', 600, 400), category: 'Massas' },
      { title: 'Panna Cotta', image: IMG.alimento('port6', 600, 400), category: 'Sobremesas' },
    ],
    address: 'Av. São Paulo, 2100 — Jardim Simus, Sorocaba/SP',
    whatsapp: '5515934447788',
    email: 'reservas@cantinadobruno.com.br',
    schemaType: 'Restaurant',
  },

  salao: {
    businessName: 'Studio Bella Sorocaba',
    tagline: 'Cabelo, estética e bem-estar para quem valoriza o melhor',
    heroHeadline: 'Aqui, cada cliente é tratado como celebridade.',
    heroSub: 'Corte, coloração, tratamentos capilares e procedimentos estéticos em Sorocaba. Equipe premiada, ambiente premium.',
    ctaLabel: 'Agendar horário',
    ctaPhone: '(15) 99777-8899',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.beleza('hero', 900, 600),
    aboutImage: IMG.beleza('about', 600, 500),
    services: [
      { name: 'Coloração & Mechas', description: 'Loiro de Hollywood, balayage, ombré, coloração global e correção de cor. Técnicas internacionais.', icon: '🎨' },
      { name: 'Tratamentos Capilares', description: 'Reconstrução, botox capilar, hidratação profunda e cronograma personalizado para cada tipo de fio.', icon: '💆' },
      { name: 'Design de Sobrancelha & Lash', description: 'Designer de sobrancelha com henna, lash lifting, extensão de cílios e microblading certificado.', icon: '✨' },
    ],
    about: 'O Studio Bella nasceu em 2015 com uma missão: elevar o padrão de atendimento em salões de Sorocaba. Hoje somos referência em coloração e tratamentos capilares, com equipe treinada em São Paulo, Rio e internacionalmente.',
    yearsExperience: 11,
    credential: 'CNPJ 98.765.432/0001-10',
    stats: [
      { value: '11+', label: 'Anos de experiência' },
      { value: '200+', label: 'Clientes/mês' },
      { value: '3', label: 'Prêmios de excelência' },
      { value: '4.9★', label: 'Google Avaliações' },
    ],
    testimonials: [
      { name: 'Aline G.', text: 'Melhor salão de Sorocaba, sem nenhuma dúvida. A coloração ficou exatamente como eu queria!', rating: 5 },
      { name: 'Roberta M.', text: 'Vim para fazer o lash lifting e me apaixonei. Já agendei o próximo tratamento capilar.', rating: 5 },
      { name: 'Natália C.', text: 'Atendimento premium, ambiente lindo e profissionais incríveis. Vale cada centavo.', rating: 5 },
    ],
    faqs: [
      { question: 'Preciso agendar com antecedência?', answer: 'Recomendamos pelo menos 48h de antecedência, especialmente para colorações. Fins de semana lotam rápido — agende com 1 semana de antecedência.' },
      { question: 'Quanto tempo dura uma coloração?', answer: 'Depende do procedimento: coloração global leva 2-3h, balayage 3-5h. Informamos o tempo exato no agendamento.' },
      { question: 'Fazem teste de mecha antes?', answer: 'Sim. Para procedimentos de descoloração, fazemos teste de resistência antes de iniciar. Sua segurança é nossa prioridade.' },
      { question: 'Aceitam menores de idade?', answer: 'Sim, menores acompanhados de responsável. Para procedimentos químicos em cabelos de crianças, exigimos autorização escrita.' },
      { question: 'Quais formas de pagamento aceitam?', answer: 'PIX, débito, crédito (em até 10x no crédito sem juros) e dinheiro. Não aceitamos cheque.' },
      { question: 'Tem produtos para venda?', answer: 'Sim. Trabalhamos com as marcas L\'Oréal, Redken e Cadiveu para venda e uso em salão, com orientação da sua profissional.' },
    ],
    blogPosts: BLOG_POSTS_BELEZA,
    portfolioItems: [
      { title: 'Loiro Platinado', image: IMG.beleza('port1', 600, 400), category: 'Coloração' },
      { title: 'Balayage Natural', image: IMG.beleza('port2', 600, 400), category: 'Coloração' },
      { title: 'Ombré Chocolate', image: IMG.beleza('port3', 600, 400), category: 'Coloração' },
      { title: 'Tratamento Botox Capilar', image: IMG.beleza('port4', 600, 400), category: 'Tratamentos' },
      { title: 'Extensão de Cílios', image: IMG.beleza('port5', 600, 400), category: 'Lash' },
      { title: 'Design de Sobrancelha', image: IMG.beleza('port6', 600, 400), category: 'Sobrancelha' },
    ],
    team: [
      { name: 'Bruna Siqueira', role: 'Fundadora & Colorista Sênior', image: IMG.beleza('team1', 400, 400) },
      { name: 'Camila Ramos', role: 'Especialista em Tratamentos', image: IMG.beleza('team2', 400, 400) },
      { name: 'Letícia Moraes', role: 'Design de Sobrancelha & Lash', image: IMG.beleza('team3', 400, 400) },
    ],
    address: 'Rua Sta. Efigênia, 450 — Campolim, Sorocaba/SP',
    whatsapp: '5515997778899',
    email: 'contato@studiobella.com.br',
    schemaType: 'BeautySalon',
  },

  escola: {
    businessName: 'Instituto Saber Sorocaba',
    tagline: 'Cursos técnicos e profissionalizantes com certificação reconhecida',
    heroHeadline: 'Conhecimento que transforma carreira e vida.',
    heroSub: 'Mais de 20 cursos técnicos e profissionalizantes em Sorocaba. Presencial, EAD e híbrido. Certificado reconhecido pelo mercado.',
    ctaLabel: 'Conhecer os cursos',
    ctaPhone: '(15) 3100-4400',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.educacao('hero', 900, 600),
    aboutImage: IMG.educacao('about', 600, 500),
    services: [
      { name: 'Cursos Técnicos', description: 'Técnico em Enfermagem, Administração, Informática, Segurança do Trabalho e mais 15 áreas.', icon: '🎓' },
      { name: 'Cursos Profissionalizantes', description: 'Eletricista, Soldador, Operador de Máquinas, Design Gráfico e outros com saída rápida para o mercado.', icon: '🔧' },
      { name: 'Cursos Online (EAD)', description: 'Plataforma própria com aulas gravadas + ao vivo. Acesso 24h de qualquer dispositivo.', icon: '💻' },
    ],
    about: 'O Instituto Saber forma profissionais em Sorocaba desde 2008. Mais de 5.000 alunos formados, parceria com 120 empresas da região para colocação no mercado. MEC credenciado, certificados com validade nacional.',
    yearsExperience: 18,
    credential: 'MEC credenciado — CNPJ 11.222.333/0001-44',
    stats: [
      { value: '18+', label: 'Anos formando profissionais' },
      { value: '5.000+', label: 'Alunos formados' },
      { value: '120+', label: 'Empresas parceiras' },
      { value: '20+', label: 'Cursos disponíveis' },
    ],
    courses: [
      { name: 'Técnico em Enfermagem', hours: 1200, modality: 'Presencial', description: 'Formação completa com estágio supervisionado. Alta demanda no mercado de trabalho.', image: IMG.educacao('course1', 600, 400), price: 'R$399/mês' },
      { name: 'Técnico em Administração', hours: 800, modality: 'Híbrido', description: 'Gestão, finanças, RH e empreendedorismo. Certificado pelo MEC.', image: IMG.educacao('course2', 600, 400), price: 'R$299/mês' },
      { name: 'Eletricista Predial', hours: 400, modality: 'Presencial', description: 'NR-10, instalações elétricas e SPDA. Saída rápida para o mercado.', image: IMG.educacao('course3', 600, 400), price: 'R$199/mês' },
      { name: 'Design Gráfico', hours: 600, modality: 'EAD', description: 'Photoshop, Illustrator, InDesign e identidade visual. Portfólio ao final do curso.', image: IMG.educacao('course4', 600, 400), price: 'R$149/mês' },
    ],
    testimonials: [
      { name: 'Thiago S.', text: 'Fiz o técnico em enfermagem e já estou empregado há 8 meses. O estágio que eles conseguem é diferenciado.', rating: 5 },
      { name: 'Andressa N.', text: 'Ambiente de ensino excelente, professores experientes e suporte ao longo de todo o curso.', rating: 5 },
      { name: 'Marcos J.', text: 'O curso de eletricista mudou minha vida. Hoje trabalho com carteira assinada e boa renda.', rating: 5 },
    ],
    faqs: [
      { question: 'Os certificados são reconhecidos pelo MEC?', answer: 'Sim. O Instituto Saber é credenciado pelo MEC e pelo Conselho Estadual de Educação de SP. Os diplomas têm validade nacional.' },
      { question: 'Tem bolsa ou financiamento?', answer: 'Sim. Oferecemos bolsas de até 50% para alunos em vulnerabilidade social e parcelamento sem juros em até 24x no cartão.' },
      { question: 'Qual a duração dos cursos técnicos?', answer: 'Entre 800h e 1.200h, cursados em 12 a 24 meses. Os profissionalizantes variam de 40h a 400h.' },
      { question: 'Os cursos EAD têm aulas ao vivo?', answer: 'Sim. Todos os cursos EAD têm plantões de dúvidas ao vivo semanais e interação direta com os professores pela plataforma.' },
      { question: 'A escola ajuda na colocação profissional?', answer: 'Sim. Temos setor de estágios e empregos com convênio de 120 empresas da região. Alunos formados têm prioridade nas vagas.' },
      { question: 'É possível trancar o curso e retornar?', answer: 'Sim. Em até 6 meses sem custo adicional. Após esse período, avaliamos caso a caso.' },
    ],
    blogPosts: BLOG_POSTS_EDUCACAO,
    address: 'Rua Padre Luís Alves de Siqueira, 300 — Centro, Sorocaba/SP',
    whatsapp: '5515931004400',
    email: 'contato@institutosaber.com.br',
    schemaType: 'EducationalOrganization',
  },

  servicos: {
    businessName: 'Silva Serviços Sorocaba',
    tagline: 'Manutenção e instalações residenciais com qualidade e pontualidade',
    heroHeadline: 'Serviço de qualidade, prazo cumprido e preço justo.',
    heroSub: 'Elétrica, hidráulica, reformas e manutenção preventiva em Sorocaba e região. Mais de 10 anos e mais de 500 clientes satisfeitos.',
    ctaLabel: 'Solicitar orçamento grátis',
    ctaPhone: '(15) 99123-4567',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.servicos('hero', 900, 600),
    aboutImage: IMG.servicos('about', 600, 500),
    services: [
      { name: 'Elétrica Residencial', description: 'Instalação, manutenção, troca de quadros, tomadas e iluminação. Profissionais NR-10 certificados.', icon: '⚡' },
      { name: 'Hidráulica', description: 'Conserto de vazamentos, instalação de torneiras, chuveiros, caixas d\'água e tubulações.', icon: '💧' },
      { name: 'Reformas e Pintura', description: 'Reforma completa ou parcial de banheiros, cozinhas e ambientes. Pintura interna e externa.', icon: '🏠' },
    ],
    about: 'Com mais de 10 anos no mercado de Sorocaba, a Silva Serviços é reconhecida pela qualidade, pontualidade e atendimento transparente. Equipe com certificações NR-10 e NR-35. Já atendemos mais de 500 clientes e empresas.',
    yearsExperience: 10,
    credential: 'CNPJ 12.345.678/0001-90 | NR-10 certificado',
    stats: STATS_DEFAULT,
    testimonials: [
      { name: 'Ana P.', text: 'Serviço impecável, prazo cumprido e ótimo custo-benefício. Já contratei 3 vezes e sempre indico.', rating: 5 },
      { name: 'João R.', text: 'Profissional, pontual e deixou tudo perfeito. Super recomendo para qualquer serviço!', rating: 5 },
      { name: 'Fernanda L.', text: 'Atendimento rápido e preço justo. Resolveram meu problema no mesmo dia da ligação.', rating: 5 },
    ],
    faqs: [
      { question: 'Qual o prazo de atendimento?', answer: 'Em geral, agendamos dentro de 24 a 72 horas. Para urgências, temos disponibilidade especial — entre em contato para verificar.' },
      { question: 'Vocês atendem fora de Sorocaba?', answer: 'Sim, atendemos Sorocaba e cidades próximas como Votorantim, Salto, Itu e Tatuí. Consulte disponibilidade e custo de deslocamento.' },
      { question: 'Como funciona o orçamento?', answer: 'O orçamento é gratuito e sem compromisso. Entre em contato, descreva o serviço e retornamos em até 2 horas em dias úteis.' },
      { question: 'Os serviços têm garantia?', answer: 'Sim. Todos os nossos serviços têm garantia de 90 dias para defeitos de execução. Retornamos sem custo adicional para resolver.' },
      { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos PIX, cartão de débito e crédito (até 6x sem juros), dinheiro e transferência bancária.' },
      { question: 'É necessário agendar com antecedência?', answer: 'Recomendamos agendamento com pelo menos 48h de antecedência. Em casos urgentes, verificamos disponibilidade no mesmo dia.' },
    ],
    blogPosts: BLOG_POSTS_SERVICOS,
    problemStatement: 'Problemas elétricos, vazamentos e reformas incompletas geram estresse, custo extra e risco à segurança da sua família.',
    solutionStatement: 'Com profissionais certificados, orçamento transparente e garantia de serviço, você resolve tudo de uma vez e sem surpresas.',
    address: 'Sorocaba/SP — Atendemos em toda a cidade e região',
    whatsapp: '5515991234567',
    email: 'contato@silvaservicos.com.br',
    schemaType: 'LocalBusiness',
  },

  institucional: {
    businessName: 'Grupo Alfa Sorocaba',
    tagline: 'Soluções empresariais integradas para médias e grandes empresas',
    heroHeadline: 'Resultados que sua empresa precisa, entregues com excelência.',
    heroSub: 'Consultoria, terceirização e serviços especializados para empresas em Sorocaba e Grande SP. 20 anos de presença nacional.',
    ctaLabel: 'Falar com especialista',
    ctaPhone: '(15) 3800-0000',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.juridico('inst-hero', 900, 600),
    aboutImage: IMG.juridico('inst-about', 600, 500),
    services: [
      { name: 'Consultoria Estratégica', description: 'Diagnóstico, planejamento e implementação de melhorias em processos, gestão e cultura organizacional.', icon: '📈' },
      { name: 'Terceirização de Serviços', description: 'Limpeza, segurança, manutenção e TI gerenciados por nós. Sua empresa foca no core business.', icon: '🤝' },
      { name: 'Gestão de Projetos', description: 'PMO estruturado para projetos de expansão, implantação de sistemas e reestruturação organizacional.', icon: '🎯' },
    ],
    about: 'O Grupo Alfa é uma holding de serviços empresariais com 20 anos de atuação e presença em 8 estados brasileiros. Nosso escritório de Sorocaba atende empresas do polo industrial e do setor de serviços com equipes especializadas.',
    yearsExperience: 20,
    credential: 'CNPJ 11.222.333/0001-00 | ISO 9001:2015',
    stats: [
      { value: '20+', label: 'Anos de mercado' },
      { value: '8', label: 'Estados atendidos' },
      { value: '150+', label: 'Clientes corporativos' },
      { value: 'ISO 9001', label: 'Certificação de qualidade' },
    ],
    team: TEAM_DEFAULT,
    testimonials: [
      { name: 'Ricardo Neves — CFO', text: 'Terceirizamos toda a área de facilities com o Grupo Alfa. Reduzimos custo em 22% e aumentamos qualidade.', rating: 5 },
      { name: 'Marcia Alves — CEO', text: 'A consultoria estratégica deles nos ajudou a dobrar o faturamento em 18 meses. Parceria real.', rating: 5 },
      { name: 'Paulo Mendonça — COO', text: 'Gestão de projetos de altíssimo nível. Entregaram tudo no prazo e dentro do orçamento.', rating: 5 },
    ],
    faqs: [
      { question: 'Qual o porte mínimo de empresa para contratar?', answer: 'Atendemos empresas a partir de 20 funcionários. Para consultorias pontuais, não há porte mínimo.' },
      { question: 'Como funciona o contrato de terceirização?', answer: 'Contratos a partir de 12 meses com SLA definido. Toda a gestão do pessoal terceirizado é nossa responsabilidade.' },
      { question: 'A empresa tem certificações?', answer: 'Sim. Somos certificados ISO 9001:2015 e nossos profissionais têm certificações específicas por área (CIPA, NR-10, PMP, etc.).' },
      { question: 'Atuam fora de Sorocaba?', answer: 'Sim. Temos operações em SP capital, Campinas, São José dos Campos, Santos e mais 4 estados. Consulte.' },
      { question: 'Como é feita a precificação?', answer: 'Elaboramos proposta personalizada após diagnóstico gratuito. Modelos de FTE, projeto ou performance conforme o escopo.' },
      { question: 'Qual o prazo para início dos serviços?', answer: 'Em média 30 dias após assinatura do contrato para mobilização da equipe e adequação dos processos.' },
    ],
    blogPosts: BLOG_POSTS_SERVICOS,
    address: 'Av. Dr. Afonso Vergueiro, 2200 — Éden, Sorocaba/SP',
    whatsapp: '5515938000000',
    email: 'comercial@grupoalfa.com.br',
    schemaType: 'Organization',
  },

  landing: {
    businessName: 'Mentoria Pro Sorocaba',
    tagline: 'O método que dobrou o faturamento de 200 profissionais em 90 dias',
    heroHeadline: 'Pare de trabalhar mais. Comece a ganhar mais.',
    heroSub: 'Mentoria intensiva de 90 dias para profissionais liberais e prestadores de serviço que querem dobrar o faturamento sem trabalhar o dobro.',
    ctaLabel: 'Quero dobrar meu faturamento',
    ctaPhone: '(15) 99000-1111',
    city: 'Sorocaba', state: 'SP',
    heroImage: IMG.servicos('lp-hero', 900, 600),
    aboutImage: IMG.servicos('lp-about', 600, 500),
    services: [
      { name: '12 Semanas de Mentoria', description: 'Sessões semanais ao vivo em grupo pequeno (máx 10 pessoas) com acompanhamento próximo.', icon: '🎯' },
      { name: 'Método de Precificação', description: 'Sistema exclusivo para precificar seus serviços e parar de cobrar abaixo do que vale.', icon: '💰' },
      { name: 'Captação de Clientes Premium', description: 'Estratégia orgânica para atrair clientes que pagam mais e reclamam menos.', icon: '🚀' },
    ],
    about: 'Sou o Marco Vieira, ex-contador que transformou um escritório de R$8.000/mês em R$45.000/mês em 14 meses. Hoje ajudo profissionais liberais a replicar esse resultado com método, não sorte.',
    yearsExperience: 8,
    credential: 'CRC/SP 234567 | 200+ alunos formados',
    stats: [
      { value: '200+', label: 'Profissionais mentorados' },
      { value: '90', label: 'Dias para resultado' },
      { value: '2.8×', label: 'Aumento médio de faturamento' },
      { value: '4.9★', label: 'Avaliação dos alunos' },
    ],
    testimonials: [
      { name: 'Beatriz — Psicóloga', text: 'Fui de R$6.000 para R$18.000/mês em 4 meses. A mentoria mudou minha relação com dinheiro e com meu negócio.', rating: 5 },
      { name: 'Rafael — Advogado', text: 'Aprendi a cobrar o que meu trabalho vale de verdade. Hoje tenho metade dos clientes e ganho o dobro.', rating: 5 },
      { name: 'Carla — Designer', text: 'Nunca pensei que conseguiria trabalhar 4 dias por semana e faturar mais. O Marco mostrou o caminho.', rating: 5 },
    ],
    faqs: [
      { question: 'Para quem é a mentoria?', answer: 'Para profissionais liberais, prestadores de serviço e consultores que faturam entre R$5.000 e R$30.000/mês e querem crescer sem trabalhar mais horas.' },
      { question: 'É presencial ou online?', answer: 'Online ao vivo, com gravação disponível para assistir depois. Participantes de qualquer cidade do Brasil.' },
      { question: 'Tem garantia?', answer: 'Sim. 30 dias de garantia total. Se você não estiver satisfeito nas primeiras 4 semanas, devolvemos 100% do investimento.' },
      { question: 'Qual o investimento?', answer: 'Solicite a proposta pelo WhatsApp. Temos condições de parcelamento e uma vaga de bolsa por turma para profissionais em situação de vulnerabilidade.' },
      { question: 'Quantas pessoas por turma?', answer: 'Máximo 10 participantes por turma para garantir atenção individual. As turmas costumam esgotar em 48h.' },
      { question: 'Quando começa a próxima turma?', answer: 'A próxima turma inicia em 3 semanas. Vagas limitadas — entre na lista de espera pelo WhatsApp agora.' },
    ],
    blogPosts: BLOG_POSTS_SERVICOS,
    problemStatement: 'Você trabalha muito, cobra pouco e no fim do mês o dinheiro some — mesmo faturando mais do que antes.',
    solutionStatement: 'Com o método certo de precificação e posicionamento, você atende menos clientes, cobra mais e sobra tempo para o que importa.',
    address: 'Sorocaba/SP — Atendimento 100% online',
    whatsapp: '5515990001111',
    email: 'contato@mentoriapro.com.br',
    schemaType: 'EducationalOrganization',
  },
}

const GENERIC = EXAMPLES['servicos'] as SiteContent

export function getExampleContent(preset: string): SiteContent {
  return EXAMPLES[preset] ?? GENERIC
}
