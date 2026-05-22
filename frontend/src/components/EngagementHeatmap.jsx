import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function EngagementHeatmap() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/custom-views/heatmap')
      .then(setData)
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <div style={{ padding: 12, color: '#ff4757' }}>Heatmap error: {err}</div>;
  if (!data) return <div style={{ padding: 12 }}>Loading heatmap...</div>;

  const { grid, dayLabels, hours, max, totalEvents } = data;
  const cell = 22;

  const color = (v) => {
    if (!v || max === 0) return '#1a2030';
    const intensity = v / max;
    const r = Math.round(40 + intensity * 215);
    const g = Math.round(80 + intensity * 100);
    const b = Math.round(180 - intensity * 100);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={{ background: '#1a1f2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>Engagement Heatmap (Day x Hour)</h3>
      <p style={{ color: '#9aa', fontSize: 12, marginTop: 0 }}>
        Record creation timing across contacts, deals, meetings, consultations. Total: {totalEvents} events.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 2 }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              {hours.map(h => (
                <th key={h} style={{ color: '#9aa', fontSize: 9, fontWeight: 'normal', width: cell }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dayLabels.map((label, d) => (
              <tr key={label}>
                <td style={{ color: '#9aa', fontSize: 11, paddingRight: 6, textAlign: 'right' }}>{label}</td>
                {hours.map(h => (
                  <td
                    key={h}
                    title={`${label} ${h}:00 — ${grid[d][h]} events`}
                    style={{
                      width: cell, height: cell,
                      background: color(grid[d][h]),
                      borderRadius: 3,
                      textAlign: 'center', color: '#fff', fontSize: 9,
                    }}
                  >
                    {grid[d][h] > 0 ? grid[d][h] : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ color: '#9aa', fontSize: 11, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Low</span>
        <div style={{ display: 'flex' }}>
          {[0.0, 0.25, 0.5, 0.75, 1.0].map((p, i) => (
            <div key={i} style={{ width: 18, height: 14, background: color(p * max) }} />
          ))}
        </div>
        <span>High (max {max})</span>
      </div>
    </div>
  );
}
