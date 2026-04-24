import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { key: 'payment_received', label: 'Payment Received' },
  { key: 'welcome_email_sent', label: 'Welcome Email Sent' },
  { key: 'kickoff_scheduled', label: 'Kickoff Scheduled' },
  { key: 'internal_project_created', label: 'Internal Project Created' },
  { key: 'milestone_1_done', label: 'Milestone 1' },
  { key: 'milestone_2_done', label: 'Milestone 2' },
  { key: 'milestone_3_done', label: 'Milestone 3' },
  { key: 'milestone_4_done', label: 'Milestone 4' },
];

const STATUS_OPTIONS = ['initiated', 'in_progress', 'completed'];

export default function AdminOnboarding() {
  const { api } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    deal_id: '', contact_id: '', company_id: '', service: '',
    milestone_1: '', milestone_2: '', milestone_3: '', milestone_4: '',
  });

  const fetchData = async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const [wf, st] = await Promise.all([
        api(`/api/onboarding${params}`),
        api('/api/onboarding/stats'),
      ]);
      setWorkflows(wf);
      setStats(st);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterStatus]);

  const handleToggle = async (id, key, currentValue) => {
    try {
      await api(`/api/onboarding/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [key]: !currentValue }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const body = { status: newStatus };
      if (newStatus === 'completed') body.completed_at = new Date().toISOString();
      await api(`/api/onboarding/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          deal_id: form.deal_id ? parseInt(form.deal_id) : null,
          contact_id: form.contact_id ? parseInt(form.contact_id) : null,
          company_id: form.company_id ? parseInt(form.company_id) : null,
          service: form.service,
          milestone_1: form.milestone_1 || undefined,
          milestone_2: form.milestone_2 || undefined,
          milestone_3: form.milestone_3 || undefined,
          milestone_4: form.milestone_4 || undefined,
        }),
      });
      setForm({ deal_id: '', contact_id: '', company_id: '', service: '', milestone_1: '', milestone_2: '', milestone_3: '', milestone_4: '' });
      setShowCreate(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this onboarding workflow?')) return;
    try {
      await api(`/api/onboarding/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getProgress = (wf) => {
    const total = 8;
    let done = 0;
    if (wf.payment_received) done++;
    if (wf.welcome_email_sent) done++;
    if (wf.kickoff_scheduled) done++;
    if (wf.internal_project_created) done++;
    if (wf.milestone_1_done) done++;
    if (wf.milestone_2_done) done++;
    if (wf.milestone_3_done) done++;
    if (wf.milestone_4_done) done++;
    return Math.round((done / total) * 100);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Client Onboarding</h1>
          <p className="subtitle">Track client onboarding workflows and milestones</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Create Onboarding'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Workflows</div>
          <div className="stat-value" style={{ color: '#6c63ff' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: '#ffa502' }}>{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: '#2ed573' }}>{stats.completed}</div>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>New Onboarding Workflow</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Deal ID</label>
                <input type="number" value={form.deal_id} onChange={e => setForm(p => ({ ...p, deal_id: e.target.value }))} className="input" placeholder="Optional" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Contact ID</label>
                <input type="number" value={form.contact_id} onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))} className="input" placeholder="Optional" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Company ID</label>
                <input type="number" value={form.company_id} onChange={e => setForm(p => ({ ...p, company_id: e.target.value }))} className="input" placeholder="Optional" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Service *</label>
                <input type="text" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} className="input" required placeholder="e.g. Strategy Consulting" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Milestone 1</label>
                <input type="text" value={form.milestone_1} onChange={e => setForm(p => ({ ...p, milestone_1: e.target.value }))} className="input" placeholder="Discovery & Kickoff" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Milestone 2</label>
                <input type="text" value={form.milestone_2} onChange={e => setForm(p => ({ ...p, milestone_2: e.target.value }))} className="input" placeholder="Strategy Development" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Milestone 3</label>
                <input type="text" value={form.milestone_3} onChange={e => setForm(p => ({ ...p, milestone_3: e.target.value }))} className="input" placeholder="Execution & Delivery" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Milestone 4</label>
                <input type="text" value={form.milestone_4} onChange={e => setForm(p => ({ ...p, milestone_4: e.target.value }))} className="input" placeholder="Review & Handoff" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Workflow</button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button className={`btn ${filterStatus === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus('')}>All</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus(s)}>
            {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Workflow Cards */}
      {workflows.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          No onboarding workflows found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {workflows.map(wf => {
            const progress = getProgress(wf);
            return (
              <div key={wf.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{wf.service || 'Untitled Service'}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
                      {wf.contact_name && `Contact: ${wf.contact_name}`}
                      {wf.contact_name && wf.company_name && ' | '}
                      {wf.company_name && `Company: ${wf.company_name}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      value={wf.status}
                      onChange={e => handleStatusChange(wf.id, e.target.value)}
                      className="input"
                      style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                    <button onClick={() => handleDelete(wf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ef4444' }}>
                      X
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#94a3b8' }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: progress === 100 ? '#2ed573' : progress > 50 ? '#ffa502' : '#6c63ff',
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {/* Checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {STEPS.map(step => {
                    const milestoneLabel = step.key === 'milestone_1_done' ? (wf.milestone_1 || 'Milestone 1')
                      : step.key === 'milestone_2_done' ? (wf.milestone_2 || 'Milestone 2')
                      : step.key === 'milestone_3_done' ? (wf.milestone_3 || 'Milestone 3')
                      : step.key === 'milestone_4_done' ? (wf.milestone_4 || 'Milestone 4')
                      : step.label;
                    return (
                      <label key={step.key} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                        borderRadius: 6, background: wf[step.key] ? 'rgba(46,213,115,0.1)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer', fontSize: 13,
                      }}>
                        <input
                          type="checkbox"
                          checked={!!wf[step.key]}
                          onChange={() => handleToggle(wf.id, step.key, wf[step.key])}
                          style={{ accentColor: '#2ed573' }}
                        />
                        <span style={{ color: wf[step.key] ? '#2ed573' : '#cbd5e1' }}>{milestoneLabel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
