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

          {/* janela de site do cliente — linguagem de impresso */}
          <div className="hero-visual">
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
            {/* carimbo postal de score */}
            <div className="postmark" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
                <path id="pmArc" d="M 60 14 A 46 46 0 1 1 59.9 14" fill="none" />
                <text fontSize="10.5" letterSpacing="2.5" fill="currentColor" fontFamily="var(--font-mono)">
                  <textPath href="#pmArc" startOffset="0">SCORE DE BUSCA · SEO GEO AEO ·</textPath>
                </text>
              </svg>
              <b>92</b>
            </div>
            <span className="coord mono">27°05′S · 52°37′W</span>
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
        <div className="stat"><b>~10 min</b><span className="mono">do zero ao site no ar</span></div>
        <div className="stat"><b>3 motores</b><span className="mono">Google, IAs e busca por voz</span></div>
        <div className="stat"><b>0 código</b><span className="mono">nenhuma linha pra você escrever</span></div>
        <div className="stat"><b>100%</b><span className="mono">orgânico, sem tráfego pago</span></div>
      </section>

      {/* ── como funciona: manifesto de bordo ── */}
      <section className="shell block" id="como">
        <div className="sec-head">
          <span className="eyebrow mono">Diário de bordo</span>
          <h2>Do zero ao site publicado em três passos</h2>
          <p>Sem escrever uma linha, sem contratar designer, sem esperar semanas.</p>
        </div>
        <ol className="manifest">
          <li>
            <span className="num">01</span>
            <div>
              <h3>Você conta do negócio</h3>
              <p>Responde poucas perguntas: o que faz, onde atende e o que só você sabe da sua área.</p>
            </div>
          </li>
          <li>
            <span className="num">02</span>
            <div>
              <h3>A IA escreve tudo</h3>
              <p>Cada texto sai otimizado pra SEO, GEO e AEO, com FAQ, blog e dados estruturados.</p>
            </div>
          </li>
          <li>
            <span className="num">03</span>
            <div>
              <h3>Publica no seu domínio</h3>
              <p>O site entra no ar pronto pra aparecer, e você ajusta o que quiser, quando quiser.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* ── pilares: banda navy noturna ── */}
      <section className="deep" id="pilares">
        <div className="shell">
          <div className="sec-head">
            <span className="eyebrow mono">Os três rumos</span>
            <h2>A busca mudou. Seu site precisa aparecer nos três lugares</h2>
            <p>Não basta estar no Google. Hoje as pessoas perguntam pra IA e buscam por voz.</p>
          </div>
          <div className="pillars">
            <article className="pillar">
              <span className="seal mono">SEO</span>
              <h3>Busca tradicional</h3>
              <p>Estrutura, schema e velocidade corretas pra ranquear no Google quando buscam pelo seu serviço.</p>
            </article>
            <article className="pillar">
              <span className="seal red-seal mono">GEO</span>
              <h3>Citado pelas IAs</h3>
              <p>Conteúdo no formato que ChatGPT, Gemini e Perplexity usam pra recomendar o seu negócio.</p>
            </article>
            <article className="pillar">
              <span className="seal mono">AEO</span>
              <h3>Resposta direta</h3>
              <p>FAQ e dados prontos pra virar a resposta exibida na busca e nas perguntas por voz.</p>
            </article>
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
        <div className="beacon">
          <h2>Seu próximo cliente está navegando agora</h2>
          <p>Crie seu site grátis e coloque seu negócio na rota do Google e das IAs hoje.</p>
          <Link href="/signup" className="btn red lg"><i className="ph-fill ph-anchor" /> Criar meu site agora</Link>
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
