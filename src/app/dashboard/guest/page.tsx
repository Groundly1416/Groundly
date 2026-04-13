'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Heart, MapPin, Users, DollarSign, Loader2, Search, X } from 'lucide-react';
import { auth, bookings as bookingService, favorites as favoritesService } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import type { Profile, BookingRequest, BookingStatus } from '@/types/database';

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  declined: { label: 'Declined', color: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', color: 'bg-stone-50 text-stone-500 border-stone-200' },
  completed: { label: 'Completed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const durationLabels: Record<string, string> = {
  '2hr': '2 Hours',
  'halfday': 'Half Day',
  'fullday': 'Full Day',
};

interface ListingInfo {
  id: string;
  title: string;
  city: string;
  state: string;
  primary_image_url: string | null;
}

export default function GuestDashboardPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [allBookings, setAllBookings] = useState<BookingRequest[]>([]);
  const [listingInfo, setListingInfo] = useState<Record<string, ListingInfo>>({});
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile) return;
        setUser(profile);

        const [guestBookings, favs] = await Promise.all([
          bookingService.getForGuest(profile.id),
          favoritesService.getAll(profile.id),
        ]);
        setAllBookings(guestBookings);
        setFavCount(favs.length);

        // Fetch listing info for all bookings
        const listingIds = [...new Set(guestBookings.map(b => b.listing_id))];
        if (listingIds.length > 0) {
          const { data } = await supabase
            .from('listings')
            .select('id, title, city, state')
            .in('id', listingIds);

          // Also get primary images
          const { data: images } = await supabase
            .from('listing_images')
            .select('listing_id, url')
            .in('listing_id', listingIds)
            .eq('is_primary', true);

          const imageMap: Record<string, string> = {};
          (images || []).forEach(img => { imageMap[img.listing_id] = img.url; });

          // If no primary image, try to get first image for each listing
          const missingImageIds = listingIds.filter(id => !imageMap[id]);
          if (missingImageIds.length > 0) {
            const { data: fallbackImages } = await supabase
              .from('listing_images')
              .select('listing_id, url')
              .in('listing_id', missingImageIds)
              .order('sort_order')
              .limit(missingImageIds.length);
            (fallbackImages || []).forEach(img => {
              if (!imageMap[img.listing_id]) imageMap[img.listing_id] = img.url;
            });
          }

          const info: Record<string, ListingInfo> = {};
          (data || []).forEach(l => {
            info[l.id] = { ...l, primary_image_url: imageMap[l.id] || null };
          });
          setListingInfo(info);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCancel(bookingId: string) {
    setCancellingId(bookingId);
    try {
      await bookingService.cancel(bookingId);
      setAllBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const upcoming = allBookings.filter(b => b.status === 'approved');
  const pending = allBookings.filter(b => b.status === 'pending');
  const past = allBookings.filter(b => ['completed', 'declined', 'cancelled'].includes(b.status));
  const totalBookings = allBookings.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-stone-500 mt-1">Track your bookings and favorite spaces</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Calendar} label="Upcoming" value={upcoming.length} highlight={upcoming.length > 0} />
        <StatCard icon={Clock} label="Total Bookings" value={totalBookings} />
        <StatCard icon={Heart} label="Favorites" value={favCount} />
      </div>

      {/* No bookings empty state */}
      {totalBookings === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-100">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">No bookings yet</h2>
          <p className="text-sm text-stone-500 mb-6 max-w-md mx-auto">
            Find the perfect outdoor space for your next shoot — gardens, estates, waterfronts, and more.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Spaces
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <BookingSection title="Upcoming Bookings" bookings={upcoming} listingInfo={listingInfo} />
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Pending Requests</h2>
              <div className="space-y-3">
                {pending.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    listing={listingInfo[booking.listing_id]}
                    actions={
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        {confirmCancelId === booking.id ? (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-stone-500 mr-auto">Cancel this request?</p>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {cancellingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Yes, Cancel
                            </button>
                            <button
                              onClick={() => setConfirmCancelId(null)}
                              className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
                            >
                              No, Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmCancelId(booking.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Cancel Request
                          </button>
                        )}
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <BookingSection title="Past Bookings" bookings={past} listingInfo={listingInfo} />
          )}
        </div>
      )}
    </div>
  );
}

function BookingSection({ title, bookings, listingInfo }: {
  title: string;
  bookings: BookingRequest[];
  listingInfo: Record<string, ListingInfo>;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {bookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} listing={listingInfo[booking.listing_id]} />
        ))}
      </div>
    </div>
  );
}

function BookingCard({ booking, listing, actions }: {
  booking: BookingRequest;
  listing?: ListingInfo;
  actions?: React.ReactNode;
}) {
  const config = statusConfig[booking.status];
  const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80';

  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <Link href={`/listing/${booking.listing_id}`} className="sm:w-40 shrink-0">
          <div className="h-32 sm:h-full">
            <img
              src={listing?.primary_image_url || fallbackImage}
              alt={listing?.title || 'Listing'}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link href={`/listing/${booking.listing_id}`} className="hover:underline">
              <h3 className="font-semibold text-stone-900 text-sm">{listing?.title || 'Listing'}</h3>
            </Link>
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0', config.color)}>
              {config.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
            {listing?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.city}, {listing.state}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(booking.booking_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {durationLabels[booking.duration] || booking.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {booking.guest_count} guest{booking.guest_count !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1 font-medium text-stone-700">
              <DollarSign className="w-3 h-3" />
              {formatPrice(booking.total_price)}
            </span>
          </div>

          {booking.host_response && (
            <div className="mt-2 p-2 bg-stone-50 rounded-lg">
              <p className="text-xs text-stone-500">Host: <span className="text-stone-700">{booking.host_response}</span></p>
            </div>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }: {
  icon: any; label: string; value: number; highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', highlight ? 'bg-emerald-50' : 'bg-stone-50')}>
          <Icon className={cn('w-4 h-4', highlight ? 'text-emerald-600' : 'text-stone-500')} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}
