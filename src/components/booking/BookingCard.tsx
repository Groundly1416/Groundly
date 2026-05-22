'use client';

import { useState } from 'react';
import { calculateFeeSplit } from '@/lib/fees';
import { getAvailableDateRange } from '@/lib/availability';

interface BookingCardProps {
  listingId: string;
  listingTitle: string;
  price2hrCents: number | null | undefined;
  priceHalfdayCents?: number | null;
  priceFulldayCents?: number | null;
  hostId?: string;
  rollingAvailabilityDays?: number | null;
}

type DurationOption = {
  hours: 2 | 4 | 8;
  label: string;
  totalCents: number;
};

export default function BookingCard({
  listingId,
  listingTitle,
  price2hrCents,
  priceHalfdayCents,
  priceFulldayCents,
  hostId,
  rollingAvailabilityDays = null,
}: BookingCardProps) {
  const options: DurationOption[] = [];
  if (price2hrCents) options.push({ hours: 2, label: '2 hours', totalCents: price2hrCents });
  if (priceHalfdayCents) options.push({ hours: 4, label: '4 hours', totalCents: priceHalfdayCents });
  if (priceFulldayCents) options.push({ hours: 8, label: '8 hours (full day)', totalCents: priceFulldayCents });

  const [date, setDate] = useState('');
  const [hours, setHours] = useState<2 | 4 | 8>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedOption = options.find(o => o.hours === hours) ?? options[0];
  const tierTotalCents = selectedOption?.totalCents ?? 0;
  const { platformFeeCents: serviceFeeCents, grossCents: grandTotalCents } =
    calculateFeeSplit(tierTotalCents);

  // price_2hr is the 2-hour tier total; the per-hour rate is half of it.
  const hourlyRateDollars = price2hrCents ? price2hrCents / 200 : 0;

  const { start, end } = getAvailableDateRange({
    rolling_availability_days: rollingAvailabilityDays,
  });
  const minDate = start.toISOString().split('T')[0];
  const maxDate = end ? end.toISOString().split('T')[0] : undefined;

  const handleBooking = async () => {
    if (!date) {
      setError('Please select a date');
      return;
    }
    if (!selectedOption) {
      setError('No pricing available for this listing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          listingTitle,
          hostRateCents: tierTotalCents,
          hours,
          date,
          hostId: hostId || '',
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (options.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-24">
        <p className="text-sm text-gray-500">Pricing not available for this listing.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-2xl font-bold text-gray-900">${hourlyRateDollars}</span>
        <span className="text-gray-500">/ hour</span>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={minDate}
          max={maxDate}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
        <select
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value) as 2 | 4 | 8)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        >
          {options.map((o) => (
            <option key={o.hours} value={o.hours}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>{selectedOption!.label}</span>
          <span>${(tierTotalCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Service fee</span>
          <span>${(serviceFeeCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${(grandTotalCents / 100).toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          'Reserve Space'
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-3">You won&apos;t be charged until the host approves</p>
    </div>
  );
}
