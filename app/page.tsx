// ============================================================
// ANCOREO — Landing pública. Núcleo de design próprio "Carta
// Náutica" (docs/DESIGN-NUCLEO.md), construído do zero: papel
// quente + tinta navy + vermelho de sinal, tipografia editorial
// (Fraunces) + rótulos mono de instrumento. Sem herança HARPIA.
// Fiação: CTAs → /signup e /login. Copy aprovada (metáforas
// náuticas pontuais: zarpar / navegando / não encalha).
// ============================================================
import type { Metadata } from 'next'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

import '@phosphor-icons/web/fill'
import '@phosphor-icons/web/duotone'
import './landing.css'

export const metadata: Metadata = {
  title: 'ANCOREO — seu site pronto pra aparecer no Google e nas IAs',
  description:
    'A ANCOREO cria o site do seu negócio com IA, já otimizado para SEO, GEO e AEO. Você responde poucas perguntas e o site entra no ar pronto pra aparecer na busca. Comece grátis.',
}

const MODELS = [
  { name: 'Clean', desc: 'Clínicas e consultórios', bg: 'linear-gradient(160deg,#0E7C86,#16B3A6)' },
  { name: 'Profissional', desc: 'Advocacia e corporativo', bg: 'linear-gradient(160deg,#1E3A5F,#2C4E78)' },
  { name: 'Conversão', desc: 'Serviços e emergência', bg: 'linear-gradient(160deg,#15425B,#1E6A8D)' },
  { name: 'Academia', desc: 'Escolas e cursos', bg: 'linear-gradient(160deg,#1D4ED8,#60A5FA)' },
]

const FAQ = [
  ['Preciso saber de tecnologia pra usar?', 'Não. Você responde poucas perguntas em português comum e a IA cuida de todo o resto: textos, estrutura e otimização pra busca.'],
  ['O que são SEO, GEO e AEO?', 'SEO é aparecer no Google. GEO é ser citado pelas IAs como ChatGPT e Gemini. AEO é virar a resposta direta da busca e por voz. A ANCOREO cuida dos três de uma vez.'],
  ['Posso usar meu próprio domínio?', 'Sim, e é o recomendado pra força de SEO. Se não tiver um, a gente compra e configura pra você. Também dá pra começar com um subdomínio grátis.'],
  ['O site é meu de verdade?', 'Sim. O conteúdo e o domínio são seus. Você edita tudo quando quiser e a autoridade de busca fica com o seu negócio.'],
  ['Como funcionam os 7 dias grátis?', 'Você cria seu site e testa tudo sem cartão de crédito. Só decide assinar depois de ver o resultado pronto.'],
  ['O blog escreve sozinho?', 'Sim. A IA usa o que você ensina sobre a sua área pra publicar artigos que constroem autoridade e melhoram seu ranqueamento ao longo do tempo.'],
]

const GROWTH = [
  { m: 'Mês 1', v: '120', h: '34px' },
  { m: 'Mês 2', v: '310', h: '58px' },
  { m: 'Mês 3', v: '680', h: '86px' },
  { m: 'Mês 4', v: '1.240', h: '120px' },
  { m: 'Mês 5', v: '2.100', h: '158px' },
  { m: 'Mês 6', v: '3.400', h: '200px' },
]

const MARQUEE = [
  'Apareça no Google',
  'Seja citado pelo ChatGPT',
  'Vire a resposta da busca por voz',
  'Blog que escreve sozinho',
  'Publicado no seu domínio',
]

export default function HomePage() {
  return (
    <div className="anc">
      {/* faixa técnica no topo */}
      <div className="topstrip">
        <span className="mono">Carta de navegação para negócios locais</span>
        <span className="mono">Brasil · 2026</span>
      </div>

      <nav className="nav">
        <div className="shell nav-in">
          <div className="brand">
            <span className="mk"><i className="ph-fill ph-anchor" /></span>
            <b>ANCOREO</b>
          </div>
          <div className="links mono">
            <a href="#como">Como funciona</a>
            <a href="#pilares">SEO · GEO · AEO</a>
            <a href="#modelos">Modelos</a>
            <a href="#precos">Preços</a>
            <Link href="/login">Entrar</Link>
          </div>
          <span className="nav-actions">
            <ThemeToggle />
            <Link href="/signup" className="btn red">Começar grátis</Link>
          </span>
        </div>
      </nav>

      {/* ── hero editorial ── */}
      <header className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="tag mono"><i className="ph-fill ph-compass" /> SEO · GEO · AEO — três rumos, um site</span>
            <h1>
              Seu site pronto pra <em>aparecer</em> no{' '}
              <span className="goog">
                <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
                <span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span>
                <span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
              </span>{' '}
              e nas IAs
            </h1>
            <p className="sub">
              A ANCOREO escreve cada texto do seu site com IA, já otimizado pra busca. Você responde
              poucas perguntas e o site entra no ar pronto pra ser encontrado — no Google e em respostas
              do ChatGPT, Gemini e Perplexity.
            </p>
            <div className="cta-row">
              <Link href="/signup" className="btn red lg"><i className="ph-fill ph-anchor" /> Começar grátis</Link>
              <a href="#como" className="btn ghost lg">Ver como funciona</a>
            </div>
            <p className="reassure mono"><i className="ph-fill ph-check-circle" /> 7 dias pra zarpar · sem cartão de crédito</p>
          </div>

          {/* janela do site do cliente + os motores onde ele aparece */}
          <div className="hero-visual">
            {/* sonar de visibilidade — âncora no centro, ondas que zarpam */}
            <div className="radar" aria-hidden="true">
              <span className="radar-ring" />
              <span className="radar-ring" />
              <span className="radar-ring" />
              <span className="radar-core"><i className="ph-fill ph-anchor" /></span>
            </div>
            <div className="window">
              <div className="window-bar">
                <span className="dots"><i /><i /><i /></span>
                <span className="url mono">vidaplenastudio.com.br</span>
              </div>
              <div className="window-body">
                <div className="msite">
                  <div className="msite-nav">
                    <b>VIDA PLENA</b>
                    <span className="mbtn">Aula grátis</span>
                  </div>
                  <p className="mkicker mono">Studio de movimento · Sorocaba</p>
                  <h4>Mexa o corpo.<br /><em>Sinta a diferença.</em></h4>
                  <p className="mtx">Pilates, funcional e yoga em turmas pequenas, com quem conhece você pelo nome.</p>
                  <div className="mrow">
                    <span className="mchip">Agendar aula</span>
                    <span className="mfoto" />
                  </div>
                </div>
              </div>
              <div className="window-foot">
                <span><b>Publicado em 1 minuto</b><small>com textos otimizados pra busca</small></span>
                <Link href="/signup" className="btn sm">Editar</Link>
              </div>
            </div>
            {/* cards flutuantes: os motores onde seu site aparece */}
            <div className="ai-pill ai-pill--google">
              <img src="/icons/platforms/google.svg" alt="" width={20} height={20} />
              <div><b>Google</b><span>Busca tradicional</span></div>
            </div>
            <div className="ai-pill ai-pill--chatgpt">
              <img src="/icons/platforms/chatgpt.svg" alt="" width={20} height={20} />
              <div><b>ChatGPT</b><span>Citado pelas IAs</span></div>
            </div>
            <div className="ai-pill ai-pill--gemini">
              <img src="/icons/platforms/gemini.svg" alt="" width={20} height={20} />
              <div><b>Gemini</b><span>Resposta direta</span></div>
            </div>
            <div className="ai-pill ai-pill--perplexity">
              <img src="/icons/platforms/perplexity.svg" alt="" width={20} height={20} />
              <div><b>Perplexity</b><span>Fonte citada</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* ── letreiro de rumo ── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map(dup => (
            <div className="marquee-set" key={dup}>
              {MARQUEE.map(item => (
                <span key={item}><i className="ph-fill ph-anchor" />{item}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── números de bordo ── */}
      <section className="shell stats">
        <div className="stat"><i className="ph-duotone ph-compass" /><div><b>~10 min</b><span className="mono">do zero ao site no ar</span></div></div>
        <div className="stat"><i className="ph-duotone ph-anchor" /><div><b>3 motores</b><span className="mono">Google, IAs e busca por voz</span></div></div>
        <div className="stat"><i className="ph-duotone ph-crosshair" /><div><b>0 código</b><span className="mono">nenhuma linha pra você escrever</span></div></div>
        <div className="stat"><i className="ph-duotone ph-lighthouse" /><div><b>100%</b><span className="mono">orgânico, sem tráfego pago</span></div></div>
      </section>

      {/* ── como funciona: mapa da rota (banda navy) ── */}
      <section className="deep deep--route" id="como">
        <div className="shell">
          <div className="sec-head">
            <span className="eyebrow mono">Mapa da rota</span>
            <h2>Do zero ao site publicado em três passos</h2>
            <p>Sem escrever uma linha, sem contratar designer, sem esperar semanas.</p>
          </div>
          <ol className="route">
            <i className="ph-fill ph-boat route-boat" aria-hidden="true" />
            <li>
              <span className="route-num">01</span>
              <h3>Você conta do negócio</h3>
              <p>Responde poucas perguntas: o que faz, onde atende e o que só você sabe da sua área.</p>
            </li>
            <li>
              <span className="route-num">02</span>
              <h3>A IA escreve tudo</h3>
              <p>Cada texto sai otimizado pra SEO, GEO e AEO, com FAQ, blog e dados estruturados.</p>
            </li>
            <li>
              <span className="route-num">03</span>
              <h3>Publica no seu domínio</h3>
              <p>O site entra no ar pronto pra aparecer, e você ajusta o que quiser, quando quiser.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* ── pilares: banda navy noturna ── */}
      <section className="deep" id="pilares">
        <div className="shell">
          <div className="sec-head">
            <span className="eyebrow mono">Os três rumos</span>
            <h2>A busca mudou. Seu site precisa aparecer nos três lugares</h2>
            <p>Não basta estar no Google. Hoje as pessoas perguntam pra IA e buscam por voz.</p>
          </div>
          <div className="deep-grid">
            <figure className="deep-photo">
              <img src="/img/farol-visibilidade.webp" alt="Farol emitindo um feixe de luz sobre o mar ao anoitecer" width={1792} height={2400} loading="lazy" />
              <figcaption className="mono"><i className="ph-fill ph-lighthouse" /> Seu sinal, visível de longe</figcaption>
            </figure>
            <div className="pillars">
              <article className="pillar pillar--seo">
                <span className="p-ico"><i className="ph-duotone ph-magnifying-glass" /></span>
                <div className="p-body">
                  <span className="p-tag mono">SEO · Busca tradicional</span>
                  <h3>Ser encontrado no Google</h3>
                  <p>Estrutura, schema e velocidade corretas pra ranquear quando alguém busca pelo seu serviço.</p>
                  <span className="p-link mono">Ser encontrado <i className="ph-bold ph-arrow-right" /></span>
                </div>
              </article>
              <article className="pillar pillar--geo">
                <span className="p-ico"><i className="ph-duotone ph-sparkle" /></span>
                <div className="p-body">
                  <span className="p-tag mono">GEO · Citado pelas IAs</span>
                  <h3>Ser referenciado pelas IAs</h3>
                  <p>Conteúdo no formato que ChatGPT, Gemini e Perplexity usam pra recomendar o seu negócio.</p>
                  <span className="p-link mono">Ser referenciado <i className="ph-bold ph-arrow-right" /></span>
                </div>
              </article>
              <article className="pillar pillar--aeo">
                <span className="p-ico"><i className="ph-duotone ph-chat-teardrop-text" /></span>
                <div className="p-body">
                  <span className="p-tag mono">AEO · Resposta direta</span>
                  <h3>Ser a resposta</h3>
                  <p>FAQ e dados prontos pra virar a resposta exibida na busca e nas perguntas por voz.</p>
                  <span className="p-link mono">Ser a resposta <i className="ph-bold ph-arrow-right" /></span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── IA cita você: GEO em ação ── */}
      <section className="shell block">
        <div className="sec-head">
          <span className="eyebrow mono">GEO em ação</span>
          <h2>Quando alguém pergunta pra IA, o seu negócio aparece na resposta</h2>
          <p>É assim que ChatGPT, Gemini e Claude respondem quando o seu site já está otimizado.</p>
        </div>
        <div className="cite-card">
          <div className="cite-q">
            <i className="ph-fill ph-chat-circle-text" />
            <p>&ldquo;Qual o melhor studio de pilates em Sorocaba?&rdquo;</p>
          </div>
          <div className="cite-a">
            <i className="ph-fill ph-sparkle" />
            <p>Em Sorocaba, o <b>Vida Plena Studio</b> se destaca por turmas pequenas de pilates, funcional e yoga, com atendimento próximo e personalizado — bem avaliado por quem busca acompanhamento de perto.</p>
          </div>
          <div className="cite-platforms mono">
            <span><img src="/icons/platforms/chatgpt.svg" alt="" width={16} height={16} />ChatGPT</span>
            <span><img src="/icons/platforms/gemini.svg" alt="" width={16} height={16} />Gemini</span>
            <span><img src="/icons/platforms/claude.svg" alt="" width={16} height={16} />Claude</span>
            <span><img src="/icons/platforms/meta.svg" alt="" width={16} height={16} />Meta AI</span>
            <span><img src="/icons/platforms/copilot.svg" alt="" width={16} height={16} />Copilot</span>
          </div>
        </div>
      </section>

      {/* ── modelos ── */}
      <section className="shell block" id="modelos">
        <div className="sec-head">
          <span className="eyebrow mono">Modelos</span>
          <h2>Um visual à altura do seu negócio</h2>
          <p>Dezenas de modelos por segmento, recoloridos pra combinar com a sua marca.</p>
        </div>
        <div className="models">
          {MODELS.map(m => (
            <div className="model" key={m.name}>
              <div className="thumb" style={{ background: m.bg }}><b>{m.name}</b></div>
              <span className="mono">{m.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── o que muda ── */}
      <section className="shell block">
        <div className="sec-head">
          <span className="eyebrow mono">O que muda</span>
          <h2>Quando seu site aparece nos três motores</h2>
          <p>O foco é um só: você ser encontrado quando o cliente busca, no Google e nas IAs.</p>
        </div>
        <div className="notes">
          <article className="note">
            <header className="mono">Busca tradicional — SEO local</header>
            <p>Aparece no Google da sua cidade quando alguém busca pelo seu serviço, com estrutura e schema corretos pra ranquear.</p>
          </article>
          <article className="note">
            <header className="mono">Citado pelas IAs — GEO</header>
            <p>Vira fonte que ChatGPT, Gemini e Perplexity citam quando perguntam por um negócio como o seu.</p>
          </article>
          <article className="note">
            <header className="mono">Resposta direta — AEO</header>
            <p>FAQ e dados estruturados prontos pra virar a resposta direta na busca e por voz, sem você escrever nada.</p>
          </article>
        </div>
      </section>

      {/* ── curva de crescimento ── */}
      <section className="shell block">
        <div className="sec-head">
          <span className="eyebrow mono">Ao longo do tempo</span>
          <h2>Cada mês fica mais fácil de te encontrar</h2>
          <p>O blog e o conteúdo otimizado constroem autoridade — a busca orgânica cresce sozinha.</p>
        </div>
        <div className="growth">
          {GROWTH.map(g => (
            <div className="gcol" key={g.m}>
              <div className="gbar" style={{ height: g.h }} />
              <b>{g.v}</b>
              <span className="mono">{g.m}</span>
            </div>
          ))}
        </div>
        <p className="growth-note mono">visitas orgânicas do Google · site de exemplo</p>
      </section>

      {/* ── planos: bilhetes de embarque ── */}
      <section className="shell block" id="precos">
        <div className="sec-head">
          <span className="eyebrow mono">Planos</span>
          <h2>Direto, sem surpresa</h2>
          <p>Todos começam com 7 dias grátis no plano Pro completo.</p>
        </div>
        <div className="plans">
          <article className="plan">
            <h3 className="mono">Starter</h3>
            <p className="price"><b>R$ 97</b><span>/mês</span></p>
            <ul>
              <li>1 site no seu domínio</li>
              <li>4 artigos de blog por mês</li>
              <li>SEO, GEO e AEO no conteúdo</li>
            </ul>
            <Link href="/signup" className="btn ghost">Começar grátis</Link>
          </article>
          <article className="plan hot">
            <span className="pennant mono">Mais popular</span>
            <h3 className="mono">Pro</h3>
            <p className="price"><b>R$ 197</b><span>/mês</span></p>
            <ul>
              <li>3 sites no seu domínio</li>
              <li>20 artigos por mês</li>
              <li>Score de SEO/GEO/AEO</li>
              <li>Análise da presença online</li>
            </ul>
            <Link href="/signup" className="btn red">Começar grátis</Link>
          </article>
          <article className="plan">
            <h3 className="mono">Agency</h3>
            <p className="price"><b>R$ 297</b><span>/mês</span></p>
            <ul>
              <li>Sites ilimitados</li>
              <li>White-label e painel de clientes</li>
              <li>API e suporte prioritário</li>
            </ul>
            <Link href="/signup" className="btn ghost">Falar com vendas</Link>
          </article>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="shell block faq-block">
        <div className="sec-head">
          <span className="eyebrow mono">Dúvidas frequentes</span>
          <h2>O que você precisa saber</h2>
        </div>
        <div className="faq">
          {FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      {/* ── CTA final: farol ── */}
      <section className="shell">
        <div className="beacon beacon--photo">
          <img className="beacon-bg" src="/img/farol-cta.webp" alt="" aria-hidden="true" />
          <div className="beacon-in">
            <span className="eyebrow mono">Zarpe agora</span>
            <h2>Seu próximo cliente está navegando agora</h2>
            <p>Crie seu site grátis e coloque seu negócio na rota do Google e das IAs hoje.</p>
            <Link href="/signup" className="btn red lg"><i className="ph-fill ph-anchor" /> Criar meu site agora</Link>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="shell foot-in">
          <div className="brand light">
            <span className="mk"><i className="ph-fill ph-anchor" /></span>
            <b>ANCOREO</b>
          </div>
          <span className="mono">pra negócios que não encalham na busca · feito no Brasil</span>
          <span className="foot-links">
            <Link href="/termos">Termos de Uso</Link>
            <Link href="/privacidade">Política de Privacidade</Link>
          </span>
          <span className="mono">© 2026 ANCOREO</span>
        </div>
      </footer>
    </div>
  )
}
