import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-semibold text-stone-900 mb-6">About Groundly</h1>
        <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
          <p>Groundly connects photographers, content creators, and creative professionals with beautiful private outdoor spaces. We believe every property has a story to tell — and every creative project deserves a stunning setting.</p>
          <p>Our curated marketplace focuses exclusively on outdoor access — gardens, lawns, estates, courtyards, and waterfronts — available for photoshoots, editorial sessions, and small creative productions. No overnight stays. No loud events. Just beautiful spaces and the people who bring them to life.</p>
          <h2 className="text-xl font-semibold text-stone-900 pt-6">Our Mission</h2>
          <p>To make premium private outdoor spaces accessible to every creative professional, while giving property owners a trusted, effortless way to share and earn from the beauty of their grounds.</p>
          <h2 className="text-xl font-semibold text-stone-900 pt-6">Currently Serving</h2>
          <p>Greenwich CT, Westchester NY, Hudson Valley, and the Hamptons — with more regions coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
