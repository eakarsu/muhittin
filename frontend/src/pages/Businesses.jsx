import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

export default function Businesses() {
  const { api } = useAuth();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    api('/api/businesses').then(setBusinesses).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => { setForm({ name: '', category: '', subcategory: '', description: '', phone: '', email: '', website_url: '', address: '', city: '', state: '', zip_code: '', hours: '', services: '', pricing_info: '' }); setShowForm(true); setSelected(null); };

  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };

  const handleSave = async () => {
    try {
      if (form.id) {
        await api(`/api/businesses/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/api/businesses', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this business?')) return;
    try {
      await api(`/api/businesses/${selected.id}`, { method: 'DELETE' });
      setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };

  const generateDesc = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/generate-description', {
        method: 'POST',
        body: JSON.stringify({ businessName: form.name || selected?.name, category: form.category || selected?.category, services: form.services || selected?.services, city: form.city || selected?.city })
      });
      setAiResult(data.content);
      if (showForm) setForm(f => ({ ...f, description: data.content }));
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Businesses</h1><p className="subtitle">{businesses.length} business profiles</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Business</button>
      </div>

      <SortableTable
        data={businesses}
        searchPlaceholder="Search businesses..."
        onRowClick={(b) => { setSelected(b); setAiResult(''); }}
        columns={[
          { key: 'name', label: 'Name', style: { fontWeight: 600 } },
          { key: 'category', label: 'Category', render: (b) => <><span className="badge badge-purple">{b.category}</span>{b.subcategory && <><br /><span className="badge badge-blue">{b.subcategory}</span></>}</> },
          { key: 'city', label: 'Location', render: (b) => `${b.city}, ${b.state}` },
          { key: 'rating', label: 'Rating', render: (b) => <span className="stars">{'★'.repeat(Math.round(b.rating || 0))} {b.rating}</span>, sortValue: (b) => b.rating || 0 },
          { key: 'status', label: 'Status', render: (b) => <span className={`badge ${b.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{b.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Category</span><span className="detail-value">{selected.category} / {selected.subcategory}</span></div>
              <div className="detail-row"><span className="detail-label">Description</span><span className="detail-value">{selected.description}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selected.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-row"><span className="detail-label">Website</span><span className="detail-value">{selected.website_url}</span></div>
              <div className="detail-row"><span className="detail-label">Address</span><span className="detail-value">{selected.address}, {selected.city}, {selected.state} {selected.zip_code}</span></div>
              <div className="detail-row"><span className="detail-label">Hours</span><span className="detail-value">{selected.hours}</span></div>
              <div className="detail-row"><span className="detail-label">Services</span><span className="detail-value">{selected.services}</span></div>
              <div className="detail-row"><span className="detail-label">Pricing</span><span className="detail-value">{selected.pricing_info}</span></div>
              <div className="detail-row"><span className="detail-label">Rating</span><span className="detail-value">{selected.rating} ⭐ ({selected.review_count} reviews)</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${selected.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{selected.status}</span></span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateDesc} disabled={aiLoading}>
                {aiLoading ? 'Generating...' : '🤖 AI Generate Description'}
              </button>
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
            <h2>{form.id ? 'Edit Business' : 'New Business'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Category</label><input value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Healthcare" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Subcategory</label><input value={form.subcategory || ''} onChange={e => setForm({ ...form, subcategory: e.target.value })} /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Website</label><input value={form.website_url || ''} onChange={e => setForm({ ...form, website_url: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Address</label><input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>City</label><input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div className="form-group"><label>State</label><input value={form.state || ''} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Hours</label><input value={form.hours || ''} onChange={e => setForm({ ...form, hours: e.target.value })} /></div>
            <div className="form-group"><label>Services</label><textarea value={form.services || ''} onChange={e => setForm({ ...form, services: e.target.value })} /></div>
            <div className="form-group">
              <label>Description <button className="btn btn-sm btn-outline" style={{ marginLeft: 8 }} onClick={generateDesc} disabled={aiLoading}>{aiLoading ? '...' : '🤖 AI Generate'}</button></label>
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>
            <div className="form-group"><label>Pricing Info</label><textarea value={form.pricing_info || ''} onChange={e => setForm({ ...form, pricing_info: e.target.value })} /></div>
            {form.id && (
              <div className="form-group"><label>Status</label>
                <select value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            )}
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
