import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const TEAM_MEMBERS = [
  {
    name: 'Muhittin Akarsu',
    initials: 'MA',
    title: 'Founder & CEO',
    bio: 'Over two decades of experience in strategy consulting and global business development, bridging the gap between strategy and execution across the Middle East, Southeast Asia, and Europe.',
    expertise: ['Strategy', 'Global Expansion', 'AI Transformation'],
  },
  {
    name: 'Sarah Chen',
    initials: 'SC',
    title: 'Managing Director, Strategy & Growth',
    bio: '15 years of strategy consulting experience from top-tier firms. Leads the Strategy & Growth practice, helping organizations develop actionable growth roadmaps.',
    expertise: ['Strategy', 'Growth Advisory', 'Market Positioning'],
  },
  {
    name: 'James Morrison',
    initials: 'JM',
    title: 'Director, Global Expansion',
    bio: 'Led market entry projects across 30+ countries. Specializes in regulatory navigation, partner networks, and go-to-market strategy for new geographies.',
    expertise: ['Market Entry', 'Regulatory', 'Partnerships'],
  },
  {
    name: 'Amira Al-Rashid',
    initials: 'AA',
    title: 'Director, Talent & Executive Search',
    bio: 'Deep expertise in executive recruitment across emerging markets. Placed over 200 C-suite and senior executives in technology, financial services, and energy.',
    expertise: ['Executive Search', 'Talent Strategy', 'Middle East'],
  },
  {
    name: 'David Park',
    initials: 'DP',
    title: 'Director, Investment Advisory',
    bio: 'Investment banking and deal advisory experience from leading global institutions. Advises on capital raising, M&A structuring, and cross-border transactions.',
    expertise: ['M&A', 'Capital Raising', 'Deal Structuring'],
  },
  {
    name: 'Dr. Nina Patel',
    initials: 'NP',
    title: 'Director, AI Transformation',
    bio: 'Combines deep technical expertise with business strategy. PhD in Machine Learning with over 50 AI transformation projects delivered across industries.',
    expertise: ['AI Strategy', 'Machine Learning', 'Change Management'],
  },
];

export default function Team() {
  useSEO('Leadership', 'Meet the senior advisors and practitioners who lead every Multiverse Consulting Group engagement.');

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Leadership Team</h1>
          <p className="pub-hero-subtitle">
            Every engagement is led by senior practitioners with deep domain expertise &mdash; not junior analysts learning on your project.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          <div className="pub-grid pub-grid-3">
            {TEAM_MEMBERS.map(member => (
              <div key={member.name} className="pub-card" style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    margin: '0 auto 1rem',
                    border: '3px solid #cbd5e1',
                  }}
                >
                  {member.initials}
                </div>
                <h3 className="pub-card-title">{member.name}</h3>
                <p style={{ color: '#0d9488', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{member.title}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {member.expertise.map(tag => (
                    <span key={tag} className="pub-chip" style={{ fontSize: 11, padding: '4px 10px' }}>{tag}</span>
                  ))}
                </div>
                <p className="pub-card-text" style={{ fontSize: '0.85rem' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section-alt">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">Our Advisory Network</h2>
          <p className="pub-body-text">
            We work with a global network of senior advisors, industry experts, and operational specialists
            who bring domain-specific expertise to every engagement.
          </p>
        </div>
      </section>

      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Work With Us</h2>
          <p className="pub-cta-text">
            Interested in joining our team or engaging our leadership for your next project?
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/join-talent-network" className="pub-btn pub-btn-outline">Join Our Team</Link>
            <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
