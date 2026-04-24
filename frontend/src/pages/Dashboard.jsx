import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categoryIcons = {
  Healthcare: '🏥', Legal: '⚖️', 'Home Services': '🔧', Beauty: '💇',
  Fitness: '💪', Veterinary: '🐾', Restaurant: '🍽️', Automotive: '🚗'
};

export default function Dashboard() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [consulting, setConsulting] = useState({
    contacts: 0, deals: {}, candidates: {}, consultations: {}, partners: {}, opportunities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/analytics/dashboard').then(setStats).catch(console.error),
      Promise.all([
        api('/api/contacts').then(d => Array.isArray(d) ? d.length : 0).catch(() => 0),
        api('/api/deals/stats').catch(() => ({ total: 0, pipeline_value: 0, won_value: 0 })),
        api('/api/candidates/stats').catch(() => ({ total: 0 })),
        api('/api/consultations/stats').catch(() => ({ total: 0, pending: 0 })),
        api('/api/partners/stats').catch(() => ({ total: 0, active: 0 })),
        api('/api/opportunities').then(d => Array.isArray(d) ? d.length : 0).catch(() => 0),
      ]).then(([contacts, deals, candidates, consultations, partners, opportunities]) => {
        setConsulting({ contacts, deals, candidates, consultations, partners, opportunities });
      }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Overview of your business growth platform</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => navigate('/admin/businesses')}>
          <div className="stat-label">Active Businesses</div>
          <div className="stat-value" style={{ color: '#6c63ff' }}>{stats?.activeBusinesses || 0}</div>
          <div className="stat-sub">{stats?.businesses || 0} total registered</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/customers')}>
          <div className="stat-label">Total Customers</div>
          <div className="stat-value" style={{ color: '#2ed573' }}>{stats?.customers || 0}</div>
          <div className="stat-sub">Across all businesses</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/payments')}>
          <div className="stat-label">Revenue</div>
          <div className="stat-value" style={{ color: '#ffa502' }}>${(stats?.revenue || 0).toLocaleString()}</div>
          <div className="stat-sub">From completed bookings</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/reviews')}>
          <div className="stat-label">Avg Rating</div>
          <div className="stat-value" style={{ color: '#ff6348' }}>{stats?.avgRating || '0.0'} ⭐</div>
          <div className="stat-sub">{stats?.reviews || 0} total reviews</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/bookings')}>
          <div className="stat-label">Upcoming Bookings</div>
          <div className="stat-value" style={{ color: '#1e90ff' }}>{stats?.upcomingBookings || 0}</div>
          <div className="stat-sub">{stats?.bookings || 0} total bookings</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/leads')}>
          <div className="stat-label">New Leads</div>
          <div className="stat-value" style={{ color: '#ff4757' }}>{stats?.newLeads || 0}</div>
          <div className="stat-sub">{stats?.leads || 0} in pipeline</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/reviews')}>
          <div className="stat-label">Pending Reviews</div>
          <div className="stat-value" style={{ color: '#ffc107' }}>{stats?.pendingReviews || 0}</div>
          <div className="stat-sub">Awaiting response</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/campaigns')}>
          <div className="stat-label">Campaigns</div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>{stats?.campaigns || 0}</div>
          <div className="stat-sub">Email & SMS campaigns</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 16, fontSize: 18, marginTop: 32 }}>Consulting</h2>
      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => navigate('/admin/contacts')}>
          <div className="stat-label">Consulting Contacts</div>
          <div className="stat-value" style={{ color: '#6c63ff' }}>{consulting.contacts}</div>
          <div className="stat-sub">Total contacts</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/deals')}>
          <div className="stat-label">Active Deals</div>
          <div className="stat-value" style={{ color: '#2ed573' }}>{consulting.deals.total || 0}</div>
          <div className="stat-sub">Pipeline: ${(consulting.deals.pipeline_value || 0).toLocaleString()} | Won: ${(consulting.deals.won_value || 0).toLocaleString()}</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/candidates')}>
          <div className="stat-label">Candidates</div>
          <div className="stat-value" style={{ color: '#ff6348' }}>{consulting.candidates.total || 0}</div>
          <div className="stat-sub">In talent network</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/consultations')}>
          <div className="stat-label">Consultations</div>
          <div className="stat-value" style={{ color: '#ffa502' }}>{consulting.consultations.total || 0}</div>
          <div className="stat-sub">{consulting.consultations.pending || 0} pending</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/partners')}>
          <div className="stat-label">Partners</div>
          <div className="stat-value" style={{ color: '#1e90ff' }}>{consulting.partners.total || 0}</div>
          <div className="stat-sub">{consulting.partners.active || 0} active</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/opportunities')}>
          <div className="stat-label">Opportunities</div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>{consulting.opportunities}</div>
          <div className="stat-sub">Total submitted</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 16, fontSize: 18 }}>Business Categories</h2>
      <div className="category-grid">
        {(stats?.categories || []).map(cat => (
          <div key={cat.category} className="category-card" onClick={() => navigate(`/businesses?category=${cat.category}`)}>
            <div className="cat-icon">{categoryIcons[cat.category] || '🏪'}</div>
            <div className="cat-name">{cat.category}</div>
            <div className="cat-count">{cat.count} businesses</div>
            <div style={{ fontSize: 11, color: '#ffc107', marginTop: 4 }}>
              {parseFloat(cat.avg_rating || 0).toFixed(1)} ⭐ avg
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
