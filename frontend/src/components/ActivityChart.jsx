import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ActivityChart() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/custom-views/activity?days=30')
      .then(setData)
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <div style={{ padding: 12, color: '#ff4757' }}>Activity error: {err}</div>;
  if (!data) return <div style={{ padding: 12 }}>Loading activity...</div>;

  const points = data.points || [];
  const maxVal = Math.max(1, ...points.map(p => p.total));
  const w = 760, h = 220, pad = 30;
  const barW = (w - pad * 2) / Math.max(points.length, 1);

  return (
    <div style={{ background: '#1a1f2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>30-Day Activity Chart</h3>
      <p style={{ color: '#9aa', fontSize: 12, marginTop: 0 }}>
        Combined created records across contacts, deals, meetings, consultations, companies, candidates.
      </p>
      <svg width={w} height={h} style={{ display: 'block', maxWidth: '100%' }}>
        <rect x={0} y={0} width={w} height={h} fill="#10131c" />
        {points.map((p, i) => {
          const bh = (p.total / maxVal) * (h - pad * 2);
          const x = pad + i * barW;
          const y = h - pad - bh;
          return (
            <g key={p.day}>
              <rect x={x + 1} y={y} width={Math.max(2, barW - 2)} height={bh} fill="#4f8cff">
                <title>{p.day}: {p.total} events</title>
              </rect>
            </g>
          );
        })}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#444" />
        <text x={pad} y={h - 8} fill="#9aa" fontSize="10">{points[0]?.day || ''}</text>
        <text x={w - pad - 70} y={h - 8} fill="#9aa" fontSize="10">{points[points.length - 1]?.day || ''}</text>
        <text x={4} y={pad} fill="#9aa" fontSize="10">{maxVal}</text>
      </svg>
      <div style={{ color: '#9aa', fontSize: 12, marginTop: 8 }}>
        Total points: {points.length} | Peak: {maxVal} events/day
      </div>
    </div>
  );
}
