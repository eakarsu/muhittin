import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const stageColors = { kickoff: 'badge-blue', 'in-progress': 'badge-yellow', review: 'badge-orange', completed: 'badge-green' };
const stageOrder = ['kickoff', 'in-progress', 'review', 'completed'];

export default function AdminOrders() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    api('/api/orders').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setForm({ deal_id: '', contact_id: '', service_package_id: '', payment_id: '', delivery_stage: 'kickoff', notes: '' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/orders/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/orders', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this order?')) return;
    try { await api(`/api/orders/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); } catch (err) { alert(err.message); }
  };

  const optimizeOrder = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/order-optimize', {
        method: 'POST',
        body: JSON.stringify({ delivery_stage: selected.delivery_stage, service_package: selected.service_package_id, contact_name: selected.contact_id })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Orders</h1><p className="subtitle">{items.length} orders</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Order</button>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search orders..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'id', label: 'Order', render: item => <span style={{ fontWeight: 600 }}>#{item.id}</span> },
          { key: 'deal_id', label: 'Deal', render: item => `#${item.deal_id}` },
          { key: 'contact_id', label: 'Contact', render: item => `#${item.contact_id}` },
          { key: 'service_package_id', label: 'Package', render: item => `#${item.service_package_id}` },
          { key: 'delivery_stage', label: 'Stage', render: item => <span className={`badge ${stageColors[item.delivery_stage] || 'badge-gray'}`}>{item.delivery_stage}</span>, sortValue: item => stageOrder.indexOf(item.delivery_stage) },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Order #{selected.id}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Deal ID</span><span className="detail-value">{selected.deal_id}</span></div>
              <div className="detail-row"><span className="detail-label">Contact ID</span><span className="detail-value">{selected.contact_id}</span></div>
              <div className="detail-row"><span className="detail-label">Package ID</span><span className="detail-value">{selected.service_package_id}</span></div>
              <div className="detail-row"><span className="detail-label">Payment ID</span><span className="detail-value">{selected.payment_id}</span></div>
              <div className="detail-row"><span className="detail-label">Delivery Stage</span><span className="detail-value"><span className={`badge ${stageColors[selected.delivery_stage] || 'badge-gray'}`}>{selected.delivery_stage}</span></span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
            </div>
            <div style={{ margin: '16px 0' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {stageOrder.map(stage => (
                  <div key={stage} style={{
                    flex: 1, height: 8, borderRadius: 4,
                    background: stageOrder.indexOf(selected.delivery_stage) >= stageOrder.indexOf(stage) ? '#2ed573' : '#e0e0e0'
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 4 }}>
                {stageOrder.map(s => <span key={s}>{s}</span>)}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={optimizeOrder} disabled={aiLoading}>
                {aiLoading ? 'Loading...' : '🤖 AI Delivery Guide'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 8, fontSize: 14 }}>
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
            <h2>{form.id ? 'Edit Order' : 'New Order'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Deal ID</label><input type="number" value={form.deal_id || ''} onChange={e => setForm({ ...form, deal_id: e.target.value })} /></div>
              <div className="form-group"><label>Contact ID</label><input type="number" value={form.contact_id || ''} onChange={e => setForm({ ...form, contact_id: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Service Package ID</label><input type="number" value={form.service_package_id || ''} onChange={e => setForm({ ...form, service_package_id: e.target.value })} /></div>
              <div className="form-group"><label>Payment ID</label><input type="number" value={form.payment_id || ''} onChange={e => setForm({ ...form, payment_id: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Delivery Stage</label>
              <select value={form.delivery_stage || 'kickoff'} onChange={e => setForm({ ...form, delivery_stage: e.target.value })}>
                <option value="kickoff">Kickoff</option><option value="in-progress">In Progress</option>
                <option value="review">Review</option><option value="completed">Completed</option>
              </select>
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
