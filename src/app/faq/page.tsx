'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  { q: 'What exactly am I booking?', a: 'You\'re booking access to a property\'s outdoor space — the grounds, garden, lawn, terrace, or courtyard. This does not include access to the home\'s interior or overnight accommodation.' },
  { q: 'Who can book on Groundly?', a: 'Groundly is designed for photographers, content creators, families, graduates, small brands, and creative production teams looking for beautiful private outdoor settings for shoots and sessions.' },
  { q: 'How does the booking process work?', a: 'Browse spaces, select your date and duration, and submit a booking request. The host reviews and approves or declines. Payment is captured after approval.' },
  { q: 'Can I host events like weddings or concerts?', a: 'Currently, Groundly is focused on photoshoots and small creative bookings. Large events, weddings, and concerts are not supported in this version.' },
  { q: 'How do I become a host?', a: 'Sign up as a host, create a listing with photos and details, and submit for review. Once approved, your space will be live on the marketplace.' },
  { q: 'Is there a service fee?', a: 'Groundly charges a 12% service fee to guests, which covers platform costs and booking protection.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-3xl font-semibold text-stone-900 mb-8">Frequently Asked Questions</h1>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="font-medium text-stone-900 text-sm">{faq.q}</span>
                <ChevronDown className={cn('w-4 h-4 text-stone-400 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && <div className="px-5 pb-4"><p className="text-sm text-stone-600 leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
