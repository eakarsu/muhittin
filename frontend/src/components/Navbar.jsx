import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api('/api/notifications/unread-count')
      .then(d => setUnread(d.count))
      .catch(() => {});
    const interval = setInterval(() => {
      api('/api/notifications/unread-count')
        .then(d => setUnread(d.count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const businessLinks = [
    { to: '/admin', icon: '📊', label: 'Dashboard' },
    { to: '/admin/businesses', icon: '🏢', label: 'Businesses' },
    { to: '/admin/customers', icon: '👥', label: 'Customers' },
    { to: '/admin/bookings', icon: '📅', label: 'Bookings' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    { to: '/admin/campaigns', icon: '📧', label: 'Campaigns' },
    { to: '/admin/leads', icon: '🎯', label: 'Leads' },
    { to: '/admin/websites', icon: '🌐', label: 'Websites' },
    { to: '/admin/social', icon: '📱', label: 'Social Media' },
    { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { to: '/admin/seo', icon: '🔍', label: 'SEO' },
  ];

  const consultingLinks = [
    { to: '/admin/contacts', icon: '📇', label: 'Contacts' },
    { to: '/admin/companies', icon: '🏛️', label: 'Companies' },
    { to: '/admin/deals', icon: '💼', label: 'Deals' },
    { to: '/admin/candidates', icon: '👤', label: 'Candidates' },
    { to: '/admin/partners', icon: '🤝', label: 'Partners' },
    { to: '/admin/payments', icon: '💳', label: 'Payments' },
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/consultations', icon: '📞', label: 'Consultations' },
    { to: '/admin/insights', icon: '📝', label: 'Insights' },
    { to: '/admin/opportunities', icon: '💡', label: 'Opportunities' },
    { to: '/admin/packages', icon: '📋', label: 'Packages' },
    { to: '/admin/meetings', icon: '📅', label: 'Meetings' },
    { to: '/admin/onboarding', icon: '🚀', label: 'Onboarding' },
    { to: '/admin/case-studies', icon: '📑', label: 'Case Studies' },
    { to: '/admin/industries', icon: '🏭', label: 'Industries' },
  ];

  const systemLinks = [
    { to: '/admin/notifications', icon: '🔔', label: `Notifications${unread > 0 ? ` (${unread})` : ''}` },
    { to: '/admin/ai', icon: '🤖', label: 'AI Assistant' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Multiverse</h2>
        <p>Consulting Group</p>
      </div>
      <nav>
        <div className="nav-section-label">Business</div>
        {businessLinks.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/admin'} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="icon">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
        <div className="nav-section-label">Consulting</div>
        {consultingLinks.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="icon">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
        <div className="nav-section-label">System</div>
        {systemLinks.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="icon">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <span>{user?.name || 'User'}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
