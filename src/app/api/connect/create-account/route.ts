import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, stripe_account_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.stripe_account_id) {
      return NextResponse.json({ accountId: profile.stripe_account_id });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: profile.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: 'individual',
      metadata: { user_id: profile.id },
    });

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_account_id: account.id })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save account ID' }, { status: 500 });
    }

    return NextResponse.json({ accountId: account.id });
  } catch (error: any) {
    console.error('Connect create-account error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create connected account' },
      { status: 500 }
    );
  }
}
