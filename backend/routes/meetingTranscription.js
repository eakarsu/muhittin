// Real-time meeting transcription + action-item extraction with CRM auto-update.
// TODO: configure credentials — DEEPGRAM_API_KEY or OPENAI_API_KEY (Whisper) for ASR.
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

const sessions = new Map();

router.post('/start', authenticateToken, (req, res) => {
  const { meetingId, attendees = [] } = req.body;
  const id = `mt_${Date.now()}`;
  sessions.set(id, { id, meetingId, attendees, segments: [], startedAt: new Date() });
  res.json({ sessionId: id });
});

router.post('/:sessionId/segment', authenticateToken, (req, res) => {
  const s = sessions.get(req.params.sessionId);
  if (!s) return res.status(404).json({ error: 'session not found' });
  const { speaker, text, ts } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  s.segments.push({ speaker: speaker || 'unknown', text, ts: ts || Date.now() });
  res.json({ ok: true });
});

router.post('/:sessionId/extract', authenticateToken, async (req, res) => {
  const s = sessions.get(req.params.sessionId);
  if (!s) return res.status(404).json({ error: 'session not found' });
  if (!OPENROUTER_API_KEY) return res.status(503).json({ error: 'OPENROUTER_API_KEY not configured' });
  const transcript = s.segments.map(seg => `${seg.speaker}: ${seg.text}`).join('\n').slice(0, 10000);
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: 'Return JSON {"summary":string,"action_items":[{"owner":string,"task":string,"due":string}],"sentiment":"positive|neutral|negative","next_meeting":string|null}.' },
        { role: 'user', content: transcript }
      ],
      max_tokens: 900
    })
  });
  const d = await r.json();
  let parsed;
  try { parsed = JSON.parse(d.choices[0].message.content.match(/\{[\s\S]*\}/)[0]); } catch { parsed = { raw: d.choices?.[0]?.message?.content }; }
  res.json({ session: s.id, ...parsed });
});

router.post('/:sessionId/sync-to-crm', authenticateToken, async (req, res) => {
  const s = sessions.get(req.params.sessionId);
  if (!s) return res.status(404).json({ error: 'session not found' });
  const { dealId, items = [] } = req.body;
  let prisma = null;
  try { const { PrismaClient } = require('@prisma/client'); prisma = new PrismaClient(); } catch {}
  let created = 0;
  if (prisma && dealId) {
    for (const it of items) {
      try {
        await prisma.activity?.create?.({ data: { dealId, type: 'meeting_action_item', notes: it.task, owner: it.owner, due: it.due ? new Date(it.due) : null } });
        created++;
      } catch {}
    }
  }
  res.json({ ok: true, synced: created, dealId });
});

module.exports = router;
