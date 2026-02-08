import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // For now, return empty history since we're not using Firebase
    // This prevents the permission errors
    return NextResponse.json({
      history: [],
      message: "History endpoint ready"
    });

  } catch (error) {
    console.error("Error fetching interview history:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview history" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, history } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // For now, just acknowledge the save request
    // The actual saving is handled client-side with localStorage
    return NextResponse.json({
      message: "History save acknowledged",
      success: true
    });

  } catch (error) {
    console.error("Error saving interview history:", error);
    return NextResponse.json(
      { error: "Failed to save interview history" },
      { status: 500 }
    );
  }
} 