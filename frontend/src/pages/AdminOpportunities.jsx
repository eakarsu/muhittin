import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';

const statusColors = { new: 'badge-blue', reviewing: 'badge-yellow', qualified: 'badge-green', proposal: 'badge-yellow', negotiation: 'badge-orange', converted: 'badge-green', closed: 'badge-gray' };
const transitions = {
  new: ['reviewing', 'qualified', 'closed'],
  reviewing: ['qualified', 'closed'],
  qualified: ['proposal', 'closed'],
  proposal: ['negotiation', 'closed'],
  negotiation: ['converted', 'closed'],
  converted: [],
  closed: [],
};

export default function AdminOpportunities() {
  const { api, user } = useAuth();
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const canTransition = ['owner', 'admin', 'manager'].includes(user?.role);

  const load = () => api('/api/opportunities').then(setItems).finally(() => setLoading(false));
  const loadEvents = id => api(`/api/opportunities/${id}/events`).then(setEvents);
  useEffect(() => { load().catch(console.error); }, []);

  const openOpportunity = item => {
    setSelected(item);
    setEvents([]);
    setAiResult('');
    loadEvents(item.id).catch(console.error);
  };

  const handleStatusChange = async status => {
    const message = status === 'closed' ? 'Closing note (required)' : 'Review note (optional)';
    const note = window.prompt(message, '') ?? null;
    if (note === null || (status === 'closed' && !note.trim())) return;
    try {
      const updated = await api(`/api/opportunities/${selected.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      setSelected(current => ({ ...current, ...updated }));
      await Promise.all([load(), loadEvents(selected.id)]);
    } catch (error) {
      alert(error.message);
    }
  };

  const assessOpportunity = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const data = await api('/api/ai/opportunity-assess', {
        method: 'POST',
        body: JSON.stringify({ company_name: selected.company_name, opportunity_type: selected.opportunity_type, region: selected.region, budget_range: selected.budget_range, description: selected.description }),
      });
      setAiResult(data.content);
    } catch (error) {
      setAiResult(`Error: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Opportunity Review</h1><p className="subtitle">{items.length} submissions · status changes are append-only audit events</p></div>
      </div>

      <SortableTable
        data={items}
        searchPlaceholder="Search opportunities..."
        onRowClick={openOpportunity}
        columns={[
          { key: 'company_name', label: 'Company', style: { fontWeight: 600 } },
          { key: 'contact_name', label: 'Contact', render: item => <>{item.contact_name}<br /><span style={{ fontSize: 11, color: '#888' }}>{item.email}</span></> },
          { key: 'opportunity_type', label: 'Type' },
          { key: 'region', label: 'Region' },
          { key: 'budget_range', label: 'Budget', style: { color: '#2ed573', fontWeight: 600 } },
          { key: 'status', label: 'Status', render: item => <span className={`badge ${statusColors[item.status] || 'badge-gray'}`}>{item.status}</span> },
        ]}
      />

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <h2>{selected.company_name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Contact</span><span className="detail-value">{selected.contact_name}</span></div>
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selected.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">{selected.opportunity_type}</span></div>
              <div className="detail-row"><span className="detail-label">Description</span><span className="detail-value">{selected.description}</span></div>
              <div className="detail-row"><span className="detail-label">Region</span><span className="detail-value">{selected.region}</span></div>
              <div className="detail-row"><span className="detail-label">Budget</span><span className="detail-value">{selected.budget_range}</span></div>
              <div className="detail-row"><span className="detail-label">Consent recorded</span><span className="detail-value">{selected.consent_recorded_at ? new Date(selected.consent_recorded_at).toLocaleString() : 'Legacy record'}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status] || 'badge-gray'}`}>{selected.status}</span></span></div>
            </div>

            {canTransition && transitions[selected.status]?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                {transitions[selected.status].map(status => <button key={status} className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(status)}>Move to {status}</button>)}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={assessOpportunity} disabled={aiLoading}>{aiLoading ? 'Assessing...' : 'AI assessment'}</button>
              <p style={{ fontSize: 12, color: '#64748b' }}>AI output is advisory. A human reviewer remains responsible for every status decision.</p>
              {aiResult && <div style={{ marginTop: 12, padding: 12, background: '#f0f7ff', borderRadius: 8, fontSize: 13, maxHeight: 300, overflow: 'auto' }}><ReactMarkdown>{aiResult}</ReactMarkdown></div>}
            </div>

            <h3 style={{ marginTop: 20 }}>Audit history</h3>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {events.length === 0 ? <p className="subtitle">No events available.</p> : events.map(event => (
                <div key={event.id} className="detail-row">
                  <span className="detail-label">{new Date(event.created_at).toLocaleString()}</span>
                  <span className="detail-value">{event.from_status ? `${event.from_status} → ` : ''}{event.to_status} · {event.actor_role}{event.note ? ` · ${event.note}` : ''}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
