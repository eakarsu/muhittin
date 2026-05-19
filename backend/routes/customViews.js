const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// In-memory store for preference rules (persists for process lifetime)
const preferenceRules = [
  { id: 1, name: 'High-Value Deal Alert', trigger: 'deal.value > 50000', action: 'notify_owner', enabled: true, priority: 'high', created_at: new Date().toISOString() },
  { id: 2, name: 'Stale Lead Reminder', trigger: 'lead.age > 14d', action: 'send_reminder', enabled: true, priority: 'medium', created_at: new Date().toISOString() },
  { id: 3, name: 'New Contact Welcome', trigger: 'contact.created', action: 'send_welcome_email', enabled: false, priority: 'low', created_at: new Date().toISOString() },
];
let nextRuleId = 4;

// 1) GET /activity - 30-day activity timeline (counts per day across contacts, deals, meetings, consultations)
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const tables = ['contacts', 'deals', 'meetings', 'consultations', 'companies', 'candidates'];
    const series = {};
    for (const t of tables) {
      try {
        const r = await pool.query(
          `SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') as day, COUNT(*)::int as count
           FROM ${t} WHERE created_at >= $1 GROUP BY day ORDER BY day`,
          [since]
        );
        series[t] = r.rows;
      } catch (e) {
        series[t] = [];
      }
    }
    // Build merged day map
    const dayMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dayMap[d] = { day: d, total: 0, ...Object.fromEntries(tables.map(t => [t, 0])) };
    }
    for (const t of tables) {
      for (const row of series[t]) {
        if (dayMap[row.day]) {
          dayMap[row.day][t] = row.count;
          dayMap[row.day].total += row.count;
        }
      }
    }
    const points = Object.values(dayMap).sort((a, b) => a.day.localeCompare(b.day));
    res.json({ days, since, points, tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2) GET /heatmap - engagement heatmap (day-of-week x hour) from contacts/deals/meetings
router.get('/heatmap', authenticateToken, async (req, res) => {
  try {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const tables = ['contacts', 'deals', 'meetings', 'consultations'];
    let totalEvents = 0;
    for (const t of tables) {
      try {
        const r = await pool.query(
          `SELECT EXTRACT(DOW FROM created_at)::int as dow,
                  EXTRACT(HOUR FROM created_at)::int as hr,
                  COUNT(*)::int as cnt
           FROM ${t}
           WHERE created_at IS NOT NULL
           GROUP BY dow, hr`
        );
        for (const row of r.rows) {
          if (row.dow >= 0 && row.dow < 7 && row.hr >= 0 && row.hr < 24) {
            grid[row.dow][row.hr] += row.cnt;
            totalEvents += row.cnt;
          }
        }
      } catch (e) { /* table may not exist */ }
    }
    let max = 0;
    for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) if (grid[d][h] > max) max = grid[d][h];
    res.json({ grid, dayLabels, hours: Array.from({ length: 24 }, (_, i) => i), max, totalEvents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) GET /summary-pdf - generate a printable plain-text summary "PDF" (text/plain, downloadable)
router.get('/summary-pdf', authenticateToken, async (req, res) => {
  try {
    const counts = {};
    const tables = ['contacts', 'companies', 'deals', 'candidates', 'meetings', 'consultations', 'opportunities', 'partners'];
    for (const t of tables) {
      try {
        const r = await pool.query(`SELECT COUNT(*)::int as c FROM ${t}`);
        counts[t] = r.rows[0].c;
      } catch (e) {
        counts[t] = 0;
      }
    }
    let topDeals = [];
    try {
      const r = await pool.query(`SELECT name, value, stage FROM deals ORDER BY value DESC NULLS LAST LIMIT 5`);
      topDeals = r.rows;
    } catch (e) {}

    const ts = new Date().toISOString();
    const lines = [];
    lines.push('========================================================');
    lines.push('  MULTIVERSE CONSULTING GROUP - EXECUTIVE SUMMARY');
    lines.push('========================================================');
    lines.push(`  Generated: ${ts}`);
    lines.push(`  Requested by: ${req.user?.email || 'admin'}`);
    lines.push('--------------------------------------------------------');
    lines.push('  PORTFOLIO COUNTS');
    lines.push('--------------------------------------------------------');
    for (const t of tables) {
      lines.push(`  ${t.padEnd(20)} : ${counts[t]}`);
    }
    lines.push('--------------------------------------------------------');
    lines.push('  TOP DEALS BY VALUE');
    lines.push('--------------------------------------------------------');
    if (topDeals.length === 0) {
      lines.push('  (no deal data available)');
    } else {
      topDeals.forEach((d, i) => {
        lines.push(`  ${i + 1}. ${(d.name || 'Untitled').padEnd(30)} $${d.value || 0}  [${d.stage || 'n/a'}]`);
      });
    }
    lines.push('--------------------------------------------------------');
    lines.push('  ACTIVE PREFERENCE RULES');
    lines.push('--------------------------------------------------------');
    const enabled = preferenceRules.filter(r => r.enabled);
    if (enabled.length === 0) lines.push('  (none enabled)');
    else enabled.forEach(r => lines.push(`  - [${r.priority}] ${r.name}: ${r.trigger} -> ${r.action}`));
    lines.push('========================================================');
    lines.push('  END OF SUMMARY');
    lines.push('========================================================');

    const body = lines.join('\n');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="muhittin-summary-${ts.slice(0, 10)}.txt"`);
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4) Preference Rules CRUD (combined endpoint via method) -> /rules
router.get('/rules', authenticateToken, (req, res) => {
  res.json({ rules: preferenceRules, count: preferenceRules.length });
});

router.post('/rules', authenticateToken, (req, res) => {
  try {
    const { name, trigger, action, priority, enabled } = req.body || {};
    if (!name || !trigger || !action) {
      return res.status(400).json({ error: 'name, trigger, and action are required' });
    }
    const rule = {
      id: nextRuleId++,
      name: String(name),
      trigger: String(trigger),
      action: String(action),
      priority: priority || 'medium',
      enabled: enabled !== false,
      created_at: new Date().toISOString(),
    };
    preferenceRules.push(rule);
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rules/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = preferenceRules.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const { name, trigger, action, priority, enabled } = req.body || {};
  preferenceRules[idx] = {
    ...preferenceRules[idx],
    ...(name !== undefined ? { name } : {}),
    ...(trigger !== undefined ? { trigger } : {}),
    ...(action !== undefined ? { action } : {}),
    ...(priority !== undefined ? { priority } : {}),
    ...(enabled !== undefined ? { enabled: !!enabled } : {}),
  };
  res.json(preferenceRules[idx]);
});

router.delete('/rules/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = preferenceRules.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const removed = preferenceRules.splice(idx, 1)[0];
  res.json({ deleted: true, rule: removed });
});

module.exports = router;
