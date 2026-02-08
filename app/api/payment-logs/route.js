import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const transactionsSnapshot = await adminDb
      .collection("payment_logs")
      .where("userId", "==", userId)
      .get();

    const transactions = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();

      // Handle timestamp conversion safely
      let timestampISO;
      try {
        if (data.timestamp && typeof data.timestamp.toDate === 'function') {
          // Firestore Timestamp object
          timestampISO = data.timestamp.toDate().toISOString();
        } else if (data.timestamp && typeof data.timestamp.toISOString === 'function') {
          // Already a Date object
          timestampISO = data.timestamp.toISOString();
        } else if (typeof data.timestamp === 'string') {
          // Already an ISO string
          timestampISO = data.timestamp;
        } else if (typeof data.timestamp === 'number') {
          // Unix timestamp
          timestampISO = new Date(data.timestamp).toISOString();
        } else {
          // Fallback to current time
          timestampISO = new Date().toISOString();
        }
      } catch (timestampError) {
        console.warn('Error converting timestamp:', timestampError);
        timestampISO = new Date().toISOString();
      }

      return {
        id: doc.id,
        ...data,
        timestamp: timestampISO,
      };
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment logs:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const data = await request.json();
    const {
      userId,
      userInfo,
      paymentId,
      orderId,
      amount,
      currency,
      status,
      billingCycle
    } = data;

    // Basic validation
    if (!status || !amount || !currency) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const logData = {
      ...data,
      timestamp: new Date(), // Use server-side timestamp
      createdAt: new Date().toISOString()
    };

    // Use different collection for development to strictly separate test data
    const paymentCollectionName = process.env.NODE_ENV === 'development' ? "payment_logs_test" : "payment_logs";

    // Use adminDb to bypass client-side rules (essential for Guest users)
    const docRef = await adminDb.collection(paymentCollectionName).add(logData);

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Error logging payment:", error);
    return NextResponse.json({ error: "Failed to log payment" }, { status: 500 });
  }
}