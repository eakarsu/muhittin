import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const statusColors = { scheduled: 'badge-blue', confirmed: 'badge-green', completed: 'badge-green', cancelled: 'badge-red', rescheduled: 'badge-yellow' };
const typeLabels = { consultation: 'Consultation', 'follow-up': 'Follow-up', pitch: 'Pitch', review: 'Review', kickoff: 'Kickoff' };

export default function AdminMeetings() {
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
    api('/api/meetings').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const loadStats = () => {
    api('/api/meetings/stats').then(setStats).catch(console.error);
  };

  useEffect(() => { load(); loadStats(); }, []);

  const handleCreate = () => {
    setForm({ title: '', type: 'consultation', contact_id: '', company_id: '', deal_id: '', date: '', time: '', duration_minutes: 60, location: '', attendees: '', notes: '', status: 'scheduled' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => {
    setForm({ ...selected, date: selected.date ? selected.date.split('T')[0] : '' });
    setShowForm(true);
  };
  const handleSave = async () => {
    try {
      const payload = { ...form, contact_id: form.contact_id || null, company_id: form.company_id || null, deal_id: form.deal_id || null };
      if (form.id) await api(`/api/meetings/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/meetings', { method: 'POST', body: JSON.stringify(payload) });
      setShowForm(false); setSelected(null); setLoading(true); load(); loadStats();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this meeting?')) return;
    try { await api(`/api/meetings/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); loadStats(); } catch (err) { alert(err.message); }
  };
  const handleStatusChange = async (id, status) => {
    try {
      await api(`/api/meetings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      load(); loadStats();
      if (selected) setSelected({ ...selected, status });
    } catch (err) { alert(err.message); }
  };

  const prepMeeting = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/meeting-prep', {
        method: 'POST',
        body: JSON.stringify({ title: selected.title, type: selected.type, contact_name: selected.contact_name, company_name: selected.company_name, agenda: selected.agenda })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Meetings</h1><p className="subtitle">{items.length} meetings{stats ? ` | ${stats.upcoming} upcoming` : ''}</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Meeting</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: '#1e90ff' }}>{stats.upcoming}</div><div className="stat-label">Upcoming</div></div>
          {stats.byStatus && stats.byStatus.map(s => (
            <div className="stat-card" key={s.status}><div className="stat-value">{s.count}</div><div className="stat-label">{s.status}</div></div>
          ))}
        </div>
      )}

      <SortableTable
        data={items}
        searchPlaceholder="Search meetings..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'title', label: 'Title', style: { fontWeight: 600 } },
          { key: 'type', label: 'Type', style: { color: '#7c3aed' }, render: item => typeLabels[item.type] || item.type, sortValue: item => typeLabels[item.type] || item.type },
          { key: 'contact_name', label: 'Contact', render: item => <>{item.contact_name}{item.company_name && <><br /><span style={{ fontSize: 11, color: '#888' }}>{item.company_name}</span></>}</> },
          { key: 'date', label: 'Date & Time', style: { color: '#ff6348' }, render: item => <>{item.date ? new Date(item.date).toLocaleDateString() : ''}{item.time && ` ${item.time}`}</>, sortValue: item => item.date || '' },
          { key: 'location', label: 'Location' },
          { key: 'status', label: 'Status', render: item => <span className={`badge ${statusColors[item.status] || 'badge-gray'}`}>{item.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.title}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">{typeLabels[selected.type] || selected.type}</span></div>
              <div className="detail-row"><span className="detail-label">Contact</span><span className="detail-value">{selected.contact_name || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Company</span><span className="detail-value">{selected.company_name || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Deal ID</span><span className="detail-value">{selected.deal_id || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Date</span><span className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Time</span><span className="detail-value">{selected.time || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Duration</span><span className="detail-value">{selected.duration_minutes} min</span></div>
              <div className="detail-row"><span className="detail-label">Location</span><span className="detail-value">{selected.location || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Attendees</span><span className="detail-value">{selected.attendees || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes || 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status] || 'badge-gray'}`}>{selected.status}</span></span></div>
              {selected.calendly_event_id && <div className="detail-row"><span className="detail-label">Calendly ID</span><span className="detail-value">{selected.calendly_event_id}</span></div>}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {selected.status === 'scheduled' && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(selected.id, 'confirmed')}>Confirm</button>}
              {selected.status === 'confirmed' && <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(selected.id, 'completed')}>Complete</button>}
              {selected.status !== 'cancelled' && selected.status !== 'completed' && <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(selected.id, 'cancelled')}>Cancel</button>}
              {selected.status !== 'rescheduled' && selected.status !== 'completed' && selected.status !== 'cancelled' && <button className="btn btn-sm btn-warning" onClick={() => handleStatusChange(selected.id, 'rescheduled')}>Reschedule</button>}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={prepMeeting} disabled={aiLoading}>
                {aiLoading ? 'Preparing...' : '🤖 AI Meeting Prep'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 16, background: '#f0f4ff', borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
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
            <h2>{form.id ? 'Edit Meeting' : 'New Meeting'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Title</label><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="form-group"><label>Type</label>
                <select value={form.type || 'consultation'} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="pitch">Pitch</option>
                  <option value="review">Review</option>
                  <option value="kickoff">Kickoff</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Contact ID</label><input type="number" value={form.contact_id || ''} onChange={e => setForm({ ...form, contact_id: e.target.value })} /></div>
              <div className="form-group"><label>Company ID</label><input type="number" value={form.company_id || ''} onChange={e => setForm({ ...form, company_id: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Deal ID</label><input type="number" value={form.deal_id || ''} onChange={e => setForm({ ...form, deal_id: e.target.value })} /></div>
              <div className="form-group"><label>Duration (min)</label><input type="number" value={form.duration_minutes || 60} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="form-group"><label>Time</label><input value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 AM" /></div>
            </div>
            <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Zoom, Office, etc." /></div>
            <div className="form-group"><label>Attendees</label><textarea value={form.attendees || ''} onChange={e => setForm({ ...form, attendees: e.target.value })} placeholder="List attendees..." /></div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="form-group"><label>Status</label>
              <select value={form.status || 'scheduled'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
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
