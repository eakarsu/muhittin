import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

export default function Websites() {
  const { api } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    api(`/api/websites?${params}`).then(setWebsites).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); api('/api/businesses').then(setBusinesses).catch(() => {}); }, []);
  useEffect(() => { load(); }, [search]);

  const handleCreate = () => { setForm({ business_id: '', page_title: '', slug: '', template: 'service', headline: '', subheadline: '', cta_text: '', cta_link: '', sections: '' }); setShowForm(true); setSelected(null); };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/websites/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/websites', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this website?')) return;
    try { await api(`/api/websites/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };
  const handleTogglePublish = async (id) => {
    try { await api(`/api/websites/${id}/publish`, { method: 'PATCH' }); load(); if (selected) setSelected({ ...selected, published: !selected.published }); } catch (err) { alert(err.message); }
  };

  const generateCopy = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const biz = businesses.find(b => String(b.id) === String(form.business_id || selected?.business_id));
      const data = await api('/api/ai/website-copy', {
        method: 'POST',
        body: JSON.stringify({ businessName: biz?.name, category: biz?.category, services: biz?.services, goal: 'generate leads' })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Websites</h1><p className="subtitle">{websites.length} landing pages</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Page</button>
      </div>
      <SortableTable
        data={websites}
        searchPlaceholder="Search all website fields..."
        onRowClick={w => { setSelected(w); setAiResult(''); }}
        columns={[
          { key: 'page_title', label: 'Page Title', style: { fontWeight: 600 } },
          { key: 'headline', label: 'Headline', style: { color: '#6c63ff' } },
          { key: 'template', label: 'Template', render: w => <span className="badge badge-blue">{w.template}</span> },
          { key: 'business_name', label: 'Business' },
          { key: 'visits', label: 'Visits' },
          { key: 'published', label: 'Status', render: w => <span className={`badge ${w.published ? 'badge-green' : 'badge-gray'}`}>{w.published ? 'Published' : 'Draft'}</span>, sortValue: w => w.published ? 1 : 0 },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.page_title}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Business</span><span className="detail-value">{selected.business_name}</span></div>
              <div className="detail-row"><span className="detail-label">Slug</span><span className="detail-value">/{selected.slug}</span></div>
              <div className="detail-row"><span className="detail-label">Template</span><span className="detail-value"><span className="badge badge-blue">{selected.template}</span></span></div>
              <div className="detail-row"><span className="detail-label">Headline</span><span className="detail-value" style={{ fontSize: 16, fontWeight: 700, color: '#6c63ff' }}>{selected.headline}</span></div>
              <div className="detail-row"><span className="detail-label">Subheadline</span><span className="detail-value">{selected.subheadline}</span></div>
              <div className="detail-row"><span className="detail-label">CTA</span><span className="detail-value"><span className="btn btn-sm btn-primary">{selected.cta_text}</span> → {selected.cta_link}</span></div>
              <div className="detail-row"><span className="detail-label">Sections</span><span className="detail-value">{selected.sections}</span></div>
              <div className="detail-row"><span className="detail-label">Published</span><span className="detail-value"><span className={`badge ${selected.published ? 'badge-green' : 'badge-gray'}`}>{selected.published ? 'Yes' : 'No'}</span></span></div>
              <div className="detail-row"><span className="detail-label">Visits</span><span className="detail-value">{selected.visits}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateCopy} disabled={aiLoading}>{aiLoading ? 'Generating...' : '🤖 AI Generate Copy'}</button>
              <button className={`btn btn-sm ${selected.published ? 'btn-secondary' : 'btn-success'}`} onClick={() => handleTogglePublish(selected.id)}>
                {selected.published ? 'Unpublish' : 'Publish'}
              </button>
            </div>
            {aiResult && <div style={{ marginTop: 10, padding: 10, background: '#f8f9fa', borderRadius: 6, fontSize: 13 }}><ReactMarkdown>{aiResult}</ReactMarkdown></div>}
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
            <h2>{form.id ? 'Edit Page' : 'New Page'}</h2>
            <div className="form-group"><label>Business</label>
              <select value={form.business_id || ''} onChange={e => setForm({ ...form, business_id: e.target.value })}>
                <option value="">Select business...</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Page Title</label><input value={form.page_title || ''} onChange={e => setForm({ ...form, page_title: e.target.value })} /></div>
              <div className="form-group"><label>Slug</label><input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="my-page" /></div>
            </div>
            <div className="form-group"><label>Template</label>
              <select value={form.template || 'service'} onChange={e => setForm({ ...form, template: e.target.value })}>
                <option value="service">Service</option><option value="healthcare">Healthcare</option>
                <option value="professional">Professional</option><option value="beauty">Beauty</option>
                <option value="fitness">Fitness</option><option value="restaurant">Restaurant</option>
              </select>
            </div>
            <div className="form-group">
              <label>Headline <button className="btn btn-sm btn-outline" style={{ marginLeft: 8 }} onClick={generateCopy} disabled={aiLoading}>{aiLoading ? '...' : '🤖 AI Generate'}</button></label>
              <input value={form.headline || ''} onChange={e => setForm({ ...form, headline: e.target.value })} />
            </div>
            <div className="form-group"><label>Subheadline</label><textarea value={form.subheadline || ''} onChange={e => setForm({ ...form, subheadline: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>CTA Text</label><input value={form.cta_text || ''} onChange={e => setForm({ ...form, cta_text: e.target.value })} /></div>
              <div className="form-group"><label>CTA Link</label><input value={form.cta_link || ''} onChange={e => setForm({ ...form, cta_link: e.target.value })} /></div>
            </div>
            {aiResult && <div style={{ padding: 10, background: '#f8f9fa', borderRadius: 6, fontSize: 13, marginBottom: 12 }}><ReactMarkdown>{aiResult}</ReactMarkdown></div>}
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
