import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase-admin";
import { searchJobs } from "../../lib/jsearch";

const CRON_SECRET = process.env.CRON_SECRET;

const shouldAuthorize = (request) => {
  if (!CRON_SECRET) return true;
  const secret = request.headers.get("x-cron-secret");
  return secret === CRON_SECRET;
};

const getTodayKey = () => new Date().toISOString().split("T")[0];

async function sendDailyDigests(request) {
  if (!shouldAuthorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Admin DB unavailable" }, { status: 500 });
  }

  const todayKey = getTodayKey();
  const origin = new URL(request.url).origin;
  const usersSnap = await adminDb
    .collection("users")
    .where("jobSearchAlerts.alertsEnabled", "==", true)
    .get();

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of usersSnap.docs) {
    const user = doc.data();
    const email = user?.email;
    const alerts = user?.jobSearchAlerts || {};
    const lastDigestSentAt = alerts?.lastDigestSentAt;
    const lastQuery = alerts?.lastQuery;

    if (!email || !lastQuery) {
      skipped += 1;
      continue;
    }

    if (typeof lastDigestSentAt === "string" && lastDigestSentAt.startsWith(todayKey)) {
      skipped += 1;
      continue;
    }

    try {
      const result = await searchJobs({
        query: lastQuery,
        date_posted: "3days",
        num_pages: 1,
      });
      const jobs = Array.isArray(result?.data) ? result.data.slice(0, 5) : [];

      const emailResponse = await fetch(`${origin}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: "daily_job_digest",
          userId: doc.id,
          email,
          data: { jobs, query: lastQuery },
        }),
      });

      if (!emailResponse.ok) {
        failed += 1;
        continue;
      }

      await adminDb.collection("users").doc(doc.id).set(
        {
          jobSearchAlerts: {
            lastDigestSentAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );
      sent += 1;
    } catch (error) {
      console.error("Digest send error:", doc.id, error);
      failed += 1;
    }
  }

  return NextResponse.json({ sent, skipped, failed });
}

export async function GET(request) {
  return sendDailyDigests(request);
}

export async function POST(request) {
  return sendDailyDigests(request);
}

