-- Without this policy the host-facing earnings page (which queries
-- under the anon key) shows empty state for every host, because the
-- table has RLS enabled (migration 005) but no SELECT policy. Service-
-- role callers (cron, webhook) bypass RLS, so they're unaffected.
CREATE POLICY "Hosts can view their own pending_transfers"
  ON pending_transfers FOR SELECT
  USING (auth.uid() = host_user_id);
