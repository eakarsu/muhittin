import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

export default function Campaigns() {
  const { api } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    api('/api/campaigns').then(setCampaigns).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); api('/api/businesses').then(setBusinesses).catch(() => {}); }, []);

  const handleCreate = () => { setForm({ business_id: '', name: '', type: 'email', subject: '', content: '', target_audience: '', status: 'draft' }); setShowForm(true); setSelected(null); };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/campaigns/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/campaigns', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this campaign?')) return;
    try { await api(`/api/campaigns/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };
  const handleSend = async () => {
    if (!confirm('Send this campaign?')) return;
    try { await api(`/api/campaigns/${selected.id}/send`, { method: 'PATCH' }); setSelected({ ...selected, status: 'sent' }); load(); } catch (err) { alert(err.message); }
  };

  const generateContent = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const biz = businesses.find(b => String(b.id) === String(form.business_id || selected?.business_id));
      const data = await api('/api/ai/campaign-content', {
        method: 'POST',
        body: JSON.stringify({ businessName: biz?.name, campaignType: form.type || selected?.type, goal: form.name || selected?.name, targetAudience: form.target_audience || selected?.target_audience })
      });
      setAiResult(data.content);
      if (showForm) setForm(f => ({ ...f, content: data.content }));
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  const statusBadge = (s) => ({ draft: 'badge-gray', scheduled: 'badge-blue', sent: 'badge-green' }[s] || 'badge-gray');

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Campaigns</h1><p className="subtitle">{campaigns.length} marketing campaigns</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Campaign</button>
      </div>
      <SortableTable
        data={campaigns}
        searchPlaceholder="Search campaigns..."
        onRowClick={(c) => { setSelected(c); setAiResult(''); }}
        columns={[
          { key: 'name', label: 'Name', style: { fontWeight: 600 } },
          { key: 'type', label: 'Type', render: (c) => <span className={`badge ${c.type === 'email' ? 'badge-purple' : 'badge-blue'}`}>{c.type}</span> },
          { key: 'subject', label: 'Subject' },
          { key: 'business_name', label: 'Business' },
          { key: 'metrics', label: 'Metrics', style: { fontSize: 12 }, render: (c) => c.status === 'sent' ? `${c.recipients} sent / ${c.opens} opens / ${c.clicks} clicks` : '' },
          { key: 'status', label: 'Status', render: (c) => <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Business</span><span className="detail-value">{selected.business_name}</span></div>
              <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value"><span className={`badge ${selected.type === 'email' ? 'badge-purple' : 'badge-blue'}`}>{selected.type}</span></span></div>
              <div className="detail-row"><span className="detail-label">Subject</span><span className="detail-value">{selected.subject}</span></div>
              <div className="detail-row"><span className="detail-label">Content</span><span className="detail-value">{selected.content}</span></div>
              <div className="detail-row"><span className="detail-label">Target</span><span className="detail-value">{selected.target_audience}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusBadge(selected.status)}`}>{selected.status}</span></span></div>
              {selected.status === 'sent' && (
                <>
                  <div className="detail-row"><span className="detail-label">Recipients</span><span className="detail-value">{selected.recipients}</span></div>
                  <div className="detail-row"><span className="detail-label">Opens</span><span className="detail-value">{selected.opens} ({selected.recipients ? ((selected.opens / selected.recipients) * 100).toFixed(1) : 0}%)</span></div>
                  <div className="detail-row"><span className="detail-label">Clicks</span><span className="detail-value">{selected.clicks} ({selected.recipients ? ((selected.clicks / selected.recipients) * 100).toFixed(1) : 0}%)</span></div>
                </>
              )}
            </div>
            {selected.status === 'draft' && (
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-success" onClick={handleSend}>Send Campaign</button>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateContent} disabled={aiLoading}>{aiLoading ? 'Generating...' : '🤖 AI Generate Content'}</button>
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
            <h2>{form.id ? 'Edit Campaign' : 'New Campaign'}</h2>
            <div className="form-group"><label>Business</label>
              <select value={form.business_id || ''} onChange={e => setForm({ ...form, business_id: e.target.value })}>
                <option value="">Select business...</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Type</label>
                <select value={form.type || 'email'} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="email">Email</option><option value="sms">SMS</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Subject</label><input value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="form-group"><label>Target Audience</label><input value={form.target_audience || ''} onChange={e => setForm({ ...form, target_audience: e.target.value })} placeholder="all_customers, leads, etc." /></div>
            <div className="form-group">
              <label>Content <button className="btn btn-sm btn-outline" style={{ marginLeft: 8 }} onClick={generateContent} disabled={aiLoading}>{aiLoading ? '...' : '🤖 AI Generate'}</button></label>
              <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} />
            </div>
            {aiResult && !showForm && <div style={{ padding: 10, background: '#f8f9fa', borderRadius: 6, fontSize: 13 }}><ReactMarkdown>{aiResult}</ReactMarkdown></div>}
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
