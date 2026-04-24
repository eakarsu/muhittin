import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const WHAT_TO_EXPECT = [
  { step: '1', title: 'Discovery Call', desc: 'A 30-minute conversation to understand your goals, challenges, and current situation.' },
  { step: '2', title: 'Needs Assessment', desc: 'We analyze your requirements and match you with the right advisory team and service package.' },
  { step: '3', title: 'Proposal & Roadmap', desc: 'Within 48 hours, you receive a tailored proposal with clear deliverables and timeline.' },
  { step: '4', title: 'Engagement Kickoff', desc: 'Once approved, we hit the ground running with our Value Delivery System methodology.' },
];

const SERVICES = [
  { value: 'Strategy & Growth', icon: '📊' },
  { value: 'Global Expansion', icon: '🌍' },
  { value: 'Talent & Executive Search', icon: '👥' },
  { value: 'Investment Advisory', icon: '💰' },
  { value: 'AI Transformation', icon: '⚡' },
  { value: 'Other', icon: '💬' },
];

function CalendlyEmbed({ name, email, topic }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const initWidget = () => {
      if (window.Calendly && containerRef.current) {
        containerRef.current.innerHTML = '';

        // Build URL with prefill params
        const params = new URLSearchParams();
        if (name) params.set('name', name);
        if (email) params.set('email', email);
        // a1 = first custom question answer (meeting topic)
        if (topic) params.set('a1', topic);

        const url = `https://calendly.com/eakarsu/new-meeting?${params.toString()}`;

        window.Calendly.initInlineWidget({
          url,
          parentElement: containerRef.current,
        });
      }
    };

    if (window.Calendly) {
      initWidget();
    } else {
      const check = setInterval(() => {
        if (window.Calendly) {
          clearInterval(check);
          initWidget();
        }
      }, 200);
      return () => clearInterval(check);
    }
  }, [name, email, topic]);

  return (
    <div
      ref={containerRef}
      style={{ minWidth: 320, height: 700 }}
    />
  );
}

export default function BookConsultation() {
  useSEO('Book a Consultation', 'Schedule a discovery call with our advisory team to explore how we can help your organization grow.');
  const [searchParams] = useSearchParams();
  const preselectedPackage = searchParams.get('package') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState(preselectedPackage ? `Interested in: ${preselectedPackage}` : '');
  const [showCalendly, setShowCalendly] = useState(false);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetch('/api/service-packages')
      .then(res => res.json())
      .then(data => {
        const list = (Array.isArray(data) ? data : data.packages || []).filter(p => p.active);
        setPackages(list.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Contact Us';
    return '$' + Number(price).toLocaleString('en-US');
  };

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Book a Consultation</h1>
          <p className="pub-hero-subtitle">
            Schedule a conversation with a senior advisor. No obligation, no sales pitch &mdash; just a focused discussion about your growth objectives.
          </p>
        </div>
      </section>

      {/* Step 1: Collect details before showing Calendly */}
      {!showCalendly ? (
        <div style={{ padding: '64px 0' }}>
          <div className="pub-container" style={{ maxWidth: 680, textAlign: 'center' }}>
            <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Step 1</h3>
            <h2 className="pub-section-title">Tell Us About Yourself</h2>
            <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              We'll personalize your booking experience.
            </p>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="pub-form-group">
                <label htmlFor="book-name" className="pub-label">Your Name</label>
                <input
                  id="book-name"
                  className="pub-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="pub-form-group">
                <label htmlFor="book-email" className="pub-label">Email</label>
                <input
                  id="book-email"
                  className="pub-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
              <div className="pub-form-group">
                <label className="pub-label">What are you interested in?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
                  {SERVICES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedService(s.value)}
                      style={{
                        padding: '16px 12px',
                        borderRadius: 12,
                        border: selectedService === s.value ? '2px solid #0f766e' : '2px solid #e2e8f0',
                        background: selectedService === s.value ? 'rgba(15,118,110,0.06)' : '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        color: selectedService === s.value ? '#0f766e' : '#334155',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="pub-btn pub-btn-primary pub-btn-lg"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => setShowCalendly(true)}
              >
                Continue to Schedule &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Calendly with prefilled data */
        <div style={{ padding: '64px 0', textAlign: 'center' }}>
          <div className="pub-container">
            <h3 style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Step 2</h3>
            <h2 className="pub-section-title">Pick a Time</h2>
            <p className="pub-section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              {name ? `Hi ${name}! ` : ''}Select a convenient time for your {selectedService || 'consultation'} discussion.
            </p>
            <button
              className="pub-btn pub-btn-secondary"
              style={{ marginBottom: 24 }}
              onClick={() => setShowCalendly(false)}
            >
              &larr; Back
            </button>
            <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <CalendlyEmbed
                name={name}
                email={email}
                topic={selectedService}
              />
            </div>
          </div>
        </div>
      )}

      {/* What to Expect */}
      <section className="pub-section">
        <div className="pub-container">
          <h2 className="pub-section-title">What to Expect</h2>
          <p className="pub-section-subtitle">Our consultation process is designed to deliver value from the very first conversation.</p>
          <div className="pub-grid pub-grid-4">
            {WHAT_TO_EXPECT.map(item => (
              <div key={item.step} className="pub-card pub-card-center">
                <span className="pub-phase-num">{item.step}</span>
                <h3 className="pub-card-title">{item.title}</h3>
                <p className="pub-card-text">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Packages */}
      {packages.length > 0 && (
        <div className="pub-section-alt">
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
            <h2 className="pub-section-title">Popular Packages</h2>
            <p className="pub-section-subtitle">Explore our predefined engagement packages.</p>
            <div className="pub-grid pub-grid-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="pub-card pub-card-package">
                  {pkg.domain && <span className="pub-badge pub-badge-alt">{pkg.domain}</span>}
                  <h3 className="pub-card-title">{pkg.name}</h3>
                  <p className="pub-package-price">
                    {formatPrice(pkg.price)}
                    {pkg.price_type === 'monthly' && <span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}>/mo</span>}
                  </p>
                  <p className="pub-card-text">{pkg.description}</p>
                  {pkg.delivery_workflow && (
                    <p className="pub-card-meta"><strong>Delivery:</strong> {pkg.delivery_workflow}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="pub-text-center pub-mt-2">
              <Link to="/packages" className="pub-btn pub-btn-outline">View All Packages</Link>
            </div>
          </div>
        </div>
      )}

      {/* Trust / CTA */}
      <section className="pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Why Work With Us?</h2>
          <div className="pub-grid pub-grid-3" style={{ marginTop: 32, textAlign: 'left', maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="pub-card pub-card-center">
              <h3 className="pub-card-title">Senior Advisors Only</h3>
              <p className="pub-card-text">Every consultation is led by a partner-level advisor with 15+ years of industry experience.</p>
            </div>
            <div className="pub-card pub-card-center">
              <h3 className="pub-card-title">No Obligation</h3>
              <p className="pub-card-text">Our initial consultation is complimentary. We earn your business through insight, not pressure.</p>
            </div>
            <div className="pub-card pub-card-center">
              <h3 className="pub-card-title">Actionable Next Steps</h3>
              <p className="pub-card-text">You leave every conversation with clear, actionable recommendations you can implement immediately.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
