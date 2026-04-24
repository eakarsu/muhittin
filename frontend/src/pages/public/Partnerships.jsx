import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const PARTNER_TYPES = [
  {
    name: 'Consulting Firms',
    desc: 'Boutique and mid-market consulting firms that collaborate on cross-border engagements, bringing complementary domain expertise and local market knowledge.',
  },
  {
    name: 'Technology Providers',
    desc: 'Software vendors, AI platforms, and technology providers whose tools enhance our delivery methodology and accelerate client outcomes.',
  },
  {
    name: 'Regional Advisors',
    desc: 'Senior professionals with deep regional networks who provide on-the-ground intelligence, introductions, and strategic guidance in target markets.',
  },
  {
    name: 'Investors',
    desc: 'Venture capital firms, private equity groups, and family offices seeking co-investment opportunities and deal flow across our global corridor network.',
  },
];

const ENGAGEMENT_STEPS = [
  { num: 1, name: 'Identify', desc: 'We identify alignment between your capabilities and our client needs or strategic goals.' },
  { num: 2, name: 'Connect', desc: 'Structured introductions and scoping conversations to explore collaboration potential.' },
  { num: 3, name: 'Collaborate', desc: 'Joint engagement design with clear roles, deliverables, and compensation structures.' },
  { num: 4, name: 'Deliver', desc: 'Execute together with shared accountability and transparent communication throughout.' },
];

const BENEFITS = [
  'Access to a global pipeline of consulting, search, and investment opportunities',
  'Structured compensation for referrals and co-delivery engagements',
  'Association with a growing boutique advisory brand',
  'Collaborative engagement model that respects your expertise and relationships',
  'Opportunities to work across diverse industries and geographies',
];

const INITIAL_FORM = {
  company_name: '', contact_name: '', email: '', phone: '',
  type: '', region: '', industry: '', notes: '',
};

export default function Partnerships() {
  useSEO('Strategic Partnerships', 'Join our global network of consulting firms, technology providers, regional advisors, and investors.');
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.company_name || !form.contact_name || !form.email || !form.type) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit. Please try again.');
      }
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Strategic Partnerships</h1>
          <p className="pub-hero-subtitle">
            Join our global network of advisors, referral partners, delivery collaborators, and technology providers.
          </p>
        </div>
      </section>

      {/* Partner Types */}
      <section className="pub-section">
        <div className="pub-container">
          <h2 className="pub-section-title">Partnership Types</h2>
          <div className="pub-grid pub-grid-2">
            {PARTNER_TYPES.map(pt => (
              <div key={pt.name} className="pub-card">
                <h3 className="pub-card-title">{pt.name}</h3>
                <p className="pub-card-text">{pt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pub-section pub-section-alt">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">Benefits of Partnering</h2>
          <ul className="pub-list">
            {BENEFITS.map((b, i) => (
              <li key={i} className="pub-list-item">{b}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Engagement Model */}
      <section className="pub-section">
        <div className="pub-container" style={{ textAlign: 'center' }}>
          <h2 className="pub-section-title">Engagement Model</h2>
          <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            A structured approach to building productive partnerships.
          </p>
          <div className="pub-grid pub-grid-4">
            {ENGAGEMENT_STEPS.map(s => (
              <div key={s.num} className="pub-phase-item">
                <span className="pub-phase-num">{s.num}</span>
                <h3 className="pub-phase-name">{s.name}</h3>
                <p className="pub-phase-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Inquiry Form */}
      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">Partnership Inquiry</h2>

          {success ? (
            <div className="pub-success-message">
              <h3>Thank you for your interest.</h3>
              <p>We have received your partnership inquiry and will be in touch within 48 hours.</p>
              <Link to="/" className="pub-btn pub-btn-outline">Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pub-form">
              {error && <div className="pub-form-error">{error}</div>}

              <div className="pub-form-grid">
                <div className="pub-form-group">
                  <label className="pub-label">Company Name *</label>
                  <input type="text" name="company_name" value={form.company_name} onChange={handleChange} className="pub-input" required />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Contact Name *</label>
                  <input type="text" name="contact_name" value={form.contact_name} onChange={handleChange} className="pub-input" required />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="pub-input" required />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="pub-input" />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Partnership Type *</label>
                  <select name="type" value={form.type} onChange={handleChange} className="pub-select" required>
                    <option value="">Select type</option>
                    <option value="Consulting Firm">Consulting Firm</option>
                    <option value="Technology Provider">Technology Provider</option>
                    <option value="Regional Advisor">Regional Advisor</option>
                    <option value="Investor">Investor</option>
                  </select>
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Region</label>
                  <input type="text" name="region" value={form.region} onChange={handleChange} className="pub-input" placeholder="e.g. Middle East, Europe" />
                </div>
                <div className="pub-form-group pub-form-full">
                  <label className="pub-label">Industry</label>
                  <input type="text" name="industry" value={form.industry} onChange={handleChange} className="pub-input" placeholder="e.g. Technology, Healthcare" />
                </div>
                <div className="pub-form-group pub-form-full">
                  <label className="pub-label">Additional Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="pub-textarea" rows="4" placeholder="Tell us about your interest in partnering..." />
                </div>
              </div>

              <button type="submit" className="pub-btn pub-btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
