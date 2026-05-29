'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { auth } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CancelBookingModal from '@/components/booking/CancelBookingModal';
import type { Profile } from '@/types/database';
import type { InitiatedBy } from '@/lib/cancellation';

interface BookingRow {
  id: string;
  listing_id: string;
  user_id: string | null;
  host_id: string | null;
  status: string;
  total_amount: number;
  booking_date: string;
  hours: number;
  stripe_payment_intent: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  refund_amount_cents: number | null;
  created_at: string;
}

interface TransferRow {
  id: string;
  status: string;
  transferred_at: string | null;
}

interface ListingRow {
  id: string;
  title: string;
  city: string | null;
  state: string | null;
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [listing, setListing] = useState<ListingRow | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<TransferRow | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await auth.getProfile();
        if (!me) {
          router.replace('/login');
          return;
        }
        if (cancelled) return;
        setProfile(me);

        const sb = supabase as any;

        const { data: bk } = await sb
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle();
        if (cancelled) return;
        if (!bk) {
          setNotFound(true);
          return;
        }
        setBooking(bk as BookingRow);

        const [{ data: lst }, { data: pt }] = await Promise.all([
          supabase
            .from('listings')
            .select('id, title, city, state')
            .eq('id', bk.listing_id)
            .maybeSingle(),
          sb
            .from('pending_transfers')
            .select('id, status, transferred_at')
            .eq('booking_id', bk.id)
            .maybeSingle(),
        ]);
        if (cancelled) return;
        setListing((lst as ListingRow) ?? null);
        setPendingTransfer((pt as TransferRow) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (notFound || !booking || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-stone-500">Booking not found.</p>
            <Link href="/dashboard/guest" className="text-sm text-stone-700 underline mt-3 inline-block">
              Back to dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine the caller's role on this booking. The API enforces this
  // server-side too — this is just for UI affordance.
  let initiatedBy: InitiatedBy | null = null;
  if (booking.user_id === profile.id) initiatedBy = 'guest';
  else if (booking.host_id === profile.id) initiatedBy = 'host';
  else if (profile.role === 'admin') initiatedBy = 'admin';

  const canCancel =
    initiatedBy !== null &&
    booking.status === 'confirmed' &&
    (pendingTransfer === null || pendingTransfer.status !== 'transferred');

  const isCancelled = booking.status === 'cancelled';
  const isPaidOut = pendingTransfer?.status === 'transferred';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <Link
          href={initiatedBy === 'host' ? '/dashboard' : '/dashboard/guest'}
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
                Booking
              </p>
              <h1 className="text-xl font-semibold text-stone-900">
                {listing?.title || 'Listing'}
              </h1>
              {listing?.city && (
                <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.city}, {listing.state}
                </p>
              )}
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
            <Field icon={Calendar} label="Date" value={formatDate(booking.booking_date)} />
            <Field icon={Clock} label="Hours" value={String(booking.hours)} />
            <Field icon={DollarSign} label="Total" value={`$${booking.total_amount.toFixed(2)}`} />
          </div>

          {isCancelled && (
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
              <p className="text-sm font-medium text-stone-900 mb-1">
                Cancelled by {booking.cancelled_by ?? 'unknown'}
              </p>
              {booking.refund_amount_cents !== null && (
                <p className="text-sm text-stone-600">
                  Refund issued: ${(booking.refund_amount_cents / 100).toFixed(2)}
                </p>
              )}
              {booking.cancellation_reason && (
                <p className="text-xs text-stone-500 mt-2 whitespace-pre-wrap">
                  {booking.cancellation_reason}
                </p>
              )}
            </div>
          )}

          {isPaidOut && !isCancelled && (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-900 leading-relaxed">
                This booking has been paid out to the host and can no longer be
                cancelled through the platform. Contact support if you need
                further assistance.
              </p>
            </div>
          )}

          {canCancel && initiatedBy && (
            <div className="pt-2">
              <button
                onClick={() => setCancelOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50"
              >
                Cancel booking
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {initiatedBy && (
        <CancelBookingModal
          bookingId={booking.id}
          initiatedBy={initiatedBy}
          open={cancelOpen}
          onClose={() => setCancelOpen(false)}
          onSuccess={() => {
            setCancelOpen(false);
            // refresh server state — the API already wrote the row.
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-stone-100 text-stone-500 border-stone-200',
  };
  const cls = map[status] ?? 'bg-stone-50 text-stone-600 border-stone-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className="text-sm font-medium text-stone-900">{value}</p>
      </div>
    </div>
  );
}
