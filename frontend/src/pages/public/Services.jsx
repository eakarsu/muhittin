import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const SERVICE_DOMAINS = [
  {
    slug: 'strategy-growth',
    title: 'Strategy & Growth',
    desc: 'We help organizations define where to play and how to win. From market positioning and competitive analysis to growth roadmaps and strategic planning, we build the blueprint for sustainable expansion.',
    points: ['Strategic planning & vision alignment', 'Market positioning & competitive analysis', 'Growth roadmaps & revenue acceleration', 'Business model innovation'],
  },
  {
    slug: 'global-expansion',
    title: 'Global Expansion',
    desc: 'Entering new markets requires more than a plan. We provide on-the-ground knowledge, regulatory navigation, local partner networks, and market-entry strategies tailored to each corridor.',
    points: ['Market entry strategy & feasibility', 'Regulatory & compliance navigation', 'Local partner identification & vetting', 'Cross-border operational setup'],
  },
  {
    slug: 'talent-executive-search',
    title: 'Talent & Executive Search',
    desc: 'The right people make the difference between a strategy that sits on a shelf and one that drives results. We source, assess, and place senior leaders and key hires across industries and geographies.',
    points: ['C-suite & VP-level executive search', 'Team building & organizational design', 'Talent strategy & workforce planning', 'Compensation benchmarking & structuring'],
  },
  {
    slug: 'investment-advisory',
    title: 'Investment Advisory',
    desc: 'Whether you are raising capital, evaluating acquisitions, or structuring deals, we bring financial acumen and investor networks to help you make the right moves at the right time.',
    points: ['Capital raising & investor introductions', 'M&A advisory & due diligence support', 'Deal structuring & term negotiation', 'Portfolio company value creation'],
  },
  {
    slug: 'ai-transformation',
    title: 'AI Transformation',
    desc: 'AI is not a feature; it is a competitive advantage. We help organizations assess readiness, identify high-impact use cases, implement solutions, and manage the change required to make AI deliver value.',
    points: ['AI readiness assessment', 'Use case identification & prioritization', 'Implementation planning & vendor selection', 'Change management & team enablement'],
  },
];

export default function Services() {
  useSEO('Our Services', 'Five integrated advisory service domains covering strategy, AI transformation, talent, global expansion, and investment.');
  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Our Services</h1>
          <p className="pub-hero-subtitle">
            Five integrated service domains designed to help organizations grow, expand, hire, fund, and transform.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          {SERVICE_DOMAINS.map((svc, idx) => (
            <div key={svc.slug} className={`pub-service-block ${idx % 2 === 1 ? 'pub-section-alt-inline' : ''}`}>
              <div className="pub-service-block-content">
                <h2 className="pub-service-block-title">{svc.title}</h2>
                <p className="pub-body-text">{svc.desc}</p>
                <ul className="pub-list">
                  {svc.points.map((p, i) => (
                    <li key={i} className="pub-list-item">{p}</li>
                  ))}
                </ul>
                <Link to={`/services/${svc.slug}`} className="pub-btn pub-btn-outline">
                  Learn More &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Not Sure Where to Start?</h2>
          <p className="pub-cta-text">
            Book a consultation and we will help you identify the highest-impact opportunity for your organization.
          </p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
