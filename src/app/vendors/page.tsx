import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { vendors as vendorService } from '@/lib/services';
import { MapPin, ExternalLink, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Creative Network',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const EMOJI_MAP: Record<string, string> = {
  Photographer: '📷',
  Florist: '💐',
  Planner: '📋',
  Catering: '🍽️',
  Rentals: '🪑',
  'Wedding & Event Planning': '✨',
};

export default async function VendorsPage() {
  let vendorList: any[] = [];
  try {
    vendorList = await vendorService.getAll();
  } catch {}

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">Creative Network</h1>
          <p className="text-stone-500 text-sm">The creative network around our locations. Photographers, planners, florists, and stylists working alongside our spaces.</p>
        </div>

        {vendorList.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendorList.map((v: any) => {
              const specialties = v.specialty ? v.specialty.split(',').map((s: string) => s.trim()).slice(0, 3) : [];
              return (
                <Link href={'/vendors/' + v.id} key={v.id} className="bg-white rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                      {v.image_url ? (
                        <img src={v.image_url} alt={v.name} className="w-full h-full object-contain" />
                      ) : (
                        EMOJI_MAP[v.type] || '🏢'
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">{v.name}</h3>
                      <p className="text-xs text-stone-500">{v.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 mb-4 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{v.description}</p>
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {specialties.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-stone-500 mb-4">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{v.location}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-stone-100 flex items-center gap-4">
                    {v.website && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700">
                        <ExternalLink className="w-4 h-4" /> Website
                      </span>
                    )}
                    {v.email && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700">
                        <Mail className="w-4 h-4" /> Email
                      </span>
                    )}
                    {v.phone && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700">
                        <Phone className="w-4 h-4" /> Call
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-stone-200 rounded-2xl">
            <p className="text-stone-400 text-sm">No vendors available yet</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
