ALTER TABLE listings
  ADD COLUMN rolling_availability_days INTEGER;

COMMENT ON COLUMN listings.rolling_availability_days IS
  'When set to N, listing is only bookable for the next N days from today. NULL means all future dates available (default). Specific dates can still be blocked via listing_availability regardless of mode.';
