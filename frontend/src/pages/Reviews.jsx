import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

const sourceColors = { google: 'google', yelp: 'yelp', instagram: 'instagram', facebook: 'facebook', manual: '' };

export default function Reviews() {
  const { api } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
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
    if (ratingFilter) params.set('rating', ratingFilter);
    api(`/api/reviews?${params}`).then(setReviews).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); api('/api/businesses').then(setBusinesses).catch(() => {}); }, []);
  useEffect(() => { load(); }, [search, statusFilter, ratingFilter]);

  const handleCreate = () => { setForm({ business_id: '', customer_name: '', rating: 5, comment: '', source: 'google' }); setShowForm(true); setSelected(null); };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/reviews/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/reviews', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return;
    try { await api(`/api/reviews/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };
  const handleRespond = async (response) => {
    try {
      await api(`/api/reviews/${selected.id}/respond`, { method: 'PATCH', body: JSON.stringify({ response }) });
      setSelected({ ...selected, response, status: 'responded' }); load();
    } catch (err) { alert(err.message); }
  };

  const generateResponse = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/review-response', {
        method: 'POST',
        body: JSON.stringify({ customerName: selected.customer_name, rating: selected.rating, comment: selected.comment, businessName: selected.business_name })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Reviews</h1><p className="subtitle">{reviews.length} reviews</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Review</button>
      </div>
      <SortableTable
        data={reviews}
        searchPlaceholder="Search all review fields..."
        onRowClick={r => { setSelected(r); setAiResult(''); }}
        columns={[
          { key: 'customer_name', label: 'Customer', style: { fontWeight: 600 } },
          { key: 'rating', label: 'Rating', render: r => <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>, sortValue: r => r.rating },
          { key: 'comment', label: 'Comment', style: { maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          { key: 'source', label: 'Source' },
          { key: 'business_name', label: 'Business' },
          { key: 'status', label: 'Status', render: r => <span className={`badge ${r.status === 'responded' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Review from {selected.customer_name}</h2>
            <div className="stars" style={{ fontSize: 20, marginBottom: 12 }}>{'★'.repeat(selected.rating)}{'☆'.repeat(5 - selected.rating)}</div>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Business</span><span className="detail-value">{selected.business_name}</span></div>
              <div className="detail-row"><span className="detail-label">Source</span><span className="detail-value"><span className={`platform-icon ${sourceColors[selected.source]}`}>{selected.source}</span></span></div>
              <div className="detail-row"><span className="detail-label">Comment</span><span className="detail-value">{selected.comment}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${selected.status === 'responded' ? 'badge-green' : 'badge-yellow'}`}>{selected.status}</span></span></div>
              {selected.response && <div className="detail-row"><span className="detail-label">Response</span><span className="detail-value" style={{ fontStyle: 'italic' }}>{selected.response}</span></div>}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-sm btn-outline" onClick={generateResponse} disabled={aiLoading}>
                {aiLoading ? 'Generating...' : '🤖 AI Generate Response'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ padding: 10, background: '#f8f9fa', borderRadius: 6, fontSize: 13, marginBottom: 8 }}>
                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                  </div>
                  {selected.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => handleRespond(aiResult)}>Use This Response</button>}
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
            <h2>{form.id ? 'Edit Review' : 'New Review'}</h2>
            <div className="form-group"><label>Business</label>
              <select value={form.business_id || ''} onChange={e => setForm({ ...form, business_id: e.target.value })}>
                <option value="">Select business...</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Customer Name</label><input value={form.customer_name || ''} onChange={e => setForm({ ...form, customer_name: e.target.value })} /></div>
              <div className="form-group"><label>Rating</label>
                <select value={form.rating || 5} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })}>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Comment</label><textarea value={form.comment || ''} onChange={e => setForm({ ...form, comment: e.target.value })} /></div>
            <div className="form-group"><label>Source</label>
              <select value={form.source || 'google'} onChange={e => setForm({ ...form, source: e.target.value })}>
                <option value="google">Google</option><option value="yelp">Yelp</option>
                <option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="manual">Manual</option>
              </select>
            </div>
            {form.id && <div className="form-group"><label>Response</label><textarea value={form.response || ''} onChange={e => setForm({ ...form, response: e.target.value })} /></div>}
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
