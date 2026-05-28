'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/utils';

type TransferStatus = 'pending' | 'transferred' | 'failed_retry_exhausted';

interface EarningsRow {
  id: string;
  status: TransferStatus;
  amount_cents: number;
  event_date: string;
  release_at: string;
  transferred_at: string | null;
  listing_title: string;
}

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<EarningsRow[]>([]);
  const [paid, setPaid] = useState<EarningsRow[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    async function load() {
      const profile = await auth.getProfile();
      if (!profile) return;

      // pending_transfers ↔ bookings is a real UUID FK (migration 005),
      // so the embedded select works. bookings.listing_id is TEXT and
      // listings.id is UUID — no FK — so we resolve titles separately.
      const { data: transfers } = await supabase
        .from('pending_transfers')
        .select('id, status, amount_cents, event_date, release_at, transferred_at, bookings(id, listing_id)')
        .eq('host_user_id', profile.id);

      const rows = (transfers || []) as any[];

      const listingIds = Array.from(
        new Set(rows.map((r) => r.bookings?.listing_id).filter(Boolean))
      ) as string[];

      const titleById: Record<string, string> = {};
      if (listingIds.length > 0) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title')
          .in('id', listingIds);
        (listings || []).forEach((l) => {
          titleById[l.id] = l.title;
        });
      }

      const shaped: EarningsRow[] = rows.map((r) => ({
        id: r.id,
        status: r.status,
        amount_cents: r.amount_cents,
        event_date: r.event_date,
        release_at: r.release_at,
        transferred_at: r.transferred_at,
        listing_title:
          (r.bookings?.listing_id && titleById[r.bookings.listing_id]) || 'Unknown listing',
      }));

      const up = shaped
        .filter((r) => r.status !== 'transferred')
        .sort(
          (a, b) => new Date(a.release_at).getTime() - new Date(b.release_at).getTime()
        );
      const pd = shaped
        .filter((r) => r.status === 'transferred')
        .sort(
          (a, b) =>
            new Date(b.transferred_at || 0).getTime() -
            new Date(a.transferred_at || 0).getTime()
        );

      setUpcoming(up);
      setPaid(pd);
      setPendingTotal(
        shaped
          .filter((r) => r.status === 'pending')
          .reduce((s, r) => s + r.amount_cents, 0)
      );
      setPaidTotal(
        shaped
          .filter((r) => r.status === 'transferred')
          .reduce((s, r) => s + r.amount_cents, 0)
      );

      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', profile.id)
        .eq('status', 'confirmed');
      setBookingsCount(count || 0);

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">Earnings</h1>
        <p className="text-sm text-stone-500">
          Track your pending payouts and paid history.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending payouts" value={formatPrice(pendingTotal)} />
        <StatCard label="Paid to date" value={formatPrice(paidTotal)} />
        <StatCard label="Total bookings" value={String(bookingsCount)} />
      </div>

      <Section title="Upcoming payouts">
        {upcoming.length === 0 ? (
          <EmptyState>
            No upcoming payouts yet. Your earnings will show here after your first booking.
          </EmptyState>
        ) : (
          <EarningsList rows={upcoming} mode="upcoming" />
        )}
      </Section>

      <Section title="Paid history">
        {paid.length === 0 ? (
          <EmptyState>
            No payouts yet. Once a shoot completes and the release window passes, your payout will show here.
          </EmptyState>
        ) : (
          <EarningsList rows={paid} mode="paid" />
        )}
      </Section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-stone-100 rounded-xl p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">
        {label}
      </div>
      <div className="text-2xl font-semibold text-stone-900">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-100 rounded-xl p-8 text-center text-sm text-stone-500">
      {children}
    </div>
  );
}

function EarningsList({
  rows,
  mode,
}: {
  rows: EarningsRow[];
  mode: 'upcoming' | 'paid';
}) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-hidden bg-white border border-stone-100 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Shoot date</th>
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">
                {mode === 'upcoming' ? 'Status' : 'Paid on'}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-stone-100">
                <td className="px-4 py-3 text-stone-700">{formatDate(r.event_date)}</td>
                <td className="px-4 py-3 text-stone-900 font-medium">{r.listing_title}</td>
                <td className="px-4 py-3 text-stone-900 font-medium">
                  {formatPrice(r.amount_cents)}
                </td>
                <td className="px-4 py-3">
                  {mode === 'paid' && r.transferred_at ? (
                    <span className="text-stone-700">{formatDate(r.transferred_at)}</span>
                  ) : (
                    <RowStatus row={r} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="bg-white border border-stone-100 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2 gap-3">
              <div className="min-w-0">
                <div className="font-medium text-stone-900 truncate">{r.listing_title}</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Shoot: {formatDate(r.event_date)}
                </div>
              </div>
              <div className="font-semibold text-stone-900 shrink-0">
                {formatPrice(r.amount_cents)}
              </div>
            </div>
            <div className="text-sm">
              {mode === 'paid' && r.transferred_at ? (
                <span className="text-stone-500">Paid on {formatDate(r.transferred_at)}</span>
              ) : (
                <RowStatus row={r} />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RowStatus({ row }: { row: EarningsRow }) {
  if (row.status === 'failed_retry_exhausted') {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
          Needs review
        </span>
        <a
          href="mailto:support@bookgroundly.com"
          className="text-xs text-stone-500 hover:text-stone-900 underline"
        >
          Contact support
        </a>
      </span>
    );
  }
  if (row.status === 'pending') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        Releases {formatDate(row.release_at)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      Paid
    </span>
  );
}
