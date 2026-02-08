import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase";
import { sendTemplateMessage, sendTextMessage, formatPhoneForWhatsApp, isValidPhoneNumber } from "../../../lib/whatsapp-cloud-api";

/**
 * API to send WhatsApp messages
 * POST /api/whatsapp/send-message
 * 
 * Usage examples:
 * 1. Send template message (for marketing/notifications)
 * 2. Send text message (within 24-hour window after user messages you)
 */

export async function POST(request) {
  try {
    const { 
      userId, 
      phone, 
      messageType = 'template', // 'template' or 'text'
      templateName,
      languageCode = 'en',
      components = [],
      text,
      metadata = {}
    } = await request.json();

    // Validation
    if (!phone && !userId) {
      return NextResponse.json(
        { error: 'Either phone or userId is required' },
        { status: 400 }
      );
    }

    let phoneNumber = phone;
    let userEmail = null;

    // If userId provided, fetch phone from user record
    if (userId) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const userData = userDoc.data();
      phoneNumber = userData.phone;
      userEmail = userData.email;

      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'User has no phone number registered' },
          { status: 400 }
        );
      }
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    
    if (!isValidPhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Send message based on type
    let result;

    if (messageType === 'template') {
      if (!templateName) {
        return NextResponse.json(
          { error: 'templateName is required for template messages' },
          { status: 400 }
        );
      }

      result = await sendTemplateMessage(
        formattedPhone,
        templateName,
        languageCode,
        components
      );
    } else if (messageType === 'text') {
      if (!text) {
        return NextResponse.json(
          { error: 'text is required for text messages' },
          { status: 400 }
        );
      }

      result = await sendTextMessage(formattedPhone, text);
    } else {
      return NextResponse.json(
        { error: 'Invalid messageType. Must be "template" or "text"' },
        { status: 400 }
      );
    }

    // Log message in Firestore
    await adminDb.collection('whatsapp_messages').add({
      messageId: result.messageId,
      to: formattedPhone,
      userId: userId || null,
      userEmail: userEmail || null,
      type: messageType,
      templateName: templateName || null,
      text: text || null,
      direction: 'outgoing',
      status: 'sent',
      metadata,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    // Update user record with last message sent
    if (userId) {
      await adminDb.collection('users').doc(userId).update({
        lastWhatsAppMessageSent: new Date().toISOString(),
        whatsAppOptIn: true
      });
    }

    console.log(`[WhatsApp API] Message sent to ${formattedPhone}:`, result.messageId);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      phone: formattedPhone,
      message: 'WhatsApp message sent successfully'
    });

  } catch (error) {
    console.error('[WhatsApp API] Send error:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message', details: error.message },
      { status: 500 }
    );
  }
}

