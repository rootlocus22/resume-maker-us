// app/api/admin/allowed-emails/route.js
// Manage allowed admin emails for feedback dashboard
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase";

const SUPER_ADMIN_EMAIL = "rahuldubey220890@gmail.com";

// Helper to verify super admin access
async function verifySuperAdmin(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Unauthorized' };
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    const adminAuthModule = await import("../../../lib/firebase-admin");
    const { adminAuth } = adminAuthModule;
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    return { authorized: false, error: 'Invalid token' };
  }

  if (decodedToken.email !== SUPER_ADMIN_EMAIL) {
    return { authorized: false, error: 'Super admin access required' };
  }

  return { authorized: true };
}

// GET - Fetch all allowed admin emails
export async function GET(request) {
  try {
    const doc = await adminDb.collection("admin_config").doc("feedback_dashboard_access").get();
    
    if (!doc.exists) {
      // Initialize with default admin email
      await adminDb.collection("admin_config").doc("feedback_dashboard_access").set({
        allowedEmails: [SUPER_ADMIN_EMAIL],
        updatedAt: new Date(),
        updatedBy: "system"
      });
      
      return NextResponse.json({
        success: true,
        allowedEmails: [SUPER_ADMIN_EMAIL]
      });
    }

    const data = doc.data();
    return NextResponse.json({
      success: true,
      allowedEmails: data.allowedEmails || [SUPER_ADMIN_EMAIL]
    });
  } catch (error) {
    console.error("Error fetching allowed emails:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch allowed emails" },
      { status: 500 }
    );
  }
}

// POST - Add a new admin email (super admin only)
export async function POST(request) {
  try {
    const authCheck = await verifySuperAdmin(request);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 401 }
      );
    }

    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Get current list
    const doc = await adminDb.collection("admin_config").doc("feedback_dashboard_access").get();
    const currentData = doc.exists ? doc.data() : { allowedEmails: [SUPER_ADMIN_EMAIL] };
    const allowedEmails = currentData.allowedEmails || [SUPER_ADMIN_EMAIL];

    // Check if already exists
    if (allowedEmails.includes(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Email already has access" },
        { status: 400 }
      );
    }

    // Add new email
    allowedEmails.push(normalizedEmail);

    // Get current user email from token
    const token = request.headers.get('authorization')?.split(' ')[1];
    const adminAuthModule = await import("../../../lib/firebase-admin");
    const { adminAuth } = adminAuthModule;
    const decodedToken = await adminAuth.verifyIdToken(token);
    const updatedBy = decodedToken.email;

    await adminDb.collection("admin_config").doc("feedback_dashboard_access").set({
      allowedEmails,
      updatedAt: new Date(),
      updatedBy
    });

    return NextResponse.json({
      success: true,
      message: "Email added successfully",
      allowedEmails
    });
  } catch (error) {
    console.error("Error adding admin email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add email" },
      { status: 500 }
    );
  }
}

// DELETE - Remove an admin email (super admin only)
export async function DELETE(request) {
  try {
    const authCheck = await verifySuperAdmin(request);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Prevent removing super admin
    if (normalizedEmail === SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, error: "Cannot remove super admin" },
        { status: 400 }
      );
    }

    // Get current list
    const doc = await adminDb.collection("admin_config").doc("feedback_dashboard_access").get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "No admin config found" },
        { status: 404 }
      );
    }

    const currentData = doc.data();
    const allowedEmails = currentData.allowedEmails || [SUPER_ADMIN_EMAIL];

    // Remove email
    const updatedEmails = allowedEmails.filter(e => e !== normalizedEmail);

    // Get current user email from token
    const token = request.headers.get('authorization')?.split(' ')[1];
    const adminAuthModule = await import("../../../lib/firebase-admin");
    const { adminAuth } = adminAuthModule;
    const decodedToken = await adminAuth.verifyIdToken(token);
    const updatedBy = decodedToken.email;

    await adminDb.collection("admin_config").doc("feedback_dashboard_access").set({
      allowedEmails: updatedEmails,
      updatedAt: new Date(),
      updatedBy
    });

    return NextResponse.json({
      success: true,
      message: "Email removed successfully",
      allowedEmails: updatedEmails
    });
  } catch (error) {
    console.error("Error removing admin email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove email" },
      { status: 500 }
    );
  }
}
