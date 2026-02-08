import { adminDb } from '../../lib/firebase';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const {
      leadId,
      supportStatus,
      conversionTime,
      conversionValue,
      planType,
      assignedAgent,
      agentName,
      conversionNotes,
      supportNotes
    } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };

    // Add conversion-specific fields if provided
    if (supportStatus) updateData.supportStatus = supportStatus;
    if (conversionTime) updateData.conversionTime = conversionTime;
    if (conversionValue) updateData.conversionValue = parseInt(conversionValue);
    if (planType) updateData.planType = planType;
    if (assignedAgent) updateData.assignedAgent = assignedAgent;
    if (agentName) updateData.agentName = agentName;
    if (conversionNotes) updateData.conversionNotes = conversionNotes;
    if (supportNotes) updateData.supportNotes = supportNotes;

    // Update the document
    await adminDb
      .collection("live_analytics_data")
      .doc(leadId)
      .update(updateData);

    console.log(`✅ Successfully updated conversion for lead: ${leadId}`);

    return NextResponse.json({
      success: true,
      message: "Conversion updated successfully",
      leadId,
      updateData
    });

  } catch (error) {
    console.error("❌ Error updating conversion:", error);
    return NextResponse.json(
      {
        error: "Failed to update conversion",
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const {
      leadId,
      contactAttempts,
      callCount,
      emailCount,
      whatsappCount,
      totalCallDuration,
      supportNotes,
      lastActiveAt,
      // Additional fields for lead claiming
      assignedAgent,
      agentName,
      supportStatus,
      firstContactTime,
      ...otherUpdates
    } = await req.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
      lastActiveAt: lastActiveAt || new Date()
    };

    // Contact attempt fields
    if (contactAttempts) updateData.contactAttempts = contactAttempts;
    if (typeof callCount === 'number') updateData.callCount = callCount;
    if (typeof emailCount === 'number') updateData.emailCount = emailCount;
    if (typeof whatsappCount === 'number') updateData.whatsappCount = whatsappCount;
    if (typeof totalCallDuration === 'number') updateData.totalCallDuration = totalCallDuration;
    if (supportNotes) updateData.supportNotes = supportNotes;

    // Lead claiming fields
    if (assignedAgent) updateData.assignedAgent = assignedAgent;
    if (agentName) updateData.agentName = agentName;
    if (supportStatus) updateData.supportStatus = supportStatus;
    if (firstContactTime) updateData.firstContactTime = firstContactTime;

    // Include any other updates passed
    Object.assign(updateData, otherUpdates);

    // Update the document
    await adminDb
      .collection("live_analytics_data")
      .doc(leadId)
      .update(updateData);

    console.log(`✅ Successfully updated lead data for: ${leadId}`, updateData);

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      leadId,
      updateData
    });

  } catch (error) {
    console.error("❌ Error updating contact attempts:", error);
    return NextResponse.json(
      {
        error: "Failed to update contact attempts",
        details: error.message
      },
      { status: 500 }
    );
  }
}
