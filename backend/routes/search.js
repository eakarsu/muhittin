const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const term = `%${q.trim()}%`;

    const results = await Promise.all([
      pool.query(
        `SELECT id, title, slug, summary, category, domain, 'insight' as type
         FROM insights
         WHERE published = true AND (
           title ILIKE $1 OR summary ILIKE $1 OR category ILIKE $1 OR domain ILIKE $1 OR content ILIKE $1
         ) LIMIT 10`,
        [term]
      ),
      pool.query(
        `SELECT id, title, slug, industry, 'case_study' as type,
           SUBSTRING(challenge, 1, 150) as summary
         FROM case_studies
         WHERE title ILIKE $1 OR industry ILIKE $1 OR challenge ILIKE $1 OR result ILIKE $1 OR approach ILIKE $1
         LIMIT 10`,
        [term]
      ),
      pool.query(
        `SELECT id, name as title, slug, description as summary, 'industry' as type
         FROM industries
         WHERE name ILIKE $1 OR description ILIKE $1 OR challenges ILIKE $1 OR approach ILIKE $1
         LIMIT 10`,
        [term]
      ),
    ]);

    const all = [
      ...results[0].rows,
      ...results[1].rows,
      ...results[2].rows,
    ];

    res.json(all);
  } catch (err) {
    console.error('Search error:', err.message);
    res.json([]);
  }
});

module.exports = router;
