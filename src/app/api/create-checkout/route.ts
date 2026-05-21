import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculateFeeSplit } from '@/lib/fees';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, listingTitle, hostRateCents, hours, date, userId, hostId } = body;

    if (!listingId || !listingTitle || !hostRateCents || !date || !hostId) {
      return NextResponse.json(
        { error: 'Missing required booking details' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server misconfigured: Supabase service credentials missing' },
        { status: 500 }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: hostProfile, error: hostError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_charges_enabled')
      .eq('id', hostId)
      .single();

    if (hostError || !hostProfile) {
      return NextResponse.json(
        { error: 'HOST_NOT_ONBOARDED' },
        { status: 400 }
      );
    }

    if (!hostProfile.stripe_charges_enabled || !hostProfile.stripe_account_id) {
      return NextResponse.json(
        { error: 'HOST_NOT_ONBOARDED' },
        { status: 400 }
      );
    }

    const { hostNetCents, platformFeeCents, grossCents } = calculateFeeSplit(hostRateCents);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: listingTitle,
              description: `${hours} hour${hours > 1 ? 's' : ''} on ${date}`,
            },
            unit_amount: grossCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bookgroundly.com'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bookgroundly.com'}/listing/${listingId}`,
      metadata: {
        listingId,
        userId: userId || '',
        hostId,
        date,
        hours: (hours || 1).toString(),
        totalAmount: (grossCents / 100).toString(),
        stripe_account_id: hostProfile.stripe_account_id,
        host_net_cents: hostNetCents.toString(),
        platform_fee_cents: platformFeeCents.toString(),
        gross_amount_cents: grossCents.toString(),
        event_date: date,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
