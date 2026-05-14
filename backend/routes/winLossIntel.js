// Competitive win/loss intelligence (pattern miner across closed deals).
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

router.post('/mine', authenticateToken, async (req, res) => {
  try {
    const { deals = [] } = req.body;
    if (!Array.isArray(deals) || !deals.length) return res.status(400).json({ error: 'deals[] required' });

    const wonText = deals.filter(d => d.outcome === 'won').map(d => d.notes || '').join('\n');
    const lostText = deals.filter(d => d.outcome === 'lost').map(d => d.notes || '').join('\n');

    if (!OPENROUTER_API_KEY) return res.status(503).json({ error: 'OPENROUTER_API_KEY not configured' });
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'Extract competitive patterns. Return JSON {"win_themes":[string],"loss_themes":[string],"competitors_mentioned":[string],"recommendations":[string]}.' },
          { role: 'user', content: `Won deals notes:\n${wonText.slice(0, 4000)}\n\nLost deals notes:\n${lostText.slice(0, 4000)}` }
        ],
        max_tokens: 800
      })
    });
    const d = await r.json();
    let parsed;
    try { parsed = JSON.parse(d.choices[0].message.content.match(/\{[\s\S]*\}/)[0]); } catch { parsed = { raw: d.choices?.[0]?.message?.content }; }
    res.json({
      sample: { won: deals.filter(d => d.outcome === 'won').length, lost: deals.filter(d => d.outcome === 'lost').length },
      analysis: parsed
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
