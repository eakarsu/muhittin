import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const scoreColor = (score) => {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#f59e0b';
  if (score >= 60) return '#f97316';
  return '#ef4444';
};

const scoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Average';
  if (score >= 60) return 'Below Avg';
  return 'Poor';
};

export default function SEO() {
  const { api } = useAuth();
  const [audits, setAudits] = useState([]);
  const [top3, setTop3] = useState([]);
  const [stats, setStats] = useState({});
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [keywords, setKeywords] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/seo'),
      api('/api/seo/top?limit=3'),
      api('/api/seo/stats'),
      api('/api/seo/report/categories')
    ]).then(([a, t, s, c]) => {
      setAudits(a);
      setTop3(t);
      setStats(s);
      setCategories(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openDetail = async (audit) => {
    setSelected(audit);
    try {
      const kw = await api(`/api/seo/${audit.business_id}/keywords`);
      setKeywords(kw);
    } catch { setKeywords([]); }
  };


  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>SEO Dashboard</h1><p className="subtitle">Monitor and improve local search rankings</p></div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-number">{stats.avg_score || 0}</div><div className="stat-label">Avg SEO Score</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: '#22c55e' }}>{stats.high_performers || 0}</div><div className="stat-label">High Performers (80+)</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: '#ef4444' }}>{stats.needs_work || 0}</div><div className="stat-label">Needs Work (&lt;50)</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: '#f59e0b' }}>{stats.no_schema || 0}</div><div className="stat-label">Missing Schema</div></div>
      </div>

      {/* Top 3 */}
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Top 3 SEO Performers</h2>
      <div style={{ marginBottom: 24 }}>
        <SortableTable
          data={top3}
          searchPlaceholder="Search top performers..."
          onRowClick={openDetail}
          columns={[
            { key: '_rank', label: '#', render: (t) => <span style={{ fontWeight: 700, fontSize: 18 }}>{top3.indexOf(t) + 1}</span>, sortValue: (t) => top3.indexOf(t) + 1 },
            { key: 'business_name', label: 'Business', render: (t) => <><span style={{ fontWeight: 600 }}>{t.business_name}</span><br /><span style={{ fontSize: 11, color: '#888' }}>{t.city}, {t.state}</span></>, style: { fontWeight: 600 } },
            { key: 'category', label: 'Category', render: (t) => <span className="badge">{t.category}</span> },
            { key: 'overall_score', label: 'Score', render: (t) => <span style={{ fontWeight: 800, color: scoreColor(t.overall_score), fontSize: 18 }}>{t.overall_score}</span> },
            { key: 'monthly_clicks', label: 'Clicks/mo', render: (t) => Number(t.monthly_clicks).toLocaleString(), sortValue: (t) => Number(t.monthly_clicks) },
            { key: 'reviews_count', label: 'Reviews', render: (t) => Number(t.reviews_count).toLocaleString(), sortValue: (t) => Number(t.reviews_count) },
            { key: 'domain_authority', label: 'Domain Auth' },
          ]}
        />
      </div>

      {/* Category Performance */}
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Category Performance</h2>
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        {categories.map(c => (
          <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 120, fontSize: 13, fontWeight: 600 }}>{c.category}</div>
            <div style={{ flex: 1, height: 24, background: '#f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${c.avg_score}%`, background: scoreColor(c.avg_score), borderRadius: 12, transition: 'width 0.5s' }}></div>
            </div>
            <div style={{ width: 40, fontSize: 14, fontWeight: 700, textAlign: 'right', color: scoreColor(c.avg_score) }}>{c.avg_score}</div>
            <div style={{ width: 80, fontSize: 11, color: '#888' }}>{c.min_score}-{c.max_score}</div>
          </div>
        ))}
      </div>

      {/* All Businesses */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>All Businesses</h2>

      {/* Business Table */}
      <div style={{ marginBottom: 24 }}>
        <SortableTable
          data={audits}
          searchPlaceholder="Search businesses..."
          onRowClick={openDetail}
          columns={[
            { key: 'business_name', label: 'Business', style: { fontWeight: 500 } },
            { key: 'category', label: 'Category', render: (a) => <span className="badge">{a.category}</span> },
            { key: 'overall_score', label: 'Score', render: (a) => <span style={{ fontWeight: 700, color: scoreColor(a.overall_score), fontSize: 15 }}>{a.overall_score}</span>, style: { textAlign: 'center' } },
            { key: 'google_business_claimed', label: 'GBP', render: (a) => a.google_business_claimed ? '\u2705' : '\u274C', style: { textAlign: 'center' }, sortValue: (a) => a.google_business_claimed ? 1 : 0 },
            { key: 'nap_consistent', label: 'NAP', render: (a) => a.nap_consistent ? '\u2705' : '\u274C', style: { textAlign: 'center' }, sortValue: (a) => a.nap_consistent ? 1 : 0 },
            { key: 'website_mobile_friendly', label: 'Mobile', render: (a) => a.website_mobile_friendly ? '\u2705' : '\u274C', style: { textAlign: 'center' }, sortValue: (a) => a.website_mobile_friendly ? 1 : 0 },
            { key: 'ssl_enabled', label: 'SSL', render: (a) => a.ssl_enabled ? '\u2705' : '\u274C', style: { textAlign: 'center' }, sortValue: (a) => a.ssl_enabled ? 1 : 0 },
            { key: 'schema_markup', label: 'Schema', render: (a) => a.schema_markup ? '\u2705' : '\u274C', style: { textAlign: 'center' }, sortValue: (a) => a.schema_markup ? 1 : 0 },
            { key: 'page_speed_score', label: 'Speed', style: { textAlign: 'center' } },
            { key: 'website_url', label: 'Website', render: (a) => (
              <a href={a.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 12 }}
                onClick={e => e.stopPropagation()}>
                {a.website_url ? a.website_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : 'N/A'}
              </a>
            ) },
          ]}
        />
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => { setSelected(null); setKeywords([]); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, marginBottom: 4 }}>{selected.business_name}</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge">{selected.category}</span>
                  <span className="badge">{selected.subcategory}</span>
                  <span className="badge">{selected.city}, {selected.state}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${scoreColor(selected.overall_score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(selected.overall_score), lineHeight: 1 }}>{selected.overall_score}</div>
                  <div style={{ fontSize: 9, color: '#888' }}>{scoreLabel(selected.overall_score)}</div>
                </div>
              </div>
            </div>

            {/* Website Link */}
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>Website</div>
              <a href={selected.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1', fontWeight: 600, fontSize: 14 }}>
                {selected.website_url}
              </a>
            </div>

            {/* SEO Checklist */}
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>SEO Checklist</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Google Business Claimed', val: selected.google_business_claimed },
                { label: 'NAP Consistent', val: selected.nap_consistent },
                { label: 'Mobile Friendly', val: selected.website_mobile_friendly },
                { label: 'SSL Enabled', val: selected.ssl_enabled },
                { label: 'Meta Tags Optimized', val: selected.meta_tags_optimized },
                { label: 'Schema Markup', val: selected.schema_markup },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: item.val ? '#f0fdf4' : '#fef2f2', borderRadius: 6, fontSize: 13 }}>
                  <span>{item.val ? '✅' : '❌'}</span>
                  <span style={{ color: item.val ? '#166534' : '#991b1b' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Performance Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Page Speed', value: selected.page_speed_score },
                { label: 'Reviews', value: selected.reviews_count },
                { label: 'Avg Rating', value: selected.reviews_avg },
                { label: 'Photos', value: selected.photos_count },
                { label: 'Posts/30d', value: selected.posts_last_30_days },
                { label: 'Citations', value: selected.citations_count },
                { label: 'Backlinks', value: selected.backlinks_count },
                { label: 'Domain Auth', value: selected.domain_authority },
                { label: 'Monthly Searches', value: Number(selected.monthly_searches).toLocaleString() },
                { label: 'Impressions', value: Number(selected.monthly_impressions).toLocaleString() },
                { label: 'Clicks', value: Number(selected.monthly_clicks).toLocaleString() },
                { label: 'Avg Position', value: selected.avg_position },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center', background: '#f8f9fa', borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: '#666' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Keyword Rankings */}
            {keywords.length > 0 && (
              <>
                <h3 style={{ fontSize: 15, marginBottom: 10 }}>Keyword Rankings</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: 8, textAlign: 'left' }}>Keyword</th>
                      <th style={{ padding: 8, textAlign: 'center' }}>Position</th>
                      <th style={{ padding: 8, textAlign: 'center' }}>Previous</th>
                      <th style={{ padding: 8, textAlign: 'center' }}>Change</th>
                      <th style={{ padding: 8, textAlign: 'right' }}>Search Vol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.map(k => {
                      const change = k.previous_position - k.position;
                      return (
                        <tr key={k.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: 8, fontWeight: 500 }}>{k.keyword}</td>
                          <td style={{ padding: 8, textAlign: 'center' }}>
                            <span style={{ background: k.position <= 3 ? '#dcfce7' : k.position <= 10 ? '#fef9c3' : '#fee2e2', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                              #{k.position}
                            </span>
                          </td>
                          <td style={{ padding: 8, textAlign: 'center', color: '#888' }}>#{k.previous_position}</td>
                          <td style={{ padding: 8, textAlign: 'center', fontWeight: 600, color: change > 0 ? '#22c55e' : change < 0 ? '#ef4444' : '#888' }}>
                            {change > 0 ? `+${change}` : change < 0 ? change : '—'}
                          </td>
                          <td style={{ padding: 8, textAlign: 'right' }}>{Number(k.search_volume).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {/* Recommendations */}
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Recommendations</h3>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
              {selected.recommendations}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <a href={selected.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Visit Website
              </a>
              <button className="btn" onClick={() => { setSelected(null); setKeywords([]); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
