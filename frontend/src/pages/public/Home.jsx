import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const CAPABILITY_CARDS = [
  { title: 'Strategy Advisory', slug: 'strategy-growth', desc: 'Data-driven strategic planning, market positioning, and growth roadmaps for ambitious organizations.' },
  { title: 'AI Transformation', slug: 'ai-transformation', desc: 'AI readiness assessments, implementation roadmaps, and change management that deliver real business value.' },
  { title: 'Talent & Executive Search', slug: 'talent-executive-search', desc: 'Senior leadership placement and talent strategy that connect you with the people who accelerate execution.' },
  { title: 'Global Expansion', slug: 'global-expansion', desc: 'Market entry strategy, regulatory navigation, and partner networks across high-growth corridors worldwide.' },
  { title: 'Investment Advisory', slug: 'investment-advisory', desc: 'Deal advisory, capital raising, and M&A support to fund and structure your next stage of growth.' },
];

const TRUST_SIGNALS = [
  { title: 'Senior Advisory Model', desc: 'Every engagement is led by experienced practitioners, not junior analysts learning on your project.', link: '/why-mcg/senior-advisory-model' },
  { title: 'Global Network', desc: 'Deep relationships across the Middle East, Southeast Asia, Europe, Africa, and the Americas.', link: '/why-mcg/global-network' },
  { title: 'Execution Focus', desc: 'We go beyond strategy decks — we stay engaged through implementation and measurable outcomes.', link: '/why-mcg/execution-focus' },
  { title: 'Boutique Flexibility', desc: 'Tailored engagements without the overhead, rigidity, or conflicts of large consulting firms.', link: '/why-mcg/boutique-flexibility' },
];

const PHASES = [
  { num: 1, name: 'Discovery', slug: 'discovery', desc: 'Understanding your current state, market position, and growth objectives.' },
  { num: 2, name: 'Design', slug: 'design', desc: 'Crafting tailored strategies aligned with your resources and ambitions.' },
  { num: 3, name: 'Build', slug: 'build', desc: 'Assembling the right team, tools, and partnerships.' },
  { num: 4, name: 'Deploy', slug: 'deploy', desc: 'Executing with precision and agility.' },
  { num: 5, name: 'Deliver Value', slug: 'deliver-value', desc: 'Measuring outcomes and ensuring sustainable growth.' },
];


const STATS = [
  { value: '150+', label: 'Engagements Delivered' },
  { value: '40+', label: 'Countries Reached' },
  { value: '95%', label: 'Client Retention' },
  { value: '$2B+', label: 'Value Created' },
];


const REGIONS = ['Middle East', 'Southeast Asia', 'Europe', 'Africa', 'Americas'];

export default function Home() {
  useSEO('Global Advisory Platform', 'Strategy, Talent and Investment advisory helping organizations expand, transform and execute across global markets.');

  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [caseStudies, setCaseStudies] = useState([]);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    fetch('/api/insights')
      .then(res => res.json())
      .then(data => {
        const published = (Array.isArray(data) ? data : data.insights || [])
          .filter(i => i.published)
          .slice(0, 3);
        setInsights(published);
      })
      .catch(() => setInsights([]))
      .finally(() => setInsightsLoading(false));

    fetch('/api/case-studies')
      .then(res => res.json())
      .then(data => setCaseStudies((Array.isArray(data) ? data : []).slice(0, 3)))
      .catch(() => setCaseStudies([]));

    fetch('/api/industries')
      .then(res => res.json())
      .then(data => setIndustries(Array.isArray(data) ? data : []))
      .catch(() => setIndustries([]));
  }, []);

  return (
    <div className="pub-page">
      {/* Hero */}
      <section className="pub-hero">
        <div className="pub-container">
          <img src="/logo-full.jpeg" alt="Multiverse Investment" style={{ height: 80, marginBottom: 24, borderRadius: 8 }} />
          <h1 className="pub-hero-title">Strategy. Talent. Investment. Execution.</h1>
          <p className="pub-hero-subtitle">
            Multiverse Consulting Group delivers growth through advisory, partnerships and execution support.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            <Link to="/services/strategy-growth" className="pub-chip" style={{ textDecoration: 'none' }}>Strategy</Link>
            <Link to="/services/talent-executive-search" className="pub-chip" style={{ textDecoration: 'none' }}>Talent</Link>
            <Link to="/services/investment-advisory" className="pub-chip" style={{ textDecoration: 'none' }}>Investment</Link>
            <Link to="/value-delivery-system" className="pub-chip" style={{ textDecoration: 'none' }}>Execution</Link>
          </div>
          <div className="pub-hero-ctas">
            <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
            <Link to="/services" className="pub-btn pub-btn-outline">Explore Services</Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '28px 0' }}>
        <div className="pub-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#0f766e', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capability Highlights */}
      <div style={{ padding: '36px 0' }}>
        <div className="pub-container" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>What We Do</h3>
          <h2 className="pub-section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Our Capabilities</h2>
          <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Five integrated service domains that cover every dimension of organizational growth.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, textAlign: 'left' }}>
            {CAPABILITY_CARDS.map(c => (
              <Link key={c.slug} to={`/services/${c.slug}`} className="pub-card pub-card-link">
                <h3 className="pub-card-title">{c.title}</h3>
                <p className="pub-card-text">{c.desc}</p>
                <span className="pub-card-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Signals - Why Multiverse */}
      <div className="pub-section-alt">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px', textAlign: 'center' }}>
          <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Why MCG</h3>
          <h2 className="pub-section-title">Why Multiverse?</h2>
          <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            A senior advisory model built for organizations that demand substance over slides.
          </p>
          <div className="pub-grid pub-grid-4">
            {TRUST_SIGNALS.map(t => (
              <Link key={t.title} to={t.link} className="pub-card pub-card-center pub-card-link" style={{ textDecoration: 'none' }}>
                <h3 className="pub-card-title">{t.title}</h3>
                <p className="pub-card-text">{t.desc}</p>
                <span className="pub-card-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Value Delivery System */}
      <div style={{ padding: '36px 0' }}>
        <div className="pub-container" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Methodology</h3>
          <h2 className="pub-section-title">Value Delivery System&trade;</h2>
          <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Our proven five-phase methodology turns ambition into measurable results.</p>
          <div className="pub-phases">
            {PHASES.map(p => (
              <Link key={p.num} to={`/methodology/${p.slug}`} className="pub-phase-item pub-phase-item-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="pub-phase-num">{p.num}</span>
                <h3 className="pub-phase-name">{p.name}</h3>
                <p className="pub-phase-desc">{p.desc}</p>
              </Link>
            ))}
          </div>
          <div className="pub-mt-2">
            <Link to="/value-delivery-system" className="pub-btn pub-btn-outline">Learn More</Link>
          </div>
        </div>
      </div>

      {/* Case Studies Preview */}
      <div className="pub-section-alt">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px', textAlign: 'center' }}>
          <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Results</h3>
          <h2 className="pub-section-title">Case Studies</h2>
          <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Real results from real engagements.
          </p>
          <div className="pub-grid pub-grid-3" style={{ textAlign: 'left' }}>
            {caseStudies.map(cs => (
              <Link key={cs.id || cs.slug} to={`/case-studies/${cs.slug}`} className="pub-card pub-card-link">
                {cs.industry && <span className="pub-badge">{cs.industry}</span>}
                <h3 className="pub-card-title" style={{ marginTop: cs.industry ? 14 : 0 }}>{cs.title}</h3>
                <p className="pub-card-text">{cs.result ? (cs.result.length > 150 ? cs.result.slice(0, 150) + '...' : cs.result) : ''}</p>
                <span className="pub-card-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
          <div className="pub-mt-2">
            <Link to="/case-studies" className="pub-btn pub-btn-outline">View All Case Studies</Link>
          </div>
        </div>
      </div>

      {/* Industries & Global Markets */}
      <div style={{ padding: '36px 0' }}>
        <div className="pub-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
            <div>
              <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Expertise</h3>
              <h2 className="pub-section-title" style={{ fontSize: 28 }}>Industries We Serve</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
                {industries.map(ind => (
                  <Link key={ind.id || ind.slug} to={`/industries/${ind.slug}`} className="pub-chip" style={{ textDecoration: 'none' }}>{ind.name}</Link>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Reach</h3>
              <h2 className="pub-section-title" style={{ fontSize: 28 }}>Global Markets</h2>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 24 }}>
                We operate across high-growth corridors, connecting opportunities between established and emerging markets.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {REGIONS.map(r => (
                  <div key={r} className="pub-chip pub-chip-lg">{r}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Preview */}
      <div className="pub-section-alt">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 32px', textAlign: 'center' }}>
          <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Knowledge</h3>
          <h2 className="pub-section-title">Latest Insights</h2>
          <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Perspectives on strategy, growth, and transformation from our senior advisory team.
          </p>
          {insightsLoading ? (
            <p className="pub-text-muted">Loading insights...</p>
          ) : insights.length === 0 ? (
            <p className="pub-text-muted">No insights published yet. Check back soon.</p>
          ) : (
            <div className="pub-grid pub-grid-3" style={{ textAlign: 'left' }}>
              {insights.map(ins => (
                <Link key={ins.id || ins.slug} to={`/insights/${ins.slug}`} className="pub-card pub-card-link">
                  <span className="pub-badge">{ins.category || 'Insight'}</span>
                  <h3 className="pub-card-title" style={{ marginTop: 14 }}>{ins.title}</h3>
                  <p className="pub-card-text">{ins.summary}</p>
                </Link>
              ))}
            </div>
          )}
          <div className="pub-mt-2">
            <Link to="/insights" className="pub-btn pub-btn-outline">View All Insights</Link>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <section className="pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Ready to Grow?</h2>
          <p className="pub-cta-text">
            Let us help you unlock your next phase of growth with a tailored strategy and execution plan.
          </p>
          <div className="pub-hero-ctas">
            <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
            <Link to="/contact" className="pub-btn pub-btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
