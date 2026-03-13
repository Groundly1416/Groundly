'use client';

import Link from 'next/link';
import { Heart, MapPin, Star, Users } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface PropertyCardProps {
  listing: {
    id: string;
    title: string;
    subtitle?: string | null;
    location_label?: string | null;
    city?: string;
    state?: string;
    price_2hr: number;
    max_guests: number;
    rating_avg?: number;
    review_count?: number;
    is_featured?: boolean;
    is_instant_inquiry?: boolean;
    primary_image_url?: string | null;
    // Also support the full Listing shape from direct queries
    images?: any[];
  };
  compact?: boolean;
}

export default function PropertyCard({ listing, compact = false }: PropertyCardProps) {
  const location = listing.location_label || (listing.city && listing.state ? `${listing.city}, ${listing.state}` : '');
  const imageUrl = listing.primary_image_url
    || (listing.images && listing.images[0]?.url)
    || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

  // Prices stored in cents in the DB
  const displayPrice = listing.price_2hr >= 100
    ? formatPrice(listing.price_2hr)    // from DB (cents)
    : `$${listing.price_2hr}`;          // fallback if already dollars

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group bg-white rounded-xl border border-stone-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative">
        <div className={cn('overflow-hidden', compact ? 'h-44' : 'h-56')}>
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        {listing.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-800 text-white">
              Featured
            </span>
          </div>
        )}
        {listing.is_instant_inquiry && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Instant Inquiry
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-stone-900 text-sm leading-tight">{listing.title}</h3>
          {listing.rating_avg != null && listing.rating_avg > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-stone-900 text-stone-900" />
              <span className="text-sm font-medium">{listing.rating_avg}</span>
            </div>
          )}
        </div>
        {location && (
          <div className="flex items-center gap-1 text-stone-500 text-xs mb-2">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-stone-50">
          <div>
            <span className="font-semibold text-stone-900">{displayPrice}</span>
            <span className="text-stone-400 text-xs"> / 2hr session</span>
          </div>
          <div className="flex items-center gap-1 text-stone-400 text-xs">
            <Users className="w-3 h-3" />
            <span>{listing.max_guests}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
