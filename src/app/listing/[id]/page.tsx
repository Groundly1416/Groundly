import { listings as listingsService } from '@/lib/services';
import { formatPrice } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
            {(images || []).slice(1, 5).map((img: any, i: number) => (
              <div key={i} className="relative">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-3xl font-semibold text-stone-900 mb-1">{listing.title}</h1>
              {listing.subtitle && <p className="text-stone-500 mb-2">{listing.subtitle}</p>}
              <div className="flex items-center gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.location_label}</span>
                {listing.rating_avg > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-stone-900 text-stone-900" />
                    {listing.rating_avg} ({listing.review_count} reviews)
                  </span>
                )}
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Up to {listing.max_guests} guests</span>
              </div>
            </div>

            {/* Outdoor-only notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This is an outdoor-access-only booking. You are booking access to the
                property&apos;s outdoor grounds — not the home itself and not overnight accommodation.
              </p>
            </div>

            {/* Host */}
            {host && (
              <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center font-medium text-sm">
                  {host.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </div>
                <div>
                  <p className="font-medium text-stone-900">Hosted by {host.full_name}</p>
                  <p className="text-xs text-stone-500">Member since {new Date(host.created_at).getFullYear()}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-stone-900 mb-3">About This Space</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{listing.description}</p>
            </div>

            {/* Amenities */}
            {amenities && amenities.length > 0 && (
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Amenities & Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((a: string) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-stone-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {rules && rules.length > 0 && (
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Property Rules</h3>
                <div className="grid grid-cols-2 gap-2">
                  {rules.map((r: string) => (
                    <div key={r} className="flex items-center gap-2 text-sm text-stone-500">
                      <AlertCircle className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="mb-4">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-semibold text-stone-900">{formatPrice(listing.price_2hr)}</span>
                  <span className="text-stone-400 text-sm">/ 2hr session</span>
                </div>
                <div className="flex gap-3 text-xs text-stone-500">
                  <span>{formatPrice(listing.price_halfday)} half day</span>
                  <span>·</span>
                  <span>{formatPrice(listing.price_fullday)} full day</span>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-stone-700">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-stone-700">Duration</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm">
                    <option>2-Hour Session — {formatPrice(listing.price_2hr)}</option>
                    <option>Half Day — {formatPrice(listing.price_halfday)}</option>
                    <option>Full Day — {formatPrice(listing.price_fullday)}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-stone-700">Guest / Crew Count</label>
                  <input type="number" min={1} max={listing.max_guests} defaultValue={2} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4 mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-500">Session fee</span>
                  <span className="font-medium">{formatPrice(listing.price_2hr)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone-500">Service fee</span>
                  <span className="font-medium">{formatPrice(Math.round(listing.price_2hr * 0.12))}</span>
                </div>
                <div className="flex justify-between font-semibold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span>{formatPrice(listing.price_2hr + Math.round(listing.price_2hr * 0.12))}</span>
                </div>
              </div>

              <a
                href="/login"
                className="block w-full text-center px-5 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
              >
                Request to Book
              </a>
              <p className="text-xs text-stone-400 text-center mt-3">
                You won&apos;t be charged until the host approves
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
