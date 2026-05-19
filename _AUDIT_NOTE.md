# Audit Note - muhittin

Source: `_AUDIT/reports/batch_10.md` (lines 806-858).

## Original Audit Recommendations

### What's Missing
- Real-time team collaboration.
- Predictive customer churn.
- Territory management.
- Commission calculation and tracking.
- API for third-party integrations (Salesforce, HubSpot, Pipedrive).
- Workflow automation (rules engine, approvals).

### Custom Feature Suggestions
1. Predictive close date + win probability.
2. Territory optimizer.
3. Revenue forecasting agent.
4. Workflow automation engine.
5. Voice note intelligence.
6. Competitive win/loss analysis.

## Implementations Applied

Added 3 AI endpoints to `backend/routes/ai.js` matching the existing `callAI` pattern + `authenticateToken` middleware:
- `POST /api/ai/deal-close-prediction`
- `POST /api/ai/territory-optimizer`
- `POST /api/ai/revenue-forecast`

Each requests JSON-only output. No new dependencies.

## Backlog (Prioritized)

### High
- Workflow automation engine (rules + approvals).
- Commission tracking on deals/payments.
- Predictive customer churn (separate from deal close).

### Medium
- Real-time team collaboration (WebSocket on deals).
- Third-party CRM connectors.
- Voice note intelligence.

### Low / Product Decisions
- Competitive win/loss analysis (long-running learning).
- Multi-currency revenue rollups.

## Apply pass 3 (frontend)

- **Stack:** Vite + React + react-router-dom, JWT Bearer via `useAI` hook (uses fetch with `localStorage.getItem('token')`).
- **Action:** LEFT-AS-IS — pass-2 endpoints already wired.
- **Notes:** `frontend/src/pages/AISales.jsx` calls all three pass-2 endpoints (`/api/ai/deal-close-prediction`, `/api/ai/territory-optimizer`, `/api/ai/revenue-forecast`) via the shared `useAI` hook. Route `/admin/ai-sales` registered in `App.jsx` behind `ProtectedRoute`. Backend returns 503 on missing key; `useAI` surfaces `error`. Idempotence rule applied.

## Apply pass 4 (mechanical backlog)

- **Action:** LEFT-AS-IS — all three mechanical backlog items were already implemented in a prior pass-4 sweep.
- **Mechanical features verified present (BE + FE):**
  1. `POST /api/ai/workflow-automation` — `backend/routes/ai.js`; FE `frontend/src/pages/AISales.jsx` tab `workflow`.
  2. `POST /api/ai/commission-tracking` — `backend/routes/ai.js`; FE `AISales.jsx` tab `commission`.
  3. `POST /api/ai/customer-churn-prediction` — `backend/routes/ai.js`; FE `AISales.jsx` tab `churn`.
- **Helper pattern:** `authenticateToken` + existing `callAI` helper (returns HTTP 503 when `OPENROUTER_API_KEY` missing). FE uses `useAuth().api` fetch wrapper (JWT bearer); `ResultPanel` shows server `error.message`.
- **Backlog deferred:** Real-time WebSocket collaboration → NEEDS-PRODUCT-DECISION; CRM connectors (Salesforce/HubSpot/Pipedrive) → NEEDS-CREDS; Voice note ASR → NEEDS-CREDS; Competitive win/loss learning → TOO-RISKY; Multi-currency rollups → NEEDS-PRODUCT-DECISION.
- **Smoke test:** `node --check backend/routes/ai.js` PASS; live HTTP skipped (Postgres not provisioned).
- **Idempotence rule applied** — no duplicate routes, no new deps, no `npm install`.
