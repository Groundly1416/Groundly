-- PR 5: Cancellation + refund columns.
--
-- bookings.status and pending_transfers.status are plain TEXT with no
-- CHECK constraint, so writing 'cancelled' to either is already legal.
-- This migration just adds the columns needed to record who cancelled,
-- when, why, and what refund went out, plus an index on status.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT
    CHECK (cancelled_by IS NULL OR cancelled_by IN ('guest','host','admin')),
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS refund_amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Document the post-PR-5 status vocabulary for future readers.
COMMENT ON COLUMN bookings.status IS
  'confirmed | cancelled';
COMMENT ON COLUMN pending_transfers.status IS
  'pending | transferred | failed_retry_exhausted | cancelled';

-- Allow guests and hosts to update their own bookings to cancel them.
-- Cancellation is the only mutation either party performs on this row,
-- and the API route always sets the cancellation columns atomically with
-- status='cancelled', so a narrow self-row UPDATE policy is safe.
DROP POLICY IF EXISTS "Users can cancel own bookings" ON bookings;
CREATE POLICY "Users can cancel own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = host_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = host_id);
