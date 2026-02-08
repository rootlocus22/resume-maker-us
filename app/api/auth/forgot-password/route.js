import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/sendEmail";

// Helper to get Admin Auth
async function getAdminAuth() {
    const { getApps, initializeApp, cert } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");

    const apps = getApps();
    let adminApp = apps.find(app => app.name === '[DEFAULT]');

    if (!adminApp) {
        if (process.env.FIREBASE_PRIVATE_KEY) {
            adminApp = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                }),
            });
        }
    }
    // If still no app (e.g. client side env vars missing on server), it might throw.
    return getAuth(adminApp);
}

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const auth = await getAdminAuth();

        // Generate the password reset link
        // checks if user exists implicitly? generatePasswordResetLink throws if user not found?
        // Documentation says: Generates the out-of-band email action link for password reset flows.
        // Throws if user not found? No, typically it generates a link. But if we want to confirm user exists first:
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                // For security, checking existence is sensitive. But for UX we often want to tell them.
                // Let's pretend success to prevent enumeration if desired, OR return error.
                // Client side logic currently handles "user-not-found".
                // Let's return error to match client logic.
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            throw e;
        }

        const link = await auth.generatePasswordResetLink(email);

        // Send the email
        // Determine domain (US vs Generic/India) based on headers or default.
        // Ideally we pass this from client or infer.
        // For now, default to check host header if possible, or just pass generic.
        // ClientForgotPassword doesn't pass domain info yet.
        // Let's guess based on request headers or default to .in

        // Check origin for domain
        const host = req.headers.get('host') || 'expertresume.us';
        const isUSDomain = host.includes('expertresume.com');

        const emailResult = await sendEmail({
            templateId: "resetPassword",
            email: email,
            data: {
                firstName: userRecord.displayName ? userRecord.displayName.split(' ')[0] : 'there',
                email: email,
                resetLink: link,
                isUSDomain: isUSDomain
            }
        });

        if (!emailResult.success) {
            throw new Error("Failed to send email");
        }

        return NextResponse.json({ success: true, message: "Password reset email sent" });

    } catch (error) {
        console.error("Error in forgot-password API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
