import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const PHASES = {
  discovery: {
    num: 1,
    title: 'Discovery',
    subtitle: 'Understanding your current state, market position, and growth objectives.',
    sections: [
      {
        heading: 'Why Discovery Matters',
        text: 'Every successful engagement starts with a deep understanding of where you are today. The Discovery phase is designed to uncover not just the obvious challenges, but the hidden constraints and untapped opportunities that will shape your growth strategy.',
      },
      {
        heading: 'What We Do',
        text: 'We conduct stakeholder interviews, market analysis, competitive benchmarking, and organizational assessments. We review your financials, operations, talent, and technology stack. We map your industry landscape and identify the forces that will shape your future.',
      },
      {
        heading: 'Key Deliverables',
        text: 'A comprehensive situational assessment covering market position, competitive dynamics, organizational capabilities, and growth constraints. A prioritized opportunity map that identifies the highest-impact areas for intervention.',
      },
      {
        heading: 'Duration & Approach',
        text: 'Typically 2-4 weeks depending on scope. We work on-site with your team, combining structured interviews with data analysis. The goal is to see your business as clearly as you do — and then identify what you might be missing.',
      },
    ],
    next: { slug: 'design', name: 'Design' },
    prev: null,
  },
  design: {
    num: 2,
    title: 'Design',
    subtitle: 'Crafting tailored strategies aligned with your resources and ambitions.',
    sections: [
      {
        heading: 'From Insight to Strategy',
        text: 'The Design phase transforms Discovery findings into a clear, actionable strategy. This is not a generic framework pulled from a shelf — it is a custom roadmap built around your specific situation, resources, and objectives.',
      },
      {
        heading: 'Strategy Development',
        text: 'We work collaboratively with your leadership team to design growth strategies that are ambitious but achievable. Every recommendation is stress-tested against your resource constraints, competitive environment, and organizational culture.',
      },
      {
        heading: 'Key Deliverables',
        text: 'A detailed strategic roadmap with clear milestones, resource requirements, and success metrics. Financial models projecting expected returns. Risk assessments with mitigation strategies for each major initiative.',
      },
      {
        heading: 'Collaborative Process',
        text: 'Strategy designed in isolation fails in execution. We involve your key stakeholders throughout the Design phase to ensure alignment, build ownership, and identify potential implementation challenges early.',
      },
    ],
    next: { slug: 'build', name: 'Build' },
    prev: { slug: 'discovery', name: 'Discovery' },
  },
  build: {
    num: 3,
    title: 'Build',
    subtitle: 'Assembling the right team, tools, and partnerships.',
    sections: [
      {
        heading: 'Preparing for Execution',
        text: 'A strategy is only as good as the team and infrastructure behind it. The Build phase focuses on assembling everything you need to execute: the right people, the right technology, and the right partnerships.',
      },
      {
        heading: 'Team & Talent',
        text: 'Whether you need to hire key executives, restructure teams, or bring in specialized expertise, we help you build the human capital required for success. Our executive search and talent advisory capabilities ensure you have the right people in the right roles.',
      },
      {
        heading: 'Technology & Tools',
        text: 'We evaluate and recommend the technology platforms, data systems, and operational tools that will enable your strategy. For AI transformation engagements, this includes readiness assessments, vendor selection, and implementation planning.',
      },
      {
        heading: 'Partnership Networks',
        text: 'Growth often requires partners — distributors, technology providers, joint venture partners, or local market allies. We leverage our global network to identify and vet the right partners for your specific needs.',
      },
    ],
    next: { slug: 'deploy', name: 'Deploy' },
    prev: { slug: 'design', name: 'Design' },
  },
  deploy: {
    num: 4,
    title: 'Deploy',
    subtitle: 'Executing with precision and agility.',
    sections: [
      {
        heading: 'From Plan to Action',
        text: 'The Deploy phase is where strategy meets reality. This is the critical transition point where most consulting engagements fail — the advisors hand over a report and leave. At MCG, we stay to help you execute.',
      },
      {
        heading: 'Implementation Support',
        text: 'We work alongside your team during deployment, providing hands-on support for market entry, organizational change, technology rollouts, and partnership launches. We help troubleshoot issues in real-time and adjust course as needed.',
      },
      {
        heading: 'Agile Execution',
        text: 'Markets move fast and plans need to adapt. We use an agile deployment approach with short sprint cycles, regular check-ins, and rapid iteration. This ensures you stay responsive to market feedback without losing strategic direction.',
      },
      {
        heading: 'Risk Management',
        text: 'Every deployment carries risk. We monitor key risk indicators throughout execution and activate mitigation strategies when needed. Our experience across 40+ countries means we have seen — and navigated — most of the challenges you will face.',
      },
    ],
    next: { slug: 'deliver-value', name: 'Deliver Value' },
    prev: { slug: 'build', name: 'Build' },
  },
  'deliver-value': {
    num: 5,
    title: 'Deliver Value',
    subtitle: 'Measuring outcomes and ensuring sustainable growth.',
    sections: [
      {
        heading: 'Beyond Delivery — Sustainable Impact',
        text: 'The final phase of our methodology is focused on ensuring that the value we create is measurable, sustainable, and self-reinforcing. We do not consider an engagement successful until our clients can demonstrate concrete results.',
      },
      {
        heading: 'Outcome Measurement',
        text: 'We track every engagement against the success metrics defined during the Design phase. Revenue growth, market share gains, cost reductions, talent acquisition outcomes, deal closings — we measure what matters and report transparently.',
      },
      {
        heading: 'Knowledge Transfer',
        text: 'Our goal is to build your internal capabilities, not create dependency. We transfer frameworks, tools, and methodologies to your team so you can sustain and build on the progress we have made together.',
      },
      {
        heading: 'Ongoing Relationship',
        text: 'Many of our client relationships span years and multiple engagements. Once we understand your business deeply, we become a trusted advisor you can call on as new challenges and opportunities emerge.',
      },
    ],
    next: null,
    prev: { slug: 'deploy', name: 'Deploy' },
  },
};

export default function MethodologyDetail() {
  const { slug } = useParams();
  const phase = PHASES[slug];

  useSEO(
    phase ? `${phase.title} — Value Delivery System` : 'Methodology',
    phase ? phase.subtitle : ''
  );

  if (!phase) {
    return (
      <div className="pub-page">
        <section className="pub-hero pub-hero-sm">
          <div className="pub-container">
            <h1 className="pub-hero-title">Page Not Found</h1>
            <p className="pub-hero-subtitle">The methodology phase you are looking for does not exist.</p>
            <Link to="/value-delivery-system" className="pub-btn pub-btn-outline">View Full Methodology</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h3 style={{ color: 'rgba(201,168,76,0.9)', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Phase {phase.num} of 5</h3>
          <h1 className="pub-hero-title">{phase.title}</h1>
          <p className="pub-hero-subtitle">{phase.subtitle}</p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          {phase.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: i < phase.sections.length - 1 ? 36 : 0 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0b1120', marginBottom: 12 }}>{s.heading}</h2>
              <p className="pub-body-text">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phase Navigation */}
      <section className="pub-section pub-section-alt">
        <div className="pub-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            {phase.prev ? (
              <Link to={`/methodology/${phase.prev.slug}`} className="pub-btn pub-btn-outline">&larr; Phase {phase.num - 1}: {phase.prev.name}</Link>
            ) : <div />}
            <Link to="/value-delivery-system" className="pub-btn pub-btn-outline">View Full Methodology</Link>
            {phase.next ? (
              <Link to={`/methodology/${phase.next.slug}`} className="pub-btn pub-btn-outline">Phase {phase.num + 1}: {phase.next.name} &rarr;</Link>
            ) : <div />}
          </div>
        </div>
      </section>

      <section className="pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Ready to Start Your Journey?</h2>
          <p className="pub-cta-text">Book a consultation to discuss how our methodology can drive results for your organization.</p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
