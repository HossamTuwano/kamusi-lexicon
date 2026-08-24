-- 002: Reported/flagging state for spam or low-quality entries
-- Requires 001_phase1_bootstrap.sql (or Phase1Init1754490000000).

ALTER TABLE lemmas ADD COLUMN IF NOT EXISTS report_count int NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS lemma_reports (
  id SERIAL PRIMARY KEY,
  lemma_id int NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
  user_id int NOT NULL,
  reason varchar NOT NULL,
  note text NULL,
  status varchar NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT uq_report_lemma_user UNIQUE (lemma_id, user_id)
);

CREATE INDEX IF NOT EXISTS IDX_lemma_reports_status ON lemma_reports (status);
