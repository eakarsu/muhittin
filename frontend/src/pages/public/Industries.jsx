import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function Industries() {
  useSEO('Industries We Serve', 'Deep domain expertise across key sectors — Healthcare, Technology, Financial Services, Education, Real Estate, and more.');

  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/industries')
      .then(res => res.json())
      .then(data => setIndustries(Array.isArray(data) ? data : []))
      .catch(() => setIndustries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Industries We Serve</h1>
          <p className="pub-hero-subtitle">
            Deep domain expertise across key sectors, delivered through our integrated advisory model.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          {loading ? (
            <p className="pub-text-muted">Loading industries...</p>
          ) : industries.length === 0 ? (
            <p className="pub-text-muted">No industries available yet.</p>
          ) : (
            <div className="pub-grid pub-grid-2">
              {industries.map(ind => (
                <Link key={ind.id || ind.slug} to={`/industries/${ind.slug}`} className="pub-card pub-card-link">
                  <h3 className="pub-card-title">{ind.name}</h3>
                  <p className="pub-card-text">{ind.description}</p>
                  <span className="pub-card-arrow">&rarr;</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Don&rsquo;t See Your Industry?</h2>
          <p className="pub-cta-text">
            Our methodology is industry-agnostic. If you have a growth challenge, we can help.
          </p>
          <Link to="/contact" className="pub-btn pub-btn-primary pub-btn-lg">Contact Us</Link>
        </div>
      </section>
    </div>
  );
}
