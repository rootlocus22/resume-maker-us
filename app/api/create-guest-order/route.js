import { NextResponse } from 'next/server';
import stripe from '../../lib/stripe';
import { ADDON_CONFIG } from '../../lib/planConfig';

export async function POST(req) {
    try {
        const body = await req.json();
        const { currency = 'USD', userInfo = {}, source = null, origin = '' } = body;

        // Verify amount from config to prevent tampering
        let amount = ADDON_CONFIG.one_time_download.price[currency] || ADDON_CONFIG.one_time_download.price.USD || 299;

        // Special pricing for 'shine' pilot program
        if (source === 'shine' || source === 'shine_500_pilot' || userInfo.source === 'shine') {
            amount = 199; // $1.99
        }

        const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

        // Create Stripe Checkout Session for one-time download
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: userInfo.email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: 'One-Time Resume Download',
                            description: 'Download your resume without a subscription',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=guest_download`,
            cancel_url: `${baseUrl}/resume-builder?cancelled=true`,
            metadata: {
                type: 'one_time_download',
                currency: currency,
                user_email: userInfo.email || 'guest',
                user_name: userInfo.name || 'Guest User',
                user_id: userInfo.userId || 'guest',
                source: source || '',
            },
        });

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
            amount: amount,
            currency: currency,
        });

    } catch (error) {
        console.error('Error creating guest checkout session:', error);
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        );
    }
}
