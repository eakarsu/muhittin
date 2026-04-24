import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../../hooks/useSEO';

export default function ServicePackages() {
  useSEO('Service Packages', 'Explore our consulting service packages — transparent pricing for strategy, talent, expansion, and AI advisory engagements.');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/service-packages')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load packages');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : data.packages || [];
        setPackages(list);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Contact Us';
    return '$' + Number(price).toLocaleString('en-US');
  };

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <h1 className="pub-hero-title">Service Packages</h1>
          <p className="pub-hero-subtitle">
            Predefined engagement packages designed to deliver focused results. Choose the package that fits your needs, or contact us for a custom engagement.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container">
          {loading ? (
            <p className="pub-text-center pub-text-muted">Loading packages...</p>
          ) : error ? (
            <p className="pub-text-center pub-text-error">{error}</p>
          ) : packages.length === 0 ? (
            <div className="pub-text-center">
              <p className="pub-text-muted">No packages available at this time.</p>
              <Link to="/book-consultation" className="pub-btn pub-btn-primary pub-mt-2">Book a Custom Consultation</Link>
            </div>
          ) : (
            <div className="pub-grid pub-grid-3">
              {packages.map(pkg => (
                <div key={pkg.id || pkg.name} className="pub-card pub-card-package">
                  {pkg.domain && <span className="pub-badge pub-badge-alt">{pkg.domain}</span>}
                  <h3 className="pub-card-title">{pkg.name}</h3>
                  <p className="pub-package-price">{formatPrice(pkg.price)}</p>
                  <p className="pub-card-text">{pkg.description}</p>
                  {pkg.delivery_workflow && (
                    <p className="pub-card-meta">
                      <strong>Delivery:</strong> {pkg.delivery_workflow}
                    </p>
                  )}
                  <Link
                    to={`/book-consultation?package=${encodeURIComponent(pkg.name)}`}
                    className="pub-btn pub-btn-primary pub-btn-block"
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pub-section pub-section-alt">
        <div className="pub-container pub-text-center">
          <h2 className="pub-section-title">Need Something Custom?</h2>
          <p className="pub-body-text">
            Our packages are starting points. We tailor every engagement to your specific objectives, timeline, and budget.
          </p>
          <Link to="/book-consultation" className="pub-btn pub-btn-outline">Discuss a Custom Engagement</Link>
        </div>
      </section>
    </div>
  );
}
