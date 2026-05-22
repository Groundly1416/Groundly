-- Retry tracking for the payout cron (PR 3). The partial index lets
-- the cron's eligibility query (status='pending' AND release_at < now
-- AND (next_retry_at IS NULL OR next_retry_at < now)) skip the bulk
-- of completed/exhausted rows once history grows.
ALTER TABLE pending_transfers
  ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN next_retry_at TIMESTAMPTZ,
  ADD COLUMN last_error_message TEXT,
  ADD COLUMN last_error_at TIMESTAMPTZ;

CREATE INDEX idx_pending_transfers_eligible
  ON pending_transfers(status, release_at, next_retry_at)
  WHERE status = 'pending';

-- Status values used by the payout cron:
--   'pending'                 -> never attempted yet, or in retry backoff
--   'transferred'             -> successfully sent to host
--   'failed_retry_exhausted'  -> 6 failures, manual review needed
-- After 6 attempts, flip status to failed_retry_exhausted.
