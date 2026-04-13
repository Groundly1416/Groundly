'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Loader2, MapPin, Clock, ArrowLeft, Shield } from 'lucide-react';
import { auth, admin } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { cn, formatDate } from '@/lib/utils';
import type { Profile, Listing } from '@/types/database';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface ListingWithHost extends Listing {
  host_name: string;
  host_email: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [listings, setListings] = useState<ListingWithHost[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile || profile.role !== 'admin') {
          router.replace('/');
          return;
        }
        setAuthorized(true);

        // Fetch under_review listings with host info
        const { data } = await supabase
          .from('listings')
          .select('*, profiles!listings_host_id_fkey(full_name, email)')
          .in('status', ['under_review', 'draft'])
          .order('created_at', { ascending: false });

        const mapped: ListingWithHost[] = (data || []).map((row: any) => ({
          ...row,
          host_name: row.profiles?.full_name || 'Unknown',
          host_email: row.profiles?.email || '',
          profiles: undefined,
        }));
        setListings(mapped);
      } catch (err) {
        console.error(err);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleApprove(id: string) {
    setActionLoading(id);
    try {
      await admin.approveListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    try {
      await admin.rejectListing(id, rejectReason[id] || undefined);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Admin Review</h1>
            <p className="text-sm text-stone-500">Listings awaiting approval</p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-100">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">All caught up</h2>
            <p className="text-sm text-stone-500">No listings pending review right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">{listings.length} listing{listings.length !== 1 ? 's' : ''} pending review</p>
            {listings.map(listing => {
              const isActioning = actionLoading === listing.id;
              return (
                <div key={listing.id} className="bg-white rounded-xl border border-stone-100 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-stone-900">{listing.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-500">
                        {listing.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listing.city}, {listing.state}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Submitted {formatDate(listing.created_at)}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 w-fit">
                      Pending Review
                    </span>
                  </div>

                  <div className="mb-4 p-3 bg-stone-50 rounded-lg">
                    <p className="text-xs font-medium text-stone-400 mb-1">Host</p>
                    <p className="text-sm text-stone-700">{listing.host_name}</p>
                    {listing.host_email && (
                      <p className="text-xs text-stone-400">{listing.host_email}</p>
                    )}
                  </div>

                  {listing.description && (
                    <p className="text-sm text-stone-600 mb-4 line-clamp-3">{listing.description}</p>
                  )}

                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Rejection reason (optional)</label>
                      <input
                        type="text"
                        value={rejectReason[listing.id] || ''}
                        onChange={e => setRejectReason(prev => ({ ...prev, [listing.id]: e.target.value }))}
                        placeholder="Reason for rejection..."
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(listing.id)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(listing.id)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
