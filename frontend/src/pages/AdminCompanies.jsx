import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const sizeColors = { startup: 'badge-blue', small: 'badge-gray', medium: 'badge-yellow', large: 'badge-purple', enterprise: 'badge-green' };

export default function AdminCompanies() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    api('/api/companies').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setForm({ name: '', industry: '', size: 'small', region: '', website: '', relationship_owner: '', notes: '' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/companies/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/companies', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this company?')) return;
    try { await api(`/api/companies/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };

  const generateResearch = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/company-research', {
        method: 'POST',
        body: JSON.stringify({ name: selected.name, industry: selected.industry, size: selected.size, region: selected.region, website: selected.website })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Companies</h1><p className="subtitle">{items.length} companies</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Company</button>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search companies..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'name', label: 'Name', style: { fontWeight: 600 } },
          { key: 'industry', label: 'Industry' },
          { key: 'size', label: 'Size', render: item => <span className={`badge ${sizeColors[item.size] || 'badge-gray'}`}>{item.size}</span> },
          { key: 'region', label: 'Region' },
          { key: 'website', label: 'Website', style: { color: '#1e90ff', fontSize: 12 } },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Industry</span><span className="detail-value">{selected.industry}</span></div>
              <div className="detail-row"><span className="detail-label">Size</span><span className="detail-value"><span className={`badge ${sizeColors[selected.size] || 'badge-gray'}`}>{selected.size}</span></span></div>
              <div className="detail-row"><span className="detail-label">Region</span><span className="detail-value">{selected.region}</span></div>
              <div className="detail-row"><span className="detail-label">Website</span><span className="detail-value">{selected.website}</span></div>
              <div className="detail-row"><span className="detail-label">Owner</span><span className="detail-value">{selected.relationship_owner}</span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateResearch} disabled={aiLoading}>{aiLoading ? 'Generating...' : '🤖 AI Company Research'}</button>
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
            <h2>{form.id ? 'Edit Company' : 'New Company'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Industry</label><input value={form.industry || ''} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Size</label>
                <select value={form.size || 'small'} onChange={e => setForm({ ...form, size: e.target.value })}>
                  <option value="startup">Startup</option><option value="small">Small</option>
                  <option value="medium">Medium</option><option value="large">Large</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="form-group"><label>Region</label><input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Website</label><input value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
              <div className="form-group"><label>Relationship Owner</label><input value={form.relationship_owner || ''} onChange={e => setForm({ ...form, relationship_owner: e.target.value })} /></div>
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
