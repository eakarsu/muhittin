import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import useSEO from '../../hooks/useSEO';

export default function InsightDetail() {
  const { slug } = useParams();
  const [insight, setInsight] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/insights/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Insight not found');
        return res.json();
      })
      .then(data => {
        setInsight(data);
        // Fetch related insights
        fetch('/api/insights')
          .then(r => r.json())
          .then(all => {
            const list = Array.isArray(all) ? all : all.insights || [];
            const filtered = list
              .filter(i => i.published && i.slug !== slug)
              .slice(0, 3);
            setRelated(filtered);
          })
          .catch(() => {});
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useSEO(insight?.title, insight?.summary);

  if (loading) {
    return (
      <div className="pub-page">
        <section className="pub-section">
          <div className="pub-container pub-text-center">
            <p className="pub-text-muted">Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="pub-page">
        <section className="pub-section">
          <div className="pub-container pub-text-center">
            <h1 className="pub-section-title">Insight Not Found</h1>
            <p className="pub-body-text">{error || 'The insight you are looking for does not exist.'}</p>
            <Link to="/insights" className="pub-btn pub-btn-outline">Back to Insights</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pub-page">
      <section className="pub-hero pub-hero-sm">
        <div className="pub-container">
          <nav className="pub-breadcrumb">
            <Link to="/insights">Insights</Link> <span>/</span> <span>{insight.title}</span>
          </nav>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-container pub-content-narrow">
          <article className="pub-article">
            <header className="pub-article-header">
              <div className="pub-card-badges">
                {insight.category && <span className="pub-badge">{insight.category}</span>}
                {insight.domain && <span className="pub-badge pub-badge-alt">{insight.domain}</span>}
              </div>
              <h1 className="pub-article-title">{insight.title}</h1>
              <div className="pub-article-meta">
                {insight.author && <span className="pub-article-author">By {insight.author}</span>}
                {insight.created_at && (
                  <time className="pub-article-date">
                    {new Date(insight.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </time>
                )}
              </div>
            </header>

            {insight.summary && (
              <p className="pub-article-summary">{insight.summary}</p>
            )}

            <div className="pub-article-content">
              <ReactMarkdown>{insight.content || ''}</ReactMarkdown>
            </div>
          </article>
        </div>
      </section>

      {/* Related Insights */}
      {related.length > 0 && (
        <section className="pub-section">
          <div className="pub-container">
            <h2 className="pub-section-title">Related Insights</h2>
            <div className="pub-grid pub-grid-3">
              {related.map(r => (
                <Link key={r.id || r.slug} to={`/insights/${r.slug}`} className="pub-card pub-card-link">
                  <span className="pub-badge">{r.category || 'Insight'}</span>
                  <h3 className="pub-card-title" style={{ marginTop: 14 }}>{r.title}</h3>
                  <p className="pub-card-text">{r.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pub-section pub-section-alt">
        <div className="pub-container pub-text-center">
          <h2 className="pub-section-title">Want to Discuss This Topic?</h2>
          <p className="pub-body-text">
            Our advisory team is available to explore how these insights apply to your organization.
          </p>
          <div className="pub-hero-ctas">
            <Link to="/book-consultation" className="pub-btn pub-btn-primary">Book a Consultation</Link>
            <Link to="/insights" className="pub-btn pub-btn-outline">More Insights</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
