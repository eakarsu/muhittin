const pool = require('../db');

async function createNotification(userId, type, title, message, link = null) {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link, read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW()) RETURNING *`,
      [userId, type, title, message, link]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Notification error:', err.message);
    return null;
  }
}

module.exports = { createNotification };
