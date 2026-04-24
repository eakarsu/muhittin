import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function IndustryDetail() {
  const { slug } = useParams();
  const [industry, setIndustry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedInsights, setRelatedInsights] = useState([]);

  useEffect(() => {
    fetch(`/api/industries/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setIndustry(data))
      .catch(() => setIndustry(null))
      .finally(() => setLoading(false));

    fetch('/api/insights')
      .then(res => res.json())
      .then(data => {
        const all = (Array.isArray(data) ? data : data.insights || []).filter(i => i.published);
        const related = all.filter(i => i.domain && i.domain.toLowerCase().includes(slug.replace(/-/g, ' ').split(' ')[0]));
        setRelatedInsights(related.length > 0 ? related.slice(0, 3) : all.slice(0, 3));
      })
      .catch(() => setRelatedInsights([]));
  }, [slug]);

  useSEO(
    industry ? `${industry.name} Advisory` : 'Industry',
    industry ? industry.description : undefined
  );

  if (loading) {
    return (
      <div className="pub-page">
        <section className="pub-section">
          <div className="pub-container pub-text-center">
            <p className="pub-text-muted">Loading industry...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="pub-page">
        <section className="pub-section">
          <div className="pub-container pub-text-center">
            <h1 className="pub-section-title">Industry Not Found</h1>
            <p className="pub-body-text">The industry you are looking for does not exist.</p>
            <Link to="/industries" className="pub-btn pub-btn-outline">Back to Industries</Link>
          </div>
        </section>
      </div>
    );
  }

  const parseList = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) return val.split('. ').map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
    return [];
  };
  const challenges = parseList(industry.challenges);
  const solutions = parseList(industry.solutions);
  const relatedServices = industry.related_services || [];

  return (
    <div className="pub-page">
      {/* Hero */}
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <nav className="pub-breadcrumb">
            <Link to="/industries">Industries</Link> <span>/</span> <span>{industry.name}</span>
          </nav>
          <h1 className="pub-hero-title">{industry.name}</h1>
        </div>
      </section>

      {/* Overview */}
      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <p className="pub-body-text pub-body-text-lg">{industry.description}</p>
        </div>
      </section>

      {/* Challenges */}
      {challenges.length > 0 && (
        <section className="pub-section pub-section-alt">
          <div className="pub-container">
            <h2 className="pub-section-title">Key Challenges</h2>
            <ul className="pub-list pub-list-challenges">
              {challenges.map((challenge, i) => (
                <li key={i} className="pub-list-item">{challenge}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Our Approach */}
      {industry.approach && (
        <section className="pub-section">
          <div className="pub-container pub-content-narrow">
            <h2 className="pub-section-title">Our Approach</h2>
            <p className="pub-body-text">{industry.approach}</p>
          </div>
        </section>
      )}

      {/* Solutions */}
      {solutions.length > 0 && (
        <section className="pub-section pub-section-alt">
          <div className="pub-container">
            <h2 className="pub-section-title">How We Help</h2>
            <ul className="pub-list pub-list-solutions">
              {solutions.map((solution, i) => (
                <li key={i} className="pub-list-item">{solution}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="pub-section">
          <div className="pub-container">
            <h2 className="pub-section-title">Related Services</h2>
            <div className="pub-grid pub-grid-3">
              {relatedServices.map((service) => (
                <div key={service.slug} className="pub-card">
                  <h3 className="pub-card-title">{service.title}</h3>
                  <Link to={`/services/${service.slug}`} className="pub-link">
                    Learn more &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Insights */}
      {relatedInsights.length > 0 && (
        <section className="pub-section pub-section-alt">
          <div className="pub-container">
            <h2 className="pub-section-title">Related Insights</h2>
            <div className="pub-grid pub-grid-3">
              {relatedInsights.map(ins => (
                <Link key={ins.id || ins.slug} to={`/insights/${ins.slug}`} className="pub-card pub-card-link">
                  {ins.category && <span className="pub-badge">{ins.category}</span>}
                  <h3 className="pub-card-title" style={{ marginTop: ins.category ? 14 : 0 }}>{ins.title}</h3>
                  <p className="pub-card-text">{ins.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Ready to Get Started?</h2>
          <p className="pub-cta-text">
            Let us show you how our {industry.name} practice can drive results for your organization.
          </p>
          <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}
