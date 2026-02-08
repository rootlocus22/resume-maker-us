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

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { resumeData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }

    // Get the hosted resume document
    const hostedRef = adminDb.collection('hostedResumes').doc(id);
    const hostedSnap = await hostedRef.get();

    if (!hostedSnap.exists) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Update the snapshot data
    await hostedRef.update({
      snapshotData: resumeData,
      updatedAt: new Date(),
      // Keep other fields intact
    });

    console.log('✅ Updated hosted resume:', id);

    return NextResponse.json({
      success: true,
      message: 'Resume updated successfully'
    });

  } catch (error) {
    console.error('Error updating hosted resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume data', details: error.message },
      { status: 500 }
    );
  }
}

