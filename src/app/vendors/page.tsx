import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { vendors as vendorService } from '@/lib/services';
import { MapPin, ExternalLink, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

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
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">Recommended Vendors</h1>
          <p className="text-stone-500 text-sm">Curated local professionals to complement your shoot</p>
        </div>

        {vendorList.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendorList.map((v: any) => {
              const specialties = v.specialty ? v.specialty.split(',').map((s: string) => s.trim()).slice(0, 3) : [];
              return (
                <Link href={'/vendors/' + v.id} key={v.id} className="bg-white rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                      {EMOJI_MAP[v.typ