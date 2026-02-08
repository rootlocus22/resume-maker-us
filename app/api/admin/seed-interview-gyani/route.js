import { adminDb as db } from '../../../lib/firebase-admin';
import { getExpandedRoles } from '../../../lib/interview-gyani/roleExpander';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const batch = db.batch();
        const collectionRef = db.collection('interview_roles');
        let count = 0;

        const roles = getExpandedRoles();

        for (const role of roles) {
            // Use slug as the document ID for easy lookup
            const docRef = collectionRef.doc(role.slug);
            batch.set(docRef, {
                ...role,
                updatedAt: new Date().toISOString()
            });
            count++;
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${count} roles to Firestore 'interview_roles' collection.`
        });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
