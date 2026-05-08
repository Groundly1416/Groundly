'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Home, Calendar, Clock, DollarSign, MapPin, Star, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { auth, listings as listingService, host } from '@/lib/services';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import type { Profile, Listing, HostStats, ListingStatus } from '@/types/database';

const statusConfig: Record<ListingStatus, { label: string; color: string; icon: any }> = {
  under_review: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  draft: { label: 'Draft', color: 'bg-stone-50 text-stone-600 border-stone-200', icon: AlertCircle },
  paused: { label: 'Paused', color: 'bg-stone-50 text-stone-500 border-stone-200', icon: AlertCircle },
};

export default function DashboardPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<HostStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile) return;
        setUser(profile);

        const [hostListings, hostStats] = await Promise.all([
          listingService.getByHost(profile.id),
          host.getStats(profile.id).catch(() => null),
        ]);
        setMyListings(hostListings);
        setStats(hostStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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

  const hasListings = myListings.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-stone-500 mt-1">Manage your spaces and booking requests</p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Listing
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Home} label="Total Listings" value={stats.active_listings} />
          <StatCard icon={Calendar} label="Total Bookings" value={stats.total_bookings} />
          <StatCard icon={Clock} label="Pending Requests" value={stats.pending_requests} highlight />
          <StatCard icon={DollarSign} label="Total Earnings" value={formatPrice(stats.total_earnings || 0)} />
        </div>
      )}

      {/* Listings */}
      {hasListings ? (
        <div>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Your Listings</h2>
          <div className="grid gap-4">
            {myListings.map(listing => {
              const config = statusConfig[listing.status] || statusConfig.draft;
              const StatusIcon = config.icon;
              return (
                <Link
                  key={listing.id}
                  href={`/dashboard/edit/${listing.id}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-xl border border-stone-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-stone-900 text-sm truncate">{listing.title}</h3>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', config.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      {listing.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.city}, {listing.state}
                        </span>
                      )}
                      <span>{formatPrice(listing.price_2hr)} / 2hr</span>
                      <span>{listing.max_guests} guests max</span>
                      {listing.rating_avg > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-stone-900 text-stone-900" />
                          {listing.rating_avg}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-stone-400 shrink-0">
                    Created {formatDate(listing.created_at)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-16 bg-white rounded-xl border border-stone-100">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Home className="w-7 h-7 text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">No listings yet</h2>
          <p className="text-sm text-stone-500 mb-6 max-w-md mx-auto">
            Start earning by listing your outdoor space on Groundly. Gardens, estates, courtyards — if it&apos;s beautiful, creative professionals want it.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }: {
  icon: any; label: string; value: string | number; highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', highlight ? 'bg-amber-50' : 'bg-stone-50')}>
          <Icon className={cn('w-4 h-4', highlight ? 'text-amber-600' : 'text-stone-500')} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}
