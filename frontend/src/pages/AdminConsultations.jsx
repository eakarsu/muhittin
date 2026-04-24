import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const statusColors = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };

export default function AdminConsultations() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    api('/api/consultations').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const loadStats = () => {
    api('/api/consultations/stats').then(setStats).catch(console.error);
  };

  useEffect(() => { load(); loadStats(); }, []);

  const handleCreate = () => {
    setForm({ name: '', email: '', phone: '', company: '', service_interest: '', message: '', preferred_date: '', preferred_time: '', status: 'pending' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected, preferred_date: selected.preferred_date ? selected.preferred_date.split('T')[0] : '' }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/consultations/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/consultations', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load(); loadStats();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this consultation?')) return;
    try { await api(`/api/consultations/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); loadStats(); } catch (err) { alert(err.message); }
  };
  const prepConsultation = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/consultation-prep', {
        method: 'POST',
        body: JSON.stringify({ name: selected.name, company: selected.company, service_interest: selected.service_interest, notes: selected.notes })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api(`/api/consultations/${id}`, { method: 'PUT', body: JSON.stringify({ ...selected, status }) });
      load(); loadStats();
      if (selected) setSelected({ ...selected, status });
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const upcoming = items.filter(c => c.status === 'confirmed' && c.preferred_date && new Date(c.preferred_date) >= new Date()).length;

  return (
    <div>
      <div className="page-header">
        <div><h1>Consultations</h1><p className="subtitle">{items.length} consultations | {upcoming} upcoming</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Consultation</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.total || items.length}</div><div className="stat-label">Total</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: '#1e90ff' }}>{stats.upcoming || upcoming}</div><div className="stat-label">Upcoming</div></div>
          {stats.by_status && Object.entries(stats.by_status).map(([k, v]) => (
            <div className="stat-card" key={k}><div className="stat-value">{v}</div><div className="stat-label">{k}</div></div>
          ))}
        </div>
      )}

      <SortableTable
        data={items}
        searchPlaceholder="Search consultations..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          {
            key: 'name',
            label: 'Name',
            style: { fontWeight: 600 },
            render: item => (<>{item.name}<br /><span style={{ fontSize: 11, color: '#888' }}>{item.email}</span></>),
          },
          { key: 'company', label: 'Company' },
          {
            key: 'service_interest',
            label: 'Service Interest',
            style: { color: '#7c3aed' },
          },
          {
            key: 'preferred_date',
            label: 'Preferred Date',
            style: { color: '#ff6348' },
            render: item => (<>{item.preferred_date ? new Date(item.preferred_date).toLocaleDateString() : ''}{item.preferred_time && ` ${item.preferred_time}`}</>),
            sortValue: item => item.preferred_date || '',
          },
          {
            key: 'status',
            label: 'Status',
            render: item => (<span className={`badge ${statusColors[item.status] || 'badge-gray'}`}>{item.status}</span>),
          },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selected.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Company</span><span className="detail-value">{selected.company}</span></div>
              <div className="detail-row"><span className="detail-label">Service Interest</span><span className="detail-value">{selected.service_interest}</span></div>
              <div className="detail-row"><span className="detail-label">Message</span><span className="detail-value">{selected.message}</span></div>
              <div className="detail-row"><span className="detail-label">Preferred Date</span><span className="detail-value">{selected.preferred_date ? new Date(selected.preferred_date).toLocaleDateString() : 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Preferred Time</span><span className="detail-value">{selected.preferred_time || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status] || 'badge-gray'}`}>{selected.status}</span></span></div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {selected.status === 'pending' && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(selected.id, 'confirmed')}>Confirm</button>}
              {selected.status === 'confirmed' && <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(selected.id, 'completed')}>Complete</button>}
              {selected.status !== 'cancelled' && selected.status !== 'completed' && <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(selected.id, 'cancelled')}>Cancel</button>}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={prepConsultation} disabled={aiLoading}>
                {aiLoading ? 'Loading...' : '🤖 AI Meeting Prep'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 8, fontSize: 14 }}>
                  <ReactMarkdown>{aiResult}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-primary" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{form.id ? 'Edit Consultation' : 'New Consultation'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label>Company</label><input value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Service Interest</label><input value={form.service_interest || ''} onChange={e => setForm({ ...form, service_interest: e.target.value })} /></div>
            <div className="form-group"><label>Message</label><textarea value={form.message || ''} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Preferred Date</label><input type="date" value={form.preferred_date || ''} onChange={e => setForm({ ...form, preferred_date: e.target.value })} /></div>
              <div className="form-group"><label>Preferred Time</label><input value={form.preferred_time || ''} onChange={e => setForm({ ...form, preferred_time: e.target.value })} placeholder="e.g. 10:00 AM" /></div>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status || 'pending'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
