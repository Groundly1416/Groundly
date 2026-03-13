'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { auth } from '@/lib/services';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.signIn(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
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
            <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 mb-1">Welcome back</h1>
            <p className="text-stone-500 text-sm">Sign in to your Groundly account</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-xl border border-stone-100 p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full px-5 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-xs text-stone-400 text-center">
              Don&apos;t have an account? <Link href="/signup" className="text-stone-600 underline">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
