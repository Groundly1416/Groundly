import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-stone-500 text-sm mb-8">Last updated: March 26, 2026</p>

        <div className="prose prose-stone max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">1. Information We Collect</h2>
            <p className="text-stone-600 leading-relaxed">
              When you use Groundly, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
              <li>Account information: name, email address, and password when you create an account.</li>
              <li>Profile information: any additional details you provide such as phone number, bio, or profile photo.</li>
              <li>Listing information: property details, photos, pricing, and rules provided by Hosts.</li>
              <li>Payment information: payment details are collected and processed securely by Stripe. Groundly does not store your credit card information.</li>
              <li>Usage information: how you interact with the platform, including pages visited, searches made, and bookings completed.</li>
              <li>Device information: browser type, IP address, and device type for security and analytics purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-stone-600 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
              <li>Operate and maintain the Groundly platform.</li>
              <li>Process bookings and payments.</li>
              <li>Communicate with you about your account, bookings, and platform updates.</li>
              <li>Improve the platform and develop new features.</li>
              <li>Ensure the security of the platform and prevent fraud.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">3. Information Sharing</h2>
            <p className="text-stone-600 leading-relaxed">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
              <li>With Hosts or Guests as necessary to facilitate a booking (e.g., sharing a Guest&apos;s name with a Host after a booking is confirmed).</li>
              <li>With Stripe to process payments.</li>
              <li>With service providers who help us operate the platform (e.g., hosting, analytics).</li>
              <li>When required by law or to protect our legal rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">4. Data Security</h2>
            <p className="text-stone-600 leading-relaxed">
              We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">5. Cookies</h2>
            <p className="text-stone-600 leading-relaxed">
              Groundly uses cookies and similar technologies to improve your experience, analyze usage, and maintain session information. You can disable cookies in your browser settings, but some features of the platform may not function properly without them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">6. Your Rights</h2>
            <p className="text-stone-600 leading-relaxed">
              You may access, update, or delete your personal information at any time by logging into your account. If you wish to delete your account entirely, please contact us and we will process your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">7. Children&apos;s Privacy</h2>
            <p className="text-stone-600 leading-relaxed">
              Groundly is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">8. Changes to This Policy</h2>
            <p className="text-stone-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of the platform after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">9. Contact</h2>
            <p className="text-stone-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at bookgroundly.com or via Instagram @bookgroundly.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
