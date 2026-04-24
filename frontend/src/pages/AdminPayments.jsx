import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const statusColors = { pending: 'badge-yellow', paid: 'badge-green', failed: 'badge-red', refunded: 'badge-gray' };

export default function AdminPayments() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const load = () => {
    api('/api/consulting-payments').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const loadStats = () => {
    api('/api/consulting-payments/stats').then(setStats).catch(console.error);
  };

  useEffect(() => { load(); loadStats(); }, []);

  const totalAmount = items.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  const handleCreate = () => {
    setForm({ deal_id: '', contact_id: '', amount: '', currency: 'USD', service: '', status: 'pending', stripe_payment_id: '', stripe_invoice_id: '', receipt_url: '' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/consulting-payments/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/consulting-payments', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load(); loadStats();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this payment record?')) return;
    try { await api(`/api/consulting-payments/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); loadStats(); } catch (err) { alert(err.message); }
  };

  const analyzePayment = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/payment-analysis', {
        method: 'POST',
        body: JSON.stringify({ service: selected.service || selected.deal_service_line, amount: selected.amount, currency: selected.currency, status: selected.status, contact_name: selected.contact_name })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Payments</h1><p className="subtitle">{items.length} payments | Total: ${totalAmount.toLocaleString()}</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Payment</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.total || items.length}</div><div className="stat-label">Total Payments</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: '#2ed573' }}>${(stats.total_amount || totalAmount).toLocaleString()}</div><div className="stat-label">Total Amount</div></div>
          {stats.by_status && Object.entries(stats.by_status).map(([k, v]) => (
            <div className="stat-card" key={k}><div className="stat-value">{v}</div><div className="stat-label">{k}</div></div>
          ))}
        </div>
      )}

      <SortableTable
        data={items}
        searchPlaceholder="Search payments..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'service', label: 'Service', render: item => <span style={{ fontWeight: 600 }}>{item.service || `Payment #${item.id}`}</span> },
          { key: 'amount', label: 'Amount', style: { fontWeight: 700, color: '#2ed573' }, render: item => `$${parseFloat(item.amount || 0).toLocaleString()} ${item.currency}`, sortValue: item => parseFloat(item.amount || 0) },
          { key: 'deal_id', label: 'Deal', render: item => `#${item.deal_id}` },
          { key: 'contact_id', label: 'Contact', render: item => `#${item.contact_id}` },
          { key: 'status', label: 'Status', render: item => <span className={`badge ${statusColors[item.status] || 'badge-gray'}`}>{item.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Payment Details</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Deal ID</span><span className="detail-value">{selected.deal_id}</span></div>
              <div className="detail-row"><span className="detail-label">Contact ID</span><span className="detail-value">{selected.contact_id}</span></div>
              <div className="detail-row"><span className="detail-label">Amount</span><span className="detail-value" style={{ fontWeight: 700, color: '#2ed573' }}>${parseFloat(selected.amount || 0).toLocaleString()} {selected.currency}</span></div>
              <div className="detail-row"><span className="detail-label">Service</span><span className="detail-value">{selected.service}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status] || 'badge-gray'}`}>{selected.status}</span></span></div>
              <div className="detail-row"><span className="detail-label">Stripe Payment ID</span><span className="detail-value">{selected.stripe_payment_id}</span></div>
              <div className="detail-row"><span className="detail-label">Stripe Invoice ID</span><span className="detail-value">{selected.stripe_invoice_id}</span></div>
              <div className="detail-row"><span className="detail-label">Receipt</span><span className="detail-value">{selected.receipt_url && <a href={selected.receipt_url} target="_blank" rel="noreferrer">View Receipt</a>}</span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={analyzePayment} disabled={aiLoading} style={{ background: '#6c5ce7' }}>
                {aiLoading ? 'Analyzing...' : '🤖 AI Payment Analysis'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 16, background: '#f8f9fa', borderRadius: 8, fontSize: 14, lineHeight: 1.6 }}>
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
            <h2>{form.id ? 'Edit Payment' : 'New Payment'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Deal ID</label><input type="number" value={form.deal_id || ''} onChange={e => setForm({ ...form, deal_id: e.target.value })} /></div>
              <div className="form-group"><label>Contact ID</label><input type="number" value={form.contact_id || ''} onChange={e => setForm({ ...form, contact_id: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Amount</label><input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="form-group"><label>Currency</label><input value={form.currency || 'USD'} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Service</label><input value={form.service || ''} onChange={e => setForm({ ...form, service: e.target.value })} /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.status || 'pending'} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option><option value="paid">Paid</option>
                  <option value="failed">Failed</option><option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Stripe Payment ID</label><input value={form.stripe_payment_id || ''} onChange={e => setForm({ ...form, stripe_payment_id: e.target.value })} /></div>
            <div className="form-group"><label>Stripe Invoice ID</label><input value={form.stripe_invoice_id || ''} onChange={e => setForm({ ...form, stripe_invoice_id: e.target.value })} /></div>
            <div className="form-group"><label>Receipt URL</label><input value={form.receipt_url || ''} onChange={e => setForm({ ...form, receipt_url: e.target.value })} /></div>
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
