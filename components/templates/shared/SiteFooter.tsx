import type { SiteContent } from '@/lib/templates/example-content'

export default function SiteFooter({ c, mini = false }: { c: SiteContent; mini?: boolean }) {
  if (mini) {
    return (
      <footer style={{ backgroundColor: 'var(--st)', padding: '1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{c.businessName}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} · {c.city}/{c.state} · Site criado com ANCOREO
          </span>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ backgroundColor: 'var(--st)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>{c.businessName}</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.6 }}>{c.tagline}</p>
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Serviços</p>
          {c.services.map((s, i) => (
            <a key={i} href="#" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '0.375rem' }}>{s.name}</a>
          ))}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conteúdo</p>
          {['Blog', 'FAQ', 'Sobre nós', 'Contato'].map(item => (
            <a key={item} href="#" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '0.375rem' }}>{item}</a>
          ))}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contato</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: '0.375rem' }}>{c.address}</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: '0.375rem' }}>{c.ctaPhone}</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>{c.email}</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        {c.credential && (
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{c.credential}</span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} {c.businessName} · Site criado com ANCOREO
        </span>
      </div>
    </footer>
  )
}
