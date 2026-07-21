import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const INITIAL_FORM = {
  company_name: '', contact_name: '', email: '', phone: '',
  opportunity_type: '', description: '', region: '', budget_range: '',
};

export default function SubmitOpportunity() {
  useSEO('Submit Opportunity', 'Submit a business opportunity to Multiverse Consulting Group for advisory, investment, or partnership consideration.');
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submissionKey, setSubmissionKey] = useState(() => crypto.randomUUID());

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.company_name || !form.contact_name || !form.email || !form.opportunity_type || !form.description || !consent) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submissionKey },
        body: JSON.stringify({ ...form, consent }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) setSubmissionKey(crypto.randomUUID());
        throw new Error(data.error || 'Failed to submit opportunity. Please try again.');
      }
      const result = await res.json();
      setReference(result.id);
      setSuccess(true);
      setForm(INITIAL_FORM);
      setConsent(false);
      setSubmissionKey(crypto.randomUUID());
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
          <h1 className="pub-hero-title">Submit an Opportunity</h1>
          <p className="pub-hero-subtitle">
            Have a project, deal, or engagement you would like to discuss? Tell us about it and we will follow up within 48 hours.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          {success ? (
            <div className="pub-success-message">
              <h3>Opportunity Submitted</h3>
              <p>Thank you for submitting this opportunity. Our team will review it and reach out to discuss next steps.</p>
              <p>Reference: <strong>{reference}</strong></p>
              <Link to="/" className="pub-btn pub-btn-outline">Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pub-form">
              {error && <div className="pub-form-error">{error}</div>}

              <div className="pub-form-grid">
                <div className="pub-form-group">
                  <label className="pub-label">Company Name *</label>
                  <input type="text" name="company_name" value={form.company_name} onChange={handleChange} className="pub-input" minLength="2" maxLength="255" autoComplete="organization" required />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Contact Name *</label>
                  <input type="text" name="contact_name" value={form.contact_name} onChange={handleChange} className="pub-input" minLength="2" maxLength="255" autoComplete="name" required />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="pub-input" maxLength="255" autoComplete="email" required />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="pub-input" maxLength="50" autoComplete="tel" />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Opportunity Type *</label>
                  <select name="opportunity_type" value={form.opportunity_type} onChange={handleChange} className="pub-select" required>
                    <option value="">Select type</option>
                    <option value="Consulting Project">Consulting Project</option>
                    <option value="Executive Search">Executive Search</option>
                    <option value="Investment Deal">Investment Deal</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Budget Range</label>
                  <select name="budget_range" value={form.budget_range} onChange={handleChange} className="pub-select">
                    <option value="">Select range</option>
                    <option value="$10k-$50k">$10k - $50k</option>
                    <option value="$50k-$100k">$50k - $100k</option>
                    <option value="$100k-$250k">$100k - $250k</option>
                    <option value="$250k-$500k">$250k - $500k</option>
                    <option value="$500k+">$500k+</option>
                  </select>
                </div>
                <div className="pub-form-group pub-form-full">
                  <label className="pub-label">Region</label>
                  <input type="text" name="region" value={form.region} onChange={handleChange} className="pub-input" maxLength="100" autoComplete="country-name" placeholder="e.g. Middle East, Southeast Asia" />
                </div>
                <div className="pub-form-group pub-form-full">
                  <label className="pub-label">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} className="pub-textarea" rows="5" minLength="20" maxLength="5000" required placeholder="Describe the opportunity, including context, objectives, and timeline..." />
                </div>
              </div>

              <label className="pub-label" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
                <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required />
                <span>I consent to MCG using these details to evaluate and respond to this opportunity.</span>
              </label>

              <button type="submit" className="pub-btn pub-btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Opportunity'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
