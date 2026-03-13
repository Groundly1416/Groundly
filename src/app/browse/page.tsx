'use client';

import { Suspense } from 'react';
import BrowseContent from './BrowseContent';

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-stone-400">Loading...</p></div>}>
      <BrowseContent />
    </Suspense>
  );
}
