// ============================================================
// ANCOREO — Landing pública (Fase 6). Visual = protótipo landing.html
// (liquid-glass dark). Fiação: CTAs → /signup e /login.
// Stats e seção "o que muda" usam só fatos reais do produto — sem número
// fabricado nem depoimento inventado (produto em beta fechado). Quando houver
// prova social real (clientes, avaliações), dá pra reintroduzir aqui.
// ============================================================
import type { Metadata } from 'next'
import Link from 'next/link'
import LandingFloaters from './LandingFloaters'

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

export default function HomePage() {
  return (
    <div className="lp">
      <div className="aura" />
      <LandingFloaters />

      <nav className="site">
        <div className="navbar">
          <div className="brand"><span className="mk"><i className="ph-fill ph-bird" /></span> ANCOREO</div>
          <div className="nav-links">
            <a href="#como">Como funciona</a>
            <a href="#pilares">SEO, GEO, AEO</a>
            <a href="#modelos">Modelos</a>
            <a href="#precos">Preços</a>
            <Link href="/login">Entrar</Link>
            <Link href="/signup" className="btn">Começar grátis</Link>
          </div>
        </div>
      </nav>

      <header className="wrap hero">
        <div>
          <span className="pill"><i className="ph-fill ph-sparkle" /> SEO · GEO · AEO em um só lugar</span>
          <h1>
            Seu site pronto pra <span className="grad">aparecer</span> no{' '}
            <span className="goog">
              <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span>
              <span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span>
              <span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
            </span>{' '}e nas IAs
          </h1>
          <p className="sub">
            A ANCOREO escreve cada texto do seu site com IA, já otimizado pra busca. Você responde poucas
            perguntas e o site entra no ar pronto pra ser encontrado, no Google e em respostas do ChatGPT,
            Gemini e Perplexity.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="btn lg"><i className="ph-fill ph-rocket-launch" /> Começar grátis</Link>
            <a href="#como" className="btn glass lg"><i className="ph-duotone ph-play-circle" /> Ver como funciona</a>
          </div>
          <div className="reassure"><i className="ph-fill ph-check-circle" /> 7 dias grátis, sem cartão de crédito</div>
        </div>
        <div className="float">
          <div className="glass hero-card">
            <div className="site-prev">
              <div className="bar"><i className="r" /><i className="y" /><i className="g" /><span className="u">vidaplenastudio.com.br</span></div>
              <div className="mock">
                <div className="mock-nav">
                  <span className="ml">VIDA PLENA<i style={{ color: '#a78bfa' }}>.</i></span>
                  <span className="mr"><i /><i /><i /><b>Aula grátis</b></span>
                </div>
                <div className="mock-hero">
                  <div className="mock-copy">
                    <span className="mk">Studio de movimento · Sorocaba</span>
                    <h4>Mexa o corpo. <em>Sinta a diferença.</em></h4>
                    <p>Pilates, funcional e yoga em turmas pequenas.</p>
                    <span className="mbtn">Agendar aula</span>
                  </div>
                  <div className="mock-img" />
                </div>
              </div>
            </div>
            <div className="hcard-foot">
              <div><div className="nm">Publicado em 1 minuto</div><div className="st">com textos otimizados pra busca</div></div>
              <Link href="/signup" className="btn amber" style={{ padding: '.5rem 1rem', fontSize: '.82rem' }}>
                <i className="ph-fill ph-pencil-simple" /> Editar
              </Link>
            </div>
          </div>
          <div className="score"><div className="in"><b>92</b><span>score</span></div></div>
        </div>
      </header>

      {/* stats */}
      <section className="wrap" style={{ paddingTop: '1rem' }}>
        <div className="stats">
          <div className="stat"><div className="n">~10 min</div><div className="l">do zero ao site no ar</div></div>
          <div className="stat"><div className="n">3 motores</div><div className="l">Google, IAs e busca por voz</div></div>
          <div className="stat"><div className="n">0</div><div className="l">linhas de código pra você escrever</div></div>
          <div className="stat"><div className="n">100%</div><div className="l">orgânico, sem tráfego pago</div></div>
        </div>
      </section>

      {/* como funciona */}
      <section className="block wrap" id="como">
        <div className="head"><span className="eyebrow">Como funciona</span><h2>Do zero ao site publicado em 3 passos</h2><p>Sem escrever uma linha, sem contratar designer, sem esperar semanas.</p></div>
        <div className="steps">
          <div className="glass step"><div className="n">1</div><h3>Você conta do negócio</h3><p>Responde poucas perguntas: o que faz, onde atende e o que só você sabe da sua área.</p></div>
          <div className="glass step"><div className="n">2</div><h3>A IA escreve tudo</h3><p>Cada texto sai otimizado pra SEO, GEO e AEO, com FAQ, blog e dados estruturados.</p></div>
          <div className="glass step"><div className="n">3</div><h3>Publica no seu domínio</h3><p>O site entra no ar pronto pra aparecer, e você ajusta o que quiser quando quiser.</p></div>
        </div>
      </section>

      {/* pilares */}
      <section className="block wrap" id="pilares">
        <div className="head"><span className="eyebrow">Os 3 pilares</span><h2>A busca mudou. Seu site precisa aparecer nos três lugares</h2><p>Não basta estar no Google. Hoje as pessoas perguntam pra IA e buscam por voz.</p></div>
        <div className="pillars">
          <div className="glass pillar"><div className="chip b"><i className="ph-duotone ph-magnifying-glass" /></div><div className="tag">SEO</div><h3>Busca tradicional</h3><p>Estrutura, schema e velocidade corretas pra ranquear no Google quando buscam pelo seu serviço.</p></div>
          <div className="glass pillar"><div className="chip t"><i className="ph-duotone ph-brain" /></div><div className="tag">GEO</div><h3>Citado pelas IAs</h3><p>Conteúdo no formato que ChatGPT, Gemini e Perplexity usam pra recomendar o seu negócio.</p></div>
          <div className="glass pillar"><div className="chip a"><i className="ph-duotone ph-chat-circle-text" /></div><div className="tag">AEO</div><h3>Resposta direta</h3><p>FAQ e dados prontos pra virar a resposta exibida na busca e nas perguntas por voz.</p></div>
        </div>
      </section>

      {/* modelos */}
      <section className="block wrap" id="modelos">
        <div className="head"><span className="eyebrow">Modelos</span><h2>Um visual à altura do seu negócio</h2><p>Dezenas de modelos por segmento, recoloridos pra combinar com a sua marca.</p></div>
        <div className="models">
          {MODELS.map(m => (
            <div className="model" key={m.name}>
              <div className="thumb" style={{ background: m.bg }}><b>{m.name}</b></div>
              <div className="ft">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* o que muda — afirmações de valor (sem depoimento fabricado: produto em beta fechado) */}
      <section className="block wrap">
        <div className="head"><span className="eyebrow">O que muda</span><h2>Quando seu site aparece nos três motores</h2><p>O foco é um só: você ser encontrado quando o cliente busca, no Google e nas IAs.</p></div>
        <div className="quotes">
          <div className="glass quote"><p>Aparece no Google da sua cidade quando alguém busca pelo seu serviço, com estrutura e schema corretos pra ranquear.</p><div className="who"><span className="av"><i className="ph-duotone ph-magnifying-glass" /></span><div><b>Busca tradicional</b><span>SEO local</span></div></div></div>
          <div className="glass quote"><p>Vira fonte que ChatGPT, Gemini e Perplexity citam quando perguntam por um negócio como o seu.</p><div className="who"><span className="av"><i className="ph-duotone ph-brain" /></span><div><b>Citado pelas IAs</b><span>GEO</span></div></div></div>
          <div className="glass quote"><p>FAQ e dados estruturados prontos pra virar a resposta direta na busca e por voz, sem você escrever nada.</p><div className="who"><span className="av"><i className="ph-duotone ph-chat-circle-text" /></span><div><b>Resposta direta</b><span>AEO</span></div></div></div>
        </div>
      </section>

      {/* preços */}
      <section className="block wrap" id="precos">
        <div className="head"><span className="eyebrow">Planos</span><h2>Direto, sem surpresa</h2><p>Todos começam com 7 dias grátis no plano Pro completo.</p></div>
        <div className="plans">
          <div className="glass plan">
            <div className="pn">Starter</div><div className="pr">R$ 97<span>/mês</span></div>
            <ul>
              <li><i className="ph-fill ph-check-circle" /> 1 site no seu domínio</li>
              <li><i className="ph-fill ph-check-circle" /> 4 artigos de blog por mês</li>
              <li><i className="ph-fill ph-check-circle" /> SEO, GEO e AEO no conteúdo</li>
            </ul>
            <Link href="/signup" className="btn glass">Começar grátis</Link>
          </div>
          <div className="glass plan hot">
            <span className="pop">Mais popular</span>
            <div className="pn">Pro</div><div className="pr">R$ 197<span>/mês</span></div>
            <ul>
              <li><i className="ph-fill ph-check-circle" /> 3 sites no seu domínio</li>
              <li><i className="ph-fill ph-check-circle" /> 20 artigos por mês</li>
              <li><i className="ph-fill ph-check-circle" /> Score de SEO/GEO/AEO</li>
              <li><i className="ph-fill ph-check-circle" /> Análise da presença online</li>
            </ul>
            <Link href="/signup" className="btn">Começar grátis</Link>
          </div>
          <div className="glass plan">
            <div className="pn">Agency</div><div className="pr">R$ 297<span>/mês</span></div>
            <ul>
              <li><i className="ph-fill ph-check-circle" /> Sites ilimitados</li>
              <li><i className="ph-fill ph-check-circle" /> White-label e painel de clientes</li>
              <li><i className="ph-fill ph-check-circle" /> API e suporte prioritário</li>
            </ul>
            <Link href="/signup" className="btn glass">Falar com vendas</Link>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="block wrap">
        <div className="head"><span className="eyebrow">Dúvidas frequentes</span><h2>O que você precisa saber</h2></div>
        <div className="faq">
          {FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      {/* cta final */}
      <section className="wrap">
        <div className="glass cta-final">
          <h2>Seu próximo cliente está buscando agora</h2>
          <p>Crie seu site grátis e comece a aparecer no Google e nas IAs hoje.</p>
          <Link href="/signup" className="btn amber lg"><i className="ph-fill ph-rocket-launch" /> Criar meu site agora</Link>
        </div>
      </section>

      <footer className="site">
        <div className="wrap foot">
          <div className="brand"><span className="mk"><i className="ph-fill ph-bird" /></span> ANCOREO</div>
          <span>SEO + GEO + AEO pra negócios locais · feito no Brasil</span>
          <span>© 2026 ANCOREO</span>
        </div>
      </footer>
    </div>
  )
}
