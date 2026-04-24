const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, platform, status, search } = req.query;
    let query = 'SELECT s.*, b.name as business_name FROM social_posts s LEFT JOIN businesses b ON s.business_id = b.id WHERE 1=1';
    const params = [];
    if (business_id) { params.push(business_id); query += ` AND s.business_id = $${params.length}`; }
    if (platform) { params.push(platform); query += ` AND s.platform = $${params.length}`; }
    if (status) { params.push(status); query += ` AND s.status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND s.content ILIKE $${params.length}`; }
    query += ' ORDER BY s.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM social_posts');
    const published = await pool.query("SELECT COUNT(*) FROM social_posts WHERE status = 'published'");
    const totalLikes = await pool.query('SELECT SUM(likes) as total FROM social_posts');
    const totalComments = await pool.query('SELECT SUM(comments_count) as total FROM social_posts');
    const totalShares = await pool.query('SELECT SUM(shares) as total FROM social_posts');
    const byPlatform = await pool.query('SELECT platform, COUNT(*) as count, SUM(likes) as total_likes FROM social_posts GROUP BY platform');
    res.json({
      total: parseInt(total.rows[0].count),
      published: parseInt(published.rows[0].count),
      totalLikes: parseInt(totalLikes.rows[0].total || 0),
      totalComments: parseInt(totalComments.rows[0].total || 0),
      totalShares: parseInt(totalShares.rows[0].total || 0),
      byPlatform: byPlatform.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT s.*, b.name as business_name FROM social_posts s LEFT JOIN businesses b ON s.business_id = b.id WHERE s.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { business_id, platform, content, image_url, status, scheduled_at } = req.body;
    const result = await pool.query(
      `INSERT INTO social_posts (business_id, platform, content, image_url, status, scheduled_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [business_id, platform, content, image_url, status || 'draft', scheduled_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { business_id, platform, content, image_url, status, scheduled_at } = req.body;
    const result = await pool.query(
      `UPDATE social_posts SET business_id=$1, platform=$2, content=$3, image_url=$4, status=$5, scheduled_at=$6
       WHERE id=$7 RETURNING *`,
      [business_id, platform, content, image_url, status, scheduled_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish post
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE social_posts SET status = 'published', published_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    await createNotification(req.user.id, 'social', 'Post Published', `Your ${result.rows[0].platform} post is live!`, '/social');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM social_posts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
