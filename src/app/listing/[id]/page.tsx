import { listings as listingsService } from '@/lib/services';
import { formatPrice } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BookingCard from '@/components/booking/BookingCard';
import { MapPin, Star, Users, Check, AlertCircle, Info } from 'lucide-react';

// This is a server component that fetches listing data on the server
export default async function ListingPage({ params }: { params: { id: string } }) {
  let detail: any = null;

  try {
    detail = await listingsService.getDetail(params.id);
  } catch {
    // Supabase not connected or listing not found
  }

  // Fallback if no data
  if (!detail || !detail.listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-stone-900 mb-2">Property not found</h2>
            <p className="text-stone-500 text-sm mb-4">This listing may not exist or Supabase is not connected yet.</p>
            <a href="/browse" className="inline-flex px-5 py-2.5 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800">
              Browse Spaces
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { listing, host, images, amenities, rules, tags } = detail;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[480px]">
          <div className="relative">
            <img
              src={images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative">
                <img
                  src={images?.[i]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80'}
                  alt={`${listing.title} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-2">{listing.title}</h1>
              <div className="flex items-center gap-4 text-stone-500 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.city}, {listing.state}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {listing.rating || '4.9'} ({listing.review_count || '12'} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Up to {listing.max_guests} guests
                </span>
              </div>
            </div>

            {/* Host */}
            {host && (
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-stone-200">
                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 font-medium">
                  {host.full_name?.[0] || 'H'}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">Hosted by {host.full_name || 'Host'}</p>
                  <p className="text-xs text-stone-500">Verified host</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-stone-900 mb-3">About this space</h3>
              <p className="text-stone-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Amenities */}
            {amenities && amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-stone-600 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      {amenity.name || amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {rules && rules.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-3">Space Rules</h3>
                <div className="space-y-2">
                  {rules.map((rule: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-stone-600 text-sm">
                      <Info className="w-4 h-4 text-stone-400" />
                      {rule.name || rule}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard
              listingId={listing.id}
              listingTitle={listing.title}
              pricePerHour={listing.price_2hr || listing.price_per_hour || 75}
              hostId={listing.host_id}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
