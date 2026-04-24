import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const typeIcons = { review: '⭐', booking: '📅', lead: '🎯', campaign: '📧', social: '📱', website: '🌐', system: '⚙️', customer: '👤', business: '🏢' };

export default function Notifications() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (readFilter !== '') params.set('read', readFilter);
    api(`/api/notifications?${params}`).then(setNotifications).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [readFilter]);

  const markRead = async (id) => {
    try { await api(`/api/notifications/${id}/read`, { method: 'PATCH' }); load(); } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try { await api('/api/notifications/read-all', { method: 'PATCH' }); load(); } catch (err) { alert(err.message); }
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try { await api(`/api/notifications/${id}`, { method: 'DELETE' }); load(); } catch (err) { alert(err.message); }
  };

  const handleClick = (n) => {
    if (!n.read) markRead(n.id);
    if (n.link) navigate(n.link);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <div><h1>Notifications</h1><p className="subtitle">{unreadCount} unread of {notifications.length} total</p></div>
        {unreadCount > 0 && <button className="btn btn-secondary" onClick={markAllRead}>Mark All Read</button>}
      </div>
      <div className="filters-bar">
        <select value={readFilter} onChange={e => setReadFilter(e.target.value)}>
          <option value="">All</option><option value="false">Unread</option><option value="true">Read</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map(n => (
          <div key={n.id} className="card card-clickable" onClick={() => handleClick(n)}
            style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, opacity: n.read ? 0.7 : 1, borderLeft: n.read ? 'none' : '3px solid #6c63ff' }}>
            <span style={{ fontSize: 20 }}>{typeIcons[n.type] || '🔔'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 14 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className={`badge ${n.read ? 'badge-gray' : 'badge-blue'}`}>{n.type}</span>
              <button className="btn btn-sm btn-danger" onClick={(e) => deleteNotif(n.id, e)} style={{ padding: '2px 6px' }}>×</button>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40, color: '#888' }}>No notifications</div>}
      </div>
    </div>
  );
}
