const crypto = require('node:crypto');
const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/consulting-advice', authenticateToken, async (req, res, next) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    if (!prompt || prompt.length > 8000) return res.status(400).json({ error: 'Prompt must contain 1 through 8000 characters' });
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;
    const baseUrl = process.env.OPENROUTER_BASE_URL;
    if (!apiKey || !model || !baseUrl) return res.status(503).json({ error: 'OpenRouter is not configured' });
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a consulting-operations reviewer. Return concise risks, evidence gaps, next actions, uncertainty, and decisions requiring human approval.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) return res.status(502).json({ error: `OpenRouter returned ${response.status}` });
    const payload = await response.json();
    const content = String(payload?.choices?.[0]?.message?.content || '').trim();
    const providerReceipt = {
      id: String(payload?.id || response.headers.get('x-request-id') || ''),
      created: payload?.created ?? null,
      upstreamModel: String(payload?.model || model),
    };
    if (!content || !providerReceipt.id) return res.status(502).json({ error: 'OpenRouter returned an incomplete response' });
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO runtime_ai_results(id,user_id,prompt,content,provider,model,provider_receipt)
       VALUES($1,$2,$3,$4,'openrouter',$5,$6)`,
      [id, req.user.id, prompt, content, model, providerReceipt],
    );
    return res.json({ id, content, provider: 'openrouter', model, providerReceipt });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
