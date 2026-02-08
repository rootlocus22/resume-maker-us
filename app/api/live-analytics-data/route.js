import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

/**
 * POST - Store new live analytics data
 */
export async function POST(req) {
  try {
    const analyticsData = await req.json();
    
    // Add server-side timestamp
    analyticsData.createdAt = new Date();
    analyticsData.updatedAt = new Date();
    
    // Store in Firestore
    const docRef = await adminDb.collection("live_analytics_data").add(analyticsData);
    
    console.log(`✅ Live analytics data stored with ID: ${docRef.id}`);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Live analytics data stored successfully"
    });
    
  } catch (error) {
    console.error("Error storing live analytics data:", error);
    return NextResponse.json(
      { 
        error: "Failed to store live analytics data", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve live analytics data with filters
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const timeFilter = searchParams.get('timeFilter') || '1h'; // 30m, 1h, 2h, 3h, 6h, 12h, 24h
    const entryPoint = searchParams.get('entryPoint');
    const supportStatus = searchParams.get('supportStatus');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const search = searchParams.get('search');

    // Calculate time threshold
    const now = new Date();
    const timeThresholds = {
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '2h': 2 * 60 * 60 * 1000,
      '3h': 3 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };
    
    const timeThreshold = new Date(now.getTime() - (timeThresholds[timeFilter] || timeThresholds['1h']));

    // Build query - get all records and filter client-side for better date handling
    let query = adminDb.collection("live_analytics_data")
      .orderBy("createdAt", "desc");
    
    // Apply filters
    if (entryPoint) {
      query = query.where("entryPoint", "==", entryPoint);
    }
    
    if (supportStatus) {
      query = query.where("supportStatus", "==", supportStatus);
    }
    
    if (priority) {
      query = query.where("supportPriority", "==", priority);
    }

    // Execute query
    const snapshot = await query.limit(limit).get();
    
    let data = snapshot.docs.map(doc => {
      const docData = doc.data();
      
      // Helper function to convert various date formats to Date object
      const parseDate = (dateValue) => {
        if (!dateValue) return null;
        if (dateValue.toDate && typeof dateValue.toDate === 'function') {
          return dateValue.toDate(); // Firestore Timestamp
        }
        if (typeof dateValue === 'string') {
          return new Date(dateValue); // ISO string
        }
        if (dateValue instanceof Date) {
          return dateValue; // Already a Date
        }
        if (dateValue._seconds) {
          return new Date(dateValue._seconds * 1000); // Firestore timestamp object
        }
        return new Date(dateValue); // Fallback
      };
      
      return {
        id: doc.id,
        ...docData,
        createdAt: parseDate(docData.createdAt),
        updatedAt: parseDate(docData.updatedAt),
        lastActiveAt: parseDate(docData.lastActiveAt),
      };
    });

    // Apply time filter client-side (better handling of mixed date formats)
    data = data.filter(record => {
      if (!record.createdAt) return false;
      const recordDate = new Date(record.createdAt);
      return recordDate >= timeThreshold;
    });

    // Apply search filter (client-side for complex fields)
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(record => {
        return (
          record.profile?.name?.toLowerCase().includes(searchLower) ||
          record.profile?.email?.toLowerCase().includes(searchLower) ||
          record.profile?.phone?.includes(search) ||
          record.profile?.jobTitle?.toLowerCase().includes(searchLower) ||
          record.profile?.address?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Calculate statistics
    const stats = {
      totalRecords: data.length,
      entryPointBreakdown: {},
      statusBreakdown: {},
      priorityBreakdown: {},
      deviceBreakdown: {},
      averageExperience: 0,
    };

    data.forEach(record => {
      // Entry point breakdown
      stats.entryPointBreakdown[record.entryPoint] = 
        (stats.entryPointBreakdown[record.entryPoint] || 0) + 1;
      
      // Status breakdown
      stats.statusBreakdown[record.supportStatus] = 
        (stats.statusBreakdown[record.supportStatus] || 0) + 1;
      
      // Priority breakdown
      stats.priorityBreakdown[record.supportPriority] = 
        (stats.priorityBreakdown[record.supportPriority] || 0) + 1;
      
      // Device breakdown
      stats.deviceBreakdown[record.deviceType] = 
        (stats.deviceBreakdown[record.deviceType] || 0) + 1;
    });

    // Calculate average experience
    const totalExperience = data.reduce((sum, record) => 
      sum + (record.profile?.yearsOfExperience || 0), 0);
    stats.averageExperience = data.length > 0 ? 
      Math.round(totalExperience / data.length * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      data,
      stats,
      filters: {
        timeFilter,
        entryPoint,
        supportStatus,
        priority,
        search,
        limit
      }
    });

  } catch (error) {
    console.error("Error fetching live analytics data:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch live analytics data", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
