'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'What is Groundly?',
    a: 'Groundly is a marketplace for booking private outdoor locations by the session. Photographers, ad agencies, and production companies use Groundly to find and book private gardens, estates, waterfront properties, and meadows for shoots and creative productions.',
  },
  {
    q: 'Where do you operate?',
    a: 'We are currently focused on the Northeast — Connecticut, New York, New Jersey, and Massachusetts, including the Hamptons and Hudson Valley. We are actively expanding our property network throughout the region.',
  },
  {
    q: 'What exactly am I booking?',
    a: 'You are booking access to a property\'s outdoor space — the grounds, garden, lawn, terrace, or courtyard — for the duration of your session. Bookings do not include access to the home\'s interior or overnight accommodation.',
  },
  {
    q: 'Who books on Groundly?',
    a: 'Groundly is built for creative professionals: photographers, ad agencies, production companies, brand teams, and content creators looking for distinctive private outdoor locations for their shoots. Independent creatives and small productions are welcome alongside larger commercial teams.',
  },
  {
    q: 'How does booking work?',
    a: 'Browse listings, select your date and session length, and submit a booking request with details about what you are shooting. The host reviews and approves or declines. Once approved, your card is charged and the booking is confirmed.',
  },
  {
    q: 'What are the booking durations?',
    a: 'Most listings offer three booking blocks: 2-hour sessions for portraits and engagement shoots, 4-hour sessions for bridal sessions and brand shoots, and full-day (8-hour) bookings for commercial productions and editorial work. Each host sets their own rates per block.',
  },
  {
    q: 'What types of bookings are allowed?',
    a: 'Groundly is built for creative professional bookings — photoshoots, content sessions, brand shoots, editorial productions, commercial ad shoots, and similar. Hosts approve every booking and can decline any request that does not fit. Multi-hundred-person events, weddings, and parties are not supported on the platform.',
  },
  {
    q: 'Can I bring crew, equipment, and vehicles?',
    a: 'Yes, within reason. Each listing specifies parking, vehicle access, and any limits on equipment or crew size. Larger productions with trucks, lighting rigs, or larger crews should confirm specifics with the host before booking — most hosts welcome professional crews when given advance notice.',
  },
  {
    q: 'What if I need to cancel?',
    a: 'Cancellation policies vary by host and are listed on each property page. We encourage clear communication with your host as soon as plans change.',
  },
  {
    q: 'Do guests or creative professionals need insurance?',
    a: 'Photographers, ad agencies, and production teams should carry their own liability insurance, which is standard industry practice. For casual bookings like portrait sessions, insurance is not required but always advisable. Affordable per-booking event insurance is available from providers like Thimble (thimble.com) and Markel (markel.com).',
  },
  {
    q: 'How do I become a host?',
    a: 'Sign up as a host, complete Stripe Connect payout setup (a quick hosted flow that handles bank info and tax compliance), and submit your listing with photos and property details. Once approved, your space is live on the marketplace.',
  },
  {
    q: 'How much can I earn?',
    a: 'It depends on your property and pricing. As a reference, hosts in our network typically earn between $250 and $1,500 per booking, with full-day commercial productions on premium properties earning more. You set your own rates and can adjust them anytime.',
  },
  {
    q: 'How and when do I get paid?',
    a: 'Payouts are handled through Stripe Connect, the same payment infrastructure used by Airbnb and other major marketplaces. Funds release 24 hours after a booking ends and transfer to your bank account on Stripe\'s standard payout schedule.',
  },
  {
    q: 'Can I decline bookings I am not comfortable with?',
    a: 'Yes. Every booking request requires host approval before it is confirmed. You see who is booking, what they are shooting, how many people will be on-site, and the booking duration before you decide. You can decline any request that does not fit.',
  },
  {
    q: 'Can I block specific dates?',
    a: 'Yes. Manage your availability calendar in your host dashboard. Block any dates for personal use, conflicting commitments, or other rentals (such as VRBO or Airbnb stays). Blocked dates are invisible to guests.',
  },
  {
    q: 'Do I need to be on the property during a booking?',
    a: 'Up to you. Most hosts are not present during bookings — guests follow check-in instructions you provide and use the outdoor space independently. Some hosts prefer to greet guests on arrival or be reachable nearby. You set the access process that works for you.',
  },
  {
    q: 'Do I need insurance to list my property?',
    a: 'We strongly recommend all hosts consult with their homeowner\'s insurance provider before listing. Many standard policies can be extended with a rider to cover short-term commercial use of outdoor space. Hosts can also purchase short-term event insurance per booking through providers like Thimble (thimble.com) and Markel (markel.com), with policies starting around $75. Hosts are solely responsible for ensuring they have appropriate coverage.',
  },
  {
    q: 'What if a guest damages my property?',
    a: 'Hosts approve every booking before it is confirmed, and we recommend setting clear rules in your listing about what is and is not permitted. If damage occurs, hosts and guests are encouraged to resolve it directly. Appropriate homeowner\'s or event insurance provides an additional layer of protection. Groundly is not responsible for any damages that occur on a host\'s property.',
  },
  {
    q: 'What about liability if someone gets injured on my property?',
    a: 'Liability for injuries or damages on a property rests with the property owner, as it does with any activity on private property. We strongly recommend hosts confirm that their homeowner\'s insurance covers visitor injuries, or obtain event-specific liability coverage. Hosts have full control over who books — every booking requires host approval.',
  },
  {
    q: 'What permits do I need to host on Groundly?',
    a: 'Permit requirements vary by municipality. Small bookings like a 2-hour photoshoot on private property typically do not require permits, but larger productions may. Hosts are responsible for checking with their local town or city for any applicable zoning, noise, or event permit regulations and complying with all local laws.',
  },
  {
    q: 'Is there a service fee?',
    a: 'Groundly charges a 12% service fee on top of the host\'s rate, paid by guests. The fee covers platform costs, payment processing, and booking protection. Compared to similar marketplaces (Peerspace charges around 20%, Giggster around 19%), Groundly\'s fee is among the lowest in the industry.',
  },
  {
    q: 'Does Groundly provide insurance?',
    a: 'No. Groundly is a marketplace that connects property owners with guests. Groundly does not provide insurance coverage for hosts, guests, or any activities that take place on a host\'s property. Hosts and guests are responsible for maintaining their own coverage. We recommend Thimble (thimble.com) and Markel (markel.com) for affordable per-booking event insurance.',
  },
  {
    q: 'What is the vendor directory?',
    a: 'Groundly features a curated directory of local creative professionals — photographers, videographers, stylists, hair and makeup artists, and other vendors who support outdoor productions. Vendors can be featured for free, and guests booking outdoor spaces can discover and connect with them directly.',
  },
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
