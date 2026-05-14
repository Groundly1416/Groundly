'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/services';
import type { Profile } from '@/types/database';

export default function HideForHosts({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    auth.getProfile()
      .then(profile => setUser(profile))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const isHost = user?.role === 'host' || user?.role === 'admin';

  if (!authLoading && isHost) return null;
  return <>{children}</>;
}
