const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());

// Existing routes
app.use('/api/auth', require('./routes/auth'));
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
app.use('/api/meeting-transcription', require('./routes/meetingTranscription')); app.use('/api/territory-planner', require('./routes/territoryPlanner')); app.use('/api/visual-workflow-builder', require('./routes/visualWorkflowBuilder')); app.use('/api/crm-sync', require('./routes/crmSync')); app.use('/api/esignature', require('./routes/esignature')); app.use('/api/win-loss-intel', require('./routes/winLossIntel'));

// Consulting routes
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

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Muhittin backend running on port ${PORT}`);
});

// === Batch 10 Gaps & Frontend Mounts === (mounts)
app.use('/api/gap-already-broad-remaining-gaps', require('./routes/gap_already_broad_remaining_gaps'));
app.use('/api/gap-no-vision-based-document-parsing', require('./routes/gap_no_vision_based_document_parsing'));
app.use('/api/gap-no-multilingual-content-generation-pipeline', require('./routes/gap_no_multilingual_content_generation_pipeline'));
app.use('/api/gap-no-real-time-meeting-transcription-action', require('./routes/gap_no_real_time_meeting_transcription_action'));
app.use('/api/gap-no-competitor-win-loss-pattern-miner', require('./routes/gap_no_competitor_win_loss_pattern_miner'));
app.use('/api/gap-no-content-moderation-across-user-generated', require('./routes/gap_no_content_moderation_across_user_generated'));
app.use('/api/gap-no-territory-quota-management-despite-optimizer', require('./routes/gap_no_territory_quota_management_despite_optimizer'));
app.use('/api/gap-no-commission-calc-ui-tied-to', require('./routes/gap_no_commission_calc_ui_tied_to'));
app.use('/api/gap-no-salesforce-hubspot-pipedrive-sync-connector', require('./routes/gap_no_salesforce_hubspot_pipedrive_sync_connector'));
app.use('/api/gap-no-workflow-visual-builder-despite-workflow', require('./routes/gap_no_workflow_visual_builder_despite_workflow'));
app.use('/api/gap-no-co-editing-commenting-on-deals', require('./routes/gap_no_co_editing_commenting_on_deals'));
app.use('/api/gap-no-e-signature-integration', require('./routes/gap_no_e_signature_integration'));
app.use('/api/gap-no-webhooks-for-partner-integrations', require('./routes/gap_no_webhooks_for_partner_integrations'));
