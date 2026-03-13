'use client';

import { useState } from 'react';

interface BookingCardProps {
  listingId: string;
  listingTitle: string;
  pricePerHour: number;
  hostId?: string;
}

export default function BookingCard({ listingId, listingTitle, pricePerHour, hostId }: BookingCardProps) {
  const [date, setDate] = useState('');
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = pricePerHour * hours;
  const serviceFee = Math.round(totalPrice * 0.1 * 100) / 100; // 10% service fee
  const grandTotal = totalPrice + serviceFee;

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleBooking = async () => {
    if (!date) {
      setError('Please select a date');
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
          pricePerHour: grandTotal, // Send total as the charge
          hours: 1, // We already calculated total, so quantity is 1
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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-2xl font-bold text-gray-900">${pricePerHour}</span>
        <span className="text-gray-500">/ hour</span>
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={minDate}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Hours Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
        <select
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
            <option key={h} value={h}>
              {h} hour{h > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>${pricePerHour} x {hours} hour{hours > 1 ? 's' : ''}</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Service fee</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      {/* Book Button */}
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

      <p className="text-center text-xs text-gray-500 mt-3">You won&apos;t be charged yet</p>
    </div>
  );
}
