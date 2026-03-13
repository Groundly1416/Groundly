'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { auth } from '@/lib/services';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.signUp(email, password, name, role);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-stone-900 mb-1">Join Groundly</h1>
            <p className="text-stone-500 text-sm">Create an account to get started</p>
          </div>

          <form onSubmit={handleSignup} className="bg-white rounded-xl border border-stone-100 p-6 space-y-4">
            {/* Role toggle */}
            <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
              <button type="button" onClick={() => setRole('guest')}
                className={cn('flex-1 py-2 text-sm rounded-md transition-all', role === 'guest' ? 'bg-white text-stone-900 font-medium shadow-sm' : 'text-stone-500')}>
                I&apos;m Booking
              </button>
              <button type="button" onClick={() => setRole('host')}
                className={cn('flex-1 py-2 text-sm rounded-md transition-all', role === 'host' ? 'bg-white text-stone-900 font-medium shadow-sm' : 'text-stone-500')}>
                I&apos;m Hosting
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full px-5 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <p className="text-xs text-stone-400 text-center">
              Already have an account? <Link href="/login" className="text-stone-600 underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
