import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/duotone/style.css"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/fill/style.css"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --blue: #1455C9; --blue-d: #0E3E96; --blue-l: #3D7BEE;
          --amber: #F5A30A; --amber-d: #C97F00;
          --ink: #14213A; --muted: #5A6678;
          --glass: rgba(255,255,255,.58);
          --glass-line: rgba(255,255,255,.85);
          --radius: 22px;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0; font-family: 'Inter', system-ui, sans-serif; color: var(--ink);
          min-height: 100vh; -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(900px 600px at 12% -5%, #cfe4ff 0%, transparent 55%),
            radial-gradient(800px 700px at 100% 0%, #d7f4ee 0%, transparent 50%),
            radial-gradient(700px 600px at 80% 110%, #e7ddff 0%, transparent 55%),
            linear-gradient(180deg, #eef4fc 0%, #e9f0f9 100%);
          background-attachment: fixed;
        }
        .hp-page { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 1.4rem 2rem 4rem; }
        h1, h2, h3, .hp-brand, .hp-display { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        /* NAV de vidro */
        .hp-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: .7rem .8rem .7rem 1.4rem; border-radius: 999px;
          background: var(--glass); backdrop-filter: blur(20px) saturate(170%); -webkit-backdrop-filter: blur(20px) saturate(170%);
          border: 1px solid var(--glass-line);
          box-shadow: 0 8px 30px rgba(20,33,58,.12), inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 2px rgba(20,33,58,.06);
        }
        .hp-brand { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.01em; color: var(--blue); display: flex; align-items: center; gap: .5rem; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .hp-brand .hp-dot { width: 26px; height: 26px; border-radius: 9px; background: linear-gradient(160deg, #4a86f5, #1450c4); box-shadow: inset 0 1px 1px rgba(255,255,255,.7), inset 0 -2px 3px rgba(0,0,0,.25), 0 4px 10px rgba(20,80,196,.45); display: grid; place-items: center; color: #fff; }
        .hp-nav-links { display: flex; gap: 1.6rem; align-items: center; font-size: .9rem; font-weight: 500; color: var(--muted); }
        .hp-nav-links a { color: var(--muted); text-decoration: none; }
        .hp-nav-links a:hover { color: var(--ink); }

        /* BOTÕES físicos */
        .hp-btn { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: .95rem; border: 0; cursor: pointer;
          display: inline-flex; align-items: center; gap: .55rem; padding: .85rem 1.5rem; border-radius: 14px; color: #fff;
          background: linear-gradient(180deg, #4a86f5 0%, #1d5fd4 48%, #1450c4 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.55),
            inset 0 -2px 3px rgba(8,40,110,.55),
            0 10px 20px -6px rgba(20,80,196,.6),
            0 3px 6px rgba(20,33,58,.18);
          transition: transform .08s ease, box-shadow .12s ease, filter .12s ease;
          text-decoration: none;
        }
        .hp-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .hp-btn:active { transform: translateY(1px);
          box-shadow: inset 0 2px 5px rgba(8,40,110,.6), inset 0 1px 0 rgba(255,255,255,.25), 0 2px 5px rgba(20,33,58,.15); }
        .hp-btn.hp-amber { background: linear-gradient(180deg, #ffc24d 0%, #f5a30a 50%, #d98c00 100%); color: #3a2600;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.7), inset 0 -2px 3px rgba(150,90,0,.55), 0 10px 20px -6px rgba(220,150,10,.6), 0 3px 6px rgba(20,33,58,.16); }
        .hp-btn.hp-glass { background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.6)); color: var(--blue);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 0 8px 18px -6px rgba(20,33,58,.25), 0 2px 4px rgba(20,33,58,.1); }
        .hp-btn.hp-sm { padding: .55rem 1.05rem; font-size: .85rem; border-radius: 11px; }

        /* HERO */
        .hp-hero { display: grid; grid-template-columns: 1.05fr .95fr; gap: 2.5rem; align-items: center; margin-top: 2.5rem; }
        .hp-pill { display: inline-flex; align-items: center; gap: .5rem; font-size: .8rem; font-weight: 700; color: var(--blue-d);
          background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.65)); padding: .45rem .9rem; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.9); box-shadow: inset 0 1px 0 #fff, 0 4px 12px rgba(20,33,58,.1); margin-bottom: 1.5rem; }
        .hp-pill i { color: var(--amber); }
        .hp-hero h1 { font-size: clamp(2.4rem, 4.4vw, 3.6rem); line-height: 1.05; letter-spacing: -0.025em; margin: 0 0 1.2rem; font-weight: 800; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .hp-hero h1 .hp-grad { background: linear-gradient(100deg, #1450c4, #3d8bee 60%, #16a8c0); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .hp-hero p { font-size: 1.12rem; line-height: 1.6; color: var(--muted); max-width: 30rem; margin: 0 0 2rem; }
        .hp-hero-cta { display: flex; gap: .9rem; flex-wrap: wrap; align-items: center; }
        .hp-reassure { margin-top: 1.4rem; font-size: .82rem; color: var(--muted); display: flex; align-items: center; gap: .5rem; }
        .hp-reassure i { color: #1f9d57; }

        /* CARD de site flutuante (tátil) */
        .hp-float { position: relative; }
        .hp-card {
          background: rgba(255,255,255,.72); backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%);
          border-radius: var(--radius); border: 1px solid var(--glass-line); padding: 1.3rem;
          box-shadow: 0 30px 60px -18px rgba(20,33,58,.32), 0 8px 20px rgba(20,33,58,.12), inset 0 1px 0 rgba(255,255,255,.9);
        }
        .hp-site-prev { border-radius: 16px; overflow: hidden; border: 1px solid rgba(20,33,58,.08); box-shadow: 0 10px 24px -10px rgba(20,33,58,.4); }
        .hp-site-prev .hp-bar { display: flex; align-items: center; gap: .4rem; padding: .55rem .8rem; background: linear-gradient(180deg,#fbfdff,#eef3fa); border-bottom: 1px solid rgba(20,33,58,.07); }
        .hp-site-prev .hp-bar i { width: 10px; height: 10px; border-radius: 50%; box-shadow: inset 0 -1px 1px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.6); display: inline-block; }
        .hp-site-prev .hp-bar .hp-r { background: #ff6b5e; } .hp-site-prev .hp-bar .hp-y { background: #ffce4f; } .hp-site-prev .hp-bar .hp-g { background: #54d27a; }
        .hp-site-prev .hp-body { height: 150px; background: linear-gradient(160deg,#0E7C86,#16B3A6); position: relative; display: flex; align-items: flex-end; padding: 1rem; }
        .hp-site-prev .hp-body::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 75% 25%, rgba(255,255,255,.25), transparent 55%); }
        .hp-site-prev .hp-body b { color: #fff; font-family: 'Plus Jakarta Sans'; font-size: 1.1rem; position: relative; z-index: 2; }
        .hp-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; }
        .hp-card-foot .hp-name { font-weight: 700; font-size: .92rem; }
        .hp-card-foot .hp-url { font-size: .76rem; color: var(--muted); }

        /* dial de score 3D */
        .hp-score { position: absolute; right: -1.4rem; top: -1.4rem; width: 104px; height: 104px; border-radius: 50%;
          background: conic-gradient(var(--amber) 0 84%, rgba(20,33,58,.12) 84% 100%);
          box-shadow: 0 14px 30px -8px rgba(220,150,10,.55), inset 0 2px 4px rgba(255,255,255,.5); display: grid; place-items: center; }
        .hp-score .hp-inner { width: 78px; height: 78px; border-radius: 50%; background: linear-gradient(180deg,#ffffff,#eef3fa);
          box-shadow: inset 0 2px 4px rgba(255,255,255,.9), inset 0 -3px 6px rgba(20,33,58,.12), 0 2px 6px rgba(20,33,58,.1);
          display: grid; place-items: center; text-align: center; }
        .hp-score .hp-inner b { font-family: 'Plus Jakarta Sans'; font-size: 1.5rem; color: var(--ink); line-height: 1; }
        .hp-score .hp-inner span { font-size: .56rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }

        /* FEATURES com chip 3D */
        .hp-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; margin-top: 3.5rem; }
        .hp-feature { background: var(--glass); backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%);
          border-radius: 20px; border: 1px solid var(--glass-line); padding: 1.5rem;
          box-shadow: 0 14px 34px -16px rgba(20,33,58,.28), inset 0 1px 0 rgba(255,255,255,.85);
          transition: transform .15s ease, box-shadow .15s ease; }
        .hp-feature:hover { transform: translateY(-3px); box-shadow: 0 22px 44px -16px rgba(20,33,58,.34), inset 0 1px 0 rgba(255,255,255,.9); }
        .hp-chip { width: 54px; height: 54px; border-radius: 16px; display: grid; place-items: center; font-size: 1.6rem; color: #fff; margin-bottom: 1rem;
          box-shadow: inset 0 2px 2px rgba(255,255,255,.6), inset 0 -3px 5px rgba(0,0,0,.28), 0 8px 16px -4px rgba(20,33,58,.4); }
        .hp-chip.hp-b { background: linear-gradient(160deg,#4a86f5,#1450c4); }
        .hp-chip.hp-t { background: linear-gradient(160deg,#27c5b6,#0e8c86); }
        .hp-chip.hp-a { background: linear-gradient(160deg,#ffc24d,#e08a00); color: #3a2600; }
        .hp-feature h3 { font-size: 1.08rem; margin: 0 0 .4rem; font-weight: 700; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .hp-feature p { font-size: .9rem; color: var(--muted); line-height: 1.55; margin: 0; }

        .hp-note { margin-top: 2.5rem; text-align: center; font-size: .8rem; color: var(--muted); }

        @media (max-width: 880px) {
          .hp-hero { grid-template-columns: 1fr; gap: 3rem; }
          .hp-features { grid-template-columns: 1fr; }
          .hp-nav-links { display: none; }
          .hp-score { right: 0; }
        }
      ` }} />

      <div className="hp-page">
        <nav className="hp-nav">
          <div className="hp-brand">
            <span className="hp-dot">
              <i className="ph-fill ph-bird"></i>
            </span>
            HARPIA
          </div>
          <div className="hp-nav-links">
            <a href="#">Modelos</a>
            <a href="#">Recursos</a>
            <a href="#">Preços</a>
            <Link href="/login">Entrar</Link>
          </div>
          <Link href="/signup" className="hp-btn hp-sm">
            Começar grátis
          </Link>
        </nav>

        <section className="hp-hero">
          <div>
            <span className="hp-pill">
              <i className="ph-fill ph-sparkle"></i>
              SEO · GEO · AEO em um só lugar
            </span>
            <h1>
              Seu site pronto pra{' '}
              <span className="hp-grad">aparecer</span>{' '}
              no Google e nas IAs
            </h1>
            <p>
              A IA escreve cada texto já otimizado. Você responde 6 perguntas e o
              site entra no ar em minutos, com profundidade de verdade no design e
              na busca.
            </p>
            <div className="hp-hero-cta">
              <Link href="/signup" className="hp-btn">
                <i className="ph-fill ph-rocket-launch"></i>
                Criar meu site agora
              </Link>
              <button className="hp-btn hp-glass">
                <i className="ph-duotone ph-play-circle"></i>
                Ver demonstração
              </button>
            </div>
            <div className="hp-reassure">
              <i className="ph-fill ph-check-circle"></i>
              7 dias grátis, sem cartão de crédito
            </div>
          </div>

          <div className="hp-float">
            <div className="hp-card">
              <div className="hp-site-prev">
                <div className="hp-bar">
                  <i className="hp-r"></i>
                  <i className="hp-y"></i>
                  <i className="hp-g"></i>
                </div>
                <div className="hp-body">
                  <b>Clínica Vida Plena</b>
                </div>
              </div>
              <div className="hp-card-foot">
                <div>
                  <div className="hp-name">clinicavidaplena.com.br</div>
                  <div className="hp-url">Publicado · atualizado hoje</div>
                </div>
                <button className="hp-btn hp-amber hp-sm">
                  <i className="ph-fill ph-pencil-simple"></i>
                  Editar
                </button>
              </div>
            </div>
            <div className="hp-score" title="Score SEO/GEO/AEO">
              <div className="hp-inner">
                <b>84</b>
                <span>score</span>
              </div>
            </div>
          </div>
        </section>

        <section className="hp-features">
          <div className="hp-feature">
            <div className="hp-chip hp-b">
              <i className="ph-duotone ph-magnifying-glass"></i>
            </div>
            <h3>SEO que ranqueia</h3>
            <p>
              Estrutura, schema e velocidade corretas para o Google entender e
              posicionar o seu site.
            </p>
          </div>
          <div className="hp-feature">
            <div className="hp-chip hp-t">
              <i className="ph-duotone ph-brain"></i>
            </div>
            <h3>Citado pelas IAs</h3>
            <p>
              Conteúdo no formato que ChatGPT, Gemini e Perplexity usam para
              recomendar o seu negócio.
            </p>
          </div>
          <div className="hp-feature">
            <div className="hp-chip hp-a">
              <i className="ph-duotone ph-chat-circle-text"></i>
            </div>
            <h3>Resposta direta</h3>
            <p>
              FAQ e dados prontos para virar a resposta exibida na busca e por voz.
            </p>
          </div>
        </section>

        <p className="hp-note">
          HARPIA · SEO · GEO · AEO — o site do seu cliente aparece quando o
          cliente dele busca
        </p>
      </div>
    </>
  )
}
