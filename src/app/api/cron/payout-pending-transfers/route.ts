import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  MAX_RETRIES,
  calculateBackoffDelay,
  selectEligibleTransfers,
  type PendingTransferRow,
} from '@/lib/transfers';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase service credentials missing' },
      { status: 500 }
    );
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let eligible: PendingTransferRow[];
  try {
    eligible = await selectEligibleTransfers(supabase);
  } catch (err: any) {
    console.error('[payout-cron] failed to fetch eligible transfers:', err);
    return NextResponse.json(
      { error: 'Failed to fetch eligible transfers', detail: err.message },
      { status: 500 }
    );
  }

  let succeeded = 0;
  let retried = 0;
  let exhausted = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const row of eligible) {
    try {
      const transfer = await stripe.transfers.create(
        {
          amount: row.amount_cents,
          currency: 'usd',
          destination: row.stripe_account_id,
          transfer_group: row.booking_id ?? row.id,
          metadata: {
            pending_transfer_id: row.id,
            booking_id: row.booking_id ?? '',
          },
        },
        { idempotencyKey: `transfer_${row.id}` }
      );

      const { error: updateError } = await supabase
        .from('pending_transfers')
        .update({
          status: 'transferred',
          stripe_transfer_id: transfer.id,
          transferred_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      if (updateError) {
        console.error(
          `[payout-cron] transfer ${transfer.id} succeeded for row ${row.id} (host=${row.stripe_account_id}, amount=${row.amount_cents}) but DB update failed:`,
          updateError
        );
        errors.push({ id: row.id, error: `DB update failed: ${updateError.message}` });
      } else {
        succeeded += 1;
        console.log(
          `[payout-cron] OK row=${row.id} transfer=${transfer.id} host=${row.stripe_account_id} amount=${row.amount_cents}`
        );
      }
    } catch (err: any) {
      const newRetryCount = row.retry_count + 1;
      const errMessage = err?.message ?? String(err);
      const nowIso = new Date().toISOString();

      if (newRetryCount >= MAX_RETRIES) {
        const { error: updateError } = await supabase
          .from('pending_transfers')
          .update({
            status: 'failed_retry_exhausted',
            retry_count: newRetryCount,
            last_error_message: errMessage,
            last_error_at: nowIso,
          })
          .eq('id', row.id);

        if (updateError) {
          console.error(
            `[payout-cron] EXHAUSTED row=${row.id} DB update failed:`,
            updateError
          );
        }
        exhausted += 1;
        console.error(
          `[payout-cron] EXHAUSTED row=${row.id} host=${row.stripe_account_id} amount=${row.amount_cents} attempts=${newRetryCount} error=${errMessage}`
        );
      } else {
        const backoffMinutes = calculateBackoffDelay(row.retry_count);
        const nextRetryAt = new Date(Date.now() + backoffMinutes * 60_000).toISOString();

        const { error: updateError } = await supabase
          .from('pending_transfers')
          .update({
            retry_count: newRetryCount,
            next_retry_at: nextRetryAt,
            last_error_message: errMessage,
            last_error_at: nowIso,
          })
          .eq('id', row.id);

        if (updateError) {
          console.error(
            `[payout-cron] RETRY row=${row.id} DB update failed:`,
            updateError
          );
        }
        retried += 1;
        console.warn(
          `[payout-cron] RETRY row=${row.id} host=${row.stripe_account_id} amount=${row.amount_cents} attempt=${newRetryCount} backoff=${backoffMinutes}min error=${errMessage}`
        );
      }

      errors.push({ id: row.id, error: errMessage });
    }
  }

  return NextResponse.json({
    processed: eligible.length,
    succeeded,
    retried,
    exhausted,
    errors,
  });
}
