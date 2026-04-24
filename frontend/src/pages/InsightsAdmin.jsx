import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const categoryColors = { insight: 'badge-blue', guide: 'badge-green', report: 'badge-purple', article: 'badge-yellow' };
const domainColors = { strategy: 'badge-blue', expansion: 'badge-green', talent: 'badge-purple', investment: 'badge-yellow', ai: 'badge-orange' };

export default function InsightsAdmin() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const generateArticle = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const target = showForm ? form : selected;
      const data = await api('/api/ai/generate-insight', {
        method: 'POST',
        body: JSON.stringify({ title: target?.title, category: target?.category, domain: target?.domain })
      });
      setAiResult(data.content);
      if (showForm) setForm(f => ({ ...f, content: data.content }));
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    if (domainFilter) params.set('domain', domainFilter);
    api(`/api/insights?${params}`).then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [search, categoryFilter, domainFilter]);

  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = () => {
    setForm({ title: '', slug: '', category: 'insight', domain: 'strategy', summary: '', content: '', author: '', published: false });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title) };
      if (payload.id) await api(`/api/insights/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/insights', { method: 'POST', body: JSON.stringify(payload) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this insight?')) return;
    try { await api(`/api/insights/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const published = items.filter(i => i.published).length;

  return (
    <div>
      <div className="page-header">
        <div><h1>Insights</h1><p className="subtitle">{items.length} insights | {published} published</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Insight</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#2ed573' }}>{published}</div><div className="stat-label">Published</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#ffc107' }}>{items.length - published}</div><div className="stat-label">Drafts</div></div>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search all insight fields..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'title', label: 'Title', style: { fontWeight: 600 } },
          { key: 'category', label: 'Category', render: item => <span className={`badge ${categoryColors[item.category] || 'badge-gray'}`}>{item.category}</span> },
          { key: 'domain', label: 'Domain', render: item => <span className={`badge ${domainColors[item.domain] || 'badge-gray'}`}>{item.domain}</span> },
          { key: 'author', label: 'Author' },
          { key: 'published', label: 'Status', render: item => <span className={`badge ${item.published ? 'badge-green' : 'badge-gray'}`}>{item.published ? 'Published' : 'Draft'}</span>, sortValue: item => item.published ? 1 : 0 },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.title}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Slug</span><span className="detail-value">{selected.slug}</span></div>
              <div className="detail-row"><span className="detail-label">Category</span><span className="detail-value"><span className={`badge ${categoryColors[selected.category] || 'badge-gray'}`}>{selected.category}</span></span></div>
              <div className="detail-row"><span className="detail-label">Domain</span><span className="detail-value"><span className={`badge ${domainColors[selected.domain] || 'badge-gray'}`}>{selected.domain}</span></span></div>
              <div className="detail-row"><span className="detail-label">Author</span><span className="detail-value">{selected.author}</span></div>
              <div className="detail-row"><span className="detail-label">Published</span><span className="detail-value"><span className={`badge ${selected.published ? 'badge-green' : 'badge-gray'}`}>{selected.published ? 'Yes' : 'No'}</span></span></div>
              <div className="detail-row"><span className="detail-label">Summary</span><span className="detail-value">{selected.summary}</span></div>
            </div>
            {selected.content && (
              <div style={{ marginTop: 12, padding: 12, background: '#f9f9f9', borderRadius: 8, fontSize: 13, maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {selected.content}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={generateArticle} disabled={aiLoading}>{aiLoading ? 'Generating...' : '🤖 AI Generate Article'}</button>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <h2>{form.id ? 'Edit Insight' : 'New Insight'}</h2>
            <div className="form-group"><label>Title</label><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} /></div>
            <div className="form-group"><label>Slug</label><input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Category</label>
                <select value={form.category || 'insight'} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="insight">Insight</option><option value="guide">Guide</option>
                  <option value="report">Report</option><option value="article">Article</option>
                </select>
              </div>
              <div className="form-group"><label>Domain</label>
                <select value={form.domain || 'strategy'} onChange={e => setForm({ ...form, domain: e.target.value })}>
                  <option value="strategy">Strategy</option><option value="expansion">Expansion</option>
                  <option value="talent">Talent</option><option value="investment">Investment</option>
                  <option value="ai">AI</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Author</label><input value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
            <div className="form-group"><label>Summary</label><textarea value={form.summary || ''} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2} /></div>
            <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Content <button type="button" className="btn btn-sm btn-primary" onClick={generateArticle} disabled={aiLoading} style={{ fontSize: 11, padding: '2px 8px' }}>{aiLoading ? 'Generating...' : '🤖 AI Generate'}</button></label><textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} style={{ fontFamily: 'monospace', fontSize: 13 }} />
              {aiResult && showForm && (
                <div style={{ marginTop: 8, padding: 10, background: '#f0f7ff', borderRadius: 8, fontSize: 13, maxHeight: 200, overflow: 'auto' }}>
                  <ReactMarkdown>{aiResult}</ReactMarkdown>
                </div>
              )}
            </div>
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
