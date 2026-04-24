import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const domainColors = { strategy: 'badge-blue', expansion: 'badge-green', talent: 'badge-purple', investment: 'badge-yellow', ai: 'badge-orange' };

export default function AdminPackages() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    api('/api/service-packages').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setForm({ name: '', slug: '', domain: 'strategy', description: '', price: '', price_type: 'one-time', stripe_price_id: '', stripe_product_id: '', delivery_workflow: '', active: true });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') };
      if (payload.id) await api(`/api/service-packages/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/service-packages', { method: 'POST', body: JSON.stringify(payload) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this package?')) return;
    try { await api(`/api/service-packages/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };

  const suggestPricing = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/package-pricing', {
        method: 'POST',
        body: JSON.stringify({ name: selected.name, domain: selected.domain, description: selected.description, current_price: selected.price })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const active = items.filter(i => i.active).length;

  return (
    <div>
      <div className="page-header">
        <div><h1>Service Packages</h1><p className="subtitle">{items.length} packages | {active} active</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Package</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{items.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#2ed573' }}>{active}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#888' }}>{items.length - active}</div><div className="stat-label">Inactive</div></div>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search packages..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        rowStyle={item => ({ opacity: item.active ? 1 : 0.6 })}
        columns={[
          { key: 'name', label: 'Name', style: { fontWeight: 600 } },
          { key: 'domain', label: 'Domain', render: item => <span className={`badge ${domainColors[item.domain] || 'badge-gray'}`}>{item.domain}</span> },
          { key: 'price', label: 'Price', style: { fontWeight: 700, color: '#2ed573' }, render: item => `$${parseFloat(item.price || 0).toLocaleString()}`, sortValue: item => parseFloat(item.price || 0) },
          { key: 'price_type', label: 'Type' },
          { key: 'active', label: 'Status', render: item => <span className={`badge ${item.active ? 'badge-green' : 'badge-gray'}`}>{item.active ? 'Active' : 'Inactive'}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Slug</span><span className="detail-value">{selected.slug}</span></div>
              <div className="detail-row"><span className="detail-label">Domain</span><span className="detail-value"><span className={`badge ${domainColors[selected.domain] || 'badge-gray'}`}>{selected.domain}</span></span></div>
              <div className="detail-row"><span className="detail-label">Description</span><span className="detail-value">{selected.description}</span></div>
              <div className="detail-row"><span className="detail-label">Price</span><span className="detail-value" style={{ fontWeight: 700, color: '#2ed573' }}>${parseFloat(selected.price || 0).toLocaleString()}</span></div>
              <div className="detail-row"><span className="detail-label">Price Type</span><span className="detail-value">{selected.price_type}</span></div>
              <div className="detail-row"><span className="detail-label">Stripe Price ID</span><span className="detail-value">{selected.stripe_price_id}</span></div>
              <div className="detail-row"><span className="detail-label">Stripe Product ID</span><span className="detail-value">{selected.stripe_product_id}</span></div>
              <div className="detail-row"><span className="detail-label">Delivery Workflow</span><span className="detail-value">{selected.delivery_workflow}</span></div>
              <div className="detail-row"><span className="detail-label">Active</span><span className="detail-value"><span className={`badge ${selected.active ? 'badge-green' : 'badge-gray'}`}>{selected.active ? 'Yes' : 'No'}</span></span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={suggestPricing} disabled={aiLoading}>
                {aiLoading ? 'Analyzing...' : '🤖 AI Pricing Strategy'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 16, background: '#f0f4ff', borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
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
            <h2>{form.id ? 'Edit Package' : 'New Package'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Slug</label><input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Domain</label>
                <select value={form.domain || 'strategy'} onChange={e => setForm({ ...form, domain: e.target.value })}>
                  <option value="strategy">Strategy</option><option value="expansion">Expansion</option>
                  <option value="talent">Talent</option><option value="investment">Investment</option>
                  <option value="ai">AI</option>
                </select>
              </div>
              <div className="form-group"><label>Price Type</label>
                <select value={form.price_type || 'one-time'} onChange={e => setForm({ ...form, price_type: e.target.value })}>
                  <option value="one-time">One-time</option><option value="recurring">Recurring</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Description</label><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-group"><label>Price ($)</label><input type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Stripe Price ID</label><input value={form.stripe_price_id || ''} onChange={e => setForm({ ...form, stripe_price_id: e.target.value })} /></div>
              <div className="form-group"><label>Stripe Product ID</label><input value={form.stripe_product_id || ''} onChange={e => setForm({ ...form, stripe_product_id: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Delivery Workflow</label><textarea value={form.delivery_workflow || ''} onChange={e => setForm({ ...form, delivery_workflow: e.target.value })} /></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.active || false} onChange={e => setForm({ ...form, active: e.target.checked })} id="active" />
              <label htmlFor="active" style={{ margin: 0 }}>Active</label>
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
