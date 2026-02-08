import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
    try {
        const body = await request.json();
        const { organizationType, organizationName, contactName, email, phone, numberOfUsers, message } = body;

        console.log('Enterprise contact form submission:', {
            organizationType,
            organizationName,
            contactName,
            email,
            phone
        });

        // Save to Firestore
        if (adminDb) {
            await adminDb.collection('enterprise_leads').add({
                organizationType,
                organizationName,
                contactName,
                email,
                phone,
                numberOfUsers: numberOfUsers || '',
                message: message || '',
                status: 'new',
                createdAt: FieldValue.serverTimestamp(),
                source: 'enterprise_landing_page'
            });
            console.log('Lead saved to Firestore');
        } else {
            console.warn('Firebase Admin not initialized, skipping Firestore save');
        }

        // TODO: Add email notification here when SMTP is configured

        return NextResponse.json({
            success: true,
            message: 'Your inquiry has been submitted successfully!'
        });

    } catch (error) {
        console.error('Enterprise contact form error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process your request.' },
            { status: 500 }
        );
    }
}
