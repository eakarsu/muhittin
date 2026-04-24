const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const businesses = await pool.query('SELECT COUNT(*) FROM businesses');
    const customers = await pool.query('SELECT COUNT(*) FROM customers');
    const bookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const reviews = await pool.query('SELECT COUNT(*) FROM reviews');
    const leads = await pool.query('SELECT COUNT(*) FROM leads');
    const campaigns = await pool.query('SELECT COUNT(*) FROM campaigns');
    const revenue = await pool.query("SELECT SUM(price) as total FROM bookings WHERE status = 'completed'");
    const avgRating = await pool.query('SELECT AVG(rating) as avg FROM reviews');
    const pendingReviews = await pool.query("SELECT COUNT(*) FROM reviews WHERE status = 'pending'");
    const upcomingBookings = await pool.query("SELECT COUNT(*) FROM bookings WHERE status IN ('scheduled','confirmed') AND date >= CURRENT_DATE");
    const newLeads = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'new'");
    const activeBusinesses = await pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'active'");

    // Category breakdown
    const categories = await pool.query(`
      SELECT category, COUNT(*) as count, AVG(rating) as avg_rating, SUM(review_count) as total_reviews
      FROM businesses GROUP BY category ORDER BY count DESC
    `);

    res.json({
      businesses: parseInt(businesses.rows[0].count),
      customers: parseInt(customers.rows[0].count),
      bookings: parseInt(bookings.rows[0].count),
      reviews: parseInt(reviews.rows[0].count),
      leads: parseInt(leads.rows[0].count),
      campaigns: parseInt(campaigns.rows[0].count),
      revenue: parseFloat(revenue.rows[0].total || 0),
      avgRating: parseFloat(avgRating.rows[0].avg || 0).toFixed(1),
      pendingReviews: parseInt(pendingReviews.rows[0].count),
      upcomingBookings: parseInt(upcomingBookings.rows[0].count),
      newLeads: parseInt(newLeads.rows[0].count),
      activeBusinesses: parseInt(activeBusinesses.rows[0].count),
      categories: categories.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full analytics
router.get('/full', authenticateToken, async (req, res) => {
  try {
    const bookingsByStatus = await pool.query('SELECT status, COUNT(*) as count FROM bookings GROUP BY status');
    const reviewsByRating = await pool.query('SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating');
    const leadsByStatus = await pool.query('SELECT status, COUNT(*) as count, SUM(value) as total_value FROM leads GROUP BY status');
    const campaignPerf = await pool.query('SELECT name, recipients, opens, clicks FROM campaigns WHERE status = \'sent\' ORDER BY sent_at DESC LIMIT 10');
    const socialPerf = await pool.query('SELECT platform, SUM(likes) as likes, SUM(comments_count) as comments, SUM(shares) as shares FROM social_posts WHERE status = \'published\' GROUP BY platform');
    const revenueByBiz = await pool.query(`
      SELECT b.name, SUM(bk.price) as revenue, COUNT(bk.id) as booking_count
      FROM businesses b LEFT JOIN bookings bk ON b.id = bk.business_id AND bk.status = 'completed'
      GROUP BY b.id, b.name ORDER BY revenue DESC NULLS LAST LIMIT 10
    `);
    const customersBySource = await pool.query('SELECT source, COUNT(*) as count FROM customers GROUP BY source ORDER BY count DESC');
    const websiteVisits = await pool.query('SELECT page_title, visits FROM websites WHERE published = true ORDER BY visits DESC');
    const recentEvents = await pool.query('SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 20');

    res.json({
      bookingsByStatus: bookingsByStatus.rows,
      reviewsByRating: reviewsByRating.rows,
      leadsByStatus: leadsByStatus.rows,
      campaignPerformance: campaignPerf.rows,
      socialPerformance: socialPerf.rows,
      revenueByBusiness: revenueByBiz.rows,
      customersBySource: customersBySource.rows,
      websiteVisits: websiteVisits.rows,
      recentEvents: recentEvents.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log event
router.post('/event', authenticateToken, async (req, res) => {
  try {
    const { business_id, event_type, metadata } = req.body;
    const result = await pool.query(
      'INSERT INTO analytics_events (business_id, event_type, metadata) VALUES ($1,$2,$3) RETURNING *',
      [business_id, event_type, JSON.stringify(metadata)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
