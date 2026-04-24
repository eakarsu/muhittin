import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

export default function AdminIndustries() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  const load = () => {
    api('/api/industries?all=true').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = () => {
    setForm({ name: '', slug: '', description: '', challenges: '', approach: '', solutions: '', related_services: '', published: true });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => {
    setForm({
      ...selected,
      related_services: selected.related_services ? (Array.isArray(selected.related_services) ? selected.related_services.join(', ') : JSON.stringify(selected.related_services)) : ''
    });
    setShowForm(true);
  };
  const handleSave = async () => {
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      // Parse related_services from comma-separated string to array
      if (typeof payload.related_services === 'string' && payload.related_services.trim()) {
        payload.related_services = payload.related_services.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        payload.related_services = null;
      }
      if (payload.id) await api(`/api/industries/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/industries', { method: 'POST', body: JSON.stringify(payload) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this industry?')) return;
    try { await api(`/api/industries/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const published = items.filter(i => i.published).length;

  return (
    <div>
      <div className="page-header">
        <div><h1>Industries</h1><p className="subtitle">{items.length} industries | {published} published</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Industry</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#2ed573' }}>{published}</div><div className="stat-label">Published</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#ffc107' }}>{items.length - published}</div><div className="stat-label">Drafts</div></div>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search industries..."
        onRowClick={item => setSelected(item)}
        columns={[
          { key: 'name', label: 'Name', style: { fontWeight: 600 } },
          { key: 'slug', label: 'Slug' },
          { key: 'published', label: 'Published', render: item => <span className={`badge ${item.published ? 'badge-green' : 'badge-gray'}`}>{item.published ? 'Yes' : 'No'}</span>, sortValue: item => item.published ? 1 : 0 },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Slug</span><span className="detail-value">{selected.slug}</span></div>
              <div className="detail-row"><span className="detail-label">Published</span><span className="detail-value"><span className={`badge ${selected.published ? 'badge-green' : 'badge-gray'}`}>{selected.published ? 'Yes' : 'No'}</span></span></div>
              <div className="detail-row"><span className="detail-label">Description</span><span className="detail-value">{selected.description}</span></div>
              <div className="detail-row"><span className="detail-label">Challenges</span><span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{selected.challenges}</span></div>
              <div className="detail-row"><span className="detail-label">Approach</span><span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{selected.approach}</span></div>
              <div className="detail-row"><span className="detail-label">Solutions</span><span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{selected.solutions}</span></div>
              <div className="detail-row"><span className="detail-label">Related Services</span><span className="detail-value">{selected.related_services ? (Array.isArray(selected.related_services) ? selected.related_services.join(', ') : JSON.stringify(selected.related_services)) : '—'}</span></div>
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
            <h2>{form.id ? 'Edit Industry' : 'New Industry'}</h2>
            <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} /></div>
            <div className="form-group"><label>Slug</label><input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="form-group"><label>Description</label><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="form-group"><label>Challenges (one per line)</label><textarea value={form.challenges || ''} onChange={e => setForm({ ...form, challenges: e.target.value })} rows={4} /></div>
            <div className="form-group"><label>Approach</label><textarea value={form.approach || ''} onChange={e => setForm({ ...form, approach: e.target.value })} rows={4} /></div>
            <div className="form-group"><label>Solutions (one per line)</label><textarea value={form.solutions || ''} onChange={e => setForm({ ...form, solutions: e.target.value })} rows={4} /></div>
            <div className="form-group"><label>Related Services (comma-separated slugs)</label><input value={form.related_services || ''} onChange={e => setForm({ ...form, related_services: e.target.value })} /></div>
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
