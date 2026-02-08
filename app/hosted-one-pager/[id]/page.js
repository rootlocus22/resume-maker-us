import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import OnePagerPreview from '../../components/OnePagerPreview';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const adminDb = getFirestore();

async function getHostedOnePager(id) {
    try {
        console.log('🔍 Fetching hosted one-pager with ID:', id);
        const docRef = adminDb.collection('hostedResumes').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log('❌ Document does not exist for ID:', id);
            return null;
        }

        const data = docSnap.data();
        console.log('📄 Document found, resumeType:', data.resumeType);

        // Verify this is a one-pager
        if (data.resumeType !== 'one-pager') {
            console.log('⚠️ Not a one-pager. Type:', data.resumeType);
            return null;
        }

        console.log('✅ One-pager data loaded successfully');
        return {
            id: docSnap.id,
            ...data
        };
    } catch (error) {
        console.error('❌ Error fetching hosted one-pager:', error);
        return null;
    }
}

export default async function HostedOnePagerPage({ params }) {
    const { id } = await params;
    const hostedData = await getHostedOnePager(id);

    if (!hostedData) {
        notFound();
    }

    // Check if locked
    if (hostedData.locked) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Locked</h1>
                    <p className="text-gray-600">
                        This resume has been temporarily locked by the owner. Please contact them for access.
                    </p>
                </div>
            </div>
        );
    }

    // Check if expired
    const expiresAt = hostedData.expiresAt ? new Date(hostedData.expiresAt) : null;
    if (expiresAt && expiresAt < new Date()) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
                    <p className="text-gray-600">
                        This resume link has expired. Please request a new link from the owner.
                    </p>
                </div>
            </div>
        );
    }

    // Import and use client component for interactive UI
    const HostedOnePagerClient = (await import('./HostedOnePagerClient')).default;

    // Helper to serialize data (convert Timestamps to strings recursively)
    const serializeData = (data) => {
        if (!data) return data;

        if (Array.isArray(data)) {
            return data.map(item => serializeData(item));
        }

        if (typeof data === 'object') {
            // Handle Firestore Timestamp
            if (data.toDate && typeof data.toDate === 'function') {
                return data.toDate().toISOString();
            }

            // Handle object with _seconds (sometimes Timestamps appear this way)
            if (data._seconds !== undefined && data._nanoseconds !== undefined) {
                return new Date(data._seconds * 1000).toISOString();
            }

            // Handle Date objects
            if (data instanceof Date) {
                return data.toISOString();
            }

            // Recursively handle object properties
            const serialized = {};
            for (const key in data) {
                serialized[key] = serializeData(data[key]);
            }
            return serialized;
        }

        return data;
    };

    // Serialize data for client component
    const serializedData = serializeData({
        ...hostedData,
        id
    });

    return <HostedOnePagerClient hostedData={serializedData} />;
}
