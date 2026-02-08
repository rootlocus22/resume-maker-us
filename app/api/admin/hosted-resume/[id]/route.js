import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

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
const adminAuth = getAuth();

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { downloadEnabled, locked, editEnabled } = body || {};
    
    // Check if user is admin (rahuldubey220890@gmail.com)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the Firebase ID token
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin by checking agent_admin attribute in Firestore
    try {
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userData = userDoc.data();
      const isAgentAdmin = userData.agent_admin === true;
      
      console.log('🔍 Admin API Check:', {
        userEmail: decodedToken.email,
        agent_admin: userData.agent_admin,
        isAgentAdmin
      });
      
      if (!isAgentAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Update fields using Admin SDK
    const hostedResumeRef = adminDb.collection('hostedResumes').doc(id);
    const updateData = {};

    if (typeof downloadEnabled === 'boolean') {
      updateData.downloadEnabled = downloadEnabled;
    }

    if (typeof locked === 'boolean') {
      updateData.locked = locked;
    }

    if (typeof editEnabled === 'boolean') {
      updateData.editEnabled = editEnabled;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided to update' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    await hostedResumeRef.update(updateData);

    return NextResponse.json({
      success: true,
      ...updateData,
      message: 'Hosted resume updated successfully'
    });

  } catch (error) {
    console.error('Error updating hosted resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume permissions' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if user is admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the Firebase ID token
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin by checking agent_admin attribute in Firestore
    try {
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userData = userDoc.data();
      const isAgentAdmin = userData.agent_admin === true;
      
      console.log('🔍 Admin API Check:', {
        userEmail: decodedToken.email,
        agent_admin: userData.agent_admin,
        isAgentAdmin
      });
      
      if (!isAgentAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Get the hosted resume data using Admin SDK
    const hostedResumeRef = adminDb.collection('hostedResumes').doc(id);
    const hostedResumeSnap = await hostedResumeRef.get();

    if (!hostedResumeSnap.exists) {
      return NextResponse.json({ error: 'Hosted resume not found' }, { status: 404 });
    }

    const data = hostedResumeSnap.data();
    
    return NextResponse.json({
      hostedId: id,
      downloadEnabled: data.downloadEnabled || false,
      locked: data.locked || false,
      editEnabled: data.editEnabled || false,
      sourceUserId: data.sourceUserId || null,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      isActive: data.isActive,
      hostedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/hosted-resume/${id}`
    });

  } catch (error) {
    console.error('Error fetching hosted resume status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume status' },
      { status: 500 }
    );
  }
}
