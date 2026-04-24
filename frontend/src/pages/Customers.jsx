import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

export default function Customers() {
  const { api } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [form, setForm] = useState({});
  const [businesses, setBusinesses] = useState([]);

  const load = () => {
    api('/api/customers').then(setCustomers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); api('/api/businesses').then(setBusinesses).catch(() => {}); }, []);

  const handleCreate = () => { setForm({ business_id: '', name: '', email: '', phone: '', address: '', city: '', tags: '', source: '', status: 'active', notes: '' }); setShowForm(true); setSelected(null); };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/customers/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/customers', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this customer?')) return;
    try { await api(`/api/customers/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };

  const generateInsights = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/customer-insights', {
        method: 'POST',
        body: JSON.stringify({ name: selected.name, email: selected.email, source: selected.source, tags: selected.tags, total_spent: selected.total_spent, visit_count: selected.visit_count, notes: selected.notes })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Customers</h1><p className="subtitle">{customers.length} customers in CRM</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Customer</button>
      </div>
      <SortableTable
        data={customers}
        searchPlaceholder="Search customers..."
        onRowClick={(c) => { setSelected(c); setAiResult(''); }}
        columns={[
          { key: 'name', label: 'Name', style: { fontWeight: 600 } },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'source', label: 'Source', render: c => <span className="badge badge-blue">{c.source}</span> },
          { key: 'tags', label: 'Tags', render: c => { const tags = Array.isArray(c.tags) ? c.tags : (c.tags || '').split(',').map(t => t.trim()).filter(Boolean); return tags.map(t => <span key={t} className="badge badge-purple" style={{ marginRight: 4 }}>{t}</span>); } },
          { key: 'total_spent', label: 'Total Spent', style: { fontWeight: 600 }, render: c => `$${parseFloat(c.total_spent || 0).toLocaleString()}`, sortValue: c => parseFloat(c.total_spent || 0) },
          { key: 'visit_count', label: 'Visits', sortValue: c => parseInt(c.visit_count || 0) },
          { key: 'status', label: 'Status', render: c => <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selected.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Address</span><span className="detail-value">{selected.address}, {selected.city}</span></div>
              <div className="detail-row"><span className="detail-label">Source</span><span className="detail-value"><span className="badge badge-blue">{selected.source}</span></span></div>
              <div className="detail-row"><span className="detail-label">Tags</span><span className="detail-value">{(selected.tags || '').split(',').map(t => t.trim()).filter(Boolean).map(t => <span key={t} className="badge badge-purple" style={{ marginRight: 4 }}>{t}</span>)}</span></div>
              <div className="detail-row"><span className="detail-label">Total Spent</span><span className="detail-value" style={{ fontWeight: 700, color: '#2ed573' }}>${parseFloat(selected.total_spent || 0).toLocaleString()}</span></div>
              <div className="detail-row"><span className="detail-label">Visits</span><span className="detail-value">{selected.visit_count}</span></div>
              <div className="detail-row"><span className="detail-label">Last Visit</span><span className="detail-value">{selected.last_visit ? new Date(selected.last_visit).toLocaleDateString() : 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${selected.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{selected.status}</span></span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateInsights} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : '🤖 AI Customer Insights'}</button>
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
            <h2>{form.id ? 'Edit Customer' : 'New Customer'}</h2>
            <div className="form-group"><label>Business</label>
              <select value={form.business_id || ''} onChange={e => setForm({ ...form, business_id: e.target.value })}>
                <option value="">Select business...</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label>City</label><input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Address</label><input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Source</label><input value={form.source || ''} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="google, referral, etc." /></div>
              <div className="form-group"><label>Tags</label><input value={form.tags || ''} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="vip,regular" /></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="form-group"><label>Status</label>
              <select value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
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
