import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { vendors as vendorService } from '@/lib/services';
import { MapPin, ExternalLink, Mail, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
  let vendor: any = null;
  try {
    vendor = await vendorService.getById(params.id);
  } catch {}

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-stone-900 mb-2">Vendor not found</h1>
            <Link href="/vendors" className="text-sm text-stone-500 hover:text-stone-900 underline">Back to vendors</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const specialties = vendor.specialty ? vendor.specialty.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to vendors
        </Link>

        <div className="bg-white rounded-2xl border border-stone-100 p-8">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 overflow-hidden">
              {vendor.image_url ? (
                <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-contain" />
              ) : (
                '✨'
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-stone-900">{vendor.name}</h1>
              <p className="text-stone-500">{vendor.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-500 mb-6">
            <MapPin className="w-5 h-5 shrink-0" />
            <span>{vendor.location}</span>
          </div>

          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {specialties.map((tag: string) => (
                <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600">{tag}</span>
              ))}
            </div>
          )}

          <div className="border-t border-stone-100 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-3">About</h2>
            <p className="text-stone-600 leading-relaxed">{vendor.description}</p>
          </div>

          <div className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Get in Touch</h2>
            <div className="flex flex-col gap-3">
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-700 hover:text-stone-900 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  <span>{vendor.website.replace('https://', '')}</span>
                </a>
              )}
              {vendor.email && (
                <a href={'mailto:' + vendor.email} className="flex items-center gap-3 text-stone-700 hover:text-stone-900 transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>{vendor.email}</span>
                </a>
              )}
              {vendor.phone && (
                <a href={'tel:' + vendor.phone} className="flex items-center gap-3 text-stone-700 hover:text-stone-900 transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>{vendor.phone}</span>
                </a>
              )}
              {vendor.instagram && (
                <a href={'https://instagram.com/' + vendor.instagram.replace('@', '')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-700 hover:text-stone-900 transition-colors">
                  <span className="text-lg">📸</span>
                  <span>{vendor.instagram}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
