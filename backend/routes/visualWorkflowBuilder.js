// Visual workflow builder backed by existing workflow-automation route.
const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', 'data', 'visual_workflows');
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

router.post('/save', authenticateToken, (req, res) => {
  const { name, graph } = req.body;
  if (!name || !graph) return res.status(400).json({ error: 'name and graph required' });
  const id = `vw_${Date.now()}`;
  fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify({ id, name, graph, savedAt: new Date() }, null, 2));
  res.json({ id, name });
});

router.get('/', authenticateToken, (_req, res) => {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  res.json({ workflows: files.map(f => { try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')); } catch { return null; } }).filter(Boolean) });
});

router.get('/:id', authenticateToken, (req, res) => {
  try { res.json(JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${req.params.id}.json`), 'utf8'))); }
  catch { res.status(404).json({ error: 'not found' }); }
});

router.post('/:id/compile', authenticateToken, (req, res) => {
  try {
    const doc = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${req.params.id}.json`), 'utf8'));
    const graph = doc.graph || {};
    const steps = (graph.nodes || []).map((n, i) => ({
      id: n.id || `step_${i}`,
      type: n.type || 'noop',
      params: n.params || {},
      next: (graph.edges || []).filter(e => e.from === n.id).map(e => e.to)
    }));
    res.json({ id: doc.id, name: doc.name, steps });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
