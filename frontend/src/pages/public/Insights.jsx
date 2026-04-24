import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

const capitalize = (str) => str.replace(/\b\w/g, c => c.toUpperCase());

export default function Insights() {
  useSEO('Insights', 'Perspectives on strategy, growth, and transformation from our senior advisory team.');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetch('/api/insights')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load insights');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : data.insights || [];
        setInsights(list.filter(i => i.published));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const domains = [...new Set(insights.map(i => i.domain).filter(Boolean))];
  const categories = [...new Set(insights.map(i => i.category).filter(Boolean))];

  const filtered = insights.filter(i => {
    if (domainFilter && i.domain !== domainFilter) return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Insights</h1>
          <p className="pub-hero-subtitle">
            Perspectives on strategy, growth, talent, investment, and AI from our senior advisory team.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          {/* Filters */}
          {(domains.length > 0 || categories.length > 0) && (
            <div className="pub-filters">
              {domains.length > 0 && (
                <select
                  className="pub-select"
                  value={domainFilter}
                  onChange={e => setDomainFilter(e.target.value)}
                >
                  <option value="">All Domains</option>
                  {domains.map(d => (
                    <option key={d} value={d}>{capitalize(d)}</option>
                  ))}
                </select>
              )}
              {categories.length > 0 && (
                <select
                  className="pub-select"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{capitalize(c)}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {loading ? (
            <p className="pub-text-center pub-text-muted">Loading insights...</p>
          ) : error ? (
            <p className="pub-text-center pub-text-error">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="pub-text-center pub-text-muted">No insights found. Check back soon.</p>
          ) : (
            <div className="pub-grid pub-grid-3">
              {filtered.map(ins => (
                <Link
                  key={ins.id || ins.slug}
                  to={`/insights/${ins.slug}`}
                  className="pub-card pub-card-link pub-card-article"
                >
                  <div className="pub-card-badges">
                    {ins.category && <span className="pub-badge">{ins.category}</span>}
                    {ins.domain && <span className="pub-badge pub-badge-alt">{ins.domain}</span>}
                  </div>
                  <h3 className="pub-card-title">{ins.title}</h3>
                  <p className="pub-card-text">{ins.summary}</p>
                  <div className="pub-card-meta">
                    {ins.author && <span>{ins.author}</span>}
                    {ins.created_at && (
                      <span>{new Date(ins.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Want to Discuss a Topic?</h2>
          <p className="pub-cta-text">Our senior advisors are available to explore how these insights apply to your organization.</p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
