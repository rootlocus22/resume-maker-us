import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import "../../../lib/firebase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) return NextResponse.json({ error: "memberId is required" }, { status: 400 });

    const db = getFirestore();

    const readCollection = async (col) => {
      const convertTimestamps = (data) => {
        // Convert Firestore Timestamps to ISO strings for JSON serialization
        const converted = { ...data };
        if (converted.timestamp && converted.timestamp._seconds) {
          converted.timestamp = new Date(converted.timestamp._seconds * 1000).toISOString();
        }
        if (converted.createdAt && typeof converted.createdAt === 'object' && converted.createdAt._seconds) {
          converted.createdAt = new Date(converted.createdAt._seconds * 1000).toISOString();
        }
        if (converted.updatedAt && typeof converted.updatedAt === 'object' && converted.updatedAt._seconds) {
          converted.updatedAt = new Date(converted.updatedAt._seconds * 1000).toISOString();
        }
        return converted;
      };

      try {
        // Try with createdAt ordering first
        const snap = await db.collection("users").doc(memberId).collection(col).orderBy("createdAt", "desc").limit(200).get();
        console.log(`✅ Loaded ${snap.docs.length} ${col} entries`);
        return snap.docs.map((d) => convertTimestamps({ id: d.id, ...d.data() }));
      } catch (error) {
        // If createdAt doesn't exist, try with timestamp
        console.log(`⚠️ createdAt not indexed for ${col}, trying timestamp...`);
        try {
          const snap = await db.collection("users").doc(memberId).collection(col).orderBy("timestamp", "desc").limit(200).get();
          console.log(`✅ Loaded ${snap.docs.length} ${col} entries (using timestamp)`);
          return snap.docs.map((d) => convertTimestamps({ id: d.id, ...d.data() }));
        } catch (error2) {
          // If both fail, get without ordering
          console.log(`⚠️ No indexes for ${col}, loading without ordering...`);
          const snap = await db.collection("users").doc(memberId).collection(col).limit(200).get();
          console.log(`✅ Loaded ${snap.docs.length} ${col} entries (unordered)`);
          return snap.docs.map((d) => convertTimestamps({ id: d.id, ...d.data() }));
        }
      }
    };

    const [clients, resumes, uploadHistory, atsCheckerHistory, jdResumeHistory, activity] = await Promise.all([
      readCollection("clients"),
      readCollection("resumes"),
      readCollection("uploadHistory"),
      readCollection("atsCheckerHistory"),
      readCollection("jdResumeHistory"),
      readCollection("activity"),
    ]);

    console.log(`📊 Summary: ${clients.length} clients, ${resumes.length} resumes, ${uploadHistory.length} uploads, ${atsCheckerHistory.length} ATS checks, ${jdResumeHistory.length} JD resumes, ${activity.length} activities`);
    
    // Debug upload history
    if (uploadHistory.length > 0) {
      console.log('📤 Upload History Details:');
      uploadHistory.forEach((upload, idx) => {
        console.log(`  [${idx}] ID: ${upload.id}, File: ${upload.fileName}, HasCreatedAt: ${!!upload.createdAt}, HasTimestamp: ${!!upload.timestamp}`);
      });
    } else {
      console.log('⚠️ No upload history found for member:', memberId);
    }

    return NextResponse.json({
      memberId,
      clients,
      resumes,
      uploadHistory,
      atsCheckerHistory,
      jdResumeHistory,
      activity,
    });
  } catch (error) {
    console.error("get-member-details error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}


