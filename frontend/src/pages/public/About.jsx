import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const DIFFERENTIATORS = [
  { title: 'Senior-Led Engagements', desc: 'Every project is led by seasoned practitioners, not junior analysts learning on your dime.' },
  { title: 'AI-Enabled Delivery', desc: 'We embed artificial intelligence into research, analysis, and execution to move faster and see further.' },
  { title: 'Global Corridor Positioning', desc: 'Deep networks across Middle East, Southeast Asia, Europe, Africa, and the Americas.' },
  { title: 'Speed to Impact', desc: 'Our methodology is built for velocity. Tangible outcomes in weeks, not quarters.' },
  { title: 'Integrated Talent Access', desc: 'Unique ability to source and place the leaders needed to execute strategy.' },
  { title: 'Investment Connectivity', desc: 'Direct links to capital, co-investors, and deal flow across our global network.' },
];

export default function About() {
  useSEO('About Us', 'Learn about Multiverse Consulting Group — a global advisory platform for Strategy, Talent and Investment.');
  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">About Multiverse Consulting Group</h1>
          <p className="pub-hero-subtitle">
            A boutique advisory firm built for founders, executives, and investors who need more than advice &mdash; they need results.
          </p>
        </div>
      </section>

      {/* Firm Overview */}
      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">Who We Are</h2>
          <p className="pub-body-text">
            Multiverse Consulting Group is a boutique strategy and execution advisory firm that helps
            organizations deliver measurable growth. We work at the intersection of strategy, talent,
            capital, and technology &mdash; integrating all four value drivers into every engagement so
            our clients move faster, hire smarter, raise capital efficiently, and build with modern tools.
          </p>
          <p className="pub-body-text">
            Unlike large consulting firms that layer in junior resources and charge for overhead, we bring
            senior practitioners to every project. Our clients range from growth-stage startups to
            established enterprises expanding into new markets, and from private equity firms seeking
            operating leverage to governments building innovation ecosystems.
          </p>
        </div>
      </section>

      {/* Founder Message */}
      <section className="pub-section pub-section-alt">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">From the Founder</h2>
          <blockquote className="pub-blockquote">
            <p>
              &ldquo;I started Multiverse because I saw a gap in the market: organizations need advisors who
              don&rsquo;t just deliver a strategy deck and walk away. They need partners who stay through
              execution, who can source the talent, connect the capital, and deploy the technology to
              make plans real. That&rsquo;s what we do.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* Our Approach */}
      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">Our Approach</h2>
          <p className="pub-body-text">
            Everything we do follows our <strong>Value Delivery System&trade;</strong> &mdash; a five-phase
            methodology (Discovery, Design, Build, Deploy, Deliver Value) that ensures every engagement
            moves from insight to impact. We don&rsquo;t believe in shelf-ware strategies. We believe in
            outcomes you can measure.
          </p>
          <div className="pub-text-center pub-mt-2">
            <Link to="/value-delivery-system" className="pub-btn pub-btn-outline">
              Explore the Value Delivery System
            </Link>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="pub-section pub-section-alt">
        <div className="pub-container">
          <h2 className="pub-section-title">What Sets Us Apart</h2>
          <div className="pub-grid pub-grid-3">
            {DIFFERENTIATORS.map(d => (
              <div key={d.title} className="pub-card">
                <h3 className="pub-card-title">{d.title}</h3>
                <p className="pub-card-text">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Network */}
      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">Our Advisory Network</h2>
          <p className="pub-body-text">
            Beyond our core team, Multiverse maintains a curated network of senior advisors, industry
            specialists, and functional experts across every domain we serve. When your engagement
            requires deep sector expertise or regional knowledge, we bring in the right people &mdash;
            without the overhead of a large firm.
          </p>
          <p className="pub-body-text">
            Our network spans former C-suite executives, board directors, investment professionals,
            technology leaders, and government advisors across five continents.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Let&rsquo;s Work Together</h2>
          <p className="pub-cta-text">
            Ready to see what senior-led, AI-enabled advisory can do for your organization?
          </p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
