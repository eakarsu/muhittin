import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const statusColors = { new: 'badge-blue', reviewing: 'badge-yellow', qualified: 'badge-green', closed: 'badge-gray' };

export default function AdminOpportunities() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const assessOpportunity = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/opportunity-assess', {
        method: 'POST',
        body: JSON.stringify({ company_name: selected.company_name, opportunity_type: selected.opportunity_type, region: selected.region, budget_range: selected.budget_range, description: selected.description })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  const load = () => {
    api('/api/opportunities').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setForm({ company_name: '', contact_name: '', email: '', phone: '', opportunity_type: '', description: '', region: '', budget_range: '', status: 'new' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/opportunities/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/opportunities', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this opportunity?')) return;
    try { await api(`/api/opportunities/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };
  const handleStatusChange = async (id, status) => {
    try {
      await api(`/api/opportunities/${id}`, { method: 'PUT', body: JSON.stringify({ ...selected, status }) });
      load();
      if (selected) setSelected({ ...selected, status });
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Opportunities</h1><p className="subtitle">{items.length} opportunities</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Opportunity</button>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search all opportunity fields..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'company_name', label: 'Company', render: item => item.company_name, style: { fontWeight: 600 } },
          { key: 'contact_name', label: 'Contact', render: item => <>{item.contact_name}<br /><span style={{ fontSize: 11, color: '#888' }}>{item.email}</span></> },
          { key: 'opportunity_type', label: 'Type' },
          { key: 'region', label: 'Region' },
          { key: 'budget_range', label: 'Budget', style: { color: '#2ed573', fontWeight: 600 } },
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
              <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">{selected.opportunity_type}</span></div>
              <div className="detail-row"><span className="detail-label">Description</span><span className="detail-value">{selected.description}</span></div>
              <div className="detail-row"><span className="detail-label">Region</span><span className="detail-value">{selected.region}</span></div>
              <div className="detail-row"><span className="detail-label">Budget</span><span className="detail-value">{selected.budget_range}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status] || 'badge-gray'}`}>{selected.status}</span></span></div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {selected.status === 'new' && <button className="btn btn-sm" style={{ background: '#ffc107', color: '#000' }} onClick={() => handleStatusChange(selected.id, 'reviewing')}>Start Review</button>}
              {(selected.status === 'new' || selected.status === 'reviewing') && <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(selected.id, 'qualified')}>Qualify</button>}
              {selected.status !== 'closed' && <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(selected.id, 'closed')}>Close</button>}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={assessOpportunity} disabled={aiLoading}>{aiLoading ? 'Assessing...' : '🤖 AI Assess Opportunity'}</button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 12, background: '#f0f7ff', borderRadius: 8, fontSize: 13, maxHeight: 300, overflow: 'auto' }}>
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
            <h2>{form.id ? 'Edit Opportunity' : 'New Opportunity'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Company Name</label><input value={form.company_name || ''} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
              <div className="form-group"><label>Contact Name</label><input value={form.contact_name || ''} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Opportunity Type</label><input value={form.opportunity_type || ''} onChange={e => setForm({ ...form, opportunity_type: e.target.value })} /></div>
              <div className="form-group"><label>Region</label><input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Description</label><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Budget Range</label><input value={form.budget_range || ''} onChange={e => setForm({ ...form, budget_range: e.target.value })} placeholder="e.g. $50k-$100k" /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.status || 'new'} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="new">New</option><option value="reviewing">Reviewing</option>
                  <option value="qualified">Qualified</option><option value="closed">Closed</option>
                </select>
              </div>
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
