import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  // -----------------------------------------------------------------
  // Two Stripe webhook destinations point at this endpoint:
  //   - STRIPE_WEBHOOK_SECRET         platform events (checkout.session.completed, etc.)
  //   - STRIPE_CONNECT_WEBHOOK_SECRET Connect events (account.updated, payout.*)
  // Each is signed with its own secret, so we try the platform secret
  // first and fall back to the Connect secret. If the Connect secret
  // env var is not set, only the platform secret is checked.
  // -----------------------------------------------------------------
  const platformSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const connectSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, platformSecret);
  } catch (platformErr: any) {
    if (!connectSecret) {
      console.error('Webhook signature verification failed:', platformErr.message);
      return NextResponse.json(
        { error: `Webhook Error: ${platformErr.message}` },
        { status: 400 }
      );
    }
    try {
      event = stripe.webhooks.constructEvent(body, signature, connectSecret);
    } catch (connectErr: any) {
      console.error('Webhook signature verification failed against both secrets:', connectErr.message);
      return NextResponse.json(
        { error: `Webhook Error: ${connectErr.message}` },
        { status: 400 }
      );
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          const { data: insertedBooking, error: insertError } = await supabase
            .from('bookings')
            .insert({
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
            })
            .select('id')
            .single();

          let bookingId: string | null = insertedBooking?.id ?? null;

          if (insertError) {
            // Unique violation on stripe_session_id means this is a webhook
            // retry — look up the existing booking so we can still wire up
            // pending_transfers idempotently.
            console.error('Error saving booking:', insertError);
            const { data: existing } = await supabase
              .from('bookings')
              .select('id')
              .eq('stripe_session_id', session.id)
              .single();
            bookingId = existing?.id ?? null;
          } else {
            console.log('Booking saved successfully for session:', session.id);
          }

          const requiredFields = [
            'stripe_account_id',
            'hostId',
            'host_net_cents',
            'platform_fee_cents',
            'gross_amount_cents',
            'event_date',
          ] as const;
          const missingField = requiredFields.find((k) => !metadata[k]);

          if (missingField) {
            console.warn(
              `Skipping pending_transfers insert for session ${session.id}: missing metadata field ${missingField} (likely a legacy booking from before PR 2)`
            );
          } else {
            const { data: existingTransfer } = await supabase
              .from('pending_transfers')
              .select('id')
              .eq('stripe_checkout_session_id', session.id)
              .maybeSingle();

            if (existingTransfer) {
              console.log(
                'pending_transfers row already exists for session, skipping:',
                session.id
              );
            } else {
              const eventDate = new Date(metadata.event_date);
              const releaseAt = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);

              const { error: transferError } = await supabase
                .from('pending_transfers')
                .insert({
                  booking_id: bookingId,
                  stripe_payment_intent_id: session.payment_intent as string,
                  stripe_checkout_session_id: session.id,
                  stripe_account_id: metadata.stripe_account_id,
                  host_user_id: metadata.hostId,
                  amount_cents: parseInt(metadata.host_net_cents),
                  platform_fee_cents: parseInt(metadata.platform_fee_cents),
                  gross_amount_cents: parseInt(metadata.gross_amount_cents),
                  event_date: eventDate.toISOString(),
                  release_at: releaseAt.toISOString(),
                  status: 'pending',
                });

              if (transferError) {
                console.error('Error saving pending_transfer:', transferError);
              } else {
                console.log('pending_transfer recorded for session:', session.id);
              }
            }
          }
        } else {
          console.log('Supabase service key not configured, skipping DB save');
        }
      } catch (err) {
        console.error('Error processing webhook:', err);
      }
    }
  }

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabase
          .from('profiles')
          .update({
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
          })
          .eq('stripe_account_id', account.id);

        if (error) {
          console.error('Error updating Connect status:', error);
        } else {
          console.log('Connect status updated for account:', account.id);
        }
      }
    } catch (err) {
      console.error('Error processing account.updated webhook:', err);
    }
  }

  return NextResponse.json({ received: true });
}
