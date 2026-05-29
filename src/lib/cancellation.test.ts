import { describe, it, expect } from 'vitest';
import { calculateRefund } from './cancellation';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const NOW = new Date('2026-06-01T12:00:00Z').getTime();
const TOTAL = 30000; // $300 in cents

function iso(offsetMs: number): string {
  return new Date(NOW + offsetMs).toISOString();
}

describe('calculateRefund', () => {
  it('guest cancels 10 days before shoot → 100% (guest_7d_plus)', () => {
    const r = calculateRefund({
      bookingCreatedAt: iso(-30 * DAY),
      shootStartAt: iso(10 * DAY),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'guest',
    });
    expect(r.tier).toBe('guest_7d_plus');
    expect(r.refundCents).toBe(TOTAL);
  });

  it('guest cancels 4 days before shoot → 50% (guest_2_to_7d)', () => {
    const r = calculateRefund({
      bookingCreatedAt: iso(-30 * DAY),
      shootStartAt: iso(4 * DAY),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'guest',
    });
    expect(r.tier).toBe('guest_2_to_7d');
    expect(r.refundCents).toBe(15000);
  });

  it('guest cancels 1 day before shoot → 0% (guest_under_2d)', () => {
    const r = calculateRefund({
      bookingCreatedAt: iso(-30 * DAY),
      shootStartAt: iso(1 * DAY),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'guest',
    });
    expect(r.tier).toBe('guest_under_2d');
    expect(r.refundCents).toBe(0);
  });

  it('guest cancels 12h after booking, 5 days before shoot → grace_period 100%', () => {
    // booking created 12h ago, shoot 5d from now, so booking was made
    // 5d+12h before shoot — well over the 48h floor.
    const r = calculateRefund({
      bookingCreatedAt: iso(-12 * HOUR),
      shootStartAt: iso(5 * DAY),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'guest',
    });
    expect(r.tier).toBe('grace_period');
    expect(r.refundCents).toBe(TOTAL);
  });

  it('last-minute-book-exploit: book 30h before shoot, cancel 2h later → 0% (grace blocked)', () => {
    // Booking happened 30h before shoot, so msBookingToShoot=30h < 48h
    // — grace period blocked. Now we're 28h before shoot, which is <2d.
    const r = calculateRefund({
      bookingCreatedAt: iso(-2 * HOUR),
      shootStartAt: iso(28 * HOUR),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'guest',
    });
    expect(r.tier).toBe('guest_under_2d');
    expect(r.refundCents).toBe(0);
  });

  it('host cancels 1 day before shoot → 100% (host_full)', () => {
    const r = calculateRefund({
      bookingCreatedAt: iso(-30 * DAY),
      shootStartAt: iso(1 * DAY),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'host',
    });
    expect(r.tier).toBe('host_full');
    expect(r.refundCents).toBe(TOTAL);
  });

  it('admin cancels with no time remaining → 100% (admin_full)', () => {
    const r = calculateRefund({
      bookingCreatedAt: iso(-30 * DAY),
      shootStartAt: iso(1 * HOUR),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'admin',
    });
    expect(r.tier).toBe('admin_full');
    expect(r.refundCents).toBe(TOTAL);
  });

  it('boundary: exactly 7 days before shoot → 50% (guest_2_to_7d, not 7d_plus)', () => {
    // Policy: ">7 days" is full, "2-7 days" is 50%. So exactly 7d → 50%.
    const r = calculateRefund({
      bookingCreatedAt: iso(-30 * DAY),
      shootStartAt: iso(7 * DAY),
      nowAt: iso(0),
      totalAmountCents: TOTAL,
      initiatedBy: 'guest',
    });
    expect(r.tier).toBe('guest_2_to_7d');
    expect(r.refundCents).toBe(15000);
  });
});
