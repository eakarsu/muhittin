import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/case-studies/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setStudy(data))
      .catch(() => setStudy(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useSEO(
    study ? study.title : 'Case Study',
    study ? `${study.title} - A ${study.industry} case study from Multiverse Consulting Group.` : undefined
  );

  if (loading) {
    return (
      <div className="pub-page">
        <section className="pub-section">
          <div className="pub-container pub-text-center">
            <p className="pub-text-muted">Loading case study...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="pub-page">
        <section className="pub-section">
          <div className="pub-container pub-text-center">
            <h1 className="pub-section-title">Case Study Not Found</h1>
            <p className="pub-body-text">The case study you are looking for does not exist.</p>
            <Link to="/case-studies" className="pub-btn pub-btn-outline">Back to Case Studies</Link>
          </div>
        </section>
      </div>
    );
  }

  const metrics = Array.isArray(study.metrics) ? study.metrics : [];

  return (
    <div className="pub-page">
      {/* Hero */}
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <nav className="pub-breadcrumb">
            <Link to="/case-studies">Case Studies</Link> <span>/</span> <span>{study.title}</span>
          </nav>
          <h1 className="pub-hero-title">{study.title}</h1>
          <p className="pub-hero-subtitle">{study.industry}</p>
        </div>
      </section>

      {/* Metrics Bar */}
      {metrics.length > 0 && (
        <section className="pub-section pub-section-alt">
          <div className="pub-container">
            <div className="pub-grid pub-grid-4">
              {metrics.map((m, i) => (
                <div key={i} className="pub-card pub-text-center">
                  <div className="pub-card-title" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{m.value}</div>
                  <p className="pub-card-text pub-text-muted">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Challenge */}
      {study.challenge && (
        <section className="pub-section">
          <div className="pub-container pub-content-narrow">
            <h2 className="pub-section-title pub-text-left">The Challenge</h2>
            <p className="pub-body-text">{study.challenge}</p>
          </div>
        </section>
      )}

      {/* Our Approach */}
      {study.approach && (
        <section className="pub-section pub-section-alt">
          <div className="pub-container pub-content-narrow">
            <h2 className="pub-section-title pub-text-left">Our Approach</h2>
            <p className="pub-body-text">{study.approach}</p>
          </div>
        </section>
      )}

      {/* Results */}
      {study.result && (
        <section className="pub-section">
          <div className="pub-container pub-content-narrow">
            <h2 className="pub-section-title pub-text-left">Results</h2>
            <p className="pub-body-text">{study.result}</p>
          </div>
        </section>
      )}

      {/* Impact */}
      {study.impact && (
        <section className="pub-section pub-section-alt">
          <div className="pub-container pub-content-narrow">
            <h2 className="pub-section-title pub-text-left">Impact</h2>
            <p className="pub-body-text">{study.impact}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pub-section pub-cta-section">
        <div className="pub-container pub-text-center">
          <h2 className="pub-cta-title">Ready to Achieve Similar Results?</h2>
          <p className="pub-cta-text">
            Every engagement begins with understanding your unique challenges. Let us show you how we can help.
          </p>
          <div>
            <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-btn-lg">Book a Consultation</Link>
            <span style={{ display: 'inline-block', width: '1rem' }} />
            <Link to="/case-studies" className="pub-btn pub-btn-outline pub-btn-lg">View All Case Studies</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
