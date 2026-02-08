import { adminDb as db } from '../../../lib/firebase-admin';
import { NextResponse } from 'next/server';

// Allowed collections for security
const ALLOWED_COLLECTIONS = [
    'interview_roles',
    'job_seo_pages',
    'global_roles'
];

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const collectionName = searchParams.get('collection');
        const limit = parseInt(searchParams.get('limit') || '50');
        // Simple pagination could be added with startAfter, but for now basic listing is fine.

        if (!ALLOWED_COLLECTIONS.includes(collectionName)) {
            return NextResponse.json({ error: 'Invalid or restricted collection' }, { status: 400 });
        }

        const snapshot = await db.collection(collectionName).limit(limit).get();

        // Transform specifically for the dashboard
        const documents = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Normalize specific fields for the table preview
                _previewTitle: data.title || data.h1_title || data.slug,
                _updatedAt: data.updatedAt || data.updated_at || data.created_at
            };
        });

        return NextResponse.json({
            success: true,
            count: documents.length,
            documents
        });

    } catch (error) {
        console.error("Admin API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { collection, docId, data } = body;

        if (!ALLOWED_COLLECTIONS.includes(collection)) {
            return NextResponse.json({ error: 'Invalid or restricted collection' }, { status: 400 });
        }

        if (!docId || !data) {
            return NextResponse.json({ error: 'Missing docId or data' }, { status: 400 });
        }

        await db.collection(collection).doc(docId).update({
            ...data,
            updatedAt: new Date().toISOString() // Ensure timestamp update
        });

        return NextResponse.json({ success: true, message: 'Document updated successfully' });

    } catch (error) {
        console.error("Admin API Update Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
