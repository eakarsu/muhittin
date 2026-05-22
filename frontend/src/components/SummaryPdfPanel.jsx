import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SummaryPdfPanel() {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState('');
  const [err, setErr] = useState('');

  const fetchText = async () => {
    setBusy(true); setErr(''); setPreview('');
    try {
      const res = await fetch('/api/custom-views/summary-pdf', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setPreview(text);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadFile = async () => {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/custom-views/summary-pdf', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `muhittin-summary-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: '#1a1f2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>Executive Summary Report</h3>
      <p style={{ color: '#9aa', fontSize: 12, marginTop: 0 }}>
        Generate a downloadable summary of portfolio counts, top deals, and active preference rules.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={fetchText} disabled={busy} className="btn">
          {busy ? 'Working...' : 'Preview'}
        </button>
        <button onClick={downloadFile} disabled={busy} className="btn btn-primary">
          {busy ? 'Working...' : 'Download Summary'}
        </button>
      </div>
      {err && <div style={{ color: '#ff4757', fontSize: 13 }}>{err}</div>}
      {preview && (
        <pre style={{
          background: '#0a0d14', color: '#d8e1f0', padding: 12, borderRadius: 6,
          maxHeight: 320, overflow: 'auto', fontSize: 11, lineHeight: 1.4,
        }}>{preview}</pre>
      )}
    </div>
  );
}
