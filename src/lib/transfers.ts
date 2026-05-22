import type { SupabaseClient } from '@supabase/supabase-js';

// After 6 attempts, flip status to failed_retry_exhausted.
// Cron passes newRetryCount (= row.retry_count + 1) into this check, and
// calls calculateBackoffDelay(row.retry_count) for failures 1-5, yielding
// the 5/10/20/40/80 min schedule before exhausting on failure 6.
export const MAX_RETRIES = 6;
const CRON_BATCH_LIMIT = 50;

export interface PendingTransferRow {
  id: string;
  booking_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string;
  stripe_account_id: string;
  host_user_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  gross_amount_cents: number;
  event_date: string;
  release_at: string;
  status: string;
  retry_count: number;
  next_retry_at: string | null;
  last_error_message: string | null;
  last_error_at: string | null;
}

export async function selectEligibleTransfers(
  supabase: SupabaseClient
): Promise<PendingTransferRow[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('pending_transfers')
    .select('*')
    .eq('status', 'pending')
    .lt('release_at', nowIso)
    .or(`next_retry_at.is.null,next_retry_at.lt.${nowIso}`)
    .limit(CRON_BATCH_LIMIT);

  if (error) throw error;
  return (data ?? []) as PendingTransferRow[];
}

// 5 * 2^retryCount minutes. retryCount=0->5, 1->10, 2->20, 3->40, 4->80.
export function calculateBackoffDelay(retryCount: number): number {
  return 5 * Math.pow(2, retryCount);
}
