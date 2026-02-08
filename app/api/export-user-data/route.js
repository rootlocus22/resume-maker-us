import { NextResponse } from "next/server";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Collect all user data
    const userData = {
      exportedAt: new Date().toISOString(),
      userId: userId,
      dataTypes: [],
      personalInformation: {},
      resumes: [],
      coverLetters: [],
      settings: {},
      paymentHistory: [],
      activityLogs: [],
      dataRequests: []
    };

    // Get basic user information
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userInfo = userDoc.data();
        userData.personalInformation = {
          email: userInfo.email || "",
          displayName: userInfo.displayName || "",
          plan: userInfo.plan || "free",
          createdAt: userInfo.createdAt || "",
          lastLoginAt: userInfo.lastLoginAt || "",
          profilePicture: userInfo.profilePicture || "",
          preferences: userInfo.preferences || {},
          subscription: userInfo.subscription || {},
          usage: {
            previewCount: userInfo.preview_count || 0,
            resumeCount: userInfo.resume_count || 0,
            downloadCount: userInfo.download_count || 0
          }
        };
        userData.dataTypes.push("Personal Information");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }

    // Get user profile data
    try {
      const profileDoc = await getDoc(doc(db, "users", userId, "profile", "userProfile"));
      if (profileDoc.exists()) {
        userData.personalInformation.profile = profileDoc.data();
        userData.dataTypes.push("Profile Data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }

    // Get resumes
    try {
      const resumesRef = collection(db, "users", userId, "resumes");
      const resumesSnapshot = await getDocs(resumesRef);
      userData.resumes = resumesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Remove sensitive or unnecessary fields
        userId: undefined
      }));
      if (userData.resumes.length > 0) {
        userData.dataTypes.push("Resumes");
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }

    // Get cover letters
    try {
      const coverLettersRef = collection(db, "users", userId, "coverLetters");
      const coverLettersSnapshot = await getDocs(coverLettersRef);
      userData.coverLetters = coverLettersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId: undefined
      }));
      if (userData.coverLetters.length > 0) {
        userData.dataTypes.push("Cover Letters");
      }
    } catch (error) {
      console.error("Error fetching cover letters:", error);
    }

    // Get privacy settings
    try {
      const settingsDoc = await getDoc(doc(db, "users", userId, "settings", "privacy"));
      if (settingsDoc.exists()) {
        userData.settings.privacy = settingsDoc.data();
        userData.dataTypes.push("Privacy Settings");
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    }

    // Get notification settings
    try {
      const notificationDoc = await getDoc(doc(db, "users", userId, "settings", "notifications"));
      if (notificationDoc.exists()) {
        userData.settings.notifications = notificationDoc.data();
        userData.dataTypes.push("Notification Settings");
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    }

    // Get payment history (if available)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-logs?userId=${userId}`);
      if (response.ok) {
        const paymentData = await response.json();
        userData.paymentHistory = paymentData.transactions || [];
        if (userData.paymentHistory.length > 0) {
          userData.dataTypes.push("Payment History");
        }
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }

    // Get data requests
    try {
      const requestsRef = collection(db, "users", userId, "dataRequests");
      const requestsSnapshot = await getDocs(requestsRef);
      userData.dataRequests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId: undefined
      }));
      if (userData.dataRequests.length > 0) {
        userData.dataTypes.push("Data Requests");
      }
    } catch (error) {
      console.error("Error fetching data requests:", error);
    }

    // Add metadata about the export
    userData.metadata = {
      exportFormat: "JSON",
      exportVersion: "1.0",
      totalDataTypes: userData.dataTypes.length,
      complianceNote: "This export includes all personal data we have collected about you as required by CCPA",
      rightsInformation: {
        rightToKnow: "You have the right to know what personal information we collect and how we use it",
        rightToDelete: "You have the right to request deletion of your personal information",
        rightToOptOut: "You have the right to opt-out of the sale of your personal information",
        rightToNonDiscrimination: "We will not discriminate against you for exercising your privacy rights"
      },
      contactInformation: {
        email: "privacy@expertresume.com",
        phone: "+91 84312 56903",
        address: "Bangalore, Choodasandra 560035"
      }
    };

    // Create JSON response
    const jsonData = JSON.stringify(userData, null, 2);
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    );
  }
} 