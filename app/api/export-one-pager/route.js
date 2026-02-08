import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { v4 as uuidv4 } from 'uuid';
import { cleanResumeDataForFirebase } from '../../lib/utils';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    try {
        initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }
}

const adminDb = getFirestore();

export async function POST(request) {
    try {
        let {
            resumeData,
            template,
            customColors,
            language,
            country,
            resumeName,
            resumeId,
            paymentAmount,
            paymentCurrency
        } = await request.json();

        // Clean resume data to remove undefined values
        console.log('🧹 Cleaning one-pager data before export...');
        resumeData = cleanResumeDataForFirebase(resumeData);

        // Check if user is admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token and get user data
        let user;
        try {
            const decodedToken = await getAuth().verifyIdToken(token);
            user = decodedToken;
        } catch (error) {
            console.error("Token verification failed:", error);
            return NextResponse.json(
                { error: "Invalid authentication token." },
                { status: 401 }
            );
        }

        // Check if user is admin
        const adminEmails = ['rahuldubey220890@gmail.com', 'ebupthaan601@gmail.com', 'shilesh.50025@gmail.com', 'gopipandey.dev@gmail.com'];
        if (!adminEmails.includes(user.email)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Normalize payment amount and currency
        let normalizedPaymentAmount = 0;
        if (typeof paymentAmount === 'string' && paymentAmount.trim() !== '') {
            normalizedPaymentAmount = parseFloat(paymentAmount);
        } else if (typeof paymentAmount === 'number') {
            normalizedPaymentAmount = paymentAmount;
        }

        if (Number.isNaN(normalizedPaymentAmount) || normalizedPaymentAmount < 0) {
            return NextResponse.json(
                { error: 'Invalid payment amount provided.' },
                { status: 400 }
            );
        }

        normalizedPaymentAmount = Number(normalizedPaymentAmount.toFixed(2));
        const normalizedPaymentCurrency = (paymentCurrency || 'INR').toUpperCase();

        // Generate unique ID for hosted one-pager
        const hostedId = uuidv4();

        // Clean customColors to remove undefined values
        const cleanedCustomColors = cleanResumeDataForFirebase(customColors || {});

        // Prepare the hosted one-pager data with source reference
        const hostedOnePagerData = {
            // Source resume reference for dynamic updates
            sourceResumeId: resumeId || null,
            sourceUserId: resumeData.userId || user.uid || null,

            // CRITICAL: Type discriminator
            resumeType: 'one-pager',
            isOnePager: true,

            // Metadata for template/preferences
            template: template || 'classic',
            customColors: cleanedCustomColors,
            language: language || 'en',
            country: country || 'in',
            resumeName: resumeName || 'One-Pager Resume',

            // Store one-pager snapshot data
            snapshotData: cleanResumeDataForFirebase({
                ...resumeData,
                template: template || resumeData.template || 'classic',
                customColors: cleanedCustomColors,
                language: language || resumeData.language || 'en',
                country: country || resumeData.country || 'in',
            }),

            // Settings
            downloadEnabled: normalizedPaymentAmount === 0,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            originalUserId: resumeData.userId || user.uid || null,
            isActive: true,
            useDynamicData: true, // Always fetch latest from source
            paymentAmount: normalizedPaymentAmount,
            paymentCurrency: normalizedPaymentCurrency,
            paymentStatus: normalizedPaymentAmount > 0 ? 'pending' : 'not_required',
            latestPaymentOrder: null,
            locked: false,
            editEnabled: false // One-pagers typically don't have edit feature
        };

        console.log('📤 Exporting hosted one-pager:', {
            hostedId,
            sourceResumeId: resumeId,
            sourceUserId: hostedOnePagerData.sourceUserId,
            resumeName,
            resumeType: 'one-pager'
        });

        // Save to Firestore using Admin SDK (same collection as regular resumes)
        const hostedResumeRef = adminDb.collection('hostedResumes').doc(hostedId);
        await hostedResumeRef.set(hostedOnePagerData);

        // Return the hosted URL
        const hostedUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/hosted-one-pager/${hostedId}`;

        return NextResponse.json({
            success: true,
            hostedId,
            hostedUrl,
            message: 'One-pager exported successfully'
        });

    } catch (error) {
        console.error('Error exporting one-pager:', error);
        return NextResponse.json(
            { error: 'Failed to export one-pager' },
            { status: 500 }
        );
    }
}
