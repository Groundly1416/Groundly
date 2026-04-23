'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Plus, Calendar, ArrowLeft, Banknote } from 'lucide-react';
import { auth } from '@/lib/services';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/create', label: 'Create Listing', icon: Plus },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { href: '/dashboard/payouts', label: 'Payouts', icon: Banknote },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    auth.getProfile().then(profile => {
      if (!profile) {
        router.replace('/login');
        return;
      }
      setUser(profile);
      setLoading(false);
    }).catch(() => {
      router.replace('/login');
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="px-3 mb-3 text-xs font-medium text-stone-400 uppercase tracking-wider">Host Dashboard</p>
              {sidebarLinks.map(link => {
                const Icon = link.icon;
                const active = link.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                      active
                        ? 'bg-stone-900 text-white font-medium'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                    {link.href === '/dashboard/payouts' && user && !user.stripe_payouts_enabled && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 px-2 py-2 flex justify-around">
            {sidebarLinks.map(link => {
              const Icon = link.icon;
              const active = link.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs rounded-lg transition-colors',
                    active ? 'text-stone-900 font-medium' : 'text-stone-400'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                  {link.href === '/dashboard/payouts' && user && !user.stripe_payouts_enabled && (
                    <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
