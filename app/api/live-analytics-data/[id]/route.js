import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase";

/**
 * GET - Fetch a specific analytics record by ID
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    const doc = await adminDb.collection("live_analytics_data").doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Analytics record not found" }, 
        { status: 404 }
      );
    }
    
    const data = doc.data();
    
    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        lastActiveAt: data.lastActiveAt?.toDate?.() || data.lastActiveAt,
      }
    });
    
  } catch (error) {
    console.error("Error fetching analytics record:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics record", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update an analytics record (for support actions)
 */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const updates = await req.json();
    
    // Add timestamp
    updates.updatedAt = new Date();
    updates.lastActiveAt = new Date();
    
    await adminDb.collection("live_analytics_data").doc(id).update(updates);
    
    console.log(`✅ Analytics record updated with ID: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: "Analytics record updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating analytics record:", error);
    return NextResponse.json(
      { 
        error: "Failed to update analytics record", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete an analytics record
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    
    await adminDb.collection("live_analytics_data").doc(id).delete();
    
    console.log(`✅ Analytics record deleted with ID: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: "Analytics record deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting analytics record:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete analytics record", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
