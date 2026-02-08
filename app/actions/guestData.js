'use server';

import { adminDb } from '../lib/firebase-admin';
import { cleanResumeDataForFirebase } from '../lib/utils';

// Save guest data
export async function saveGuestData(clientId, data) {
    try {
        if (!adminDb) return { success: false, error: 'Database not available' };
        if (!clientId || !data) return { success: false, error: 'Missing required data' };

        // Sanitize data to remove undefined values (Firestore doesn't support them)
        const sanitizedData = cleanResumeDataForFirebase(data);

        await adminDb.collection('guest_users').doc(clientId).set({
            ...sanitizedData,
            lastUpdated: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days retention
        });

        return { success: true };
    } catch (error) {
        console.error('Error saving guest data:', error);
        return { success: false, error: error.message };
    }
}

// Load guest data
export async function loadGuestData(clientId) {
    try {
        if (!adminDb) return { success: false, error: 'Database not available' };
        if (!clientId) return { success: false, error: 'Missing client ID' };

        const doc = await adminDb.collection('guest_users').doc(clientId).get();

        if (!doc.exists) return { success: false, error: 'Not found' };

        return { success: true, data: doc.data() };
    } catch (error) {
        console.error('Error loading guest data:', error);
        return { success: false, error: error.message };
    }
}
