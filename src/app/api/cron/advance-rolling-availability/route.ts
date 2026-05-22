import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// No-op stub for now. Rolling availability is computed dynamically from
// today's date every time isDateAvailable() / getAvailableDateRange() is
// called, so there is no per-day DB transition to apply. This endpoint
// exists to give us an audit log of the daily rollover and a hook for
// future features (e.g. emailing hosts about newly bookable dates).
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const dateIso = today.toISOString();
  console.log(`[advance-rolling-availability] rolling availability advanced for date ${dateIso}`);

  return NextResponse.json({ advanced: true, date: dateIso });
}
