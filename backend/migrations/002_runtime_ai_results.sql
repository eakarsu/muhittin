CREATE TABLE IF NOT EXISTS runtime_ai_results (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  provider VARCHAR(30) NOT NULL,
  model VARCHAR(200) NOT NULL,
  provider_receipt JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS runtime_ai_results_identity_idx
  ON runtime_ai_results(user_id, created_at DESC);
