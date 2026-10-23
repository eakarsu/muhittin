import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AIReport from './AIReport';

// Wave 15B UI: follow-up tasks, lead export, and lead AI over own leads.
export default function FeaturePackPanel() {
  const { api, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    try { const data = await api('/api/tasks'); setTasks(data.data || []); } catch (_) { /* best-effort */ }
  }, [api]);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  async function addTask(event) {
    event.preventDefault();
    try { await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) }); setTitle(''); loadTasks(); }
    catch (e) { setError(e.message); }
  }
  async function toggleTask(task) {
    try { await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ status: task.status === 'done' ? 'open' : 'done' }) }); loadTasks(); }
    catch (e) { setError(e.message); }
  }
  async function runAi(feature) {
    setError('');
    try { setReport(await api(`/api/wave3c/ai/${feature}`, { method: 'POST', body: JSON.stringify({}) })); }
    catch (e) { setError(e.message); }
  }
  async function downloadExport(format) {
    try {
      const res = await fetch(`/api/leads/export?format=${format}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `leads.${format}`; link.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(e.message); }
  }

  return (
    <section aria-label="Tasks, export and lead AI" style={{ margin: '1rem 0' }}>
      <h2>Follow-up tasks, export &amp; lead AI</h2>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={addTask}>
        <label>New task <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></label>
        <button type="submit">Add task</button>
      </form>
      <ul>{tasks.map((t) => <li key={t.id}><span>{t.title} — {t.status}</span> <button type="button" onClick={() => toggleTask(t)}>{t.status === 'done' ? 'Reopen' : 'Mark done'}</button></li>)}</ul>
      <div>
        <button type="button" onClick={() => downloadExport('csv')}>Export leads (CSV)</button>
        <button type="button" onClick={() => downloadExport('json')}>Export leads (JSON)</button>
      </div>
      <div>
        <button type="button" onClick={() => runAi('lead-pipeline-summary')}>Pipeline summary</button>
        <button type="button" onClick={() => runAi('lead-followup-triage')}>Follow-up triage</button>
        <button type="button" onClick={() => runAi('lead-source-performance')}>Source performance</button>
      </div>
      {report && <AIReport response={report} title={report.feature || 'Lead AI'} />}
    </section>
  );
}
