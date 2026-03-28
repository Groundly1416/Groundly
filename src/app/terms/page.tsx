import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Terms of Service</h1>
        <p className="text-stone-500 text-sm mb-8">Last updated: March 26, 2026</p>

        <div className="prose prose-stone max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">1. About Groundly</h2>
            <p className="text-stone-600 leading-relaxed">
              Groundly (&quot;we,&quot; &quot;us,&quot; or &quot;the Platform&quot;) operates the website bookgroundly.com and provides an online marketplace that connects property owners (&quot;Hosts&quot;) who offer private outdoor spaces for short-term use with individuals and businesses (&quot;Guests&quot;) seeking those spaces for photoshoots, events, creative productions, and other lawful activities. Groundly also maintains a vendor directory connecting Guests with local creative professionals and service providers (&quot;Vendors&quot;).
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              Groundly is a marketplace platform only. We do not own, manage, or control any properties listed on the platform. We are not a party to any agreement between Hosts and Guests. We do not act as a real estate broker, event venue, or event planner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">2. Eligibility</h2>
            <p className="text-stone-600 leading-relaxed">
              You must be at least 18 years old to use Groundly. By creating an account, you represent that the information you provide is accurate and complete, and that you have the legal authority to enter into binding agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">3. Host Responsibilities</h2>
            <p className="text-stone-600 leading-relaxed">
              By listing a property on Groundly, Hosts agree to the following:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
              <li>You have the legal right to offer your outdoor space for short-term rental use.</li>
              <li>You are solely responsible for ensuring your property complies with all applicable local, state, and federal laws, including zoning regulations, permitting requirements, noise ordinances, HOA rules, and any other local restrictions on commercial use of residential property.</li>
              <li>You are responsible for obtaining any permits or licenses required to rent your outdoor space for the activities you allow.</li>
              <li>You are responsible for maintaining adequate homeowner&apos;s or property insurance that covers short-term commercial use of your outdoor space.</li>
              <li>You will accurately represent your property in your listing, including photos, descriptions, amenities, rules, and pricing.</li>
              <li>You will clearly communicate any rules, restrictions, or limitations to Guests before their booking is confirmed.</li>
              <li>You are responsible for the safety and condition of your outdoor space.</li>
              <li>Groundly does not verify, endorse, or guarantee that any property is legally permitted for commercial use, events, or productions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">4. Guest Responsibilities</h2>
            <p className="text-stone-600 leading-relaxed">
              By booking a space on Groundly, Guests agree to the following:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
              <li>You will use the outdoor space only for the purpose stated in your booking and in accordance with the Host&apos;s rules.</li>
              <li>You are responsible for obtaining any permits required for your specific activity (e.g., film permits, event permits, noise permits).</li>
              <li>You will respect the property, leave it in the condition you found it, and not access any areas not included in the booking (including indoor spaces unless explicitly agreed upon with the Host).</li>
              <li>You are responsible for the conduct of anyone you bring to the property during your booking.</li>
              <li>You will not exceed the maximum guest count specified in the listing.</li>
              <li>You acknowledge that Groundly does not guarantee the accuracy of any listing information and that you should verify details directly with the Host before your session.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">5. Local Laws and Permitting</h2>
            <p className="text-stone-600 leading-relaxed">
              Groundly does not provide legal advice and makes no representations regarding the legality of any particular use of a listed property. Laws regarding the short-term rental of private property for commercial purposes vary significantly by municipality, county, and state.
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              Hosts are solely responsible for understanding and complying with all applicable laws and regulations governing the use of their property, including but not limited to: zoning and land use regulations, short-term rental ordinances, business licensing requirements, noise ordinances, parking restrictions, and fire and safety codes.
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              Guests are solely responsible for understanding and complying with any permitting requirements for their specific activity, including but not limited to: film and photography permits, event permits, alcohol service permits, and amplified sound permits.
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              Groundly strongly encourages both Hosts and Guests to consult with their local municipality and/or legal counsel to ensure compliance with all applicable laws before listing a property or booking a session.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">6. Payments and Fees</h2>
            <p className="text-stone-600 leading-relaxed">
              All payments are processed securely through Stripe. Guests pay the listed price plus a 12% service fee at the time of booking. Hosts receive their payout after the booking is completed, minus any applicable host fees. All prices are listed in US dollars.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">7. Cancellations and Refunds</h2>
            <p className="text-stone-600 leading-relaxed">
              Cancellation policies may vary by listing. Unless otherwise stated, the following default policy applies:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
              <li>Cancellations made 48 or more hours before the booking start time are eligible for a full refund.</li>
              <li>Cancellations made between 24 and 48 hours before the booking start time are eligible for a 50% refund.</li>
              <li>Cancellations made less than 24 hours before the booking start time are not eligible for a refund.</li>
              <li>If a Host cancels a confirmed booking, the Guest will receive a full refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">8. Vendor Directory</h2>
            <p className="text-stone-600 leading-relaxed">
              Groundly maintains a directory of local creative professionals and service providers. Vendor listings are provided for informational purposes only. Groundly does not employ, endorse, or guarantee the work of any Vendor listed on the platform. Any agreement between a Guest and a Vendor is solely between those two parties. Groundly is not liable for the quality, timeliness, or outcome of any services provided by a Vendor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">9. Limitation of Liability</h2>
            <p className="text-stone-600 leading-relaxed">
              Groundly provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis. To the fullest extent permitted by law, Groundly shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to: property damage, personal injury, loss of revenue, or loss of data arising from the use of the platform or any interaction between Hosts, Guests, or Vendors.
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              Groundly is not responsible for the condition, safety, legality, or suitability of any listed property. Groundly is not responsible for the conduct of any Host, Guest, or Vendor. Users interact with each other at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">10. Indemnification</h2>
            <p className="text-stone-600 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Groundly, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or related to your use of the platform, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">11. Intellectual Property</h2>
            <p className="text-stone-600 leading-relaxed">
              All content on the Groundly platform, including but not limited to text, graphics, logos, and software, is the property of Groundly or its licensors and is protected by copyright and trademark laws. Hosts retain ownership of any photos and content they upload to their listings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">12. Privacy</h2>
            <p className="text-stone-600 leading-relaxed">
              Your use of Groundly is also governed by our Privacy Policy. By using the platform, you consent to the collection and use of information as described in our Privacy Policy. We collect personal information necessary to operate the platform, process payments, and communicate with users. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">13. Dispute Resolution</h2>
            <p className="text-stone-600 leading-relaxed">
              Any disputes between Hosts and Guests should first be resolved directly between the parties. If a resolution cannot be reached, either party may contact Groundly for assistance, but Groundly is not obligated to mediate or resolve disputes. These Terms are governed by the laws of the State of Connecticut.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">14. Modifications</h2>
            <p className="text-stone-600 leading-relaxed">
              Groundly reserves the right to modify these Terms at any time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of the platform after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">15. Contact</h2>
            <p className="text-stone-600 leading-relaxed">
              If you have questions about these Terms, please contact us at bookgroundly.com or via Instagram @bookgroundly.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
