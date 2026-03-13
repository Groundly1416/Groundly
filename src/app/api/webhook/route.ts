import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Use service role key for webhook (server-side, no user auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata) {
      try {
        // Save booking to Supabase
        const { error } = await supabase.from('bookings').insert({
          listing_id: metadata.listingId,
          user_id: metadata.userId || null,
          host_id: metadata.hostId || null,
          booking_date: metadata.date,
          hours: parseInt(metadata.hours || '1'),
          total_amount: (session.amount_total || 0) / 100,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          status: 'confirmed',
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error saving booking:', error);
        } else {
          console.log('Booking saved successfully for session:', session.id);
        }
      } catch (err) {
        console.error('Error processing webhook:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
