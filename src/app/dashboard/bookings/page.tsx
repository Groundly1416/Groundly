'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Users, DollarSign, Check, X, Loader2, MessageSquare, Inbox } from 'lucide-react';
import { auth, bookings as bookingService } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import type { Profile, BookingRequest, BookingStatus } from '@/types/database';

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  declined: { label: 'Declined', color: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', color: 'bg-stone-50 text-stone-500 border-stone-200' },
  completed: { label: 'Completed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const durationLabels: Record<string, string> = {
  '2hr': '2 Hours',
  'halfday': 'Half Day',
  'fullday': 'Full Day',
};

type Filter = 'all' | 'pending' | 'approved' | 'declined';

export default function BookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [allBookings, setAllBookings] = useState<BookingRequest[]>([]);
  const [listingNames, setListingNames] = useState<Record<string, string>>({});
  const [guestNames, setGuestNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile) { router.replace('/login'); return; }
        setUser(profile);

        const hostBookings = await bookingService.getForHost(profile.id);
        setAllBookings(hostBookings);

        // Fetch listing titles and guest names for display
        const listingIds = [...new Set(hostBookings.map(b => b.listing_id))];
        const guestIds = [...new Set(hostBookings.map(b => b.guest_id))];

        if (listingIds.length > 0) {
          const { data: listingsData } = await supabase
            .from('listings').select('id, title').in('id', listingIds);
          const names: Record<string, string> = {};
          (listingsData || []).forEach(l => { names[l.id] = l.title; });
          setListingNames(names);
        }

        if (guestIds.length > 0) {
          const { data: guestsData } = await supabase
            .from('profiles').select('id, full_name').in('id', guestIds);
          const names: Record<string, string> = {};
          (guestsData || []).forEach(g => { names[g.id] = g.full_name || 'Guest'; });
          setGuestNames(names);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleApprove(bookingId: string) {
    setActionLoading(bookingId);
    try {
      await bookingService.approve(bookingId, responseText[bookingId] || undefined);
      setAllBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'approved' as BookingStatus, responded_at: new Date().toISOString() } : b
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(bookingId: string) {
    setActionLoading(bookingId);
    try {
      await bookingService.decline(bookingId, responseText[bookingId] || undefined);
      setAllBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'declined' as BookingStatus, responded_at: new Date().toISOString() } : b
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = filter === 'all'
    ? allBookings
    : allBookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Booking Requests</h1>
        <p className="text-sm text-stone-500 mt-1">Review and manage incoming booking requests for your spaces.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-lg w-fit">
        {(['all', 'pending', 'approved', 'declined'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-all capitalize',
              filter === f ? 'bg-white text-stone-900 font-medium shadow-sm' : 'text-stone-500 hover:text-stone-700'
            )}>
            {f}
            {f === 'pending' && allBookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-amber-100 text-amber-700 rounded-full font-medium">
                {allBookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-100">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7 text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">No booking requests</h2>
          <p className="text-sm text-stone-500">
            {filter === 'all'
              ? 'When guests request to book your spaces, they\'ll appear here.'
              : `No ${filter} bookings to show.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const config = statusConfig[booking.status];
            const isPending = booking.status === 'pending';
            const isActioning = actionLoading === booking.id;

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-stone-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm">
                      {listingNames[booking.listing_id] || 'Listing'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Requested by <span className="font-medium text-stone-700">{guestNames[booking.guest_id] || 'Guest'}</span>
                    </p>
                  </div>
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit', config.color)}>
                    {config.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <DetailItem icon={Calendar} label="Date" value={formatDate(booking.booking_date)} />
                  <DetailItem icon={Clock} label="Duration" value={durationLabels[booking.duration] || booking.duration} />
                  <DetailItem icon={Users} label="Guests" value={String(booking.guest_count)} />
                  <DetailItem icon={DollarSign} label="Total" value={formatPrice(booking.total_price)} />
                </div>

                {booking.notes && (
                  <div className="mb-4 p-3 bg-stone-50 rounded-lg">
                    <p className="text-xs font-medium text-stone-500 mb-1">Guest Notes</p>
                    <p className="text-sm text-stone-700">{booking.notes}</p>
                  </div>
                )}

                {booking.purpose && (
                  <p className="text-xs text-stone-500 mb-4">
                    Purpose: <span className="capitalize font-medium text-stone-700">{booking.purpose}</span>
                  </p>
                )}

                {isPending && (
                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Response message (optional)</label>
                      <input
                        type="text"
                        value={responseText[booking.id] || ''}
                        onChange={e => setResponseText(prev => ({ ...prev, [booking.id]: e.target.value }))}
                        placeholder="Add a message to the guest..."
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(booking.id)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(booking.id)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {booking.host_response && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <p className="text-xs font-medium text-stone-500 mb-1">Your Response</p>
                    <p className="text-sm text-stone-700">{booking.host_response}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
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
