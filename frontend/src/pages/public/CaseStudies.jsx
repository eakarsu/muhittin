import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function CaseStudies() {
  useSEO('Case Studies', 'Real results from real engagements — explore how Multiverse Consulting Group delivers measurable impact.');

  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    fetch('/api/case-studies')
      .then(res => res.json())
      .then(data => setCaseStudies(Array.isArray(data) ? data : []))
      .catch(() => setCaseStudies([]))
      .finally(() => setLoading(false));
  }, []);

  const industries = [...new Set(caseStudies.map(cs => cs.industry).filter(Boolean))];
  const filtered = industryFilter ? caseStudies.filter(cs => cs.industry === industryFilter) : caseStudies;

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Case Studies</h1>
          <p className="pub-hero-subtitle">Real results from real engagements.</p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          {industries.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              <button className={`pub-chip ${!industryFilter ? 'pub-chip-active' : ''}`} onClick={() => setIndustryFilter('')}>All</button>
              {industries.map(ind => (
                <button key={ind} className={`pub-chip ${industryFilter === ind ? 'pub-chip-active' : ''}`} onClick={() => setIndustryFilter(ind)}>{ind}</button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="pub-text-muted">Loading case studies...</p>
          ) : filtered.length === 0 ? (
            <p className="pub-text-muted">No case studies available yet.</p>
          ) : (
            <div className="pub-grid pub-grid-3">
              {filtered.map(cs => (
                <Link key={cs.id || cs.slug} to={`/case-studies/${cs.slug}`} className="pub-card pub-card-link">
                  {cs.industry && <span className="pub-badge">{cs.industry}</span>}
                  <h3 className="pub-card-title" style={{ marginTop: cs.industry ? 14 : 0 }}>{cs.title}</h3>
                  {cs.challenge && (
                    <div style={{ marginTop: 12 }}>
                      <strong style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Challenge</strong>
                      <p className="pub-card-text">{cs.challenge.length > 150 ? cs.challenge.slice(0, 150) + '...' : cs.challenge}</p>
                    </div>
                  )}
                  {cs.result && (
                    <div style={{ marginTop: 8 }}>
                      <strong style={{ fontSize: 12, color: '#0d9488', textTransform: 'uppercase', letterSpacing: 1 }}>Outcome</strong>
                      <p className="pub-card-text">{cs.result.length > 150 ? cs.result.slice(0, 150) + '...' : cs.result}</p>
                    </div>
                  )}
                  <span className="pub-card-arrow">&rarr;</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Ready to Create Your Success Story?</h2>
          <p className="pub-cta-text">Let us show you how our advisory team can deliver measurable results for your organization.</p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
