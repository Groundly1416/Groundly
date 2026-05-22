// Single source of truth for "is this date bookable on this listing?".
// Used by both the guest-side date picker (to bound the input) and any
// future server-side validation (e.g. before creating a booking).
//
// The earliest bookable date is tomorrow — same-day bookings on a
// marketplace are operationally messy (host coordination, payment hold
// timing, etc.), so today is always excluded. The rolling-window upper
// bound stays anchored at today + N: a host who picks "14 days" gets
// a 14-day bookable window [tomorrow, today + 14].

export interface ListingAvailability {
  rolling_availability_days: number | null;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * True iff `date` is bookable on `listing`. Earliest bookable date is
 * tomorrow; latest is `today + rolling_availability_days` when set, or
 * unbounded when NULL. Dates in `blockedDates` are always rejected.
 */
export function isDateAvailable(
  listing: ListingAvailability,
  date: Date,
  blockedDates: Date[] = []
): boolean {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = startOfDay(date);

  if (target < tomorrow) return false;

  if (listing.rolling_availability_days != null) {
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + listing.rolling_availability_days);
    if (target > maxDate) return false;
  }

  const targetMs = target.getTime();
  if (blockedDates.some((b) => startOfDay(b).getTime() === targetMs)) {
    return false;
  }

  return true;
}

/**
 * The bookable date range for the date picker. `start` is tomorrow
 * (same-day bookings are never allowed). `end` is `today +
 * rolling_availability_days` when set, otherwise null (open-ended).
 */
export function getAvailableDateRange(
  listing: ListingAvailability
): { start: Date; end: Date | null } {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(start.getDate() + 1);

  if (listing.rolling_availability_days == null) {
    return { start, end: null };
  }
  const end = new Date(today);
  end.setDate(end.getDate() + listing.rolling_availability_days);
  return { start, end };
}
