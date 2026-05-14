// Territory + quota planner with simulation.
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const territories = new Map();
const quotas = new Map();

router.post('/territories', authenticateToken, (req, res) => {
  const { id, name, regions = [], reps = [] } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  territories.set(id, { id, name, regions, reps, createdAt: new Date() });
  res.json(territories.get(id));
});

router.get('/territories', authenticateToken, (_req, res) => res.json([...territories.values()]));

router.post('/quotas', authenticateToken, (req, res) => {
  const { repId, periodMonths = 3, quotaUSD } = req.body;
  if (!repId || quotaUSD == null) return res.status(400).json({ error: 'repId and quotaUSD required' });
  quotas.set(repId, { repId, periodMonths, quotaUSD: Number(quotaUSD), setAt: new Date() });
  res.json(quotas.get(repId));
});

router.post('/simulate', authenticateToken, (req, res) => {
  const { reps = [], assumptions = {} } = req.body;
  const baseConversion = assumptions.conversionRate || 0.2;
  const avgDealUSD = assumptions.avgDealUSD || 12000;
  const out = reps.map(r => {
    const projected = (r.leadsPerMonth || 50) * baseConversion * avgDealUSD;
    const quota = (quotas.get(r.id)?.quotaUSD) || projected;
    return {
      repId: r.id,
      projectedUSD: Math.round(projected),
      quotaUSD: Math.round(quota),
      attainmentPct: Math.round((projected / quota) * 100)
    };
  });
  res.json({ assumptions: { baseConversion, avgDealUSD }, simulations: out });
});

module.exports = router;
