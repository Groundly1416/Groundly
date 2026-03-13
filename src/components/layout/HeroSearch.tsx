'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    router.push(`/browse${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by location..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
        >
          <Search className="w-4 h-4" />
          Search Spaces
        </button>
      </div>
    </div>
  );
}
