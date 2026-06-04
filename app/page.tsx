import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-heading text-xl font-bold text-primary">HARPIA</span>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            7 dias grátis — sem cartão de crédito
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Seu site aparece quando
            <br />
            <span className="text-primary">o cliente busca no Google</span>
            <br />
            e nas IAs
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A IA escreve todos os textos do seu site já otimizados para SEO, GEO e AEO.
            Você responde 6 perguntas sobre o negócio. O site fica no ar em minutos,
            pronto para aparecer na busca orgânica.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-md bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              Quero meu site agora
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-border px-8 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-heading mb-4 text-center text-3xl font-bold text-foreground">
              Do zero ao site publicado em 3 passos
            </h2>
            <p className="mb-14 text-center text-muted-foreground">
              Sem escrever uma linha. Sem contratar designer. Sem esperar semanas.
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Você conta sobre o negócio',
                  desc: 'Nome, cidade, serviços, diferenciais. São 6 perguntas. Leva menos de 10 minutos.',
                },
                {
                  step: '02',
                  title: 'A IA gera todos os textos',
                  desc: 'Cada palavra é otimizada para o Google e para os motores de IA como ChatGPT e Gemini.',
                },
                {
                  step: '03',
                  title: 'Publica no seu domínio',
                  desc: 'Site no ar, já ranqueável, com schema, FAQ automático e monitoramento de posição.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 font-heading text-4xl font-bold text-primary/20">
                    {item.step}
                  </div>
                  <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 PILARES */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-heading mb-4 text-center text-3xl font-bold text-foreground">
              Os 3 pilares que fazem você aparecer
            </h2>
            <p className="mb-14 text-center text-muted-foreground">
              A busca mudou. Seu site precisa aparecer no Google, nas IAs e nas buscas por voz.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  sigla: 'SEO',
                  nome: 'Busca tradicional',
                  desc: 'Aparece no Google quando o cliente busca pelo seu serviço na cidade. Keywords, schema, velocidade e estrutura correta.',
                  cor: 'text-primary',
                  bg: 'bg-primary/8',
                },
                {
                  sigla: 'GEO',
                  nome: 'Motores generativos',
                  desc: 'Seu negócio é citado quando alguém pergunta pro ChatGPT, Gemini ou Perplexity sobre o que você oferece.',
                  cor: 'text-accent-foreground',
                  bg: 'bg-accent/10',
                },
                {
                  sigla: 'AEO',
                  nome: 'Resposta direta',
                  desc: 'Seu site aparece como resposta direta no Google (featured snippet) e em buscas por voz como "Ok Google".',
                  cor: 'text-primary',
                  bg: 'bg-secondary',
                },
              ].map((item) => (
                <div key={item.sigla} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className={`mb-4 inline-block rounded-lg ${item.bg} px-3 py-1`}>
                    <span className={`font-heading text-2xl font-bold ${item.cor}`}>
                      {item.sigla}
                    </span>
                  </div>
                  <h3 className="font-heading mb-2 text-base font-semibold text-foreground">
                    {item.nome}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS — resumo */}
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-heading mb-4 text-3xl font-bold text-foreground">
              Planos diretos, sem surpresa
            </h2>
            <p className="mb-12 text-muted-foreground">
              Todos começam com 7 dias grátis no plano Pro completo.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { nome: 'Starter', preco: 'R$ 97', desc: '1 site · 4 posts/mês com IA · Blog + GBP básico' },
                { nome: 'Pro', preco: 'R$ 197', dest: true, desc: '3 sites · 20 posts/mês · Score SEO/GEO/AEO · Multilíngue' },
                { nome: 'Agency', preco: 'R$ 297', desc: 'Sites ilimitados · White-label · Painel de clientes · API' },
              ].map((p) => (
                <div
                  key={p.nome}
                  className={`rounded-xl border p-6 ${
                    p.dest
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-border bg-card'
                  }`}
                >
                  {p.dest && (
                    <div className="mb-3 text-xs font-semibold uppercase tracking-widest opacity-80">
                      Mais popular
                    </div>
                  )}
                  <div className="font-heading text-lg font-bold">{p.nome}</div>
                  <div className="font-heading my-2 text-3xl font-bold">{p.preco}<span className="text-sm font-normal opacity-70">/mês</span></div>
                  <p className={`text-sm leading-relaxed ${p.dest ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="font-heading mb-4 text-3xl font-bold text-foreground">
              Comece hoje. É grátis por 7 dias.
            </h2>
            <p className="mb-8 text-muted-foreground">
              Sem cartão de crédito agora. Você só informa no 6º dia — depois de ver o resultado.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-md bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              Quero começar grátis
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HARPIA · Todos os direitos reservados
        </div>
      </footer>
    </div>
  )
}
