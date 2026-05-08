'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Menu, X, LayoutDashboard, Calendar, LogOut } from 'lucide-react';
import { auth } from '@/lib/services';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    auth.getProfile()
      .then(profile => setUser(profile))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    setUser(null);
    setMenuOpen(false);
    window.location.href = '/';
  };

  const isHost = user?.role === 'host' || user?.role === 'admin';
  const isGuest = user?.role === 'guest';

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
            <Link href="/creative-network" className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 rounded-lg transition-colors">
              Creative Network
            </Link>
            {isHost ? (
              <Link href="/dashboard" className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 rounded-lg transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            ) : isGuest ? (
              <Link href="/dashboard/guest" className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 rounded-lg transition-colors flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                My Bookings
              </Link>
            ) : (
              <Link href="/signup" className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 rounded-lg transition-colors">
                List Your Space
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            {authLoading ? (
              <div className="w-20" />
            ) : user ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-stone-500">{user.full_name?.split(' ')[0]}</span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}

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
          <Link href="/creative-network" className="block px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>Creative Network</Link>
          {isHost ? (
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          ) : isGuest ? (
            <Link href="/dashboard/guest" className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
              <Calendar className="w-3.5 h-3.5" />
              My Bookings
            </Link>
          ) : (
            <Link href="/signup" className="block px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>List Your Space</Link>
          )}
          <div className="border-t border-stone-100 pt-2 mt-2">
            {user ? (
              <>
                <p className="px-3 py-1 text-xs text-stone-400">{user.full_name || user.email}</p>
                <button onClick={handleSignOut} className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/signup" className="block px-3 py-2 text-sm font-medium text-stone-900 rounded-lg hover:bg-stone-50" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
