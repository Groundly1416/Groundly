'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: number | null;
  onChange: (v: number | null) => void;
}

type Mode = 'anytime' | 'two_weeks' | 'four_weeks' | 'custom';

function modeFor(value: number | null): Mode {
  if (value === null) return 'anytime';
  if (value === 14) return 'two_weeks';
  if (value === 28) return 'four_weeks';
  return 'custom';
}

export default function RollingAvailabilityField({ value, onChange }: Props) {
  const mode = modeFor(value);
  const [customStr, setCustomStr] = useState<string>(
    mode === 'custom' ? String(value) : ''
  );

  function pick(next: Mode) {
    if (next === 'anytime') onChange(null);
    else if (next === 'two_weeks') onChange(14);
    else if (next === 'four_weeks') onChange(28);
    else {
      const parsed = parseInt(customStr, 10);
      const fallback = !isNaN(parsed) && parsed >= 1 && parsed <= 365 ? parsed : 7;
      setCustomStr(String(fallback));
      onChange(fallback);
    }
  }

  function handleCustomInput(s: string) {
    setCustomStr(s);
    const n = parseInt(s, 10);
    if (!isNaN(n) && n >= 1 && n <= 365) onChange(n);
  }

  const options: { id: Mode; label: string; hint?: string }[] = [
    { id: 'anytime', label: 'Anytime', hint: 'recommended — guests can book any future date' },
    { id: 'two_weeks', label: '2 weeks' },
    { id: 'four_weeks', label: '4 weeks' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all',
              mode === opt.id
                ? 'border-stone-900 bg-stone-50'
                : 'border-stone-200 hover:border-stone-300'
            )}
          >
            <input
              type="radio"
              name="rolling-availability"
              checked={mode === opt.id}
              onChange={() => pick(opt.id)}
              className="mt-0.5 accent-stone-900"
            />
            <span className="flex-1">
              <span className="text-sm font-medium text-stone-900">{opt.label}</span>
              {opt.hint && (
                <span className="text-xs text-stone-500 ml-1.5">— {opt.hint}</span>
              )}
              {opt.id === 'custom' && mode === 'custom' && (
                <span className="ml-3 inline-flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={customStr}
                    onChange={(e) => handleCustomInput(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 border border-stone-300 rounded-md px-2 py-1 text-sm text-stone-900 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none"
                  />
                  <span className="text-sm text-stone-500">days (1–365)</span>
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
