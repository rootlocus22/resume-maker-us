'use server';

import { adminDb } from '../lib/firebase-admin';

export async function logClientError(errorData) {
    try {
        if (!adminDb) {
            console.error('Firebase Admin not initialized');
            return { success: false, error: 'Firebase Admin not initialized' };
        }

        const {
            message,
            stack,
            digest,
            cause,
            url,
            path,
            userAgent,
            timestamp = new Date().toISOString()
        } = errorData;

        await adminDb.collection('client_error_logs').add({
            message: message || 'Unknown Error',
            stack: stack || null,
            digest: digest || null, // Critical for Next.js error matching
            cause: cause ? JSON.stringify(cause, Object.getOwnPropertyNames(cause)) : null,
            url: url || null,
            path: path || null,
            userAgent: userAgent || null,
            timestamp,
            serverTimestamp: new Date()
        });

        return { success: true };
    } catch (err) {
        console.error('Failed to log client error:', err);
        return { success: false, error: err.message };
    }
}
