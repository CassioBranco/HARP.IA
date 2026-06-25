// ============================================================
// ANCOREO — Google Perfil de Empresa (GPE / Google Business Profile)
// Helpers de validação do link e dos 3 modos da Tela 5.
// Lógica pura — sem UI. O front só consome.
// ============================================================

import type { GpeModo } from './types'

// Pra onde mandar o usuário que escolhe "Criar um perfil agora".
export const GPE_CREATE_URL = 'https://business.google.com/create'

// Impacto de SEO de cada modo (texto curto pra UI mostrar o aviso).
export const GPE_SEO_IMPACT: Record<GpeModo, { nivel: 'maximo' | 'minimo'; aviso: string }> = {
  vincular: {
    nivel: 'maximo',
    aviso: 'SEO máximo: mapa, avaliações e buscas "perto de mim" ativados.',
  },
  criar: {
    nivel: 'maximo',
    aviso: 'Depois de criar e vincular, o SEO local fica no máximo.',
  },
  sem: {
    nivel: 'minimo',
    aviso: 'SEO mínimo: sem perfil, você perde o mapa e as buscas "perto de mim".',
  },
}

// Hosts aceitos de link do Google Maps / Business Profile.
const GPE_HOST_PATTERNS = [
  /(^|\.)google\.[a-z.]+$/i, // google.com, google.com.br…
  /(^|\.)goo\.gl$/i,
  /(^|\.)maps\.app\.goo\.gl$/i,
  /(^|\.)g\.page$/i,
  /(^|\.)business\.google\.com$/i,
]

export interface GpeLinkValidation {
  valid: boolean
  normalized?: string
  reason?: string
}

/**
 * Valida (de forma leve) um link de perfil do Google.
 * Não faz fetch — só confere formato/host plausível, que é o suficiente
 * pra liberar o canNext da Tela 5. A conexão real vem depois.
 */
export function validateGpeLink(raw: string): GpeLinkValidation {
  const value = raw.trim()
  if (!value) return { valid: false, reason: 'Cole o link do seu perfil no Google.' }

  let url: URL
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`)
  } catch {
    return { valid: false, reason: 'Link inválido. Verifique e cole de novo.' }
  }

  const hostOk = GPE_HOST_PATTERNS.some((re) => re.test(url.hostname))
  if (!hostOk) {
    return { valid: false, reason: 'Esse link não parece ser do Google Maps/Perfil de Empresa.' }
  }

  return { valid: true, normalized: url.toString() }
}
