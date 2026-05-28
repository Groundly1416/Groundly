-- The bookings table's SELECT policies from migration 004 appear to be
-- missing or non-functional in production: the earnings page's anon-key
-- queries return 0 rows for the authenticated host even though
-- auth.uid() = host_id should match. This re-applies the SELECT
-- policies idempotently (DROP IF EXISTS then CREATE), so it's safe to
-- run whether the original policies are present or not.
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view their listing bookings" ON bookings;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view their listing bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = host_id);
