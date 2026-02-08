import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
        const { hostedId, analysisResult, atsScore } = await request.json();

        if (!hostedId || !analysisResult) {
            return NextResponse.json({ error: 'Hosted ID and Analysis Result are required' }, { status: 400 });
        }

        // 1. Get hosted resume metadata to find source resume
        const hostedRef = adminDb.collection('hostedResumes').doc(hostedId);
        const hostedSnap = await hostedRef.get();

        if (!hostedSnap.exists) {
            return NextResponse.json({ error: 'Hosted resume not found' }, { status: 404 });
        }

        const hostedData = hostedSnap.data();
        const { sourceUserId, sourceResumeId } = hostedData;

        if (!sourceUserId || !sourceResumeId) {
            return NextResponse.json({ error: 'Source resume not linked' }, { status: 404 });
        }

        // 2. Update the source resume with ATS data
        const sourceResumeRef = adminDb
            .collection('users')
            .doc(sourceUserId)
            .collection('resumes')
            .doc(sourceResumeId);

        // Update specific fields relative to ATS
        // We update both the top-level fields (if used) and merge into stored data
        await sourceResumeRef.update({
            atsScore: atsScore,
            analysisResult: analysisResult,
            // Also update updatedAt to reflect change
            updatedAt: new Date().toISOString()
        });

        console.log(`✅ Cached ATS report for source resume: ${sourceResumeId} (Hosted: ${hostedId})`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving ATS result:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
