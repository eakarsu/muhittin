// Salesforce / HubSpot / Pipedrive bi-directional sync.
// TODO: configure credentials —
//   SF_*: SF_CLIENT_ID, SF_CLIENT_SECRET, SF_USERNAME, SF_PASSWORD
//   HUBSPOT_API_KEY
//   PIPEDRIVE_API_TOKEN
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/providers', authenticateToken, (_req, res) => {
  res.json({
    providers: [
      { id: 'salesforce', configured: !!process.env.SF_CLIENT_ID },
      { id: 'hubspot', configured: !!process.env.HUBSPOT_API_KEY },
      { id: 'pipedrive', configured: !!process.env.PIPEDRIVE_API_TOKEN }
    ]
  });
});

router.get('/hubspot/contacts', authenticateToken, async (_req, res) => {
  if (!process.env.HUBSPOT_API_KEY) return res.status(503).json({ error: 'HubSpot not configured' });
  try {
    const r = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=20', {
      headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` }
    });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

router.get('/pipedrive/deals', authenticateToken, async (_req, res) => {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) return res.status(503).json({ error: 'Pipedrive not configured' });
  try {
    const r = await fetch(`https://api.pipedrive.com/v1/deals?api_token=${token}&limit=20`);
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

router.post('/push', authenticateToken, async (req, res) => {
  const { provider, type, payload } = req.body;
  if (!provider || !type || !payload) return res.status(400).json({ error: 'provider, type, payload required' });
  if (provider === 'hubspot') {
    if (!process.env.HUBSPOT_API_KEY) return res.status(503).json({ error: 'HubSpot not configured' });
    const r = await fetch(`https://api.hubapi.com/crm/v3/objects/${type}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties: payload })
    });
    return res.json(await r.json());
  }
  if (provider === 'pipedrive') {
    const token = process.env.PIPEDRIVE_API_TOKEN;
    if (!token) return res.status(503).json({ error: 'Pipedrive not configured' });
    const r = await fetch(`https://api.pipedrive.com/v1/${type}?api_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json(await r.json());
  }
  res.status(400).json({ error: `provider ${provider} not implemented for push` });
});

module.exports = router;
