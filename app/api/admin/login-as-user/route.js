import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../lib/firebase-admin';

const ADMIN_EMAIL = 'rahuldubey220890@gmail.com';

// Helper to verify admin access
async function verifyAdminAccess(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Unauthorized' };
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    return { authorized: false, error: 'Invalid authentication token' };
  }

  // Check if user is admin
  if (decodedToken.email !== ADMIN_EMAIL) {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true, adminId: decodedToken.uid };
}

// Search users by email or user ID
export async function POST(request) {
  try {
    const { authorized, error, adminId } = await verifyAdminAccess(request);
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { searchQuery, searchType } = await request.json();

    if (!searchQuery || !searchType) {
      return NextResponse.json(
        { error: 'Search query and type are required' },
        { status: 400 }
      );
    }

    let userDoc = null;
    let userId = null;

    if (searchType === 'userId') {
      // Search by user ID
      userId = searchQuery.trim();
      userDoc = await adminDb.collection('users').doc(userId).get();
    } else if (searchType === 'email') {
      // Search by email - need to find user by email
      // First try to find in users collection by email field
      const usersSnapshot = await adminDb
        .collection('users')
        .where('email', '==', searchQuery.trim().toLowerCase())
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        userDoc = usersSnapshot.docs[0];
        userId = userDoc.id;
      } else {
        // Try Firebase Auth to find user by email
        try {
          const userRecord = await adminAuth.getUserByEmail(searchQuery.trim().toLowerCase());
          userId = userRecord.uid;
          userDoc = await adminDb.collection('users').doc(userId).get();
        } catch (authError) {
          // User might not exist in Firestore but exists in Auth
          userDoc = null;
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid search type. Use "email" or "userId"' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user auth record first (required for custom token)
    let authUser = null;
    try {
      authUser = await adminAuth.getUser(userId);
    } catch (error) {
      console.error('Error fetching auth user:', error);
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    // Get user data from Firestore
    // Note: In Admin SDK, exists is a property (boolean), not a method
    // If document doesn't exist, data() returns undefined
    let userData = null;
    if (userDoc) {
      try {
        const data = userDoc.data();
        if (data) {
          userData = data;
        }
      } catch (error) {
        // Document might not exist or be accessible
        console.log('Could not read user document data:', error);
      }
    }

    // Get profile references (firstResumeReference)
    const profileReferences = userData?.firstResumeReference || null;
    let activeProfiles = [];
    
    if (profileReferences) {
      if (Array.isArray(profileReferences)) {
        activeProfiles = profileReferences;
      } else {
        activeProfiles = [profileReferences];
      }
    }

    // Create custom token for impersonation
    let customToken = null;
    try {
      customToken = await adminAuth.createCustomToken(userId, {
        adminImpersonation: true,
        impersonatedBy: adminId,
        impersonatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating custom token:', error);
      return NextResponse.json(
        { error: 'Failed to create impersonation token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: userId,
        email: authUser?.email || userData?.email || 'N/A',
        displayName: authUser?.displayName || userData?.name || 'N/A',
        emailVerified: authUser?.emailVerified || false,
        createdAt: authUser?.metadata?.creationTime || null,
        lastSignIn: authUser?.metadata?.lastSignInTime || null,
      },
      userData: {
        plan: userData?.plan || 'anonymous',
        premium_expiry: userData?.premium_expiry || null,
        profileSlots: userData?.profileSlots || 0,
        name: userData?.name || '',
        phone: userData?.phone || '',
      },
      activeProfiles: activeProfiles,
      customToken: customToken,
      impersonatedBy: adminId,
      impersonatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in login-as-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

