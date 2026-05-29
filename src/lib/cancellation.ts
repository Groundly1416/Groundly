// PR 5 cancellation policy — pure, no I/O, fully unit-testable.
//
// Policy (hardcoded for now; per-listing customization is a future PR):
//
//   Grace period (guest-initiated only):
//     - Cancelled within 24h of booking confirmation
//     - AND more than 48h before the shoot
//     - AND the booking was created at least 48h before the shoot
//       (prevents last-minute-book-then-grace-cancel exploit)
//     -> 100% refund
//
//   Guest-initiated, outside grace period:
//     -  >7 days before shoot   -> 100% refund
//     -  2-7 days before shoot  ->  50% refund
//     -  <2 days before shoot   ->   0% refund
//
//   Host-initiated  -> 100% refund regardless of timing
//   Admin-initiated -> 100% refund regardless of timing

export type InitiatedBy = 'guest' | 'host' | 'admin';

export type RefundTier =
  | 'grace_period'
  | 'guest_7d_plus'
  | 'guest_2_to_7d'
  | 'guest_under_2d'
  | 'host_full'
  | 'admin_full';

export interface CalculateRefundInput {
  bookingCreatedAt: Date | string;
  shootStartAt: Date | string;
  nowAt: Date | string;
  totalAmountCents: number;
  initiatedBy: InitiatedBy;
}

export interface RefundResult {
  refundCents: number;
  tier: RefundTier;
  reason: string;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function calculateRefund(input: CalculateRefundInput): RefundResult {
  const total = input.totalAmountCents;
  const created = new Date(input.bookingCreatedAt).getTime();
  const shoot = new Date(input.shootStartAt).getTime();
  const now = new Date(input.nowAt).getTime();

  if (input.initiatedBy === 'admin') {
    return {
      refundCents: total,
      tier: 'admin_full',
      reason: 'Admin-initiated cancellation — full refund.',
    };
  }

  if (input.initiatedBy === 'host') {
    return {
      refundCents: total,
      tier: 'host_full',
      reason: 'Host-initiated cancellation — full refund to guest.',
    };
  }

  const msSinceBooking = now - created;
  const msUntilShoot = shoot - now;
  const msBookingToShoot = shoot - created;

  const inGracePeriod =
    msSinceBooking <= 24 * HOUR_MS &&
    msUntilShoot > 48 * HOUR_MS &&
    msBookingToShoot >= 48 * HOUR_MS;

  if (inGracePeriod) {
    return {
      refundCents: total,
      tier: 'grace_period',
      reason:
        'Cancelled within 24h of booking confirmation and more than 48h before shoot — full refund.',
    };
  }

  if (msUntilShoot > 7 * DAY_MS) {
    return {
      refundCents: total,
      tier: 'guest_7d_plus',
      reason: 'More than 7 days before shoot — full refund.',
    };
  }

  if (msUntilShoot >= 2 * DAY_MS) {
    return {
      refundCents: Math.round(total / 2),
      tier: 'guest_2_to_7d',
      reason: '2–7 days before shoot — 50% refund.',
    };
  }

  return {
    refundCents: 0,
    tier: 'guest_under_2d',
    reason: 'Less than 2 days before shoot — non-refundable.',
  };
}
