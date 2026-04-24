import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const typeColors = { advisory: 'badge-purple', referral: 'badge-blue', delivery: 'badge-yellow', technology: 'badge-green' };
const statusColors = { active: 'badge-green', inactive: 'badge-gray', pending: 'badge-yellow' };

export default function AdminPartners() {
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
    api('/api/partners').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const loadStats = () => {
    api('/api/partners/stats').then(setStats).catch(console.error);
  };

  useEffect(() => { load(); loadStats(); }, []);

  const handleCreate = () => {
    setForm({ company_name: '', contact_name: '', email: '', phone: '', type: 'referral', region: '', industry: '', status: 'pending', notes: '' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/partners/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/partners', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load(); loadStats();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this partner?')) return;
    try { await api(`/api/partners/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); loadStats(); } catch (err) { alert(err.message); }
  };

  const generateStrategy = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/partner-strategy', {
        method: 'POST',
        body: JSON.stringify({ company_name: selected.company_name, type: selected.type, region: selected.region, industry: selected.industry, status: selected.status })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Partners</h1><p className="subtitle">{items.length} partners</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Partner</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.total || items.length}</div><div className="stat-label">Total Partners</div></div>
          {stats.by_type && Object.entries(stats.by_type).map(([k, v]) => (
            <div className="stat-card" key={k}><div className="stat-value">{v}</div><div className="stat-label">{k}</div></div>
          ))}
        </div>
      )}

      <SortableTable
        data={items}
        searchPlaceholder="Search partners..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'company_name', label: 'Company', style: { fontWeight: 600 } },
          { key: 'contact_name', label: 'Contact', render: item => <>{item.contact_name}<br /><span style={{ fontSize: 11, color: '#888' }}>{item.email}</span></> },
          { key: 'type', label: 'Type', render: item => <span className={`badge ${typeColors[item.type] || 'badge-gray'}`}>{item.type}</span> },
          { key: 'region', label: 'Region' },
          { key: 'industry', label: 'Industry' },
          { key: 'status', label: 'Status', render: item => <span className={`badge ${statusColors[item.status] || 'badge-gray'}`}>{item.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.company_name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Contact</span><span className="detail-value">{selected.contact_name}</span></div>
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selected.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value"><span className={`badge ${typeColors[selected.type] || 'badge-gray'}`}>{selected.type}</span></span></div>
              <div className="detail-row"><span className="detail-label">Region</span><span className="detail-value">{selected.region}</span></div>
              <div className="detail-row"><span className="detail-label">Industry</span><span className="detail-value">{selected.industry}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status] || 'badge-gray'}`}>{selected.status}</span></span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={generateStrategy} disabled={aiLoading} style={{ background: '#6c5ce7' }}>
                {aiLoading ? 'Analyzing...' : '🤖 AI Partnership Strategy'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 16, background: '#f8f9fa', borderRadius: 8, fontSize: 14, lineHeight: 1.6 }}>
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
            <h2>{form.id ? 'Edit Partner' : 'New Partner'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Company Name</label><input value={form.company_name || ''} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
              <div className="form-group"><label>Contact Name</label><input value={form.contact_name || ''} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Type</label>
                <select value={form.type || 'referral'} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="advisory">Advisory</option><option value="referral">Referral</option>
                  <option value="delivery">Delivery</option><option value="technology">Technology</option>
                </select>
              </div>
              <div className="form-group"><label>Status</label>
                <select value={form.status || 'pending'} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Region</label><input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
              <div className="form-group"><label>Industry</label><input value={form.industry || ''} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
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
