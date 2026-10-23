'use strict';
// Wave 3C: AI over the app's own lead records. Provider only when a key is
// configured; otherwise a clearly labelled deterministic fallback.
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

function fallbackLabel() { return { provider: 'deterministic-fallback', aiGenerated: false, label: 'Deterministic fallback — no AI provider configured. Computed locally from your records; not AI-generated.' }; }

function leadPipelineSummary(leads = []) {
  const byStatus = {}; let totalValue = 0;
  for (const l of leads) { byStatus[l.status || 'unknown'] = (byStatus[l.status || 'unknown'] || 0) + 1; totalValue += Number(l.value) || 0; }
  return { ...fallbackLabel(), feature: 'lead-pipeline-summary', sections: { summary: `${leads.length} lead(s) reviewed totalling ${totalValue}.`, metrics: { totalLeads: leads.length, byStatus, totalValue, hasUnvaluedLeads: leads.some((l) => !Number(l.value)) }, findings: leads.slice(0, 10).map((l) => `${l.name || l.id}: status=${l.status ?? 'unknown'}, value=${l.value ?? 0}`), recommendations: leads.length ? ['Review new leads first.', 'Add a value to every open lead.'] : ['Add leads before requesting a pipeline summary.'] } };
}
function leadFollowupTriage(leads = [], now = new Date()) {
  const open = leads.filter((l) => !['won', 'lost', 'closed'].includes(String(l.status || '').toLowerCase()));
  const overdue = open.filter((l) => l.follow_up_date && new Date(l.follow_up_date) < now);
  return { ...fallbackLabel(), feature: 'lead-followup-triage', sections: { summary: `${open.length} open lead(s); ${overdue.length} overdue for follow-up.`, metrics: { openLeads: open.length, overdueLeads: overdue.length, leadsWithoutFollowUp: open.filter((l) => !l.follow_up_date).length }, findings: overdue.slice(0, 10).map((l) => `${l.name || l.id}: follow_up_date=${l.follow_up_date}`), recommendations: overdue.length ? ['Contact overdue leads today.'] : ['No overdue follow-ups.'] } };
}

async function maybeProvider(fallback, env = process.env) {
  const apiKey = env.OPENROUTER_API_KEY || env.OPENAI_API_KEY; const model = env.OPENROUTER_MODEL;
  if (!apiKey || !model) return fallback;
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'system', content: 'Return ONLY JSON {summary:string, findings:string[], recommendations:string[], metrics:object}. Preserve false/0 values.' }, { role: 'user', content: JSON.stringify(fallback.sections).slice(0, 8000) }] }), signal: AbortSignal.timeout(60000) });
    if (!r.ok) return fallback;
    const p = await r.json(); const parsed = JSON.parse(String(p.choices?.[0]?.message?.content || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
    return { provider: 'openrouter', aiGenerated: true, model, feature: fallback.feature, sections: parsed };
  } catch { return fallback; }
}

function leadSourcePerformance(leads = []) {
  const bySource = {};
  for (const l of leads) { const s = l.source || 'unknown'; bySource[s] = bySource[s] || { count: 0, value: 0 }; bySource[s].count += 1; bySource[s].value += Number(l.value) || 0; }
  const top = Object.entries(bySource).sort((a, b) => b[1].value - a[1].value)[0];
  return { ...fallbackLabel(), feature: 'lead-source-performance', sections: { summary: `${leads.length} lead(s) across ${Object.keys(bySource).length} source(s); top source by value: ${top ? top[0] : 'none'}.`, metrics: { totalLeads: leads.length, sources: Object.keys(bySource).length, bySource, hasSourcedLeads: leads.some((l) => Boolean(l.source)) }, findings: Object.entries(bySource).map(([s, v]) => `${s}: ${v.count} lead(s), value=${v.value}`), recommendations: top ? [`Invest follow-up effort in ${top[0]}, the highest-value source.`] : ['Add a source to every lead to measure channel performance.'] } };
}

async function ownLeads() { const r = await pool.query('SELECT id,name,email,status,source,value,follow_up_date,created_at FROM leads ORDER BY created_at DESC LIMIT 1000'); return r.rows; }
router.post('/ai/lead-pipeline-summary', authenticateToken, async (req, res) => { try { const leads = Array.isArray(req.body?.leads) ? req.body.leads : await ownLeads(); return res.json(await maybeProvider(leadPipelineSummary(leads))); } catch (e) { return res.status(500).json({ error: e.message }); } });
router.post('/ai/lead-followup-triage', authenticateToken, async (req, res) => { try { const leads = Array.isArray(req.body?.leads) ? req.body.leads : await ownLeads(); return res.json(await maybeProvider(leadFollowupTriage(leads))); } catch (e) { return res.status(500).json({ error: e.message }); } });
router.post('/ai/lead-source-performance', authenticateToken, async (req, res) => { try { const leads = Array.isArray(req.body?.leads) ? req.body.leads : await ownLeads(); return res.json(await maybeProvider(leadSourcePerformance(leads))); } catch (e) { return res.status(500).json({ error: e.message }); } });

module.exports = router;
module.exports.leadPipelineSummary = leadPipelineSummary;
module.exports.leadFollowupTriage = leadFollowupTriage;
module.exports.leadSourcePerformance = leadSourcePerformance;
