import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — ANCOREO',
  description: 'As regras para usar a plataforma ANCOREO de criação de sites com IA.',
}

// Dado da empresa a preencher (aparece destacado em amarelo no documento).
function Fill({ children }: { children: React.ReactNode }) {
  return <span className="legal__fill">{children}</span>
}

const VIGENCIA = '30 de junho de 2026'

export default function TermosPage() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p className="legal__meta">Última atualização: {VIGENCIA}</p>

      <p>
        Estes Termos de Uso regem o acesso e o uso da plataforma <strong>ANCOREO</strong>
        (&ldquo;plataforma&rdquo;, &ldquo;serviço&rdquo;), operada por{' '}
        <Fill>[RAZÃO SOCIAL DA EMPRESA]</Fill>, CNPJ <Fill>[CNPJ]</Fill> (&ldquo;ANCOREO&rdquo;,
        &ldquo;nós&rdquo;). Ao criar uma conta ou usar o serviço, você concorda com estes Termos e com
        a nossa{' '}
        <Link href="/privacidade">Política de Privacidade</Link>. Se não concordar, não use a plataforma.
      </p>

      <h2 id="servico">1. O que é a ANCOREO</h2>
      <p>
        A ANCOREO é uma plataforma que cria sites para negócios usando inteligência artificial, já
        otimizados para busca (SEO, GEO e AEO). Você responde algumas perguntas sobre o seu negócio e a
        plataforma gera os textos, a estrutura e o conteúdo do site, que você pode editar e publicar no
        seu próprio domínio.
      </p>

      <div className="legal__note">
        A plataforma está em fase <strong>beta</strong>. Recursos podem mudar, ser adicionados ou
        removidos, e podem ocorrer instabilidades enquanto evoluímos o produto.
      </div>

      <h2 id="conta">2. Cadastro e conta</h2>
      <ul>
        <li>Você deve fornecer informações verdadeiras e mantê-las atualizadas.</li>
        <li>Você é responsável por manter a senha em segredo e por toda atividade na sua conta.</li>
        <li>É necessário ser maior de 18 anos e ter capacidade para contratar.</li>
        <li>Avise-nos imediatamente em caso de uso não autorizado da sua conta.</li>
      </ul>

      <h2 id="planos">3. Período gratuito, planos e pagamento</h2>
      <ul>
        <li>
          Oferecemos um período de <strong>7 dias grátis</strong> no plano Pro, sem necessidade de
          cartão de crédito no início.
        </li>
        <li>
          Após o período gratuito, o uso contínuo depende da assinatura de um plano pago, com os
          valores informados na página de planos.
        </li>
        <li>
          Os pagamentos são processados pelo <strong>Mercado Pago</strong>. A cobrança é recorrente
          conforme o plano escolhido, até o cancelamento.
        </li>
        <li>
          Podemos ajustar preços; mudanças serão comunicadas com antecedência e valerão para os ciclos
          seguintes.
        </li>
      </ul>

      <h2 id="ia">4. Conteúdo gerado por inteligência artificial</h2>
      <ul>
        <li>
          O conteúdo é gerado automaticamente a partir das informações que você fornece. <strong>Revise
          tudo antes de publicar</strong> — você é responsável pelo que publica no seu site.
        </li>
        <li>
          A IA pode cometer erros ou imprecisões. Não garantimos que o conteúdo esteja livre de falhas.
        </li>
        <li>
          <strong>Não garantimos posições de ranqueamento</strong> no Google ou citações por
          ferramentas de IA. Otimizamos seguindo boas práticas, mas o resultado depende de fatores fora
          do nosso controle.
        </li>
      </ul>

      <h2 id="seu-conteudo">5. Seu conteúdo e responsabilidades</h2>
      <ul>
        <li>
          Você declara ter os direitos sobre os textos, imagens, marcas e demais materiais que envia à
          plataforma.
        </li>
        <li>
          Você é o único responsável pelo conteúdo do seu site e por mantê-lo lícito, verdadeiro e em
          conformidade com a lei.
        </li>
        <li>
          Ao enviar conteúdo, você nos concede uma licença limitada para hospedá-lo e exibi-lo apenas
          com a finalidade de prestar o serviço.
        </li>
      </ul>

      <h2 id="propriedade">6. Propriedade intelectual</h2>
      <ul>
        <li>
          <strong>O que é seu continua seu:</strong> o conteúdo do seu site e o seu domínio pertencem a
          você.
        </li>
        <li>
          <strong>O que é nosso continua nosso:</strong> a plataforma, o software, a marca ANCOREO e a
          tecnologia por trás do serviço são de nossa propriedade e não podem ser copiados ou
          revendidos sem autorização.
        </li>
      </ul>

      <h2 id="uso-aceitavel">7. Uso aceitável</h2>
      <p>Ao usar a ANCOREO, você concorda em não:</p>
      <ul>
        <li>Publicar conteúdo ilegal, enganoso, ofensivo ou que viole direitos de terceiros;</li>
        <li>Usar a plataforma para spam, fraude, phishing ou atividades maliciosas;</li>
        <li>Tentar burlar limites, copiar o sistema ou comprometer a segurança do serviço;</li>
        <li>Sobrecarregar a infraestrutura com uso automatizado abusivo.</li>
      </ul>
      <p>
        Podemos suspender ou encerrar contas que violem estas regras, com aviso quando possível.
      </p>

      <h2 id="cancelamento">8. Cancelamento</h2>
      <ul>
        <li>Você pode cancelar sua assinatura a qualquer momento pelo painel.</li>
        <li>
          O cancelamento encerra as cobranças seguintes; o acesso permanece até o fim do ciclo já pago.
        </li>
        <li>
          Reembolsos seguem o Código de Defesa do Consumidor, incluindo o direito de arrependimento em
          até 7 dias para contratações feitas pela internet.
        </li>
      </ul>

      <h2 id="disponibilidade">9. Disponibilidade do serviço</h2>
      <p>
        Trabalhamos para manter a plataforma no ar, mas não garantimos funcionamento ininterrupto.
        Pode haver manutenções, interrupções ou indisponibilidades, especialmente durante a fase beta.
      </p>

      <h2 id="limitacao">10. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida em lei, a ANCOREO não se responsabiliza por danos indiretos, lucros
        cessantes ou perda de oportunidades decorrentes do uso ou da impossibilidade de uso do serviço.
        Nossa responsabilidade, quando cabível, fica limitada ao valor pago por você nos 12 meses
        anteriores ao evento.
      </p>

      <h2 id="alteracoes">11. Alterações destes Termos</h2>
      <p>
        Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas pelo site ou por e-mail.
        O uso continuado após a atualização significa concordância com a nova versão.
      </p>

      <h2 id="foro">12. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis do Brasil. Fica eleito o foro da comarca de{' '}
        <Fill>[CIDADE/UF]</Fill> para dirimir eventuais conflitos, salvo direito do consumidor de optar
        pelo foro do seu domicílio.
      </p>

      <h2 id="contato">13. Contato</h2>
      <p>
        Dúvidas sobre estes Termos? Fale com a gente em <Fill>contato@ancoreo.com.br</Fill>.
      </p>

      <div className="legal__note">
        <strong>Nota interna (remover antes do lançamento):</strong> os trechos destacados em amarelo
        precisam ser preenchidos com os dados reais da empresa. Veja a lista no final da conversa com o
        Claude.
      </div>
    </>
  )
}
