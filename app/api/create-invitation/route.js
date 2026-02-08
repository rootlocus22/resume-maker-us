import { NextResponse } from 'next/server';
import { createInvitation } from '../../lib/teamManagement';

export async function POST(request) {
  try {
    const { adminUserId, memberData, invitedBy, inviterDetails } = await request.json();

    if (!adminUserId || !memberData || !invitedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: adminUserId, memberData, invitedBy' },
        { status: 400 }
      );
    }

    // Call the server-side createInvitation function
    const result = await createInvitation(adminUserId, memberData, invitedBy, inviterDetails);

    return NextResponse.json({
      success: true,
      invitation: result
    });

  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation', details: error.message },
      { status: 500 }
    );
  }
}
