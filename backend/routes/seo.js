const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get SEO dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_audits,
        ROUND(AVG(overall_score)) as avg_score,
        COUNT(*) FILTER (WHERE overall_score >= 80) as high_performers,
        COUNT(*) FILTER (WHERE overall_score < 50) as needs_work,
        COUNT(*) FILTER (WHERE NOT google_business_claimed) as unclaimed_gbp,
        COUNT(*) FILTER (WHERE NOT nap_consistent) as nap_issues,
        COUNT(*) FILTER (WHERE NOT ssl_enabled) as no_ssl,
        COUNT(*) FILTER (WHERE NOT schema_markup) as no_schema
      FROM seo_audits
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top performers
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const result = await pool.query(`
      SELECT s.*, b.name as business_name, b.category, b.subcategory, b.website_url, b.city, b.state, b.address, b.phone
      FROM seo_audits s
      JOIN businesses b ON s.business_id = b.id
      ORDER BY s.overall_score DESC
      LIMIT $1
    `, [limit]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all SEO audits with business info
router.get('/', async (req, res) => {
  try {
    const { category, min_score, max_score, sort } = req.query;
    let query = `
      SELECT s.*, b.name as business_name, b.category, b.subcategory, b.website_url, b.city, b.state
      FROM seo_audits s
      JOIN businesses b ON s.business_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND b.category = $${params.length}`;
    }
    if (min_score) {
      params.push(parseInt(min_score));
      query += ` AND s.overall_score >= $${params.length}`;
    }
    if (max_score) {
      params.push(parseInt(max_score));
      query += ` AND s.overall_score <= $${params.length}`;
    }

    const sortField = sort === 'name' ? 'b.name' : sort === 'category' ? 'b.category' : 's.overall_score DESC';
    query += ` ORDER BY ${sortField === 's.overall_score DESC' ? sortField : sortField + ' ASC'}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get SEO audit for a specific business
router.get('/:businessId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, b.name as business_name, b.category, b.subcategory, b.website_url, b.city, b.state, b.address, b.phone, b.email
      FROM seo_audits s
      JOIN businesses b ON s.business_id = b.id
      WHERE s.business_id = $1
    `, [req.params.businessId]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'SEO audit not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get keyword rankings for a business
router.get('/:businessId/keywords', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM keyword_rankings
      WHERE business_id = $1
      ORDER BY position ASC
    `, [req.params.businessId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update SEO audit
router.put('/:businessId', async (req, res) => {
  try {
    const { overall_score, google_business_claimed, nap_consistent, website_mobile_friendly, ssl_enabled, meta_tags_optimized, schema_markup, page_speed_score, recommendations } = req.body;
    const result = await pool.query(`
      UPDATE seo_audits SET
        overall_score = COALESCE($1, overall_score),
        google_business_claimed = COALESCE($2, google_business_claimed),
        nap_consistent = COALESCE($3, nap_consistent),
        website_mobile_friendly = COALESCE($4, website_mobile_friendly),
        ssl_enabled = COALESCE($5, ssl_enabled),
        meta_tags_optimized = COALESCE($6, meta_tags_optimized),
        schema_markup = COALESCE($7, schema_markup),
        page_speed_score = COALESCE($8, page_speed_score),
        recommendations = COALESCE($9, recommendations)
      WHERE business_id = $10
      RETURNING *
    `, [overall_score, google_business_claimed, nap_consistent, website_mobile_friendly, ssl_enabled, meta_tags_optimized, schema_markup, page_speed_score, recommendations, req.params.businessId]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'SEO audit not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get score distribution
router.get('/report/distribution', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        CASE
          WHEN overall_score >= 90 THEN 'Excellent (90-100)'
          WHEN overall_score >= 80 THEN 'Good (80-89)'
          WHEN overall_score >= 70 THEN 'Average (70-79)'
          WHEN overall_score >= 60 THEN 'Below Average (60-69)'
          ELSE 'Poor (0-59)'
        END as range,
        COUNT(*) as count
      FROM seo_audits
      GROUP BY range
      ORDER BY MIN(overall_score) DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get category averages
router.get('/report/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.category,
        ROUND(AVG(s.overall_score)) as avg_score,
        COUNT(*) as count,
        MAX(s.overall_score) as max_score,
        MIN(s.overall_score) as min_score
      FROM seo_audits s
      JOIN businesses b ON s.business_id = b.id
      GROUP BY b.category
      ORDER BY avg_score DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
