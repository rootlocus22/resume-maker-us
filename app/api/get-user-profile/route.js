import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
    }

    // Get user document
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({});
    }

    const userData = userDoc.data();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 });
  }
}
