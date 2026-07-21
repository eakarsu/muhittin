ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS auth_version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'viewer';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_allowed' AND conrelid = 'users'::regclass) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_allowed
      CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')) NOT VALID;
  END IF;
END $$;
ALTER TABLE users VALIDATE CONSTRAINT users_role_allowed;

ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128),
  ADD COLUMN IF NOT EXISTS request_fingerprint CHAR(64),
  ADD COLUMN IF NOT EXISTS consent_recorded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_request_fingerprint_format' AND conrelid = 'opportunities'::regclass) THEN
    ALTER TABLE opportunities ADD CONSTRAINT opportunities_request_fingerprint_format
      CHECK (request_fingerprint IS NULL OR request_fingerprint ~ '^[0-9a-f]{64}$') NOT VALID;
  END IF;
END $$;
ALTER TABLE opportunities VALIDATE CONSTRAINT opportunities_request_fingerprint_format;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_idempotency_contract' AND conrelid = 'opportunities'::regclass) THEN
    ALTER TABLE opportunities ADD CONSTRAINT opportunities_idempotency_contract CHECK (
      (idempotency_key IS NULL AND request_fingerprint IS NULL)
      OR (
        idempotency_key ~ '^[A-Za-z0-9:_-]{16,128}$'
        AND request_fingerprint IS NOT NULL
        AND consent_recorded_at IS NOT NULL
      )
    ) NOT VALID;
  END IF;
END $$;
ALTER TABLE opportunities VALIDATE CONSTRAINT opportunities_idempotency_contract;

CREATE UNIQUE INDEX IF NOT EXISTS opportunities_idempotency_key_unique
  ON opportunities (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_status_allowed' AND conrelid = 'opportunities'::regclass) THEN
    ALTER TABLE opportunities ADD CONSTRAINT opportunities_status_allowed
      CHECK (status IN ('new', 'reviewing', 'qualified', 'proposal', 'negotiation', 'converted', 'closed')) NOT VALID;
  END IF;
END $$;
ALTER TABLE opportunities VALIDATE CONSTRAINT opportunities_status_allowed;

CREATE TABLE IF NOT EXISTS opportunity_events (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE RESTRICT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('submitted', 'status_changed')),
  from_status VARCHAR(50) CHECK (from_status IS NULL OR from_status IN ('new', 'reviewing', 'qualified', 'proposal', 'negotiation', 'converted', 'closed')),
  to_status VARCHAR(50) NOT NULL CHECK (to_status IN ('new', 'reviewing', 'qualified', 'proposal', 'negotiation', 'converted', 'closed')),
  actor_user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
  actor_role VARCHAR(50) NOT NULL CHECK (actor_role IN ('public', 'owner', 'admin', 'manager', 'staff', 'viewer')),
  request_id VARCHAR(100) NOT NULL,
  note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (event_type = 'submitted' AND from_status IS NULL AND to_status = 'new' AND actor_user_id IS NULL AND actor_role = 'public')
    OR
    (event_type = 'status_changed' AND from_status IS NOT NULL AND actor_user_id IS NOT NULL AND actor_role <> 'public')
  )
);

CREATE INDEX IF NOT EXISTS opportunity_events_opportunity_created_idx
  ON opportunity_events (opportunity_id, created_at, id);

CREATE OR REPLACE FUNCTION reject_opportunity_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'opportunity_events is append-only';
END;
$$;

DROP TRIGGER IF EXISTS opportunity_events_immutable ON opportunity_events;
CREATE TRIGGER opportunity_events_immutable
  BEFORE UPDATE OR DELETE ON opportunity_events
  FOR EACH ROW EXECUTE FUNCTION reject_opportunity_event_mutation();
