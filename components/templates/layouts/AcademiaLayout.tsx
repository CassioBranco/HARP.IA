import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'
import SiteNav from '../shared/SiteNav'
import SiteFAQ from '../shared/SiteFAQ'
import SiteBlog from '../shared/SiteBlog'
import SiteFooter from '../shared/SiteFooter'
import SiteSchema from '../shared/SiteSchema'

function cssVars(p: PaletteColors) {
  return `:root{--sp:${p.primary};--ss:${p.secondary};--sa:${p.accent};--sb:${p.bg};--sf:${p.surface};--st:${p.text};--sm:${p.muted}}`
}

const MODALITY_COLOR: Record<string, string> = {
  Presencial: '#2563eb',
  EAD: '#16a34a',
  Híbrido: '#d97706',
}

export default function AcademiaLayout({ c, p, preview }: { c: SiteContent; p: PaletteColors; preview: boolean }) {
  const href = (url: string) => preview ? '#' : url
  const whatsapp = `https://wa.me/${c.whatsapp}?text=Olá, tenho interesse nos cursos.`
  const courses = c.courses ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars(p) }} />
      <SiteSchema c={c} preview={preview} />
      <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', backgroundColor: 'var(--sb)', color: 'var(--st)', minHeight: '100vh' }}>

        <SiteNav c={c} preview={preview} />

        {/* HERO — foco em matrícula */}
        <section style={{ backgroundColor: 'var(--sp)', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', borderRadius: '999px', padding: '0.25rem 1.1rem', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {c.city} · {c.state} · {c.yearsExperience} anos formando profissionais
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                {c.heroHeadline}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, fontSize: '1.05rem', marginBottom: '2rem' }}>{c.heroSub}</p>
              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                  Quero me matricular →
                </a>
                <a href="#cursos" style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', padding: '0.9rem 1.75rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
                  Ver cursos ↓
                </a>
              </div>
            </div>
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
              <img src={c.heroImage} alt={c.businessName} width={900} height={600} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* STATS */}
        {c.stats && (
          <section style={{ backgroundColor: 'var(--sf)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
              {c.stats.map((s, i) => (
                <div key={i} style={{ padding: '1rem' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--sp)', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--sm)', marginTop: '0.375rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CATÁLOGO DE CURSOS */}
        <section id="cursos" style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '0.75rem' }}>
              Cursos disponíveis em {c.city}
            </h2>
            <p style={{ color: 'var(--sm)', textAlign: 'center', marginBottom: '3rem' }}>
              Certificados reconhecidos, metodologia prática e saída rápida para o mercado.
            </p>
            {courses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {courses.map((course, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                      <img src={course.image} alt={course.name} width={600} height={338} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', backgroundColor: MODALITY_COLOR[course.modality] ?? '#6b7280', color: '#fff', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 700 }}>
                        {course.modality}
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontWeight: 700, color: 'var(--st)', fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{course.name}</h3>
                      <p style={{ color: 'var(--sm)', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '1rem', flex: 1 }}>{course.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--sm)', fontSize: '0.8rem' }}>⏱ {course.hours}h de carga horária</span>
                        {course.price && <span style={{ fontWeight: 700, color: 'var(--sp)', fontSize: '0.95rem' }}>{course.price}</span>}
                      </div>
                      <a href={href(whatsapp)} style={{ display: 'block', backgroundColor: 'var(--sp)', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>
                        Quero me matricular →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback — serviços como "cursos" */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {c.services.map((svc, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{svc.icon}</div>
                    <h3 style={{ fontWeight: 700, color: 'var(--sp)', marginBottom: '0.625rem', fontSize: '1rem' }}>{svc.name}</h3>
                    <p style={{ color: 'var(--sm)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>{svc.description}</p>
                    <a href={href(whatsapp)} style={{ display: 'block', backgroundColor: 'var(--sp)', color: '#fff', padding: '0.7rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center' }}>
                      Saber mais →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* METODOLOGIA */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sf)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 700, color: 'var(--st)', marginBottom: '1.25rem' }}>
                Nossa metodologia em {c.city}
              </h2>
              <p style={{ color: 'var(--sm)', lineHeight: 1.8, marginBottom: '2rem' }}>{c.about}</p>
              {[
                'Professores com experiência de mercado',
                'Práticas e projetos reais desde o início',
                'Suporte para colocação profissional',
                c.credential,
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--sa)', fontWeight: 700, marginTop: '0.1rem' }}>✓</span>
                  <span style={{ color: 'var(--st)', fontSize: '0.95rem' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={c.aboutImage} alt={`Metodologia ${c.businessName}`} width={600} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS — alunos */}
        <section style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--sb)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'var(--st)', textAlign: 'center', marginBottom: '3rem' }}>
              Histórias de quem já se formou
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {c.testimonials.map((t, i) => (
                <div key={i} style={{ backgroundColor: 'var(--sf)', borderRadius: '1rem', padding: '1.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--sp)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--st)', fontSize: '0.875rem' }}>{t.name}</p>
                      <p style={{ color: 'var(--sa)', fontSize: '0.8rem' }}>{'★'.repeat(t.rating)} Aluno formado</p>
                    </div>
                  </div>
                  <p style={{ color: 'var(--sm)', fontSize: '0.9rem', lineHeight: 1.7 }}>"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteBlog c={c} />
        <SiteFAQ c={c} />

        {/* CTA matrícula */}
        <section style={{ backgroundColor: 'var(--sp)', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
              Vagas limitadas. Garanta a sua agora.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>
              Turmas com início imediato em {c.city}. Fale com a nossa equipe e escolha o melhor curso para você.
            </p>
            <a href={href(whatsapp)} style={{ display: 'inline-block', backgroundColor: 'var(--sa)', color: '#fff', padding: '1rem 2.75rem', borderRadius: '0.625rem', fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              Quero me matricular →
            </a>
          </div>
        </section>

        <SiteFooter c={c} />
      </div>
    </>
  )
}
