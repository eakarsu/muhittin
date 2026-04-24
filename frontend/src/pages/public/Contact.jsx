import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const INITIAL_FORM = {
  name: '', email: '', company: '', country: '',
  service_interest: '', message: '',
};

export default function Contact() {
  useSEO('Contact Us', 'Get in touch with our advisory team to discuss how Multiverse Consulting Group can help your organization grow.');
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
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/consultations', {
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
          <h1 className="pub-hero-title">Get in Touch</h1>
          <p className="pub-hero-subtitle">
            We would love to hear from you. Reach out to discuss how we can help your organization grow.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          <div className="pub-contact-layout">
            {/* Form */}
            <div className="pub-contact-form-col">
              {success ? (
                <div className="pub-success-message">
                  <h3>Message Received</h3>
                  <p>Thank you. MCG will contact you within 24 hours.</p>
                  <Link to="/" className="pub-btn pub-btn-outline">Back to Home</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="pub-form">
                  {error && <div className="pub-form-error">{error}</div>}

                  <div className="pub-form-grid">
                    <div className="pub-form-group">
                      <label htmlFor="contact-name" className="pub-label">Name *</label>
                      <input id="contact-name" type="text" name="name" value={form.name} onChange={handleChange} className="pub-input" required />
                    </div>
                    <div className="pub-form-group">
                      <label htmlFor="contact-email" className="pub-label">Email *</label>
                      <input id="contact-email" type="email" name="email" value={form.email} onChange={handleChange} className="pub-input" required />
                    </div>
                    <div className="pub-form-group">
                      <label htmlFor="contact-company" className="pub-label">Company</label>
                      <input id="contact-company" type="text" name="company" value={form.company} onChange={handleChange} className="pub-input" />
                    </div>
                    <div className="pub-form-group">
                      <label htmlFor="contact-country" className="pub-label">Country</label>
                      <input id="contact-country" type="text" name="country" value={form.country} onChange={handleChange} className="pub-input" placeholder="e.g. United States, UAE, Singapore" />
                    </div>
                    <div className="pub-form-group pub-form-full">
                      <label htmlFor="contact-service" className="pub-label">Service of Interest</label>
                      <select id="contact-service" name="service_interest" value={form.service_interest} onChange={handleChange} className="pub-select">
                        <option value="">Select a service</option>
                        <option value="Strategy">Strategy & Growth</option>
                        <option value="Expansion">Global Expansion</option>
                        <option value="Talent">Talent & Executive Search</option>
                        <option value="Investment">Investment Advisory</option>
                        <option value="AI">AI Transformation</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="pub-form-group pub-form-full">
                      <label htmlFor="contact-message" className="pub-label">Message *</label>
                      <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} className="pub-textarea" rows="5" required placeholder="How can we help?" />
                    </div>
                  </div>

                  <button type="submit" className="pub-btn pub-btn-primary" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="pub-contact-sidebar">
              <div className="pub-card">
                <h3 className="pub-card-title">Contact Information</h3>
                <div className="pub-contact-info">
                  <div className="pub-contact-info-item">
                    <strong>Email</strong>
                    <span>contact@multiverseinvestment.com</span>
                  </div>
                  <div className="pub-contact-info-item">
                    <strong>Response Time</strong>
                    <span>Within 24 hours</span>
                  </div>
                  <div className="pub-contact-info-item">
                    <strong>Offices</strong>
                    <span>Chicago | London | Germany | Turkey | Dubai | Singapore | South Korea | China</span>
                  </div>
                </div>
              </div>

              <div className="pub-card pub-mt-1">
                <h3 className="pub-card-title">Quick Links</h3>
                <ul className="pub-sidebar-links">
                  <li><Link to="/book-consultation" className="pub-link">Book a Consultation</Link></li>
                  <li><Link to="/submit-opportunity" className="pub-link">Submit an Opportunity</Link></li>
                  <li><Link to="/partnerships" className="pub-link">Become a Partner</Link></li>
                  <li><Link to="/join-talent-network" className="pub-link">Join Talent Network</Link></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
