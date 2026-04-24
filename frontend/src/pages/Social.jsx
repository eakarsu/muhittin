import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

const platformIcons = { instagram: '📸 Instagram', facebook: '👤 Facebook', tiktok: '🎵 TikTok', linkedin: '💼 LinkedIn', twitter: '🐦 Twitter' };
const statusColors = { draft: 'badge-gray', scheduled: 'badge-blue', published: 'badge-green' };

export default function Social() {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (platformFilter) params.set('platform', platformFilter);
    if (statusFilter) params.set('status', statusFilter);
    api(`/api/social?${params}`).then(setPosts).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); api('/api/businesses').then(setBusinesses).catch(() => {}); }, []);
  useEffect(() => { load(); }, [search, platformFilter, statusFilter]);

  const handleCreate = () => { setForm({ business_id: '', platform: 'instagram', content: '', image_url: '', status: 'draft', scheduled_at: '' }); setShowForm(true); setSelected(null); };
  const handleEdit = () => { setForm({ ...selected, scheduled_at: selected.scheduled_at ? selected.scheduled_at.slice(0, 16) : '' }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/social/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/social', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try { await api(`/api/social/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };
  const handlePublish = async () => {
    try { await api(`/api/social/${selected.id}/publish`, { method: 'PATCH' }); setSelected({ ...selected, status: 'published' }); load(); } catch (err) { alert(err.message); }
  };

  const generatePost = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const biz = businesses.find(b => String(b.id) === String(form.business_id || selected?.business_id));
      const data = await api('/api/ai/social-post', {
        method: 'POST',
        body: JSON.stringify({ businessName: biz?.name, platform: form.platform || selected?.platform, category: biz?.category, topic: 'business promotion' })
      });
      setAiResult(data.content);
      if (showForm) setForm(f => ({ ...f, content: data.content }));
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Social Media</h1><p className="subtitle">{posts.length} posts</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Post</button>
      </div>
      <SortableTable
        data={posts}
        searchPlaceholder="Search all social post fields..."
        onRowClick={p => { setSelected(p); setAiResult(''); }}
        columns={[
          { key: 'platform', label: 'Platform', render: p => platformIcons[p.platform] || p.platform },
          { key: 'content', label: 'Content', style: { maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          { key: 'business_name', label: 'Business' },
          { key: 'engagement', label: 'Engagement', style: { fontSize: 12 }, render: p => p.status === 'published' ? `${p.likes} / ${p.comments_count} / ${p.shares}` : p.scheduled_at && p.status === 'scheduled' ? new Date(p.scheduled_at).toLocaleDateString() : '' },
          { key: 'status', label: 'Status', render: p => <span className={`badge ${statusColors[p.status]}`}>{p.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2><span className={`platform-icon ${selected.platform}`}>{platformIcons[selected.platform]}</span></h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Business</span><span className="detail-value">{selected.business_name}</span></div>
              <div className="detail-row"><span className="detail-label">Content</span><span className="detail-value">{selected.content}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status]}`}>{selected.status}</span></span></div>
              {selected.status === 'published' && (
                <>
                  <div className="detail-row"><span className="detail-label">Engagement</span><span className="detail-value">❤️ {selected.likes} | 💬 {selected.comments_count} | 🔄 {selected.shares}</span></div>
                  <div className="detail-row"><span className="detail-label">Published</span><span className="detail-value">{selected.published_at ? new Date(selected.published_at).toLocaleString() : 'N/A'}</span></div>
                </>
              )}
              {selected.scheduled_at && <div className="detail-row"><span className="detail-label">Scheduled</span><span className="detail-value">{new Date(selected.scheduled_at).toLocaleString()}</span></div>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generatePost} disabled={aiLoading}>{aiLoading ? 'Generating...' : '🤖 AI Generate Post'}</button>
              {selected.status !== 'published' && <button className="btn btn-sm btn-success" onClick={handlePublish}>Publish Now</button>}
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
            <h2>{form.id ? 'Edit Post' : 'New Post'}</h2>
            <div className="form-group"><label>Business</label>
              <select value={form.business_id || ''} onChange={e => setForm({ ...form, business_id: e.target.value })}>
                <option value="">Select business...</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Platform</label>
              <select value={form.platform || 'instagram'} onChange={e => setForm({ ...form, platform: e.target.value })}>
                <option value="instagram">Instagram</option><option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option><option value="linkedin">LinkedIn</option><option value="twitter">Twitter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Content <button className="btn btn-sm btn-outline" style={{ marginLeft: 8 }} onClick={generatePost} disabled={aiLoading}>{aiLoading ? '...' : '🤖 AI Generate'}</button></label>
              <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} />
            </div>
            {aiResult && <div style={{ padding: 10, background: '#f8f9fa', borderRadius: 6, fontSize: 13, marginBottom: 12 }}><ReactMarkdown>{aiResult}</ReactMarkdown></div>}
            <div className="form-group"><label>Image URL</label><input value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Status</label>
                <select value={form.status || 'draft'} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option><option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="form-group"><label>Schedule At</label><input type="datetime-local" value={form.scheduled_at || ''} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} /></div>
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
