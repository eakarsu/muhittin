import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

const stageColors = { discovery: 'badge-blue', proposal: 'badge-yellow', negotiation: 'badge-orange', won: 'badge-green', lost: 'badge-red' };

export default function AdminDeals() {
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
    api('/api/deals').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const loadStats = () => {
    api('/api/deals/stats').then(setStats).catch(console.error);
  };

  useEffect(() => { load(); loadStats(); }, []);

  const pipelineValue = items.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + parseFloat(d.value || 0), 0);
  const wonValue = items.filter(d => d.stage === 'won').reduce((s, d) => s + parseFloat(d.value || 0), 0);

  const handleCreate = () => {
    setForm({ contact_id: '', company_id: '', opportunity_type: 'consulting', service_line: '', value: '', stage: 'discovery', close_date: '', region: '', notes: '' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected, close_date: selected.close_date ? selected.close_date.split('T')[0] : '' }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/deals/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/deals', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load(); loadStats();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this deal?')) return;
    try { await api(`/api/deals/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); loadStats(); } catch (err) { alert(err.message); }
  };

  const generateStrategy = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/deal-strategy', {
        method: 'POST',
        body: JSON.stringify({ service_line: selected.service_line, opportunity_type: selected.opportunity_type, value: selected.value, stage: selected.stage, region: selected.region })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Deals</h1><p className="subtitle">{items.length} deals | Pipeline: ${pipelineValue.toLocaleString()} | Won: ${wonValue.toLocaleString()}</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Deal</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.total || items.length}</div><div className="stat-label">Total Deals</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: '#1e90ff' }}>${pipelineValue.toLocaleString()}</div><div className="stat-label">Pipeline Value</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: '#2ed573' }}>${wonValue.toLocaleString()}</div><div className="stat-label">Won Value</div></div>
          {stats.by_stage && Object.entries(stats.by_stage).map(([k, v]) => (
            <div className="stat-card" key={k}><div className="stat-value">{v}</div><div className="stat-label">{k}</div></div>
          ))}
        </div>
      )}

      <SortableTable
        data={items}
        searchPlaceholder="Search deals..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'service_line', label: 'Service Line', style: { fontWeight: 600 }, render: item => item.service_line || item.opportunity_type },
          { key: 'opportunity_type', label: 'Type' },
          { key: 'value', label: 'Value', style: { fontWeight: 700, color: '#2ed573' }, render: item => `$${parseFloat(item.value || 0).toLocaleString()}`, sortValue: item => parseFloat(item.value || 0) },
          { key: 'region', label: 'Region' },
          { key: 'close_date', label: 'Close Date', render: item => item.close_date ? new Date(item.close_date).toLocaleDateString() : '', sortValue: item => item.close_date || '' },
          { key: 'stage', label: 'Stage', render: item => <span className={`badge ${stageColors[item.stage] || 'badge-gray'}`}>{item.stage}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Deal Details</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Contact ID</span><span className="detail-value">{selected.contact_id}</span></div>
              <div className="detail-row"><span className="detail-label">Company ID</span><span className="detail-value">{selected.company_id}</span></div>
              <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">{selected.opportunity_type}</span></div>
              <div className="detail-row"><span className="detail-label">Service Line</span><span className="detail-value">{selected.service_line}</span></div>
              <div className="detail-row"><span className="detail-label">Value</span><span className="detail-value" style={{ fontWeight: 700, color: '#2ed573' }}>${parseFloat(selected.value || 0).toLocaleString()}</span></div>
              <div className="detail-row"><span className="detail-label">Stage</span><span className="detail-value"><span className={`badge ${stageColors[selected.stage] || 'badge-gray'}`}>{selected.stage}</span></span></div>
              <div className="detail-row"><span className="detail-label">Close Date</span><span className="detail-value">{selected.close_date ? new Date(selected.close_date).toLocaleDateString() : 'N/A'}</span></div>
              <div className="detail-row"><span className="detail-label">Region</span><span className="detail-value">{selected.region}</span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={generateStrategy} disabled={aiLoading} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {aiLoading ? '⏳ Generating...' : '🤖 AI Deal Strategy'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 16, background: '#f0f0ff', borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>
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
            <h2>{form.id ? 'Edit Deal' : 'New Deal'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Contact ID</label><input type="number" value={form.contact_id || ''} onChange={e => setForm({ ...form, contact_id: e.target.value })} /></div>
              <div className="form-group"><label>Company ID</label><input type="number" value={form.company_id || ''} onChange={e => setForm({ ...form, company_id: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Opportunity Type</label>
                <select value={form.opportunity_type || 'consulting'} onChange={e => setForm({ ...form, opportunity_type: e.target.value })}>
                  <option value="consulting">Consulting</option><option value="search">Search</option>
                  <option value="advisory">Advisory</option><option value="investment">Investment</option>
                </select>
              </div>
              <div className="form-group"><label>Service Line</label><input value={form.service_line || ''} onChange={e => setForm({ ...form, service_line: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Value ($)</label><input type="number" value={form.value || ''} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
              <div className="form-group"><label>Stage</label>
                <select value={form.stage || 'discovery'} onChange={e => setForm({ ...form, stage: e.target.value })}>
                  <option value="discovery">Discovery</option><option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option><option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Close Date</label><input type="date" value={form.close_date || ''} onChange={e => setForm({ ...form, close_date: e.target.value })} /></div>
              <div className="form-group"><label>Region</label><input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
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
