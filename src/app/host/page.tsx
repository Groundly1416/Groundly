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
          <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80" alt="Beautiful outdoor estate" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-4 leading-tight">Your outdoor space<br />deserves to be shared</h1>
          <p className="text-white/70 text-lg mb-8">Earn money by listing your garden, lawn, or estate on Groundly. Photographers, event planners, and creators are looking for beautiful private outdoor spaces just like yours.</p>
          <a href="mailto:bookgroundly@gmail.com?subject=I%20want%20to%20list%20my%20space%20on%20Groundly" className="inline-flex items-center gap-2 bg-white text-stone-900 hover:bg-stone-100 px-8 py-4 rounded-lg font-medium transition-colors text-base">
            Start Hosting <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-semibold text-center mb-10">Why hosts love Groundly</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { icon: DollarSign, title: 'Earn on your terms', desc: 'Set your own pricing, availability, and rules. You approve every booking before it happens.' },
            { icon: Shield, title: 'Safe & controlled', desc: 'Outdoor access only. No overnight stays. Full control over who uses your property and for what purpose.' },
            { icon: Camera, title: 'Curated community', desc: 'Our guests are professionals — photographers, brands, event planners, and creative teams.' },
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
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-stone-900 text-center mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Tell us about your space', desc: 'Send us photos and details about your outdoor space — gardens, lawns, estates, waterfronts, courtyards, and more.' },
              { step: '2', title: 'We build your listing', desc: 'Our team creates a polished listing with your photos, description, pricing, and rules. You review and approve before it goes live.' },
              { step: '3', title: 'Start earning', desc: 'Receive booking requests from photographers, event planners, and creatives. You approve every booking and get paid through our secure platform.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 text-sm font-semibold">{item.step}</div>
                <h3 className="font-medium text-stone-900 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">Ready to list your space?</h2>
          <p className="text-stone-500 mb-8">It's free to list. Send us a message with a few photos of your outdoor space and we'll handle the rest.</p>
          <a href="mailto:bookgroundly@gmail.com?subject=I%20want%20to%20list%20my%20space%20on%20Groundly" className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors">
            Get Started <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-stone-400 text-sm mt-4">Or email us directly at bookgroundly@gmail.com</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
