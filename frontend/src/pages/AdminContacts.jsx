import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const lifecycleColors = { visitor: 'badge-gray', lead: 'badge-blue', qualified: 'badge-purple', client: 'badge-green' };

export default function AdminContacts() {
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
    api('/api/contacts').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const loadStats = () => {
    api('/api/contacts/stats').then(setStats).catch(console.error);
  };

  useEffect(() => { load(); loadStats(); }, []);

  const handleCreate = () => {
    setForm({ name: '', email: '', phone: '', company: '', industry: '', region: '', lifecycle_stage: 'visitor', source: '', interest: '' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/contacts/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/contacts', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load(); loadStats();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this contact?')) return;
    try { await api(`/api/contacts/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); loadStats(); } catch (err) { alert(err.message); }
  };

  const generateOutreach = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/contact-outreach', {
        method: 'POST',
        body: JSON.stringify({ name: selected.name, company: selected.company_name, industry: selected.industry, region: selected.region, lifecycle_stage: selected.lifecycle_stage, interest: selected.interest })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Contacts</h1><p className="subtitle">{items.length} contacts</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Contact</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.total || items.length}</div><div className="stat-label">Total Contacts</div></div>
          {stats.by_lifecycle_stage && Object.entries(stats.by_lifecycle_stage).map(([k, v]) => (
            <div className="stat-card" key={k}><div className="stat-value">{v}</div><div className="stat-label">{k}</div></div>
          ))}
        </div>
      )}

      <SortableTable
        data={items}
        searchPlaceholder="Search contacts..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          {
            key: 'name',
            label: 'Name',
            style: { fontWeight: 600 },
            render: item => (<>{item.name}<br /><span style={{ fontSize: 11, color: '#888' }}>{item.email}</span></>),
            sortValue: item => item.name
          },
          { key: 'company', label: 'Company' },
          { key: 'industry', label: 'Industry' },
          { key: 'region', label: 'Region' },
          {
            key: 'lifecycle_stage',
            label: 'Stage',
            render: item => (<span className={`badge ${lifecycleColors[item.lifecycle_stage] || 'badge-gray'}`}>{item.lifecycle_stage}</span>)
          }
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
              <div className="detail-row"><span className="detail-label">Industry</span><span className="detail-value">{selected.industry}</span></div>
              <div className="detail-row"><span className="detail-label">Region</span><span className="detail-value">{selected.region}</span></div>
              <div className="detail-row"><span className="detail-label">Stage</span><span className="detail-value"><span className={`badge ${lifecycleColors[selected.lifecycle_stage] || 'badge-gray'}`}>{selected.lifecycle_stage}</span></span></div>
              <div className="detail-row"><span className="detail-label">Source</span><span className="detail-value">{selected.source}</span></div>
              <div className="detail-row"><span className="detail-label">Interest</span><span className="detail-value">{selected.interest}</span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateOutreach} disabled={aiLoading}>{aiLoading ? 'Generating...' : '🤖 AI Outreach Strategy'}</button>
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
            <h2>{form.id ? 'Edit Contact' : 'New Contact'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label>Company</label><input value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Industry</label><input value={form.industry || ''} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
              <div className="form-group"><label>Region</label><input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Lifecycle Stage</label>
                <select value={form.lifecycle_stage || 'visitor'} onChange={e => setForm({ ...form, lifecycle_stage: e.target.value })}>
                  <option value="visitor">Visitor</option><option value="lead">Lead</option>
                  <option value="qualified">Qualified</option><option value="client">Client</option>
                </select>
              </div>
              <div className="form-group"><label>Source</label><input value={form.source || ''} onChange={e => setForm({ ...form, source: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Interest</label><textarea value={form.interest || ''} onChange={e => setForm({ ...form, interest: e.target.value })} /></div>
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
