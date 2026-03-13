import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const SECTIONS = [
  { title: 'Verified Listings', desc: 'Every property listing is reviewed and approved by our team before going live. We verify that hosts own or have authority over the property and that the space matches its description.' },
  { title: 'Outdoor Access Only', desc: 'All bookings on Groundly are for outdoor space access only. This is not an overnight stay or home rental platform. Clear boundaries protect both hosts and guests.' },
  { title: 'Host Approval Required', desc: 'Hosts review and approve every booking request. They maintain full control over who accesses their property and when.' },
  { title: 'Secure Payments', desc: 'All payments are processed securely through Stripe. Guests are not charged until the host approves the booking.' },
  { title: 'Community Guidelines', desc: 'Both hosts and guests agree to our community standards, which include respect for property, adherence to stated rules, and professional conduct during all bookings.' },
  { title: 'Support', desc: 'Our team is available to assist with any issues before, during, or after a booking. Contact us at support@groundly.com.' },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-semibold text-stone-900 mb-6">Trust & Safety</h1>
        <div className="space-y-6">
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h3 className="font-medium text-stone-900 mb-1">{s.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
