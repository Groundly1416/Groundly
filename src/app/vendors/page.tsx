import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { vendors as vendorService } from '@/lib/services';
import { MapPin, Star } from 'lucide-react';

const EMOJI_MAP: Record<string, string> = {
  Photographer: '📷', Florist: '💐', Planner: '📋', Catering: '🍽️', Rentals: '🪑',
};

export default async function VendorsPage() {
  let vendorList: any[] = [];
  try { vendorList = await vendorService.getAll(); } catch {}

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">Recommended Vendors</h1>
          <p className="text-stone-500 text-sm">Curated local professionals to complement your shoot</p>
        </div>
        {vendorList.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendorList.map((v: any) => (
              <div key={v.id} className="bg-white rounded-xl border border-stone-100 p-5">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-2xl">
                    {EMOJI_MAP[v.type] || '🏢'}
                  </div>
                  <div>
                    <h3 className="font-medium text-stone-900">{v.name}</h3>
                    <p className="text-xs text-stone-500">{v.type}</p>
                  </div>
                </div>
                <p className="text-sm text-stone-600 mb-3">{v.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {v.location}</span>
                    {v.rating && <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {v.rating}</span>}
                  </div>
                  {v.specialty && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">{v.specialty}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-stone-200 rounded-2xl">
            <p className="text-stone-400 text-sm">Connect Supabase and run seed data to see vendors here</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
