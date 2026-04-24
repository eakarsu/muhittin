import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const statusColors = { scheduled: 'badge-blue', confirmed: 'badge-purple', completed: 'badge-green', cancelled: 'badge-red' };

export default function Bookings() {
  const { api } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [form, setForm] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [customers, setCustomers] = useState([]);

  const load = () => {
    api('/api/bookings').then(setBookings).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api('/api/businesses').then(setBusinesses).catch(() => {});
    api('/api/customers').then(setCustomers).catch(() => {});
  }, []);

  const handleCreate = () => { setForm({ business_id: '', customer_id: '', service_name: '', date: '', time_slot: '', duration_minutes: 60, price: '', status: 'scheduled', notes: '' }); setShowForm(true); setSelected(null); };
  const handleEdit = () => { setForm({ ...selected, date: selected.date ? selected.date.split('T')[0] : '' }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/bookings/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/bookings', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this booking?')) return;
    try { await api(`/api/bookings/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };
  const handleStatusChange = async (id, status) => {
    try { await api(`/api/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); if (selected) setSelected({ ...selected, status }); } catch (err) { alert(err.message); }
  };

  const generateFollowUp = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/booking-suggest', {
        method: 'POST',
        body: JSON.stringify({ service_name: selected.service_name, customer_name: selected.customer_name, date: selected.booking_date, duration: selected.duration, price: selected.price })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Bookings</h1><p className="subtitle">{bookings.length} appointments</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Booking</button>
      </div>
      <SortableTable
        data={bookings}
        searchPlaceholder="Search bookings..."
        onRowClick={(b) => { setSelected(b); setAiResult(''); }}
        columns={[
          { key: 'service_name', label: 'Service', style: { fontWeight: 600 } },
          { key: 'customer_name', label: 'Customer', render: b => b.customer_name || 'Walk-in' },
          { key: 'date', label: 'Date & Time', render: b => `${b.date ? new Date(b.date).toLocaleDateString() : ''} ${b.time_slot || ''}`.trim(), sortValue: b => b.date ? new Date(b.date).getTime() : 0 },
          { key: 'duration_minutes', label: 'Duration', render: b => `${b.duration_minutes} min` },
          { key: 'price', label: 'Price', style: { fontWeight: 600, color: '#2ed573' }, render: b => `$${b.price || 0}` },
          { key: 'status', label: 'Status', render: b => <span className={`badge ${statusColors[b.status] || 'badge-gray'}`}>{b.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.service_name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Customer</span><span className="detail-value">{selected.customer_name || 'Walk-in'}</span></div>
              <div className="detail-row"><span className="detail-label">Date</span><span className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : ''}</span></div>
              <div className="detail-row"><span className="detail-label">Time</span><span className="detail-value">{selected.time_slot}</span></div>
              <div className="detail-row"><span className="detail-label">Duration</span><span className="detail-value">{selected.duration_minutes} minutes</span></div>
              <div className="detail-row"><span className="detail-label">Price</span><span className="detail-value" style={{ fontWeight: 700, color: '#2ed573' }}>${selected.price || 0}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status]}`}>{selected.status}</span></span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              {selected.status === 'scheduled' && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(selected.id, 'confirmed')}>Confirm</button>}
              {(selected.status === 'scheduled' || selected.status === 'confirmed') && <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(selected.id, 'completed')}>Complete</button>}
              {selected.status !== 'cancelled' && selected.status !== 'completed' && <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(selected.id, 'cancelled')}>Cancel</button>}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateFollowUp} disabled={aiLoading}>{aiLoading ? 'Generating...' : '🤖 AI Follow-Up'}</button>
              {aiResult && <div style={{ marginTop: 10, padding: 10, background: '#f8f9fa', borderRadius: 6, fontSize: 13 }}><ReactMarkdown>{aiResult}</ReactMarkdown></div>}
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
            <h2>{form.id ? 'Edit Booking' : 'New Booking'}</h2>
            <div className="form-group"><label>Business</label>
              <select value={form.business_id || ''} onChange={e => setForm({ ...form, business_id: e.target.value })}>
                <option value="">Select business...</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Customer</label>
              <select value={form.customer_id || ''} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Walk-in</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Service</label><input value={form.service_name || ''} onChange={e => setForm({ ...form, service_name: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="form-group"><label>Time</label><input value={form.time_slot || ''} onChange={e => setForm({ ...form, time_slot: e.target.value })} placeholder="09:00 AM" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Duration (min)</label><input type="number" value={form.duration_minutes || 60} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} /></div>
              <div className="form-group"><label>Price</label><input type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status || 'scheduled'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
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
