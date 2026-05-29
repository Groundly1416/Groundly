import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculateRefund } from '@/lib/cancellation';
import {
  loadCancelContext,
  errToResponse,
  totalAmountCents,
} from '@/lib/bookings-cancel-context';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

// POST /api/bookings/[id]/cancel
//
// Body (JSON, all optional):
//   { cancellation_reason?: string }
//
// Behavior:
//   1. Identify caller, load booking + pending_transfer.
//   2. If pending_transfer.status='transferred' -> 409 (funds already out).
//   3. Compute refund per policy.
//   4. If refund > 0, issue Stripe refund. Capture the refund id.
//   5. Mark pending_transfer 'cancelled' so the payout cron skips it.
//   6. Update booking with cancellation columns + status='cancelled'.
//
// Error policy:
//   If Stripe refund succeeds but the DB writes fail, we LOG LOUDLY and
//   surface the inconsistency to the caller as a 500 with the refund id
//   in the message. We do NOT attempt to reverse the Stripe refund —
//   that creates a worse, harder-to-reconcile state. Operator must
//   manually align the booking row using the logged refund_id.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const loaded = await loadCancelContext(params.id);
  if (!loaded.ok) {
    const { status, body } = errToResponse(loaded.err);
    return NextResponse.json(body, { status });
  }
  const { booking, pendingTransfer, initiatedBy, serviceClient } = loaded.ctx;

  let reason: string | null = null;
  try {
    const body = await req.json();
    if (typeof body?.cancellation_reason === 'string') {
      reason = body.cancellation_reason.slice(0, 1000) || null;
    }
  } catch {
    // body is optional
  }

  const refund = calculateRefund({
    bookingCreatedAt: booking.created_at,
    shootStartAt: booking.booking_date,
    nowAt: new Date().toISOString(),
    totalAmountCents: totalAmountCents(booking),
    initiatedBy,
  });

  // --- Stripe refund (only when there's actually money to send back) ---
  let stripeRefundId: string | null = null;
  if (refund.refundCents > 0) {
    if (!booking.stripe_payment_intent) {
      return NextResponse.json(
        {
          error:
            'Booking has no Stripe payment intent on file — refund cannot be issued.',
        },
        { status: 422 },
      );
    }
    try {
      const stripeRefund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent,
        amount: refund.refundCents,
        metadata: {
          booking_id: booking.id,
          tier: refund.tier,
          initiated_by: initiatedBy,
        },
      });
      stripeRefundId = stripeRefund.id;
    } catch (err: any) {
      return NextResponse.json(
        { error: `Stripe refund failed: ${err.message}` },
        { status: 502 },
      );
    }
  }

  // --- Past the point of no return: refund (if any) is already issued ---
  if (pendingTransfer) {
    const { error: ptErr } = await serviceClient
      .from('pending_transfers')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', pendingTransfer.id);
    if (ptErr) {
      console.error(
        `[cancel] CRITICAL: Stripe refund ${stripeRefundId ?? '(none)'} for booking ${booking.id} succeeded but pending_transfer ${pendingTransfer.id} update failed — payout cron may still fire. Manual reconcile required. Error: ${ptErr.message}`,
      );
      return NextResponse.json(
        {
          error: 'Refund issued but pending_transfer update failed — see logs.',
          stripe_refund_id: stripeRefundId,
        },
        { status: 500 },
      );
    }
  }

  const { error: bookingErr } = await serviceClient
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: initiatedBy,
      cancellation_reason: reason,
      refund_amount_cents: refund.refundCents,
      stripe_refund_id: stripeRefundId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  if (bookingErr) {
    console.error(
      `[cancel] CRITICAL: Stripe refund ${stripeRefundId ?? '(none)'} for booking ${booking.id} succeeded and pending_transfer cancelled, but booking row update failed. Manual reconcile required. Error: ${bookingErr.message}`,
    );
    return NextResponse.json(
      {
        error: 'Refund issued but booking row update failed — see logs.',
        stripe_refund_id: stripeRefundId,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    status: 'cancelled',
    tier: refund.tier,
    refundCents: refund.refundCents,
    refundDollars: refund.refundCents / 100,
    stripeRefundId,
  });
}
