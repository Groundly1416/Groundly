'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/listings/PropertyCard';
import { listings as listingsService } from '@/lib/services';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'gardens', label: 'Gardens', icon: '🌿' },
  { id: 'waterfronts', label: 'Waterfronts', icon: '🌊' },
  { id: 'modern', label: 'Modern Homes', icon: '🏡' },
  { id: 'historic', label: 'Historic Estates', icon: '🏛️' },
  { id: 'courtyards', label: 'Courtyards', icon: '⛲' },
  { id: 'lawns', label: 'Large Lawns', icon: '🌳' },
  { id: 'meadows', label: 'Meadows', icon: '🌾' },
  { id: 'terraces', label: 'Terraces', icon: '🏔️' },
];

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const data = await listingsService.search({
          query: searchQuery || undefined,
          category: category !== 'all' ? category : undefined,
          sort,
          minPrice: priceRange === 'under250' ? undefined : priceRange === '250to400' ? 250 : priceRange === 'over400' ? 400 : undefined,
          maxPrice: priceRange === 'under250' ? 250 : priceRange === '250to400' ? 400 : undefined,
        });
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [searchQuery, category, sort, priceRange]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by location, name, or style..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-stone-50 rounded-xl grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Price Range (2hr)</label>
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm">
                <option value="all">Any Price</option>
                <option value="under250">Under $250</option>
                <option value="250to400">$250 - $400</option>
                <option value="over400">Over $400</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Sort By</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm">
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <button
            onClick={() => setCategory('all')}
            className={cn('px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
              category === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}
          >
            All Spaces
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn('px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5',
                category === cat.id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-stone-500 mb-6">
          {loading ? 'Searching...' : `${results.length} spaces found`}
        </p>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="h-56 bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">No spaces found</h3>
            <p className="text-stone-500 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((listing: any) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
