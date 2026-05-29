'use client';

import { useEffect, useState } from 'react';
import { Loader2, X, AlertTriangle } from 'lucide-react';
import type { InitiatedBy } from '@/lib/cancellation';

interface PreviewResponse {
  refundCents: number;
  refundDollars: number;
  tier: string;
  reason: string;
  initiatedBy: InitiatedBy;
}

interface Props {
  bookingId: string;
  initiatedBy: InitiatedBy;
  open: boolean;
  onClose: () => void;
  onSuccess: (result: {
    refundCents: number;
    tier: string;
    stripeRefundId: string | null;
  }) => void;
}

export default function CancelBookingModal({
  bookingId,
  initiatedBy,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch preview when modal opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPreview(null);
    setPreviewError(null);
    setSubmitError(null);
    setReason('');
    (async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/cancel-preview`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setPreviewError(data.error || 'Could not load cancellation preview.');
          return;
        }
        setPreview(data);
      } catch (err: any) {
        if (!cancelled) setPreviewError(err.message || 'Network error.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, bookingId]);

  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellation_reason: reason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Cancellation failed.');
        return;
      }
      onSuccess({
        refundCents: data.refundCents,
        tier: data.tier,
        stripeRefundId: data.stripeRefundId ?? null,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Cancel this booking?
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="text-stone-400 hover:text-stone-700 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {initiatedBy === 'host' && (
          <div className="flex gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              Host cancellations result in a full refund to the guest. Frequent
              cancellations may affect your standing on Groundly.
            </p>
          </div>
        )}

        {previewError && (
          <p className="text-sm text-red-600 mb-4">{previewError}</p>
        )}

        {!preview && !previewError && (
          <div className="flex items-center gap-2 py-6 justify-center text-stone-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Calculating refund…</span>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
              {preview.refundCents > 0 ? (
                <>
                  <p className="text-xs text-stone-500 mb-1">You will receive</p>
                  <p className="text-2xl font-semibold text-stone-900">
                    ${preview.refundDollars.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-stone-900">
                  This cancellation is non-refundable.
                </p>
              )}
              <p className="text-xs text-stone-500 mt-2">{preview.reason}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                rows={3}
                maxLength={1000}
                placeholder="Let the other party know why you're cancelling."
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 disabled:bg-stone-50"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-40"
              >
                Keep booking
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {preview.refundCents > 0
                  ? 'Confirm cancellation'
                  : 'Cancel anyway'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
