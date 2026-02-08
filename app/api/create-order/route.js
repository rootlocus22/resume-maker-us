// DEPRECATED: This route now redirects to the Stripe checkout session flow.
// Kept for backward compatibility - new code should use /api/create-checkout-session
import { NextResponse } from "next/server";

export async function POST(request) {
  return NextResponse.json(
    { 
      error: "This endpoint is deprecated. Please use /api/create-checkout-session instead.",
      code: "DEPRECATED"
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
