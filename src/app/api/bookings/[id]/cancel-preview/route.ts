import { NextRequest, NextResponse } from 'next/server';
import { calculateRefund } from '@/lib/cancellation';
import {
  loadCancelContext,
  errToResponse,
  totalAmountCents,
} from '@/lib/bookings-cancel-context';

// GET /api/bookings/[id]/cancel-preview
//
// Returns the refund amount + tier the cancel endpoint *would* compute,
// without touching Stripe or the database. Used by the CancelBookingModal
// to show the guest/host what they'll get back before they confirm.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const loaded = await loadCancelContext(params.id);
  if (!loaded.ok) {
    const { status, body } = errToResponse(loaded.err);
    return NextResponse.json(body, { status });
  }
  const { booking, initiatedBy } = loaded.ctx;

  const result = calculateRefund({
    bookingCreatedAt: booking.created_at,
    shootStartAt: booking.booking_date,
    nowAt: new Date().toISOString(),
    totalAmountCents: totalAmountCents(booking),
    initiatedBy,
  });

  return NextResponse.json({
    refundCents: result.refundCents,
    refundDollars: result.refundCents / 100,
    tier: result.tier,
    reason: result.reason,
    initiatedBy,
  });
}
