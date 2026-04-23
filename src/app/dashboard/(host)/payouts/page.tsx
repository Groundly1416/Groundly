'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { auth } from '@/lib/services';
import { cn } from '@/lib/utils';

interface AccountStatus {
  hasAccount: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue: string[];
}

export default function PayoutsPage() {
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const isRefresh = searchParams.get('refresh') === 'true';
  const isComplete = searchParams.get('complete') === 'true';

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile) return;
        setUserId(profile.id);

        const res = await fetch(`/api/connect/account-status?userId=${profile.id}`);
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSetup() {
    if (!userId) return;
    setActionLoading(true);
    try {
      const createRes = await fetch('/api/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const { error: createError } = await createRes.json();
      if (createError) throw new Error(createError);

      const linkRes = await fetch('/api/connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const { url, error: linkError } = await linkRes.json();
      if (linkError) throw new Error(linkError);

      window.location.href = url;
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  }

  async function handleContinueSetup() {
    if (!userId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  }

  async function handleManage() {
    if (!userId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/connect/dashboard-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const isActive = status?.chargesEnabled && status?.payoutsEnabled;
  const needsCompletion = status?.hasAccount && !isActive;

  return (
    <div className="space-y-6">
      {isRefresh && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          Returning from Stripe — your setup session expired or was refreshed. Continue below to finish.
        </div>
      )}
      {isComplete && isActive && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-4 py-3">
          Setup complete! Your payouts are now active.
        </div>
      )}
      {isComplete && !isActive && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          You've returned from Stripe, but there are still requirements to finish. Continue below.
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-100 p-8">
        {!status?.hasAccount && (
          <>
            <h1 className="text-2xl font-semibold text-stone-900 mb-2">Set up payouts</h1>
            <p className="text-stone-500 mb-6 max-w-lg">
              Groundly uses Stripe to securely pay hosts. Connect your account to start receiving payouts for bookings on your spaces.
            </p>
            <button
              onClick={handleSetup}
              disabled={actionLoading}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors',
                actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-800'
              )}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Set up payouts with Stripe
            </button>
          </>
        )}

        {needsCompletion && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-stone-900">Finish payout setup</h1>
                <p className="text-sm text-stone-500">Stripe needs a bit more information before you can receive payouts.</p>
              </div>
            </div>

            {status.requirementsDue.length > 0 && (
              <div className="mb-6 bg-stone-50 rounded-lg p-4">
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Requirements remaining</p>
                <ul className="space-y-1">
                  {status.requirementsDue.map((req) => (
                    <li key={req} className="text-sm text-stone-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {req.replace(/_/g, ' ').replace(/\./g, ' > ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleContinueSetup}
              disabled={actionLoading}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg transition-colors',
                actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-800'
              )}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Continue setup
            </button>
          </>
        )}

        {isActive && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-stone-900">Payouts active</h1>
                <p className="text-sm text-stone-500">You're all set to receive bookings.</p>
              </div>
            </div>

            <button
              onClick={handleManage}
              disabled={actionLoading}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 border border-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors',
                actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-50'
              )}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage in Stripe
            </button>
          </>
        )}
      </div>
    </div>
  );
}
