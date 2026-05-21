-- Records the host portion of each completed booking so PR 3 can sweep
-- funds from the platform balance to the host's Connect account after
-- the event date.
CREATE TABLE pending_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT UNIQUE NOT NULL,
  stripe_account_id TEXT NOT NULL,
  host_user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  gross_amount_cents INTEGER NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  release_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_transfer_id TEXT,
  transferred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pending_transfers_status ON pending_transfers(status);
CREATE INDEX idx_pending_transfers_release_at ON pending_transfers(release_at);

ALTER TABLE pending_transfers ENABLE ROW LEVEL SECURITY;
