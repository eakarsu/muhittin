import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const SERVICE_DATA = {
  'strategy-growth': {
    title: 'Strategy & Growth',
    overview: 'Multiverse helps organizations define their strategic direction and build actionable growth plans. We combine rigorous analytical frameworks with practical market experience to create strategies that are not only sound on paper but executable in the real world. Our senior-led teams work alongside your leadership to align vision, resources, and market opportunity into a coherent path forward.',
    challenges: [
      'Lack of clarity on strategic priorities and resource allocation',
      'Stagnant growth despite strong product-market fit',
      'Competitive pressure eroding market position',
      'Difficulty translating board-level strategy into operational execution',
      'Misalignment between leadership vision and organizational capabilities',
    ],
    solutions: [
      'Comprehensive market and competitive landscape analysis',
      'Growth opportunity identification and prioritization framework',
      'Strategic roadmap development with phased milestones',
      'Revenue model optimization and pricing strategy',
      'Executive alignment workshops and strategy activation plans',
    ],
    engagements: [
      'Developed a three-year growth strategy for a Series C SaaS company, identifying $40M in addressable revenue opportunities.',
      'Repositioned a mid-market professional services firm, resulting in 35% revenue growth within 18 months.',
      'Created market entry strategy for a healthcare technology platform expanding into GCC markets.',
      'Designed a diversification roadmap for a family-owned industrial conglomerate seeking new verticals.',
    ],
    outcomes: ['35% average revenue growth within 18 months', '$40M+ in new addressable opportunities identified', '90% strategy adoption rate by client leadership teams', 'Measurable ROI within first engagement quarter'],
  },
  'global-expansion': {
    title: 'Global Expansion',
    overview: 'Expanding into new markets is one of the highest-impact moves an organization can make, but it is also one of the most complex. Multiverse provides end-to-end support for market entry and international growth, from feasibility analysis and regulatory navigation to local partner identification and operational setup. We leverage our global corridor networks to reduce risk and accelerate time to market.',
    challenges: [
      'Uncertainty about which markets offer the best risk-adjusted opportunity',
      'Complex regulatory, legal, and compliance requirements in target markets',
      'Lack of local networks, partners, and on-the-ground knowledge',
      'Cultural and operational differences that derail execution',
      'High cost of failed market entries and pivots',
    ],
    solutions: [
      'Market feasibility studies with quantified opportunity sizing',
      'Regulatory and compliance roadmap development',
      'Local partner identification, vetting, and introduction',
      'Entity formation and operational setup advisory',
      'Cultural integration and localization strategy',
    ],
    engagements: [
      'Guided a European fintech into the UAE market, from regulatory approval to first customer in under six months.',
      'Established a Southeast Asian distribution network for a US consumer brand across four countries.',
      'Structured a joint venture between a Saudi industrial group and a German engineering firm.',
      'Supported a Nigerian tech startup in securing Singapore-based investors and regional partners.',
    ],
    outcomes: ['Average 6-month time to first revenue in new markets', '30+ countries entered successfully', '85% partner retention rate across engagements', '3x faster market entry vs. going alone'],
  },
  'talent-executive-search': {
    title: 'Talent & Executive Search',
    overview: 'Strategy without the right people is just a document. Multiverse provides integrated talent advisory and executive search services that connect organizations with the senior leaders and key hires they need to execute. Our global talent network spans industries and geographies, and our methodology ensures cultural and strategic fit, not just resume matching.',
    challenges: [
      'Difficulty attracting senior talent to high-growth or turnaround situations',
      'Misalignment between new hires and organizational culture or strategy',
      'Lack of visibility into global talent pools beyond traditional channels',
      'Lengthy and expensive search processes that delay critical initiatives',
      'Retention challenges with key executives and high performers',
    ],
    solutions: [
      'Retained executive search for C-suite, VP, and director roles',
      'Talent mapping and succession planning',
      'Organizational design and team structure optimization',
      'Compensation benchmarking and offer structuring',
      'Onboarding support and 90-day integration planning',
    ],
    engagements: [
      'Placed a Chief Technology Officer for a Series B healthtech company within 45 days of engagement.',
      'Built an entire regional leadership team (5 roles) for a PE-backed services platform entering the Middle East.',
      'Designed and executed a succession plan for a founder-led company transitioning to professional management.',
      'Sourced a Head of AI for a Fortune 500 financial services firm from a non-traditional talent pool.',
    ],
    outcomes: ['200+ C-suite placements completed', '45-day average time to placement', '92% candidate retention at 2 years', 'Talent sourced across 25+ countries'],
  },
  'investment-advisory': {
    title: 'Investment Advisory',
    overview: 'Capital is a growth accelerant, but only when deployed strategically. Multiverse provides investment advisory services that help companies raise capital, evaluate acquisitions, structure deals, and create value in portfolio companies. We combine financial expertise with operational insight to ensure that every investment decision is grounded in a credible path to returns.',
    challenges: [
      'Difficulty raising capital in competitive or uncertain markets',
      'Lack of institutional-quality materials and investor readiness',
      'Complex deal structures that require specialized negotiation expertise',
      'Post-acquisition integration challenges that destroy value',
      'Limited access to the right investor or buyer networks',
    ],
    solutions: [
      'Capital raising strategy and investor targeting',
      'Investment memorandum and data room preparation',
      'Buy-side and sell-side M&A advisory',
      'Deal structuring, term sheet negotiation, and closing support',
      'Post-acquisition value creation and integration planning',
    ],
    engagements: [
      'Advised on a $25M Series B raise for an AI-powered logistics platform, securing three term sheets in eight weeks.',
      'Structured and closed a cross-border acquisition of a European SaaS company by a Middle Eastern technology group.',
      'Developed a value creation plan for a PE fund portfolio company, driving 2.5x EBITDA improvement in 24 months.',
      'Provided buy-side due diligence and negotiation support for a strategic acquisition in the healthcare sector.',
    ],
    outcomes: ['$500M+ in total transaction value advised', '2.5x average EBITDA improvement in portfolio companies', '8-week average from mandate to term sheet', 'Cross-border deals across 15+ jurisdictions'],
  },
  'ai-transformation': {
    title: 'AI Transformation',
    overview: 'Artificial intelligence is reshaping every industry, but most organizations struggle to move beyond pilots and proof-of-concepts. Multiverse helps companies assess their AI readiness, identify high-impact use cases, select and implement the right solutions, and manage the organizational change required to make AI deliver real business value. We are practitioners, not theorists.',
    challenges: [
      'Uncertainty about where AI can create the most value in the organization',
      'Failed pilots and proof-of-concepts that never reach production',
      'Lack of internal AI talent and capability',
      'Resistance to change and fear of job displacement',
      'Vendor confusion and technology selection paralysis',
    ],
    solutions: [
      'AI readiness assessment and maturity scoring',
      'Use case identification, prioritization, and ROI modeling',
      'Vendor evaluation and technology selection support',
      'Implementation roadmap and project management',
      'Change management, training, and organizational enablement',
    ],
    engagements: [
      'Designed and implemented an AI-powered customer service platform for a telecom operator, reducing resolution time by 60%.',
      'Conducted an AI readiness assessment for a $2B manufacturing company and identified $15M in annual cost savings.',
      'Built an AI transformation roadmap for a government ministry, prioritizing 12 use cases across four departments.',
      'Deployed a predictive analytics solution for a real estate investment firm, improving deal screening accuracy by 40%.',
    ],
    outcomes: ['60% average reduction in process cycle times', '$15M+ in annual cost savings identified per engagement', '50+ AI transformation projects delivered', '85% of pilots successfully moved to production'],
  },
};

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = SERVICE_DATA[slug];
  useSEO(service?.title, service?.overview?.slice(0, 160));

  if (!service) {
    return (
      <div className="pub-page">
        <section className="pub-section">
          <div className="pub-container pub-text-center">
            <h1 className="pub-section-title">Service Not Found</h1>
            <p className="pub-body-text">The service you are looking for does not exist.</p>
            <Link to="/services" className="pub-btn pub-btn-outline">Back to Services</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <nav className="pub-breadcrumb">
            <Link to="/services">Services</Link> <span>/</span> <span>{service.title}</span>
          </nav>
          <h1 className="pub-hero-title">{service.title}</h1>
        </div>
      </section>

      {/* Overview */}
      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <p className="pub-body-text pub-body-text-lg">{service.overview}</p>
        </div>
      </section>

      {/* Challenges & Solutions */}
      <section className="pub-section pub-section-alt">
        <div className="pub-container">
          <div className="pub-grid pub-grid-2">
            <div>
              <h2 className="pub-section-title pub-text-left">Common Challenges</h2>
              <ul className="pub-list pub-list-challenges">
                {service.challenges.map((c, i) => (
                  <li key={i} className="pub-list-item">{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="pub-section-title pub-text-left">How We Help</h2>
              <ul className="pub-list pub-list-solutions">
                {service.solutions.map((s, i) => (
                  <li key={i} className="pub-list-item">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Example Engagements */}
      <section className="pub-section">
        <div className="pub-container">
          <h2 className="pub-section-title">Example Engagements</h2>
          <div className="pub-grid pub-grid-2">
            {service.engagements.map((e, i) => (
              <div key={i} className="pub-card">
                <p className="pub-card-text">{e}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      {service.outcomes && (
        <section className="pub-section pub-section-alt">
          <div className="pub-container" style={{ textAlign: 'center' }}>
            <h2 className="pub-section-title">Expected Outcomes</h2>
            <div className="pub-grid pub-grid-4">
              {service.outcomes.map((o, i) => (
                <div key={i} className="pub-card pub-card-center">
                  <p className="pub-card-text" style={{ fontWeight: 600 }}>{o}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Ready to Get Started?</h2>
          <p className="pub-cta-text">
            Let us show you how our {service.title} practice can drive results for your organization.
          </p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
