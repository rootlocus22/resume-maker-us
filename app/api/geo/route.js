import { NextResponse } from 'next/server';

export async function GET(request) {
    // Get country from Vercel headers
    // x-vercel-ip-country returns the 2-letter country code (e.g. US, IN, GB)
    const country = request.headers.get('x-vercel-ip-country') || 'US';
    console.log('Geo Detection - Country:', country, 'Headers:', request.headers.get('x-vercel-ip-country'));

    return NextResponse.json({
        country,
        // Add debug info if needed, but keep payload small
        isVercel: !!request.headers.get('x-vercel-ip-country')
    });
}
