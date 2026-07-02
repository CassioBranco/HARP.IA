import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — ANCOREO',
  description: 'Como a ANCOREO coleta, usa e protege seus dados, em conformidade com a LGPD.',
}

// Dado da empresa a preencher (aparece destacado em amarelo no documento).
function Fill({ children }: { children: React.ReactNode }) {
  return <span className="legal__fill">{children}</span>
}

const VIGENCIA = '30 de junho de 2026'

export default function PrivacidadePage() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p className="legal__meta">Última atualização: {VIGENCIA}</p>

      <p>
        Esta Política de Privacidade explica como a <strong>ANCOREO</strong> coleta, usa,
        compartilha e protege os dados pessoais de quem usa nossa plataforma, em conformidade
        com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — &ldquo;LGPD&rdquo;). Ao usar a
        ANCOREO, você concorda com as práticas descritas aqui.
      </p>

      <h2 id="controlador">1. Quem é o controlador dos dados</h2>
      <p>
        O controlador dos seus dados é{' '}
        <Fill>[RAZÃO SOCIAL DA EMPRESA]</Fill>, inscrita no CNPJ sob nº{' '}
        <Fill>[CNPJ]</Fill>, com sede em <Fill>[CIDADE/UF]</Fill> (&ldquo;ANCOREO&rdquo;,
        &ldquo;nós&rdquo;). Para qualquer assunto sobre seus dados, fale com o nosso Encarregado
        (DPO) pelo e-mail <Fill>privacidade@ancoreo.com.br</Fill>.
      </p>

      <h2 id="dados">2. Quais dados coletamos</h2>
      <h3>2.1. Dados que você fornece</h3>
      <ul>
        <li><strong>Cadastro:</strong> nome e e-mail (e senha, guardada de forma criptografada).</li>
        <li>
          <strong>Conteúdo do seu negócio:</strong> informações que você digita no onboarding e no
          editor (nome do negócio, área de atuação, cidade de atendimento, textos, imagens e demais
          conteúdos que você envia para gerar e publicar o seu site).
        </li>
        <li><strong>Suporte:</strong> mensagens que você nos envia.</li>
      </ul>
      <h3>2.2. Dados coletados automaticamente (telemetria de produto)</h3>
      <p>
        Para entender como as pessoas usam a plataforma e onde podemos melhorar, registramos eventos
        de uso de forma <strong>pseudônima</strong>. Isso significa que:
      </p>
      <ul>
        <li>
          Usamos um identificador aleatório de sessão (cookie), que <strong>não é ligado à sua
          identidade</strong> e não permite, sozinho, te identificar.
        </li>
        <li>
          Registramos eventos como &ldquo;iniciou o onboarding&rdquo;, &ldquo;avançou de etapa&rdquo;,
          &ldquo;escolheu um modelo&rdquo; e &ldquo;gerou o site&rdquo;, além de uma classe genérica de
          dispositivo (celular, tablet ou computador).
        </li>
        <li>
          <strong>Não</strong> guardamos o seu endereço IP, nem o agente de navegador completo, nem
          qualquer dado que identifique você diretamente nessa telemetria.
        </li>
      </ul>
      <p>
        Você pode <strong>desativar a telemetria</strong> a qualquer momento pelo banner de
        privacidade exibido no site (botão &ldquo;Não quero ser rastreado&rdquo;). A escolha fica
        guardada no seu navegador.
      </p>

      <h2 id="uso">3. Para que usamos seus dados</h2>
      <ul>
        <li><strong>Prestar o serviço:</strong> criar sua conta, gerar e publicar o seu site com IA.</li>
        <li><strong>Cobrança:</strong> processar assinaturas e pagamentos dos planos.</li>
        <li><strong>Melhorar o produto:</strong> analisar, de forma agregada, como os fluxos são usados.</li>
        <li><strong>Comunicação:</strong> enviar avisos importantes sobre sua conta e o serviço.</li>
        <li><strong>Segurança e obrigações legais:</strong> prevenir fraudes e cumprir a lei.</li>
      </ul>

      <h2 id="bases">4. Bases legais (LGPD)</h2>
      <ul>
        <li>
          <strong>Execução de contrato</strong> (art. 7º, V): para criar sua conta, gerar o site e
          processar pagamentos.
        </li>
        <li>
          <strong>Legítimo interesse</strong> (art. 7º, IX): para a telemetria de produto pseudônima
          e a melhoria da plataforma, sempre respeitando seus direitos e a possibilidade de opt-out.
        </li>
        <li>
          <strong>Cumprimento de obrigação legal</strong> (art. 7º, II): quando a lei exigir guarda
          de registros.
        </li>
        <li>
          <strong>Consentimento</strong> (art. 7º, I): para comunicações de marketing eventuais, que
          você pode revogar quando quiser.
        </li>
      </ul>

      <h2 id="cookies">5. Cookies</h2>
      <p>Usamos apenas dois tipos de cookies:</p>
      <ul>
        <li>
          <strong>Essenciais:</strong> mantêm seu login e a segurança da sessão. Sem eles a plataforma
          não funciona.
        </li>
        <li>
          <strong>Telemetria de produto:</strong> o identificador de sessão pseudônimo descrito no item
          2.2. Pode ser desativado pelo banner de privacidade.
        </li>
      </ul>
      <p>Não usamos cookies de publicidade nem vendemos seus dados a terceiros.</p>

      <h2 id="compartilhamento">6. Com quem compartilhamos</h2>
      <p>
        Não vendemos seus dados. Compartilhamos o mínimo necessário com prestadores que viabilizam o
        serviço (operadores), sob contrato:
      </p>
      <ul>
        <li><strong>Vercel:</strong> hospedagem da plataforma e dos sites.</li>
        <li><strong>Supabase:</strong> banco de dados, autenticação e armazenamento.</li>
        <li><strong>OpenAI e Anthropic:</strong> geração de conteúdo por IA a partir do que você informa.</li>
        <li><strong>Mercado Pago:</strong> processamento de pagamentos das assinaturas.</li>
        <li><strong>Google:</strong> quando você opta por vincular seu Perfil da Empresa (Google Meu Negócio).</li>
      </ul>

      <h2 id="internacional">7. Transferência internacional</h2>
      <p>
        Alguns desses prestadores processam dados em servidores fora do Brasil (por exemplo, nos
        Estados Unidos). Nesses casos, adotamos as salvaguardas exigidas pela LGPD para a transferência
        internacional de dados.
      </p>

      <h2 id="retencao">8. Por quanto tempo guardamos</h2>
      <ul>
        <li><strong>Dados da conta e do site:</strong> enquanto sua conta estiver ativa.</li>
        <li>
          <strong>Telemetria de produto:</strong> por até <strong>12 meses</strong>, após o que é
          apagada ou anonimizada.
        </li>
        <li>
          <strong>Após o encerramento da conta:</strong> apagamos ou anonimizamos seus dados, salvo o
          que a lei exigir manter (ex.: registros fiscais).
        </li>
      </ul>

      <h2 id="direitos">9. Seus direitos</h2>
      <p>A qualquer momento, você pode solicitar:</p>
      <ul>
        <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
        <li>Correção de dados incompletos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Portabilidade dos seus dados;</li>
        <li>Eliminação dos dados tratados com base em consentimento;</li>
        <li>Informação sobre com quem compartilhamos seus dados;</li>
        <li>Revogação do consentimento.</li>
      </ul>
      <p>
        Para exercer qualquer direito, escreva para <Fill>privacidade@ancoreo.com.br</Fill>.
        Responderemos no prazo legal.
      </p>

      <h2 id="seguranca">10. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados, como criptografia de
        senhas, controle de acesso por isolamento de conta e tráfego sob HTTPS. Nenhum sistema é 100%
        imune, mas trabalhamos continuamente para reduzir riscos.
      </p>

      <h2 id="menores">11. Crianças e adolescentes</h2>
      <p>
        A ANCOREO é destinada a maiores de 18 anos, no contexto profissional de criação de sites para
        negócios. Não coletamos intencionalmente dados de menores.
      </p>

      <h2 id="alteracoes">12. Alterações desta Política</h2>
      <p>
        Podemos atualizar esta Política periodicamente. Quando a mudança for relevante, avisaremos pelo
        site ou por e-mail. A data no topo indica a versão vigente.
      </p>

      <h2 id="contato">13. Contato</h2>
      <p>
        Dúvidas sobre privacidade? Fale com o nosso Encarregado (DPO) em{' '}
        <Fill>privacidade@ancoreo.com.br</Fill>.
      </p>

      <div className="legal__note">
        <strong>Nota interna (remover antes do lançamento):</strong> os trechos destacados em amarelo
        precisam ser preenchidos com os dados reais da empresa (razão social, CNPJ, cidade/UF e e-mail
        de privacidade). Veja a lista no final da conversa com o Claude.
      </div>
    </>
  )
}
