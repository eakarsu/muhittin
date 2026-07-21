const crypto = require('node:crypto');
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { getRuntimeConfig } = require('./config');
const { authenticateToken, requireRole } = require('./middleware/auth');
const { createRateLimiter } = require('./middleware/rateLimit');

const gapRoutes = [
  ['gap-already-broad-remaining-gaps', './routes/gap_already_broad_remaining_gaps'],
  ['gap-no-vision-based-document-parsing', './routes/gap_no_vision_based_document_parsing'],
  ['gap-no-multilingual-content-generation-pipeline', './routes/gap_no_multilingual_content_generation_pipeline'],
  ['gap-no-real-time-meeting-transcription-action', './routes/gap_no_real_time_meeting_transcription_action'],
  ['gap-no-competitor-win-loss-pattern-miner', './routes/gap_no_competitor_win_loss_pattern_miner'],
  ['gap-no-content-moderation-across-user-generated', './routes/gap_no_content_moderation_across_user_generated'],
  ['gap-no-territory-quota-management-despite-optimizer', './routes/gap_no_territory_quota_management_despite_optimizer'],
  ['gap-no-commission-calc-ui-tied-to', './routes/gap_no_commission_calc_ui_tied_to'],
  ['gap-no-salesforce-hubspot-pipedrive-sync-connector', './routes/gap_no_salesforce_hubspot_pipedrive_sync_connector'],
  ['gap-no-workflow-visual-builder-despite-workflow', './routes/gap_no_workflow_visual_builder_despite_workflow'],
  ['gap-no-co-editing-commenting-on-deals', './routes/gap_no_co_editing_commenting_on_deals'],
  ['gap-no-e-signature-integration', './routes/gap_no_e_signature_integration'],
  ['gap-no-webhooks-for-partner-integrations', './routes/gap_no_webhooks_for_partner_integrations'],
];

function securityHeaders(_req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  return next();
}

function createApp({ config = getRuntimeConfig(), database = pool } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use((req, res, next) => {
    const supplied = req.headers['x-request-id'];
    req.id = typeof supplied === 'string' && /^[A-Za-z0-9:_-]{8,100}$/.test(supplied) ? supplied : crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
  });
  app.use(securityHeaders);
  app.use(cors({
    credentials: false,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed');
      error.status = 403;
      return callback(error);
    },
  }));

  app.use('/api/stripe/webhook', express.raw({ type: 'application/json', limit: '1mb' }));
  app.use(express.json({ limit: '64kb', strict: true }));

  const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
  const submissionLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });
  app.use('/api/auth', authLimiter, require('./routes/auth'));
  app.post('/api/opportunities', submissionLimiter);

  app.use('/api/businesses', require('./routes/businesses'));
  app.use('/api/customers', require('./routes/customers'));
  app.use('/api/bookings', require('./routes/bookings'));
  app.use('/api/reviews', require('./routes/reviews'));
  app.use('/api/campaigns', require('./routes/campaigns'));
  app.use('/api/leads', require('./routes/leads'));
  app.use('/api/websites', require('./routes/websites'));
  app.use('/api/social', require('./routes/social'));
  app.use('/api/analytics', require('./routes/analytics'));
  app.use('/api/notifications', require('./routes/notifications'));
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/seo', require('./routes/seo'));
  app.use('/api/meeting-transcription', require('./routes/meetingTranscription'));
  app.use('/api/territory-planner', require('./routes/territoryPlanner'));
  app.use('/api/visual-workflow-builder', require('./routes/visualWorkflowBuilder'));
  app.use('/api/crm-sync', require('./routes/crmSync'));
  app.use('/api/esignature', require('./routes/esignature'));
  app.use('/api/win-loss-intel', require('./routes/winLossIntel'));
  app.use('/api/contacts', require('./routes/contacts'));
  app.use('/api/companies', require('./routes/companies'));
  app.use('/api/candidates', require('./routes/candidates'));
  app.use('/api/partners', require('./routes/partners'));
  app.use('/api/deals', require('./routes/deals'));
  app.use('/api/consulting-payments', require('./routes/consulting-payments'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/service-packages', require('./routes/service-packages'));
  app.use('/api/consultations', require('./routes/consultations'));
  app.use('/api/insights', require('./routes/insights'));
  app.use('/api/opportunities', require('./routes/opportunities'));
  app.use('/api/meetings', require('./routes/meetings'));
  app.use('/api/stripe', require('./routes/stripe'));
  app.use('/api/onboarding', require('./routes/onboarding'));
  app.use('/api/case-studies', require('./routes/case-studies'));
  app.use('/api/industries', require('./routes/industries'));
  app.use('/api/search', require('./routes/search'));
  app.use('/api/custom-views', require('./routes/customViews'));

  const gapAccess = [authenticateToken, requireRole('owner', 'admin', 'manager')];
  for (const [slug, modulePath] of gapRoutes) app.use(`/api/${slug}`, ...gapAccess, require(modulePath));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/ready', async (_req, res) => {
    try {
      const result = await database.query(`
        SELECT
          to_regclass('public.users') AS users,
          to_regclass('public.opportunities') AS opportunities,
          to_regclass('public.opportunity_events') AS opportunity_events
      `);
      if (Object.values(result.rows[0] || {}).some((value) => !value)) return res.status(503).json({ status: 'not_ready' });
      return res.json({ status: 'ready' });
    } catch {
      return res.status(503).json({ status: 'not_ready' });
    }
  });

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((error, req, res, _next) => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    console.error(`Request ${req.id} failed (${status})${config.nodeEnv === 'development' ? `: ${error.stack || error.message}` : ''}`);
    return res.status(status).json({ error: status >= 500 ? 'Internal server error' : error.message, request_id: req.id });
  });
  return app;
}

function startServer({ app = createApp(), port = getRuntimeConfig().backendPort } = {}) {
  return app.listen(port, '127.0.0.1', () => {
    console.log(`Multiverse Consulting Group backend listening on 127.0.0.1:${port}`);
  });
}

if (require.main === module) {
  const server = startServer();
  const shutdown = (signal) => {
    console.log(`${signal} received; shutting down.`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = { createApp, securityHeaders, startServer };
