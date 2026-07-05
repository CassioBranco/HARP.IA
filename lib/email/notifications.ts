// ============================================================
// Templates de e-mail que avisam o dono do site (lojista) quando
// chega um lead, um agendamento ou um pedido no site dele.
// Todo valor que vem do visitante passa por escapeHtml antes de entrar
// no HTML — formulário público é entrada não confiável, então nada de
// HTML injetado no e-mail do lojista.
// Só monta { subject, html }; quem envia é lib/email/resend.ts.
// ============================================================

// Escapa & < > " ' — o mínimo pra neutralizar HTML em texto de visitante.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Colapsa quebras de linha num espaço — usado no ASSUNTO (header do e-mail),
// onde um \r\n no nome do visitante poderia tentar injeção de cabeçalho.
function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim()
}

// Nome de exibição do site: nome do negócio, senão domínio, senão "seu site".
function siteLabel(businessName?: string | null, siteDomain?: string | null): string {
  return businessName || siteDomain || 'seu site'
}

// Linha "Campo: valor" da tabela do e-mail; some quando o valor está vazio.
function row(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `<tr><td style="padding:4px 12px 4px 0;color:#555;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`
}

// Moldura sóbria comum aos três e-mails.
function wrap(heading: string, bodyHtml: string, siteDomain?: string | null): string {
  const footer = siteDomain
    ? `<p style="margin-top:24px;font-size:12px;color:#999">Aviso automático do site ${escapeHtml(siteDomain)} (ANCOREO).</p>`
    : `<p style="margin-top:24px;font-size:12px;color:#999">Aviso automático do seu site (ANCOREO).</p>`
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;max-width:560px">
<h2 style="font-size:18px;margin:0 0 12px">${escapeHtml(heading)}</h2>
${bodyHtml}
${footer}
</div>`
}

/** E-mail avisando o lojista que um lead chegou pelo site. */
export function buildLeadEmail(i: {
  businessName?: string | null
  siteDomain?: string | null
  name: string
  email?: string | null
  phone?: string | null
  interest?: string | null
}): { subject: string; html: string } {
  const site = siteLabel(i.businessName, i.siteDomain)
  const subject = `Novo contato pelo site — ${oneLine(i.name)}`

  const contato = i.phone || i.email
  const comoResponder = contato
    ? `<p>Para responder, fale direto com a pessoa: <strong>${escapeHtml(contato)}</strong>.</p>`
    : `<p>O visitante não deixou telefone nem e-mail — não há como responder diretamente.</p>`

  const html = wrap(
    `Novo contato em ${site}`,
    `<p>Uma pessoa preencheu o formulário de contato do seu site.</p>
<table style="border-collapse:collapse;margin:12px 0">
${row('Nome', i.name)}
${row('E-mail', i.email)}
${row('Telefone', i.phone)}
${row('Interesse', i.interest)}
</table>
${comoResponder}`,
    i.siteDomain
  )
  return { subject, html }
}

/** E-mail avisando o lojista que um agendamento foi solicitado pelo site. */
export function buildBookingEmail(i: {
  businessName?: string | null
  siteDomain?: string | null
  name: string
  phone: string
  service?: string | null
  preferredDate: string
  preferredTime: string
  note?: string | null
}): { subject: string; html: string } {
  const site = siteLabel(i.businessName, i.siteDomain)
  const subject = `Novo agendamento — ${oneLine(i.name)}, ${i.preferredDate} às ${i.preferredTime}`

  const html = wrap(
    `Novo pedido de agendamento em ${site}`,
    `<p>Uma pessoa pediu um horário pelo seu site. O horário ainda não está confirmado — é você quem confirma com o cliente.</p>
<table style="border-collapse:collapse;margin:12px 0">
${row('Nome', i.name)}
${row('Telefone', i.phone)}
${row('Serviço', i.service)}
${row('Data preferida', i.preferredDate)}
${row('Horário preferido', i.preferredTime)}
${row('Observação', i.note)}
</table>
<p>Para confirmar ou remarcar, ligue ou mande mensagem para <strong>${escapeHtml(i.phone)}</strong>.</p>`,
    i.siteDomain
  )
  return { subject, html }
}

// Centavos → valor legível ("R$ 149,90"). Moeda diferente de BRL sai como
// código + valor ("USD 149.90") pra não fingir símbolo que não conhecemos.
function formatTotal(totalCents: number, currency: string): string {
  const units = totalCents / 100
  if (currency.toUpperCase() === 'BRL') {
    return `R$ ${units.toFixed(2).replace('.', ',')}`
  }
  return `${currency.toUpperCase()} ${units.toFixed(2)}`
}

/** E-mail avisando o lojista que um pedido foi feito na loja do site. */
export function buildOrderEmail(i: {
  businessName?: string | null
  siteDomain?: string | null
  customerName?: string | null
  totalCents: number
  currency: string
  orderId: string
}): { subject: string; html: string } {
  const site = siteLabel(i.businessName, i.siteDomain)
  const total = formatTotal(i.totalCents, i.currency)
  const subject = `Novo pedido de ${total} — ${site}`

  const html = wrap(
    `Novo pedido em ${site}`,
    `<p>Um pedido foi registrado na sua loja.</p>
<table style="border-collapse:collapse;margin:12px 0">
${row('Cliente', i.customerName || 'não informado')}
${row('Total', total)}
${row('Pedido', i.orderId)}
</table>
<p>Acompanhe o pagamento e a preparação do pedido no seu painel ANCOREO.</p>`,
    i.siteDomain
  )
  return { subject, html }
}
