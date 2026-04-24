import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

const statusColors = { new: 'badge-blue', contacted: 'badge-yellow', qualified: 'badge-purple', won: 'badge-green', lost: 'badge-red' };

export default function Leads() {
  const { api } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (sourceFilter) params.set('source', sourceFilter);
    api(`/api/leads?${params}`).then(setLeads).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); api('/api/businesses').then(setBusinesses).catch(() => {}); }, []);
  useEffect(() => { load(); }, [search, statusFilter, sourceFilter]);

  const sources = [...new Set(leads.map(l => l.source).filter(Boolean))].sort();

  const handleCreate = () => { setForm({ business_id: '', name: '', email: '', phone: '', source: '', status: 'new', value: '', notes: '', follow_up_date: '' }); setShowForm(true); setSelected(null); };
  const handleEdit = () => { setForm({ ...selected, follow_up_date: selected.follow_up_date ? selected.follow_up_date.split('T')[0] : '' }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/leads/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/leads', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this lead?')) return;
    try { await api(`/api/leads/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };
  const handleStatusChange = async (id, status) => {
    try { await api(`/api/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); if (selected) setSelected({ ...selected, status }); } catch (err) { alert(err.message); }
  };

  const scoreLeads = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/lead-score', {
        method: 'POST',
        body: JSON.stringify({ leads: leads.filter(l => l.status !== 'won' && l.status !== 'lost').slice(0, 10) })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const totalValue = leads.reduce((s, l) => s + parseFloat(l.value || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div><h1>Leads</h1><p className="subtitle">{leads.length} leads | Pipeline: ${totalValue.toLocaleString()}</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={scoreLeads} disabled={aiLoading}>{aiLoading ? 'Scoring...' : '🤖 AI Score Leads'}</button>
          <button className="btn btn-primary" onClick={handleCreate}>+ New Lead</button>
        </div>
      </div>

      {aiResult && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>AI Lead Scoring</h3>
          <div style={{ fontSize: 13 }}><ReactMarkdown>{aiResult}</ReactMarkdown></div>
          <button className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => setAiResult('')}>Close</button>
        </div>
      )}

      <SortableTable
        data={leads}
        searchPlaceholder="Search all lead fields..."
        onRowClick={setSelected}
        columns={[
          { key: 'name', label: 'Name', render: l => <><span style={{ fontWeight: 600 }}>{l.name}</span><br /><span style={{ fontSize: 11, color: '#888' }}>{l.email}</span></> },
          { key: 'business_name', label: 'Business' },
          { key: 'source', label: 'Source', render: l => <span className="badge badge-gray">{l.source}</span> },
          { key: 'value', label: 'Value', style: { fontWeight: 700, color: '#2ed573' }, render: l => `$${parseFloat(l.value || 0).toLocaleString()}`, sortValue: l => parseFloat(l.value || 0) },
          { key: 'follow_up_date', label: 'Follow Up', style: { color: '#ff6348', fontSize: 12 }, render: l => l.follow_up_date ? new Date(l.follow_up_date).toLocaleDateString() : '' },
          { key: 'status', label: 'Status', render: l => <span className={`badge ${statusColors[l.status]}`}>{l.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selected.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Business</span><span className="detail-value">{selected.business_name}</span></div>
              <div className="detail-row"><span className="detail-label">Source</span><span className="detail-value"><span className="badge badge-gray">{selected.source}</span></span></div>
              <div className="detail-row"><span className="detail-label">Value</span><span className="detail-value" style={{ fontWeight: 700, color: '#2ed573' }}>${parseFloat(selected.value || 0).toLocaleString()}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status]}`}>{selected.status}</span></span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
              <div className="detail-row"><span className="detail-label">Follow Up</span><span className="detail-value">{selected.follow_up_date ? new Date(selected.follow_up_date).toLocaleDateString() : 'N/A'}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {selected.status === 'new' && <button className="btn btn-sm" style={{ background: '#ffc107', color: '#000' }} onClick={() => handleStatusChange(selected.id, 'contacted')}>Mark Contacted</button>}
              {(selected.status === 'new' || selected.status === 'contacted') && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(selected.id, 'qualified')}>Qualify</button>}
              {selected.status !== 'won' && selected.status !== 'lost' && <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(selected.id, 'won')}>Won</button>}
              {selected.status !== 'won' && selected.status !== 'lost' && <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(selected.id, 'lost')}>Lost</button>}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={scoreLeads} disabled={aiLoading}>{aiLoading ? 'Scoring...' : '🤖 AI Score This Lead'}</button>
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
            <h2>{form.id ? 'Edit Lead' : 'New Lead'}</h2>
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
              <div className="form-group"><label>Source</label><input value={form.source || ''} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="google, referral, etc." /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Value ($)</label><input type="number" value={form.value || ''} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
              <div className="form-group"><label>Follow Up Date</label><input type="date" value={form.follow_up_date || ''} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status || 'new'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="new">New</option><option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option><option value="won">Won</option><option value="lost">Lost</option>
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
