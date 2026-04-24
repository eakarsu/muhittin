import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const PHASES = [
  {
    num: 1,
    name: 'Discovery',
    desc: 'Understanding your current state, market position, and growth objectives.',
    details: [
      'Stakeholder interviews and leadership alignment sessions',
      'Market landscape analysis and competitive benchmarking',
      'Operational and financial baseline assessment',
      'Identification of growth levers and constraint mapping',
    ],
  },
  {
    num: 2,
    name: 'Design',
    desc: 'Crafting tailored strategies aligned with your resources and ambitions.',
    details: [
      'Strategic option generation and scenario modeling',
      'Resource allocation and investment prioritization',
      'Go-to-market and expansion blueprint development',
      'KPI framework and success metric definition',
    ],
  },
  {
    num: 3,
    name: 'Build',
    desc: 'Assembling the right team, tools, and partnerships.',
    details: [
      'Executive search and key hire placement',
      'Technology stack evaluation and vendor selection',
      'Partnership and channel development',
      'Organizational design and capability building',
    ],
  },
  {
    num: 4,
    name: 'Deploy',
    desc: 'Executing with precision and agility.',
    details: [
      'Phased implementation with clear milestones',
      'Change management and stakeholder communication',
      'Real-time performance monitoring dashboards',
      'Agile course corrections based on live data',
    ],
  },
  {
    num: 5,
    name: 'Deliver Value',
    desc: 'Measuring outcomes and ensuring sustainable growth.',
    details: [
      'ROI measurement against defined success metrics',
      'Knowledge transfer and team enablement',
      'Sustainability assessment and risk mitigation',
      'Ongoing advisory and quarterly strategic reviews',
    ],
  },
];

const AI_ENHANCEMENTS = [
  { phase: 'Discovery', enhancement: 'AI-powered market scanning, sentiment analysis, and competitive intelligence gathering at scale.' },
  { phase: 'Design', enhancement: 'Predictive modeling and scenario simulation to stress-test strategic options before committing resources.' },
  { phase: 'Build', enhancement: 'AI-driven talent matching, vendor scoring, and partnership compatibility analysis.' },
  { phase: 'Deploy', enhancement: 'Automated progress tracking, anomaly detection, and real-time reporting dashboards.' },
  { phase: 'Deliver Value', enhancement: 'Continuous performance analytics, predictive churn models, and growth opportunity identification.' },
];

const ENGAGEMENT_MODELS = [
  {
    name: 'Project-Based',
    desc: 'Defined scope, timeline, and deliverables. Ideal for specific strategic initiatives, market entries, or transformation programs.',
    best: 'Organizations with a clear problem to solve or opportunity to capture.',
  },
  {
    name: 'Retainer',
    desc: 'Ongoing advisory access with a fixed monthly commitment. Provides continuity and priority access to our team.',
    best: 'CEOs, founders, and PE portfolio companies needing consistent strategic guidance.',
  },
  {
    name: 'Advisory',
    desc: 'Board-level or C-suite advisory on a periodic basis. Light touch, high impact.',
    best: 'Organizations seeking experienced outside perspective without a full engagement.',
  },
];

export default function ValueDeliverySystem() {
  useSEO('Value Delivery System', 'Our proven five-phase methodology turns ambition into measurable results — from discovery through value delivery.');
  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Value Delivery System&trade;</h1>
          <p className="pub-hero-subtitle">
            Our proven five-phase methodology ensures every engagement moves from insight to measurable impact.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="pub-section">
        <div className="pub-container">
          {PHASES.map(phase => (
            <div key={phase.num} id={`phase-${phase.num}`} className="pub-vds-phase">
              <div className="pub-vds-phase-header">
                <span className="pub-phase-num pub-phase-num-lg">{phase.num}</span>
                <div>
                  <h2 className="pub-vds-phase-title">{phase.name}</h2>
                  <p className="pub-vds-phase-desc">{phase.desc}</p>
                </div>
              </div>
              <ul className="pub-list">
                {phase.details.map((d, i) => (
                  <li key={i} className="pub-list-item">{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* AI Integration */}
      <section className="pub-section pub-section-alt">
        <div className="pub-container">
          <h2 className="pub-section-title">AI-Enhanced at Every Phase</h2>
          <p className="pub-section-subtitle">
            We embed artificial intelligence throughout our methodology to deliver faster insights, better predictions, and smarter execution.
          </p>
          <div className="pub-grid pub-grid-1">
            {AI_ENHANCEMENTS.map(item => (
              <div key={item.phase} className="pub-card pub-card-horizontal">
                <h3 className="pub-card-title">{item.phase}</h3>
                <p className="pub-card-text">{item.enhancement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="pub-section">
        <div className="pub-container">
          <h2 className="pub-section-title">Engagement Models</h2>
          <div className="pub-grid pub-grid-3">
            {ENGAGEMENT_MODELS.map(model => (
              <div key={model.name} className="pub-card">
                <h3 className="pub-card-title">{model.name}</h3>
                <p className="pub-card-text">{model.desc}</p>
                <p className="pub-card-meta"><strong>Best for:</strong> {model.best}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">See the System in Action</h2>
          <p className="pub-cta-text">
            Book a consultation to learn how the Value Delivery System can drive results for your organization.
          </p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
