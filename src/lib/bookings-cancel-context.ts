// Shared loading logic for the cancel and cancel-preview routes.
// Both endpoints need the same user identity + booking + pending_transfer
// + role determination, but only the cancel endpoint actually mutates.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { InitiatedBy } from './cancellation';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type CancelContextError =
  | { kind: 'unauthorized' }      // 401
  | { kind: 'forbidden' }         // 403 — user has no role on this booking
  | { kind: 'not_found' }         // 404
  | { kind: 'already_paid_out' }  // 409 — pending_transfer is 'transferred'
  | { kind: 'already_cancelled' } // 409 — booking already cancelled
  | { kind: 'server_error'; message: string };

export interface BookingRow {
  id: string;
  user_id: string | null;
  host_id: string | null;
  status: string;
  total_amount: number;          // dollars (DECIMAL)
  booking_date: string;          // TEXT — treated as shoot start
  created_at: string;
  stripe_payment_intent: string | null;
}

export interface PendingTransferRow {
  id: string;
  status: string;                // 'pending' | 'transferred' | 'failed_retry_exhausted' | 'cancelled'
  gross_amount_cents: number;
}

export interface CancelContext {
  userId: string;
  booking: BookingRow;
  pendingTransfer: PendingTransferRow | null;
  initiatedBy: InitiatedBy;
  serviceClient: ReturnType<typeof createClient>;
}

export function totalAmountCents(b: BookingRow): number {
  // bookings.total_amount is DECIMAL(10,2) in dollars; we work in cents
  // everywhere else (matches fees.ts).
  return Math.round(Number(b.total_amount) * 100);
}

/**
 * Load everything a cancellation route needs and return a discriminated
 * union — either an error code for the route to map to an HTTP status,
 * or the full context with a service-role client ready for writes.
 */
export async function loadCancelContext(
  bookingId: string,
): Promise<{ ok: true; ctx: CancelContext } | { ok: false; err: CancelContextError }> {
  // 1. Identify the caller via the cookie session.
  const cookieStore = cookies();
  const userClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, err: { kind: 'unauthorized' } };

  // 2. Service-role client for the rest — we already know who the user is
  //    and we want to bypass RLS for the cross-table reads + updates.
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: booking, error: bookingErr } = await serviceClient
    .from('bookings')
    .select(
      'id, user_id, host_id, status, total_amount, booking_date, created_at, stripe_payment_intent',
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (bookingErr) {
    return { ok: false, err: { kind: 'server_error', message: bookingErr.message } };
  }
  if (!booking) return { ok: false, err: { kind: 'not_found' } };

  // 3. Determine initiatedBy.
  let initiatedBy: InitiatedBy | null = null;
  if (booking.user_id && booking.user_id === user.id) {
    initiatedBy = 'guest';
  } else if (booking.host_id && booking.host_id === user.id) {
    initiatedBy = 'host';
  } else {
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.role === 'admin') initiatedBy = 'admin';
  }
  if (!initiatedBy) return { ok: false, err: { kind: 'forbidden' } };

  // 4. Already-cancelled short-circuit.
  if (booking.status === 'cancelled') {
    return { ok: false, err: { kind: 'already_cancelled' } };
  }

  // 5. Look up the corresponding pending_transfer (may be null for legacy
  //    bookings created before PR 2). Block on 'transferred' — funds have
  //    left the platform and the cancellation must go through support.
  const { data: pt } = await serviceClient
    .from('pending_transfers')
    .select('id, status, gross_amount_cents')
    .eq('booking_id', booking.id)
    .maybeSingle();

  if (pt && pt.status === 'transferred') {
    return { ok: false, err: { kind: 'already_paid_out' } };
  }

  return {
    ok: true,
    ctx: {
      userId: user.id,
      booking: booking as BookingRow,
      pendingTransfer: pt as PendingTransferRow | null,
      initiatedBy,
      serviceClient,
    },
  };
}

export function errToResponse(err: CancelContextError): {
  status: number;
  body: { error: string };
} {
  switch (err.kind) {
    case 'unauthorized':
      return { status: 401, body: { error: 'Not authenticated.' } };
    case 'forbidden':
      return { status: 403, body: { error: 'You do not have access to this booking.' } };
    case 'not_found':
      return { status: 404, body: { error: 'Booking not found.' } };
    case 'already_paid_out':
      return {
        status: 409,
        body: {
          error:
            'This booking has been paid out and can no longer be cancelled through the platform. Contact support.',
        },
      };
    case 'already_cancelled':
      return { status: 409, body: { error: 'This booking is already cancelled.' } };
    case 'server_error':
      return { status: 500, body: { error: err.message } };
  }
}
