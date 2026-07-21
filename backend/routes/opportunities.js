const express = require('express');
const crypto = require('node:crypto');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');
const { sendOpportunityConfirmation } = require('../helpers/email');
const {
  validateIdempotencyKey,
  validateOpportunitySubmission,
  validateStatusTransition,
} = require('../domain/opportunity');

function numericId(value) {
  if (!/^[1-9]\d*$/.test(String(value))) throw new TypeError('Opportunity ID is invalid');
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 2_147_483_647) throw new TypeError('Opportunity ID is invalid');
  return id;
}

function requestId(req) {
  return String(req.id || req.headers['x-request-id'] || crypto.randomUUID()).slice(0, 100);
}

class IdempotencyConflictError extends Error {}

async function defaultPostSubmission(database, opportunity, opportunityId) {
  try {
    await database.query(
      `INSERT INTO contacts (name, email, phone, company, lifecycle_stage, source, interest)
       SELECT $1, $2, $3, $4, 'lead', 'opportunity', $5
       WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE LOWER(email) = LOWER($2))`,
      [opportunity.contact_name, opportunity.email, opportunity.phone, opportunity.company_name, opportunity.opportunity_type],
    );
    const owner = await database.query("SELECT id FROM users WHERE active = TRUE AND role IN ('owner', 'admin') ORDER BY id LIMIT 1");
    if (owner.rows[0]) {
      await createNotification(
        owner.rows[0].id,
        'opportunity',
        'New Opportunity Submitted',
        `${opportunity.contact_name} from ${opportunity.company_name} submitted an opportunity`,
        `/admin/opportunities?opportunity=${opportunityId}`,
        database,
      );
    }
    await sendOpportunityConfirmation(opportunity.email, opportunity.contact_name);
  } catch (error) {
    console.error(`Opportunity post-submission automation failed for ${opportunityId}: ${error.message}`);
  }
}

function createOpportunitiesRouter({
  database = pool,
  authenticate = authenticateToken,
  canRead = requireRole('owner', 'admin', 'manager', 'staff'),
  canTransition = requireRole('owner', 'admin', 'manager'),
  postSubmission = defaultPostSubmission,
} = {}) {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    let client;
    try {
      const idempotencyKey = validateIdempotencyKey(req.headers['idempotency-key']);
      const opportunity = validateOpportunitySubmission(req.body);
      const requestFingerprint = crypto.createHash('sha256').update(JSON.stringify(opportunity)).digest('hex');
      client = await database.connect();
      await client.query('BEGIN');
      const inserted = await client.query(
        `INSERT INTO opportunities
          (company_name, contact_name, email, phone, opportunity_type, description, region, budget_range, status, idempotency_key, request_fingerprint, consent_recorded_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'new',$9,$10,NOW(),NOW())
         ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
         RETURNING id, status, created_at`,
        [
          opportunity.company_name,
          opportunity.contact_name,
          opportunity.email,
          opportunity.phone,
          opportunity.opportunity_type,
          opportunity.description,
          opportunity.region,
          opportunity.budget_range,
          idempotencyKey,
          requestFingerprint,
        ],
      );
      const created = inserted.rows.length === 1;
      let record = inserted.rows[0];
      if (created) {
        await client.query(
          `INSERT INTO opportunity_events
            (opportunity_id, event_type, from_status, to_status, actor_user_id, actor_role, request_id)
           VALUES ($1, 'submitted', NULL, 'new', NULL, 'public', $2)`,
          [record.id, requestId(req)],
        );
      } else {
        const existing = await client.query(
          'SELECT id, status, created_at, request_fingerprint FROM opportunities WHERE idempotency_key = $1',
          [idempotencyKey],
        );
        record = existing.rows[0];
        if (!record) throw new Error('Idempotent submission could not be reconciled');
        if (record.request_fingerprint && record.request_fingerprint.trim() !== requestFingerprint) {
          throw new IdempotencyConflictError('Idempotency-Key was already used for a different submission');
        }
      }
      await client.query('COMMIT');
      client.release();
      client = null;

      if (created) {
        setImmediate(() => Promise.resolve(postSubmission(database, opportunity, record.id)).catch((error) => {
          console.error(`Opportunity post-submission callback failed for ${record.id}: ${error.message}`);
        }));
      }
      return res.status(created ? 201 : 200).json({
        id: record.id,
        status: record.status,
        submitted_at: record.created_at,
        replayed: !created,
      });
    } catch (error) {
      if (client) {
        try { await client.query('ROLLBACK'); } catch {}
        client.release();
      }
      if (error instanceof IdempotencyConflictError) return res.status(409).json({ error: error.message });
      if (error instanceof TypeError) return res.status(400).json({ error: error.message });
      return next(error);
    }
  });

  router.get('/', authenticate, canRead, async (req, res, next) => {
    try {
      const { status, opportunity_type, search } = req.query;
      const params = [];
      let query = 'SELECT id, company_name, contact_name, email, phone, opportunity_type, description, region, budget_range, status, consent_recorded_at, created_at, updated_at FROM opportunities WHERE 1=1';
      if (status) { params.push(status); query += ` AND status = $${params.length}`; }
      if (opportunity_type) { params.push(opportunity_type); query += ` AND opportunity_type = $${params.length}`; }
      if (search) { params.push(`%${String(search).slice(0, 100)}%`); query += ` AND (company_name ILIKE $${params.length} OR contact_name ILIKE $${params.length})`; }
      query += ' ORDER BY created_at DESC LIMIT 500';
      const result = await database.query(query, params);
      return res.json(result.rows);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:id/events', authenticate, canRead, async (req, res, next) => {
    try {
      const result = await database.query(
        `SELECT id, event_type, from_status, to_status, actor_user_id, actor_role, request_id, note, created_at
         FROM opportunity_events WHERE opportunity_id = $1 ORDER BY created_at, id`,
        [numericId(req.params.id)],
      );
      return res.json(result.rows);
    } catch (error) {
      if (error instanceof TypeError) return res.status(400).json({ error: error.message });
      return next(error);
    }
  });

  router.get('/:id', authenticate, canRead, async (req, res, next) => {
    try {
      const result = await database.query(
        'SELECT id, company_name, contact_name, email, phone, opportunity_type, description, region, budget_range, status, consent_recorded_at, created_at, updated_at FROM opportunities WHERE id = $1',
        [numericId(req.params.id)],
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Opportunity not found' });
      return res.json(result.rows[0]);
    } catch (error) {
      if (error instanceof TypeError) return res.status(400).json({ error: error.message });
      return next(error);
    }
  });

  router.patch('/:id/status', authenticate, canTransition, async (req, res, next) => {
    let opportunityId;
    try {
      opportunityId = numericId(req.params.id);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    let client;
    try {
      client = await database.connect();
    } catch (error) {
      return next(error);
    }
    try {
      await client.query('BEGIN');
      const existing = await client.query('SELECT id, status FROM opportunities WHERE id = $1 FOR UPDATE', [opportunityId]);
      if (!existing.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Opportunity not found' });
      }
      const transition = validateStatusTransition(existing.rows[0].status, req.body?.status, req.body?.note);
      const updated = await client.query(
        'UPDATE opportunities SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status, updated_at',
        [transition.status, existing.rows[0].id],
      );
      await client.query(
        `INSERT INTO opportunity_events
          (opportunity_id, event_type, from_status, to_status, actor_user_id, actor_role, request_id, note)
         VALUES ($1, 'status_changed', $2, $3, $4, $5, $6, $7)`,
        [existing.rows[0].id, existing.rows[0].status, transition.status, req.user.id, req.user.role, requestId(req), transition.note],
      );
      await client.query('COMMIT');
      return res.json(updated.rows[0]);
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch {}
      if (error instanceof TypeError) return res.status(409).json({ error: error.message });
      return next(error);
    } finally {
      client.release();
    }
  });

  return router;
}

module.exports = createOpportunitiesRouter();
module.exports.createOpportunitiesRouter = createOpportunitiesRouter;
module.exports.defaultPostSubmission = defaultPostSubmission;
module.exports.IdempotencyConflictError = IdempotencyConflictError;
