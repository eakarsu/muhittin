// E-signature integration with proposal templating.
// TODO: configure credentials — DOCUSIGN_INTEGRATION_KEY/USER_ID/RSA_KEY or HELLOSIGN_API_KEY.
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const envelopes = new Map();

router.post('/templates', authenticateToken, (req, res) => {
  // Stub template store; production wires to DocuSign templates API.
  const { id, name, body, fields = [] } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  res.json({ id, name, body, fields, createdAt: new Date() });
});

router.post('/envelopes', authenticateToken, async (req, res) => {
  const { templateId, signers = [], variables = {} } = req.body;
  if (!templateId || !signers.length) return res.status(400).json({ error: 'templateId and signers[] required' });
  const id = `env_${Date.now()}`;
  envelopes.set(id, {
    id,
    templateId,
    signers: signers.map(s => ({ ...s, status: 'pending' })),
    variables,
    status: process.env.DOCUSIGN_INTEGRATION_KEY ? 'sent' : 'mock',
    createdAt: new Date()
  });
  // TODO: configure credentials — implement DocuSign JWT auth + envelopes.create.
  res.json(envelopes.get(id));
});

router.get('/envelopes/:id', authenticateToken, (req, res) => {
  const e = envelopes.get(req.params.id);
  if (!e) return res.status(404).json({ error: 'envelope not found' });
  res.json(e);
});

router.post('/envelopes/:id/webhook', (req, res) => {
  // Stub webhook for completion callbacks; verify signature in production.
  const e = envelopes.get(req.params.id);
  if (!e) return res.status(404).json({ error: 'envelope not found' });
  const { signerEmail, status } = req.body;
  const s = e.signers.find(x => x.email === signerEmail);
  if (s) s.status = status || 'completed';
  if (e.signers.every(x => x.status === 'completed')) e.status = 'completed';
  res.json(e);
});

module.exports = router;
