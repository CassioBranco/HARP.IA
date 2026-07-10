// Cache em memória do editor (vive só nesta aba do navegador, some no reload).
// Objetivo: matar o "pisca-skeleton" ao reabrir uma seção do acordeão e evitar
// refetch redundante do pageId. É stale-while-revalidate: o SectionEditor mostra
// o cache na hora e revalida no banco em segundo plano, sempre gravando de volta.

type Content = Record<string, unknown>

const sectionContent = new Map<string, Content>() // `${siteId}:${sectionType}` -> content
const pageIdBySite = new Map<string, string>()     // siteId -> id da página "home"

const secKey = (siteId: string, sectionType: string) => `${siteId}:${sectionType}`

export function getCachedSection(siteId: string, sectionType: string): Content | undefined {
  return sectionContent.get(secKey(siteId, sectionType))
}

export function setCachedSection(siteId: string, sectionType: string, content: Content): void {
  sectionContent.set(secKey(siteId, sectionType), content)
}

// Regeração de página inteira pela IA muda TODAS as seções no banco de uma vez.
// Limpar o cache do site força releitura fresca ao reabrir cada seção, evitando
// mostrar conteúdo antigo por engano.
export function clearSiteSectionCache(siteId: string): void {
  const prefix = `${siteId}:`
  for (const k of Array.from(sectionContent.keys())) {
    if (k.startsWith(prefix)) sectionContent.delete(k)
  }
}

export function getCachedPageId(siteId: string): string | undefined {
  return pageIdBySite.get(siteId)
}

export function setCachedPageId(siteId: string, pageId: string): void {
  pageIdBySite.set(siteId, pageId)
}
