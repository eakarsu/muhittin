import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const industries = ['Healthcare', 'Technology', 'Financial Services', 'Education', 'Real Estate', 'International Trade', 'Manufacturing', 'Energy'];

export default function AdminCaseStudies() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  const load = () => {
    api('/api/case-studies?all=true').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = () => {
    setForm({ title: '', slug: '', industry: 'Technology', challenge: '', approach: '', result: '', impact: '', published: false });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title) };
      if (payload.id) await api(`/api/case-studies/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/case-studies', { method: 'POST', body: JSON.stringify(payload) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this case study?')) return;
    try { await api(`/api/case-studies/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const published = items.filter(i => i.published).length;

  return (
    <div>
      <div className="page-header">
        <div><h1>Case Studies</h1><p className="subtitle">{items.length} case studies | {published} published</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Case Study</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#2ed573' }}>{published}</div><div className="stat-label">Published</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#ffc107' }}>{items.length - published}</div><div className="stat-label">Drafts</div></div>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search case studies..."
        onRowClick={item => setSelected(item)}
        columns={[
          { key: 'title', label: 'Title', style: { fontWeight: 600 } },
          { key: 'industry', label: 'Industry' },
          { key: 'published', label: 'Published', render: item => <span className={`badge ${item.published ? 'badge-green' : 'badge-gray'}`}>{item.published ? 'Published' : 'Draft'}</span>, sortValue: item => item.published ? 1 : 0 },
          { key: 'created_at', label: 'Date', render: item => new Date(item.created_at).toLocaleDateString() },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.title}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Slug</span><span className="detail-value">{selected.slug}</span></div>
              <div className="detail-row"><span className="detail-label">Industry</span><span className="detail-value">{selected.industry}</span></div>
              <div className="detail-row"><span className="detail-label">Published</span><span className="detail-value"><span className={`badge ${selected.published ? 'badge-green' : 'badge-gray'}`}>{selected.published ? 'Yes' : 'No'}</span></span></div>
              <div className="detail-row"><span className="detail-label">Challenge</span><span className="detail-value">{selected.challenge}</span></div>
              <div className="detail-row"><span className="detail-label">Approach</span><span className="detail-value">{selected.approach}</span></div>
              <div className="detail-row"><span className="detail-label">Result</span><span className="detail-value">{selected.result}</span></div>
              <div className="detail-row"><span className="detail-label">Impact</span><span className="detail-value">{selected.impact}</span></div>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <h2>{form.id ? 'Edit Case Study' : 'New Case Study'}</h2>
            <div className="form-group"><label>Title</label><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} /></div>
            <div className="form-group"><label>Slug</label><input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="form-group"><label>Industry</label>
              <select value={form.industry || 'Technology'} onChange={e => setForm({ ...form, industry: e.target.value })}>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Challenge</label><textarea value={form.challenge || ''} onChange={e => setForm({ ...form, challenge: e.target.value })} rows={3} /></div>
            <div className="form-group"><label>Approach</label><textarea value={form.approach || ''} onChange={e => setForm({ ...form, approach: e.target.value })} rows={3} /></div>
            <div className="form-group"><label>Result</label><textarea value={form.result || ''} onChange={e => setForm({ ...form, result: e.target.value })} rows={3} /></div>
            <div className="form-group"><label>Impact</label><textarea value={form.impact || ''} onChange={e => setForm({ ...form, impact: e.target.value })} rows={3} /></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.published || false} onChange={e => setForm({ ...form, published: e.target.checked })} id="published" />
              <label htmlFor="published" style={{ margin: 0 }}>Published</label>
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
