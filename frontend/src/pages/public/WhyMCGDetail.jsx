import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const ARTICLES = {
  'senior-advisory-model': {
    title: 'Senior Advisory Model',
    subtitle: 'Why every MCG engagement is led by experienced practitioners — not junior analysts.',
    sections: [
      {
        heading: 'The Problem With Traditional Consulting',
        text: 'Most large consulting firms sell you a senior partner in the pitch meeting, then staff your project with recent graduates. You pay premium rates for junior talent learning on your dime. The result: generic frameworks, slow ramp-up times, and deliverables that miss the mark.',
      },
      {
        heading: 'How MCG Is Different',
        text: 'At Multiverse Consulting Group, the advisor you meet is the advisor who leads your engagement. Our team consists exclusively of professionals with 15+ years of domain expertise. There are no layers of project managers or analysts between you and actionable insight.',
      },
      {
        heading: 'What This Means For You',
        text: 'Faster time-to-value because senior advisors identify patterns and solutions immediately. Higher quality deliverables grounded in real-world experience. Direct access to decision-makers who understand your challenges from day one.',
      },
      {
        heading: 'Our Commitment',
        text: 'Every engagement is personally overseen by a named senior advisor who is accountable for outcomes. We measure success not by hours billed, but by the measurable impact we deliver to your organization.',
      },
    ],
    cta: { text: 'Meet Our Leadership', link: '/leadership' },
  },
  'global-network': {
    title: 'Global Network',
    subtitle: 'Deep relationships across the Middle East, Southeast Asia, Europe, Africa, and the Americas.',
    sections: [
      {
        heading: 'Built Over Decades, Not Months',
        text: 'Our global network is the product of two decades of cross-border deal-making, executive placements, and strategic partnerships. These are not database contacts — they are trusted relationships built through successful collaboration.',
      },
      {
        heading: 'Key Corridors',
        text: 'We specialize in connecting high-growth corridors: Gulf States to Southeast Asia, Europe to Africa, Americas to Middle East. These corridors represent some of the fastest-growing trade and investment routes in the global economy.',
      },
      {
        heading: 'On-the-Ground Intelligence',
        text: 'In every major market we serve, we maintain relationships with local advisors, regulatory experts, and industry leaders. This gives our clients access to real-time market intelligence that no desk research can replicate.',
      },
      {
        heading: 'Network Advantages',
        text: 'Warm introductions to decision-makers, regulators, and potential partners. Local market insights that reduce entry risk. Cross-border deal facilitation with culturally fluent advisors who understand both sides of every transaction.',
      },
    ],
    cta: { text: 'Explore Global Markets', link: '/global-markets' },
  },
  'execution-focus': {
    title: 'Execution Focus',
    subtitle: 'We go beyond strategy decks — we stay engaged through implementation and measurable outcomes.',
    sections: [
      {
        heading: 'Strategy Without Execution Is Just a Slide Deck',
        text: 'The consulting industry has a well-known problem: beautifully crafted strategies that never get implemented. Organizations spend millions on recommendations that sit in drawers because the consultants who created them have already moved on to the next engagement.',
      },
      {
        heading: 'Our Value Delivery System',
        text: 'MCG\'s proprietary five-phase methodology — Discovery, Design, Build, Deploy, Deliver Value — ensures that every engagement moves from analysis to action. We don\'t hand over a report and walk away. We stay engaged through implementation.',
      },
      {
        heading: 'Measurable Outcomes',
        text: 'Every engagement begins with clearly defined success metrics agreed upon with the client. We track progress against these metrics throughout the engagement and hold ourselves accountable for delivering tangible results.',
      },
      {
        heading: 'Skin in the Game',
        text: 'We structure many of our engagements with performance-linked compensation. When your organization succeeds, we succeed. This alignment of incentives ensures that our advice is always practical, actionable, and focused on real-world impact.',
      },
    ],
    cta: { text: 'See Our Methodology', link: '/value-delivery-system' },
  },
  'boutique-flexibility': {
    title: 'Boutique Flexibility',
    subtitle: 'Tailored engagements without the overhead, rigidity, or conflicts of large consulting firms.',
    sections: [
      {
        heading: 'Right-Sized For Impact',
        text: 'Large consulting firms bring large overhead: layers of management, standardized methodologies, and one-size-fits-all frameworks. MCG brings the caliber of talent you expect from top-tier firms with the agility and personalization of a boutique practice.',
      },
      {
        heading: 'No Conflicts of Interest',
        text: 'Unlike large firms that may be advising your competitors simultaneously, MCG maintains strict conflict-of-interest policies. When we work with you, your interests are our only priority.',
      },
      {
        heading: 'Flexible Engagement Models',
        text: 'We offer multiple engagement structures to match your needs: project-based advisory, retainer arrangements, and performance-linked partnerships. No rigid scoping documents that lock you into work you don\'t need.',
      },
      {
        heading: 'Direct Senior Access',
        text: 'No account managers, no project coordinators, no intermediaries. You work directly with the senior advisors leading your engagement. Decisions happen faster, communication is clearer, and outcomes are better.',
      },
    ],
    cta: { text: 'Explore Our Services', link: '/services' },
  },
};

export default function WhyMCGDetail() {
  const { slug } = useParams();
  const article = ARTICLES[slug];

  useSEO(
    article ? article.title : 'Why MCG',
    article ? article.subtitle : ''
  );

  if (!article) {
    return (
      <div className="pub-page">
        <section className="pub-hero pub-hero-sm">
          <div className="pub-container">
            <h1 className="pub-hero-title">Page Not Found</h1>
            <p className="pub-hero-subtitle">The article you are looking for does not exist.</p>
            <Link to="/" className="pub-btn pub-btn-outline">Back to Home</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h3 style={{ color: 'rgba(201,168,76,0.9)', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Why MCG</h3>
          <h1 className="pub-hero-title">{article.title}</h1>
          <p className="pub-hero-subtitle">{article.subtitle}</p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          {article.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: i < article.sections.length - 1 ? 36 : 0 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0b1120', marginBottom: 12 }}>{s.heading}</h2>
              <p className="pub-body-text">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Ready to Experience the Difference?</h2>
          <p className="pub-cta-text">See how our approach translates into real outcomes for organizations like yours.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={article.cta.link} className="pub-btn pub-btn-outline">{article.cta.text}</Link>
            <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
