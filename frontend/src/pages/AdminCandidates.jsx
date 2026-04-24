import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SortableTable from '../components/SortableTable';
import ReactMarkdown from 'react-markdown';

const statusColors = { new: 'badge-blue', screened: 'badge-yellow', shortlisted: 'badge-orange', placed: 'badge-green', archived: 'badge-gray' };

export default function AdminCandidates() {
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
    api('/api/candidates').then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  const loadStats = () => {
    api('/api/candidates/stats').then(setStats).catch(console.error);
  };

  useEffect(() => { load(); loadStats(); }, []);

  const handleCreate = () => {
    setForm({ name: '', email: '', phone: '', industry: '', experience_years: '', region: '', role_level: 'Senior', compensation_min: '', compensation_max: '', skills: '', resume_url: '', linkedin_url: '', availability: 'immediate', status: 'new', notes: '' });
    setShowForm(true); setSelected(null);
  };
  const handleEdit = () => { setForm({ ...selected }); setShowForm(true); };
  const handleSave = async () => {
    try {
      if (form.id) await api(`/api/candidates/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await api('/api/candidates', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false); setSelected(null); setLoading(true); load(); loadStats();
    } catch (err) { alert(err.message); }
  };
  const handleDelete = async () => {
    if (!confirm('Delete this candidate?')) return;
    try { await api(`/api/candidates/${selected.id}`, { method: 'DELETE' }); setSelected(null); setLoading(true); load(); loadStats(); } catch (err) { alert(err.message); }
  };

  const evaluateCandidate = async () => {
    setAiLoading(true); setAiResult('');
    try {
      const data = await api('/api/ai/candidate-evaluate', {
        method: 'POST',
        body: JSON.stringify({ name: selected.name, industry: selected.industry, role_level: selected.role_level, experience_years: selected.experience_years, region: selected.region, skills: selected.skills, compensation_min: selected.compensation_min, compensation_max: selected.compensation_max })
      });
      setAiResult(data.content);
    } catch (err) { setAiResult('Error: ' + err.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Candidates</h1><p className="subtitle">{items.length} candidates</p></div>
        <button className="btn btn-primary" onClick={handleCreate}>+ New Candidate</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{stats.total || items.length}</div><div className="stat-label">Total Candidates</div></div>
          {stats.by_status && Object.entries(stats.by_status).map(([k, v]) => (
            <div className="stat-card" key={k}><div className="stat-value">{v}</div><div className="stat-label">{k}</div></div>
          ))}
        </div>
      )}

      <SortableTable
        data={items}
        searchPlaceholder="Search candidates..."
        onRowClick={item => { setSelected(item); setAiResult(''); }}
        columns={[
          { key: 'name', label: 'Name', style: { fontWeight: 600 }, render: item => <>{item.name}<br /><span style={{ fontSize: 11, color: '#888' }}>{item.email}</span></> },
          { key: 'role_level', label: 'Role Level', render: item => <span className="badge badge-gray">{item.role_level}</span> },
          { key: 'industry', label: 'Industry' },
          { key: 'region', label: 'Region' },
          { key: 'experience_years', label: 'Experience', render: item => `${item.experience_years} yrs`, sortValue: item => Number(item.experience_years) || 0 },
          { key: 'compensation_min', label: 'Compensation', style: { color: '#2ed573' }, render: item => item.compensation_min ? `$${Number(item.compensation_min).toLocaleString()} - $${Number(item.compensation_max).toLocaleString()}` : '', sortValue: item => Number(item.compensation_min) || 0 },
          { key: 'status', label: 'Status', render: item => <span className={`badge ${statusColors[item.status] || 'badge-gray'}`}>{item.status}</span> },
        ]}
      />

      {selected && !showForm && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selected.phone}</span></div>
              <div className="detail-row"><span className="detail-label">Industry</span><span className="detail-value">{selected.industry}</span></div>
              <div className="detail-row"><span className="detail-label">Experience</span><span className="detail-value">{selected.experience_years} years</span></div>
              <div className="detail-row"><span className="detail-label">Region</span><span className="detail-value">{selected.region}</span></div>
              <div className="detail-row"><span className="detail-label">Role Level</span><span className="detail-value"><span className="badge badge-purple">{selected.role_level}</span></span></div>
              <div className="detail-row"><span className="detail-label">Compensation</span><span className="detail-value">${Number(selected.compensation_min || 0).toLocaleString()} - ${Number(selected.compensation_max || 0).toLocaleString()}</span></div>
              <div className="detail-row"><span className="detail-label">Skills</span><span className="detail-value">{selected.skills}</span></div>
              <div className="detail-row"><span className="detail-label">Availability</span><span className="detail-value">{selected.availability}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={`badge ${statusColors[selected.status] || 'badge-gray'}`}>{selected.status}</span></span></div>
              <div className="detail-row"><span className="detail-label">LinkedIn</span><span className="detail-value">{selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" rel="noreferrer">{selected.linkedin_url}</a>}</span></div>
              <div className="detail-row"><span className="detail-label">Resume</span><span className="detail-value">{selected.resume_url && <a href={selected.resume_url} target="_blank" rel="noreferrer">View Resume</a>}</span></div>
              <div className="detail-row"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes}</span></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={evaluateCandidate} disabled={aiLoading} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {aiLoading ? '⏳ Evaluating...' : '🤖 AI Evaluate Candidate'}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, padding: 16, background: '#f0f0ff', borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>
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
            <h2>{form.id ? 'Edit Candidate' : 'New Candidate'}</h2>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label>Industry</label><input value={form.industry || ''} onChange={e => setForm({ ...form, industry: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Experience (years)</label><input type="number" value={form.experience_years || ''} onChange={e => setForm({ ...form, experience_years: e.target.value })} /></div>
              <div className="form-group"><label>Region</label><input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Role Level</label>
                <select value={form.role_level || 'Senior'} onChange={e => setForm({ ...form, role_level: e.target.value })}>
                  <option value="C-Suite">C-Suite</option><option value="VP">VP</option>
                  <option value="Director">Director</option><option value="Manager">Manager</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div className="form-group"><label>Availability</label>
                <select value={form.availability || 'immediate'} onChange={e => setForm({ ...form, availability: e.target.value })}>
                  <option value="immediate">Immediate</option><option value="1month">1 Month</option>
                  <option value="3months">3 Months</option><option value="passive">Passive</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Compensation Min ($)</label><input type="number" value={form.compensation_min || ''} onChange={e => setForm({ ...form, compensation_min: e.target.value })} /></div>
              <div className="form-group"><label>Compensation Max ($)</label><input type="number" value={form.compensation_max || ''} onChange={e => setForm({ ...form, compensation_max: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Skills</label><input value={form.skills || ''} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Comma-separated skills" /></div>
            <div className="form-row">
              <div className="form-group"><label>Resume URL</label><input value={form.resume_url || ''} onChange={e => setForm({ ...form, resume_url: e.target.value })} /></div>
              <div className="form-group"><label>LinkedIn URL</label><input value={form.linkedin_url || ''} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status || 'new'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="new">New</option><option value="screened">Screened</option>
                <option value="shortlisted">Shortlisted</option><option value="placed">Placed</option>
                <option value="archived">Archived</option>
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
