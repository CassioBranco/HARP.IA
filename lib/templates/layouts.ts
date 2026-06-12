export type LayoutId =
  | 'clean'
  | 'bold'
  | 'profissional'
  | 'portfolio'
  | 'acolhedor'
  | 'conversao'
  | 'magazine'
  | 'academia'
  | 'jovem'
  | 'tech'

export type Layout = {
  id: LayoutId
  name: string
  description: string
  badge?: string
  recommendedFor: string[]  // nicho slugs
  sections: string[]        // seções em ordem, para documentação
}

export const LAYOUTS: Layout[] = [
  {
    id: 'clean',
    name: 'Clean',
    description: 'Espaçamento amplo, tipografia elegante, hero dividido 50/50. Transmite confiança e profissionalismo.',
    recommendedFor: ['clinica', 'psicologia', 'fisioterapia', 'odontologia', 'contabilidade'],
    sections: ['nav', 'hero-split', 'stats', 'services', 'about', 'testimonials', 'blog', 'faq', 'cta', 'footer'],
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Hero fullscreen com foto de fundo e overlay. Alto impacto visual, energia e apetite.',
    recommendedFor: ['restaurante', 'salao', 'fisioterapia', 'veterinaria'],
    sections: ['nav-transparent', 'hero-fullscreen', 'services-colored', 'about-image', 'testimonials', 'blog', 'faq', 'cta-band', 'footer'],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    description: 'Grid estruturado, credenciais em destaque abaixo do hero, barra de confiança. Ideal para autoridade.',
    recommendedFor: ['advocacia', 'contabilidade', 'institucional', 'imobiliaria'],
    sections: ['nav-phone', 'hero-credentials', 'trust-bar', 'services-list', 'about-timeline', 'testimonials-quote', 'blog', 'faq', 'cta', 'footer'],
  },
  {
    id: 'portfolio',
    name: 'Portfólio',
    description: 'Grade de imagens em destaque, galeria de trabalhos antes do sobre. Para quem vende pelo visual.',
    recommendedFor: ['salao', 'imobiliaria', 'restaurante'],
    sections: ['nav', 'hero-gallery', 'portfolio-grid', 'services', 'about', 'testimonials', 'blog', 'faq', 'cta', 'footer'],
  },
  {
    id: 'acolhedor',
    name: 'Acolhedor',
    description: 'Nossa história em primeiro lugar, equipe em destaque, depoimentos emocionais grandes.',
    recommendedFor: ['psicologia', 'veterinaria', 'clinica', 'fisioterapia'],
    sections: ['nav', 'hero-centered', 'story', 'services', 'team', 'testimonials-large', 'blog', 'faq', 'cta-warm', 'footer'],
  },
  {
    id: 'conversao',
    name: 'Conversão',
    description: 'CTA única acima do fold, sem distração. Tudo empurra para um único objetivo.',
    recommendedFor: ['landing', 'servicos'],
    sections: ['nav-mini', 'hero-cta', 'problem-solution', 'social-proof', 'benefits', 'testimonials', 'faq', 'cta-final', 'footer-mini'],
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Conteúdo editorial domina a home. Blog e artigos ao lado dos serviços.',
    recommendedFor: ['escola', 'clinica', 'institucional'],
    sections: ['nav-search', 'featured-article', 'services-sidebar', 'articles-grid', 'about-band', 'testimonials', 'faq', 'cta', 'footer'],
  },
  {
    id: 'academia',
    name: 'Academia',
    description: 'Catálogo de cursos com cards detalhados (carga horária, modalidade, CTA de matrícula).',
    recommendedFor: ['escola'],
    sections: ['nav', 'hero-enrollment', 'course-catalog', 'methodology', 'testimonials-student', 'blog', 'faq', 'enrollment-cta', 'footer'],
  },
  {
    id: 'jovem',
    name: 'Jovem & Vibrante',
    description: 'Layout assimétrico, gradientes, tipografia grande. Energia e modernidade para públicos jovens.',
    recommendedFor: ['escola', 'landing', 'servicos'],
    sections: ['nav-minimal', 'hero-asymmetric', 'services-offset', 'about-numbers', 'portfolio-scatter', 'testimonials-modern', 'blog', 'faq', 'cta-gradient', 'footer'],
  },
  {
    id: 'tech',
    name: 'Tech Neon',
    description: 'Dark theme com gradientes neon, glow blobs, hero assimétrico 3fr/2fr, masonry de serviços. Energia digital e futurista.',
    recommendedFor: ['servicos', 'landing', 'escola', 'institucional'],
    sections: ['nav-glass', 'hero-asymmetric', 'strip', 'stats', 'masonry-services', 'about-glow', 'testimonial-center', 'blog', 'faq', 'cta-glow', 'footer'],
  },
]

export function getLayout(id: string): Layout {
  return LAYOUTS.find(l => l.id === id) ?? LAYOUTS[0]!
}

export function getRecommendedLayouts(niche: string): Layout[] {
  const recommended = LAYOUTS.filter(l => l.recommendedFor.includes(niche))
  const others = LAYOUTS.filter(l => !l.recommendedFor.includes(niche))
  return [...recommended, ...others]
}
