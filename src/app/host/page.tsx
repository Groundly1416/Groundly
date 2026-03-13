import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DollarSign, Shield, Camera, ArrowRight, Check } from 'lucide-react';

export default function HostPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-4 leading-tight">Your outdoor space<br />deserves to be shared</h1>
          <p className="text-white/70 text-lg mb-8">Earn money by listing your garden, lawn, or estate on Groundly. Photographers and creators are looking for beautiful private outdoor spaces just like yours.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-stone-900 hover:bg-stone-100 px-8 py-4 rounded-lg font-medium transition-colors text-base">
            Start Hosting <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-semibold text-center mb-10">Why hosts love Groundly</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { icon: DollarSign, title: 'Earn on your terms', desc: 'Set your own pricing, availability, and rules. You approve every booking.' },
            { icon: Shield, title: 'Safe & controlled', desc: 'Outdoor access only. No overnight stays. Full control over who accesses your property.' },
            { icon: Camera, title: 'Curated community', desc: 'Our guests are professionals — photographers, brands, and creative teams.' },
          ].map(item => (
            <div key={item.title} className="text-center">
              <item.icon className="w-8 h-8 mx-auto mb-3 text-stone-700" />
              <h3 className="font-medium text-stone-900 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-stone-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">Ready to list your space?</h2>
          <p className="text-stone-500 mb-8">Create a free account, add your property details and photos, and start receiving booking requests from creative professionals.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors">
            Create Your Listing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
