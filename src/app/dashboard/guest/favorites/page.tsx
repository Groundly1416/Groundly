'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { auth, favorites as favoritesService } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/listings/PropertyCard';
import type { Profile, Listing } from '@/types/database';

export default function FavoritesPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile) return;
        setUser(profile);

        const favIds = await favoritesService.getAll(profile.id);
        setFavoriteIds(favIds);

        if (favIds.length > 0) {
          const { data } = await supabase
            .from('listings')
            .select('*')
            .in('id', favIds);
          setFavoriteListings(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRemove(listingId: string) {
    if (!user) return;
    setRemovingId(listingId);
    try {
      await favoritesService.toggle(user.id, listingId);
      setFavoriteListings(prev => prev.filter(l => l.id !== listingId));
      setFavoriteIds(prev => prev.filter(id => id !== listingId));
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  }

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
        <h1 className="text-2xl font-semibold text-stone-900">Favorites</h1>
        <p className="text-sm text-stone-500 mt-1">Spaces you&apos;ve saved for later</p>
      </div>

      {favoriteListings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-100">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">No favorites yet</h2>
          <p className="text-sm text-stone-500 mb-6 max-w-md mx-auto">
            Tap the heart icon on any listing to save it here for quick access.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            Browse Spaces
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteListings.map(listing => (
            <div key={listing.id} className="relative group/fav">
              <PropertyCard listing={listing} compact />
              <button
                onClick={(e) => { e.preventDefault(); handleRemove(listing.id); }}
                disabled={removingId === listing.id}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Remove from favorites"
              >
                {removingId === listing.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />
                ) : (
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
