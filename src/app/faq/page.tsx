'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  { q: 'What exactly am I booking?', a: 'You\'re booking access to a property\'s outdoor space — the grounds, garden, lawn, terrace, or courtyard. This does not include access to the home\'s interior or overnight accommodation.' },
  { q: 'Who can book on Groundly?', a: 'Groundly is designed for photographers, content creators, families, graduates, small brands, event planners, and creative production teams looking for beautiful private outdoor settings.' },
  { q: 'How does the booking process work?', a: 'Browse spaces, select your date and duration, and submit a booking request. The host reviews and approves or declines. Payment is captured after approval.' },
  { q: 'What types of events can I host?', a: 'Groundly supports a wide range of outdoor bookings including photoshoots, weddings, engagement sessions, brand shoots, corporate events, retreats, baby showers, birthday celebrations, and more. Hosts set their own rules about what types of events they allow and how many guests are permitted, so every booking is on your terms.' },
  { q: 'How do I become a host?', a: 'Sign up as a host, create a listing with photos and details, and submit for review. Once approved, your space will be live on the marketplace.' },
  { q: 'Is there a service fee?', a: 'Groundly charges a 12% service fee to guests, which covers platform costs and booking protection.' },
  { q: 'Do I need insurance to list my property?', a: 'We strongly recommend all hosts consult with their homeowner\'s insurance provider before listing. Many standard homeowner\'s policies can be extended with a rider to cover short-term commercial use of outdoor space. Hosts can also purchase short-term event insurance on a per-booking basis through third-party providers. Hosts are solely responsible for ensuring they have appropriate insurance coverage for their property and any activities that take place on it.' },
  { q: 'Does Groundly provide insurance for hosts?', a: 'No. Groundly is a marketplace that connects property owners with guests. Groundly does not provide insurance coverage for hosts, guests, or any activities that take place on a host\'s property. Hosts are responsible for maintaining their own insurance coverage. We recommend consulting with your insurance provider to understand your options.' },
  { q: 'What about liability if someone gets injured on my property?', a: 'Liability for injuries or damages that occur on a property rests with the property owner, as it does with any activity on private property. We strongly recommend hosts confirm that their homeowner\'s insurance covers visitor injuries, or obtain event-specific liability coverage. Hosts have full control over who books their space — every booking requires host approval before it is confirmed.' },
  { q: 'Do guests or photographers need insurance?', a: 'We recommend that professional photographers and production teams carry their own liability insurance, which is standard practice in the industry. For casual bookings like portrait sessions or family photos, guest insurance is not required but is always advisable.' },
  { q: 'What permits do I need to host on Groundly?', a: 'Permit requirements vary by municipality. Small bookings like a two-hour photoshoot on private property typically do not require permits, but larger gatherings may. Hosts are responsible for checking with their local town or city for any applicable zoning, noise, or event permit regulations and for complying with all local laws.' },
  { q: 'What about bathrooms for guests?', a: 'This is entirely up to the host. Some hosts offer access to a powder room or outdoor restroom, while others note that no indoor bathroom access is available. For longer bookings or larger groups, guests can arrange a portable restroom. We encourage hosts to clearly state bathroom availability in their listing.' },
  { q: 'What if a guest damages my property?', a: 'Hosts approve every booking before it is confirmed, and all payments are processed through Groundly\'s secure platform. We recommend hosts set clear rules in their listing about what is and is not permitted. If damage occurs, hosts and guests are encouraged to resolve it directly. Having appropriate homeowner\'s or event insurance provides an additional layer of protection. Groundly is not responsible for any damages that occur on a host\'s property.' },
  { q: 'What is the vendor directory?', a: 'Groundly features a curated directory of local event professionals — photographers, videographers, event planners, florists, caterers, and more. Vendors can be featured for free, and clients booking outdoor spaces on Groundly can discover and connect with them directly.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-3xl font-semibold text-stone-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-stone-500 mb-8">Everything you need to know about booking and hosting on Groundly</p>
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
