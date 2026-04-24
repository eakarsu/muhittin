import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const INITIAL_FORM = {
  name: '', email: '', phone: '', industry: '',
  experience_years: '', region: '', role_level: '',
  compensation_min: '', compensation_max: '',
  skills: '', linkedin_url: '', availability: '',
};

export default function JoinTalentNetwork() {
  useSEO('Join Talent Network', 'Join the Multiverse Consulting Group talent network — connect with executive search and leadership placement opportunities.');
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
    if (!form.name || !form.email || !form.role_level) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
          compensation_min: form.compensation_min ? parseInt(form.compensation_min, 10) : null,
          compensation_max: form.compensation_max ? parseInt(form.compensation_max, 10) : null,
        }),
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
          <h1 className="pub-hero-title">Join Our Talent Network</h1>
          <p className="pub-hero-subtitle">
            Connect with high-impact leadership opportunities across industries and geographies.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <p className="pub-body-text">
            Multiverse maintains an exclusive network of senior executives, functional leaders, and
            specialized professionals. Our talent network members gain access to curated opportunities
            with high-growth companies, PE-backed platforms, and global enterprises. We respect your
            privacy and will only contact you about roles that match your profile and preferences.
          </p>
        </div>
      </section>

      <section className="pub-section pub-section-alt">
        <div className="pub-container pub-content-narrow">
          <h2 className="pub-section-title">Your Profile</h2>

          {success ? (
            <div className="pub-success-message">
              <h3>Welcome to the Network</h3>
              <p>
                Thank you for joining our talent network. We will review your profile and reach out
                when we identify opportunities that match your experience and preferences.
              </p>
              <Link to="/" className="pub-btn pub-btn-outline">Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pub-form">
              {error && <div className="pub-form-error">{error}</div>}

              <div className="pub-form-grid">
                <div className="pub-form-group">
                  <label className="pub-label">Full Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="pub-input" required />
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
                  <label className="pub-label">Industry</label>
                  <input type="text" name="industry" value={form.industry} onChange={handleChange} className="pub-input" placeholder="e.g. Technology, Healthcare" />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Years of Experience</label>
                  <input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} className="pub-input" min="0" max="50" />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Region</label>
                  <input type="text" name="region" value={form.region} onChange={handleChange} className="pub-input" placeholder="e.g. Middle East, Europe" />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Role Level *</label>
                  <select name="role_level" value={form.role_level} onChange={handleChange} className="pub-select" required>
                    <option value="">Select level</option>
                    <option value="C-Suite">C-Suite</option>
                    <option value="VP">VP</option>
                    <option value="Director">Director</option>
                    <option value="Manager">Manager</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Availability</label>
                  <select name="availability" value={form.availability} onChange={handleChange} className="pub-select">
                    <option value="">Select availability</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 1 Month">Within 1 Month</option>
                    <option value="Within 3 Months">Within 3 Months</option>
                    <option value="Passive/Open to Opportunities">Passive / Open to Opportunities</option>
                  </select>
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Minimum Compensation (USD)</label>
                  <input type="number" name="compensation_min" value={form.compensation_min} onChange={handleChange} className="pub-input" placeholder="e.g. 150000" />
                </div>
                <div className="pub-form-group">
                  <label className="pub-label">Maximum Compensation (USD)</label>
                  <input type="number" name="compensation_max" value={form.compensation_max} onChange={handleChange} className="pub-input" placeholder="e.g. 250000" />
                </div>
                <div className="pub-form-group pub-form-full">
                  <label className="pub-label">LinkedIn URL</label>
                  <input type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} className="pub-input" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="pub-form-group pub-form-full">
                  <label className="pub-label">Key Skills & Expertise</label>
                  <textarea name="skills" value={form.skills} onChange={handleChange} className="pub-textarea" rows="4" placeholder="Describe your core competencies, functional expertise, and any notable achievements..." />
                </div>
              </div>

              <button type="submit" className="pub-btn pub-btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Join the Network'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
