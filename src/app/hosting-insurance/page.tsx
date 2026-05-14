import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const QUESTIONS_TO_ASK = [
  'Does my homeowner\'s policy cover short-term commercial use of my outdoor space?',
  'If not, can I add a commercial endorsement or rider, and what does it cost?',
  'Are there any exclusions for events, productions, or commercial photography?',
  'What is my liability coverage in the event of injury to a guest or their crew?',
];

const PROVIDERS = [
  { name: 'Thimble', url: 'https://www.thimble.com', display: 'thimble.com' },
  { name: 'Markel', url: 'https://www.markel.com', display: 'markel.com' },
  { name: 'Hiscox', url: 'https://www.hiscox.com', display: 'hiscox.com' },
];

export default function HostingInsurancePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-3xl font-semibold text-stone-900 mb-2">Hosting & Insurance</h1>
        <p className="text-stone-500 mb-8">Understanding your insurance responsibilities as a Groundly host</p>

        <div className="space-y-12">
          <section>
            <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
              <p>
                Groundly is a marketplace that connects hosts and guests — we are not an insurance provider and we do not offer coverage for activities that take place on a host&apos;s property. As a host, you are responsible for making sure your property carries the right insurance for short-term commercial use.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">The three layers of insurance</h2>
            <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
              <div>
                <h3 className="font-medium text-stone-900 mb-1">1. Host property & liability insurance</h3>
                <p>
                  Your homeowner&apos;s policy is the foundation. It typically covers damage to your property and personal liability — but standard residential policies often exclude or limit short-term commercial use. Many providers offer a rider or endorsement that extends coverage to commercial photography, productions, and similar activities.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-1">2. Guest commercial general liability (CGL)</h3>
                <p>
                  Working photographers, agencies, and production companies typically carry their own Commercial General Liability policy. CGL covers third-party bodily injury and property damage that may occur during a shoot — including damage to the location they&apos;re shooting on.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-1">3. Why most working creatives carry CGL</h3>
                <p>
                  CGL is industry standard. Many commercial clients and agencies require it before hiring a photographer or crew, and any larger studio or venue will ask for proof of coverage. For guests, it&apos;s an everyday cost of doing business — for you, it&apos;s an additional layer of protection on top of your own policy.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-1">Where Groundly fits in</h3>
                <p>
                  Groundly provides the structure for these bookings — host approval on every request, secure payments, clear booking terms, and a record of who is on your property and when. We do not provide coverage. The insurance layers above are what protect you, your guest, and your property when something goes wrong.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">What to ask your homeowner&apos;s insurance provider</h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              Before listing, give your insurance agent a call. A short conversation with these questions will tell you exactly where you stand:
            </p>
            <ul className="space-y-3 text-sm text-stone-600 leading-relaxed">
              {QUESTIONS_TO_ASK.map((q) => (
                <li key={q} className="flex gap-3">
                  <span className="text-stone-400 flex-shrink-0">•</span>
                  <span>&ldquo;{q}&rdquo;</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Recommended insurance providers</h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              If your homeowner&apos;s policy doesn&apos;t cover commercial use — or you want extra coverage for a specific booking — these providers offer per-booking event insurance you can purchase on demand. Policies typically start around <span className="font-medium text-stone-900">$75 per booking</span>.
            </p>
            <div className="space-y-3">
              {PROVIDERS.map((p) => (
                <div key={p.name} className="border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between">
                  <span className="font-medium text-stone-900 text-sm">{p.name}</span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    {p.display}
                  </a>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed mt-4">
              Pricing and coverage vary by location, property type, and booking details. Always review the policy terms before purchase. Groundly is not affiliated with these providers and does not receive compensation for referrals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Requiring proof of insurance from guests</h2>
            <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
              <p>
                For larger bookings — generally anything over <span className="font-medium text-stone-900">$1,000</span>, or any booking involving an ad agency or production company — it&apos;s reasonable to ask the guest for a Certificate of Insurance (COI) before you confirm the booking.
              </p>
              <p>
                A COI is a one-page document from the guest&apos;s insurance carrier showing their active CGL policy, the coverage limits, and the dates of coverage. You can also ask to be listed as an additional insured for the date of the shoot. This is standard practice across the production industry, and any professional guest will be familiar with the request and able to provide it quickly.
              </p>
              <p>
                Use the Groundly messaging thread on the booking to request the COI before approving. If a guest can&apos;t provide one for a booking that warrants it, that&apos;s a meaningful signal — feel free to decline.
              </p>
            </div>
          </section>

          <section className="border-t border-stone-200 pt-10">
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Ready to list your space?</h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-5">
              Join hosts across Connecticut, New York, and the Hamptons earning from professional photo and production bookings.
            </p>
            <Link
              href="/host"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
            >
              Start listing
            </Link>
            <p className="text-xs text-stone-500 leading-relaxed mt-4">
              Questions? Email{' '}
              <a
                href="mailto:bookgroundly@gmail.com"
                className="underline underline-offset-2 hover:text-stone-700 transition-colors"
              >
                bookgroundly@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
