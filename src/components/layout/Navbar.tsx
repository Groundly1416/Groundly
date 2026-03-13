'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, Menu, Heart, Calendar, MessageSquare, BarChart3, Home, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// In a real app this would use the auth hook.
// For now it's a presentational shell.
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-stone-900">Groundly</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/browse" className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 rounded-lg transition-colors">
              Browse
            </Link>
            <Link href="/vendors" className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 rounded-lg transition-colors">
              Vendors
            </Link>
            <Link href="/host" className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 rounded-lg transition-colors">
              List Your Space
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center px-5 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
            >
              Get Started
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-stone-50"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 space-y-1">
          <Link href="/browse" className="block px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>Browse Spaces</Link>
          <Link href="/vendors" className="block px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>Vendors</Link>
          <Link href="/host" className="block px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>List Your Space</Link>
          <div className="border-t border-stone-100 pt-2 mt-2">
            <Link href="/login" className="block px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link href="/signup" className="block px-3 py-2 text-sm font-medium text-stone-900 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
