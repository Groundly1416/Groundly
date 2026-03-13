import Link from 'next/link';
import { listings as listingsService } from '@/lib/services';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/listings/PropertyCard';
import HeroSearch from '@/components/layout/HeroSearch';
import { Camera, Calendar, Search, Shield, Lock, Users, Check, ArrowRight, ChevronRight, Star, MapPin } from 'lucide-react';

// Categories displayed on homepage
const CATEGORIES = [
  { id: 'gardens',     label: 'Gardens',         icon: '🌿', description: 'Lush private gardens' },
  { id: 'waterfronts', label: 'Waterfronts',     icon: '🌊', description: 'Waterfront lawns & docks' },
  { id: 'modern',      label: 'Modern Homes',    icon: '🏡', description: 'Contemporary outdoor spaces' },
  { id: 'historic',    label: 'Historic Estates', icon: '🏛️', description: 'Grand estate grounds' },
  { id: 'courtyards',  label: 'Courtyards',      icon: '⛲', description: 'Stone & brick courtyards' },
  { id: 'lawns',       label: 'Large Lawns',     icon: '🌳', description: 'Open expansive lawns' },
  { id: 'meadows',     label: 'Meadows',         icon: '🌾', description: 'Natural meadow settings' },
  { id: 'terraces',    label: 'Terraces',        icon: '🏔️', description: 'Elevated terrace views' },
];

export default async function HomePage() {
  // Fetch featured listings from Supabase
  // If Supabase isn't connected yet, this gracefully returns []
  let featured: any[] = [];
  try {
    featured = await listingsService.getFeatured(6);
  } catch {
    // Supabase not configured yet — that's fine, page still renders
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ---- HERO ---- */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80"
            alt="Beautiful outdoor estate"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/80 text-sm tracking-[0.2em] uppercase mb-4 font-medium">
            Private Outdoor Spaces
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-tight tracking-tight">
            Beautiful grounds for<br />your next creative shoot
          </h1>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Discover and book premium private estates, gardens, and outdoor spaces
            for photography and creative productions.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* ---- CATEGORIES ---- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">Browse by Category</h2>
        <p className="text-stone-500 mb-8">Find the perfect outdoor setting for your creative vision</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.id}`}
              className="group p-5 rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all text-left"
            >
              <span className="text-2xl mb-2 block">{cat.icon}</span>
              <h3 className="font-medium text-stone-900 text-sm">{cat.label}</h3>
              <p className="text-xs text-stone-400 mt-0.5">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FEATURED ---- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">Featured Properties</h2>
            <p className="text-stone-500 text-sm">Hand-picked outdoor spaces loved by photographers and creators</p>
          </div>
          <Link href="/browse" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((listing: any) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-stone-200 rounded-2xl">
            <p className="text-stone-400 text-sm mb-2">No featured listings yet</p>
            <p className="text-stone-300 text-xs">Connect Supabase and run the seed data to see properties here</p>
          </div>
        )}
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-stone-900 mb-2">How Groundly Works</h2>
            <p className="text-stone-500">Book your perfect outdoor space in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Search, title: 'Discover', desc: 'Browse curated private outdoor spaces filtered by location, style, and budget.' },
              { icon: Calendar, title: 'Request', desc: 'Choose your date, duration, and send a booking request to the host.' },
              { icon: Camera, title: 'Create', desc: 'Show up and bring your creative vision to life in a stunning private setting.' },
            ].map(step => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- HOST CTA ---- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-stone-900 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <p className="text-stone-400 text-sm tracking-widest uppercase mb-3">For Property Owners</p>
              <h2 className="text-3xl font-semibold text-white mb-4 leading-tight">
                Earn from your outdoor space
              </h2>
              <p className="text-stone-300 mb-6 leading-relaxed">
                Your garden, lawn, or estate could be the perfect backdrop for someone's
                next photoshoot. List your outdoor space on Groundly and earn money
                while sharing its beauty.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'You control who books',
                  'Outdoor access only — no overnight stays',
                  'Set your own pricing and rules',
                  'Simple, secure booking process',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-stone-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/host"
                className="inline-flex items-center gap-2 bg-white text-stone-900 hover:bg-stone-100 px-7 py-3 rounded-lg font-medium transition-colors w-fit"
              >
                Start Hosting <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80"
                alt="Beautiful garden"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---- TRUST ---- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-stone-900 mb-2">Built on Trust</h2>
          <p className="text-stone-500">Every booking is protected by our community standards</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: Shield, title: 'Verified Hosts', desc: 'All properties are reviewed and approved by our team before going live.' },
            { icon: Lock, title: 'Secure Bookings', desc: 'Your booking request and payment are handled safely through Groundly.' },
            { icon: Users, title: 'Community Standards', desc: 'Clear guidelines for guests and hosts keep every booking professional.' },
          ].map(item => (
            <div key={item.title} className="text-center p-6">
              <item.icon className="w-6 h-6 mx-auto mb-3 text-stone-700" />
              <h3 className="font-medium text-stone-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
