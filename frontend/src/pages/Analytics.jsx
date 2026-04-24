import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Bar({ label, value, max, color = '#6c63ff' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 24 }}>
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }}></div>
      </div>
      <span className="bar-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </div>
  );
}

export default function Analytics() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/analytics/full'),
      api('/api/analytics/dashboard')
    ]).then(([full, dash]) => { setData(full); setStats(dash); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const maxRevenue = Math.max(...(data?.revenueByBusiness || []).map(r => parseFloat(r.revenue || 0)), 1);
  const maxVisits = Math.max(...(data?.websiteVisits || []).map(w => w.visits), 1);

  return (
    <div>
      <div className="page-header">
        <div><h1>Analytics</h1><p className="subtitle">Comprehensive business analytics</p></div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value" style={{ color: '#2ed573' }}>${(stats?.revenue || 0).toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-label">Total Customers</div><div className="stat-value" style={{ color: '#6c63ff' }}>{stats?.customers || 0}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Rating</div><div className="stat-value" style={{ color: '#ffc107' }}>{stats?.avgRating} ⭐</div></div>
        <div className="stat-card"><div className="stat-label">Total Leads</div><div className="stat-value" style={{ color: '#ff6348' }}>{stats?.leads || 0}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Revenue by Business</h3>
          <div className="bar-chart">
            {(data?.revenueByBusiness || []).filter(r => parseFloat(r.revenue) > 0).map(r => (
              <Bar key={r.name} label={r.name} value={parseFloat(r.revenue)} max={maxRevenue} color="#2ed573" />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Bookings by Status</h3>
          <div className="bar-chart">
            {(data?.bookingsByStatus || []).map(b => (
              <Bar key={b.status} label={b.status} value={parseInt(b.count)} max={Math.max(...(data?.bookingsByStatus || []).map(x => parseInt(x.count)), 1)}
                color={{ scheduled: '#1e90ff', confirmed: '#7c3aed', completed: '#2ed573', cancelled: '#ff4757' }[b.status] || '#6c63ff'} />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Reviews by Rating</h3>
          <div className="bar-chart">
            {(data?.reviewsByRating || []).map(r => (
              <Bar key={r.rating} label={`${'★'.repeat(r.rating)} (${r.rating})`} value={parseInt(r.count)}
                max={Math.max(...(data?.reviewsByRating || []).map(x => parseInt(x.count)), 1)}
                color={r.rating >= 4 ? '#2ed573' : r.rating >= 3 ? '#ffc107' : '#ff4757'} />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Lead Pipeline</h3>
          <div className="bar-chart">
            {(data?.leadsByStatus || []).map(l => (
              <Bar key={l.status} label={`${l.status} ($${parseFloat(l.total_value || 0).toLocaleString()})`}
                value={parseInt(l.count)}
                max={Math.max(...(data?.leadsByStatus || []).map(x => parseInt(x.count)), 1)}
                color={{ new: '#1e90ff', contacted: '#ffc107', qualified: '#7c3aed', won: '#2ed573', lost: '#ff4757' }[l.status] || '#6c63ff'} />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Social Media Performance</h3>
          <div className="bar-chart">
            {(data?.socialPerformance || []).map(s => (
              <Bar key={s.platform} label={s.platform} value={parseInt(s.total_likes || 0)}
                max={Math.max(...(data?.socialPerformance || []).map(x => parseInt(x.total_likes || 0)), 1)}
                color={{ instagram: '#e1306c', facebook: '#1877f2', tiktok: '#010101', linkedin: '#0077b5' }[s.platform] || '#6c63ff'} />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Website Visits</h3>
          <div className="bar-chart">
            {(data?.websiteVisits || []).map(w => (
              <Bar key={w.page_title} label={w.page_title} value={w.visits} max={maxVisits} color="#1e90ff" />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Customers by Source</h3>
          <div className="bar-chart">
            {(data?.customersBySource || []).map(c => (
              <Bar key={c.source} label={c.source} value={parseInt(c.count)}
                max={Math.max(...(data?.customersBySource || []).map(x => parseInt(x.count)), 1)} color="#7c3aed" />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Campaign Performance</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: 12 }}>
              <thead><tr><th>Campaign</th><th>Sent</th><th>Opens</th><th>Clicks</th><th>Rate</th></tr></thead>
              <tbody>
                {(data?.campaignPerformance || []).map(c => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{c.recipients}</td>
                    <td>{c.opens}</td>
                    <td>{c.clicks}</td>
                    <td>{c.recipients ? ((c.opens / c.recipients) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
