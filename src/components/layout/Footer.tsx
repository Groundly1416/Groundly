import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Leaf className="w-4 h-4 text-stone-900" />
              </div>
              <span className="text-xl font-semibold text-white">Groundly</span>
            </div>
            <p className="text-sm leading-relaxed">
              Premium private outdoor spaces for creative shoots and productions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Discover</h4>
            <div className="space-y-2">
              <Link href="/browse" className="block text-sm hover:text-white transition-colors">Browse Spaces</Link>
              <Link href="/vendors" className="block text-sm hover:text-white transition-colors">Find Vendors</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Hosting</h4>
            <div className="space-y-2">
              <Link href="/host" className="block text-sm hover:text-white transition-colors">List Your Space</Link>
              <Link href="/faq" className="block text-sm hover:text-white transition-colors">Host FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Company</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm hover:text-white transition-colors">About</Link>
              <Link href="/faq" className="block text-sm hover:text-white transition-colors">FAQ</Link>
              <Link href="/trust" className="block text-sm hover:text-white transition-colors">Trust & Safety</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">&copy; 2026 Groundly. All rights reserved.</p>
          <p className="text-xs">Outdoor access only — not overnight accommodation.</p>
        </div>
      </div>
    </footer>
  );
}
