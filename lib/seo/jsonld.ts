// Serializa um objeto JSON-LD para injeção segura em
// <script type="application/ld+json">. Escapa o caractere '<' para a sequência
// unicode <, impedindo breakout via "</script>" ou "<!--" quando o schema
// carrega dados do usuário (nome do negócio, título de artigo, FAQ). O
// resultado continua sendo JSON válido e é interpretado igual pelo parser.
export function jsonLdScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}
