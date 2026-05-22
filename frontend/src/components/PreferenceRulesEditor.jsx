import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', trigger: '', action: '', priority: 'medium', enabled: true };

export default function PreferenceRulesEditor() {
  const { api } = useAuth();
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    api('/api/custom-views/rules')
      .then(d => setRules(d.rules || []))
      .catch(e => setErr(e.message));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.trigger || !form.action) {
      setErr('Name, trigger, and action are required.');
      return;
    }
    setBusy(true); setErr('');
    try {
      if (editingId != null) {
        await api(`/api/custom-views/rules/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await api('/api/custom-views/rules', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setForm(emptyForm); setEditingId(null);
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setForm({ name: r.name, trigger: r.trigger, action: r.action, priority: r.priority, enabled: r.enabled });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return;
    setBusy(true); setErr('');
    try {
      await api(`/api/custom-views/rules/${id}`, { method: 'DELETE' });
      if (editingId === id) { setEditingId(null); setForm(emptyForm); }
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (r) => {
    setBusy(true); setErr('');
    try {
      await api(`/api/custom-views/rules/${r.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !r.enabled }),
      });
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = { padding: '6px 8px', background: '#0a0d14', color: '#fff', border: '1px solid #2a3040', borderRadius: 4, fontSize: 13 };

  return (
    <div style={{ background: '#1a1f2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>Preference Rules Editor</h3>
      <p style={{ color: '#9aa', fontSize: 12, marginTop: 0 }}>
        Configurable automation rules with triggers, actions, and priorities. Full CRUD via /api/custom-views/rules.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: 8, marginBottom: 12 }}>
        <input style={inputStyle} placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={inputStyle} placeholder="Trigger (e.g. deal.value > 1000)" value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })} />
        <input style={inputStyle} placeholder="Action (e.g. notify_owner)" value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} />
        <select style={inputStyle} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <label style={{ color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
          on
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-primary" disabled={busy} onClick={handleSave}>
          {editingId != null ? 'Update Rule' : 'Add Rule'}
        </button>
        {editingId != null && (
          <button className="btn" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>
        )}
      </div>

      {err && <div style={{ color: '#ff4757', fontSize: 13, marginBottom: 8 }}>{err}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#d8e1f0', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#10131c' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Trigger</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Action</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Priority</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Status</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 12, color: '#9aa' }}>No rules yet.</td></tr>
          )}
          {rules.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #2a3040' }}>
              <td style={{ padding: 6 }}>{r.name}</td>
              <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 12 }}>{r.trigger}</td>
              <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 12 }}>{r.action}</td>
              <td style={{ padding: 6 }}>{r.priority}</td>
              <td style={{ padding: 6 }}>
                <button className="btn" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => handleToggle(r)}>
                  {r.enabled ? 'enabled' : 'disabled'}
                </button>
              </td>
              <td style={{ padding: 6 }}>
                <button className="btn" style={{ fontSize: 11, padding: '2px 6px', marginRight: 4 }} onClick={() => handleEdit(r)}>edit</button>
                <button className="btn" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => handleDelete(r.id)}>delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
