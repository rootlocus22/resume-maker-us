import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase";
import { verifyWebhookSignature, markMessageAsRead, sendTextMessage } from "../../../lib/whatsapp-cloud-api";

/**
 * WhatsApp Cloud API Webhook
 * Receives incoming messages, status updates, and other events
 * 
 * Setup: Configure this URL in Meta Business Manager
 * URL: https://yourdomain.com/api/whatsapp/webhook
 */

// Verification endpoint (GET) - Meta will call this to verify your webhook
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'expertresume_webhook_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified successfully');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('[WhatsApp Webhook] Verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

// Webhook endpoint (POST) - Receives WhatsApp events
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature (security)
    if (signature && !verifyWebhookSignature(body, signature)) {
      console.error('[WhatsApp Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const data = JSON.parse(body);
    console.log('[WhatsApp Webhook] Received:', JSON.stringify(data, null, 2));

    // Process webhook data
    if (data.object === 'whatsapp_business_account') {
      for (const entry of data.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await handleMessageUpdate(change.value);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle incoming messages and status updates
 */
async function handleMessageUpdate(value) {
  const { messages, statuses, contacts } = value;

  // Handle incoming messages
  if (messages && messages.length > 0) {
    for (const message of messages) {
      await handleIncomingMessage(message, contacts);
    }
  }

  // Handle message status updates (sent, delivered, read, failed)
  if (statuses && statuses.length > 0) {
    for (const status of statuses) {
      await handleMessageStatus(status);
    }
  }
}

/**
 * Handle incoming message from user
 */
async function handleIncomingMessage(message, contacts) {
  const { from, id: messageId, type, text, timestamp } = message;
  
  console.log(`[WhatsApp] Message from ${from}:`, text?.body || `[${type}]`);

  try {
    // Mark message as read
    await markMessageAsRead(messageId);

    // Get or create user contact
    const contact = contacts?.find(c => c.wa_id === from);
    const contactName = contact?.profile?.name || 'User';

    // Store message in Firestore
    await adminDb.collection('whatsapp_messages').add({
      messageId,
      from,
      contactName,
      type,
      text: text?.body || null,
      timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
      direction: 'incoming',
      processed: false,
      createdAt: new Date().toISOString()
    });

    // Find user in database by phone number
    const userQuery = await adminDb
      .collection('users')
      .where('phone', '==', from)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      const userId = userQuery.docs[0].id;
      const userData = userQuery.docs[0].data();

      // Update last WhatsApp contact
      await adminDb.collection('users').doc(userId).update({
        lastWhatsAppContact: new Date().toISOString(),
        whatsAppActive: true
      });

      // Auto-respond based on message content
      await handleAutoResponse(from, text?.body, userData, contactName);
    } else {
      // New contact - send welcome message
      await sendTextMessage(
        from,
        `Hi ${contactName}! 👋 Welcome to ExpertResume. How can we help you today?`
      );
    }

  } catch (error) {
    console.error('[WhatsApp] Error handling incoming message:', error);
  }
}

/**
 * Handle message status updates
 */
async function handleMessageStatus(status) {
  const { id: messageId, status: messageStatus, timestamp, recipient_id } = status;

  console.log(`[WhatsApp] Message ${messageId} status: ${messageStatus}`);

  try {
    // Update message status in Firestore
    const messageQuery = await adminDb
      .collection('whatsapp_messages')
      .where('messageId', '==', messageId)
      .limit(1)
      .get();

    if (!messageQuery.empty) {
      await messageQuery.docs[0].ref.update({
        status: messageStatus,
        statusUpdatedAt: new Date(parseInt(timestamp) * 1000).toISOString()
      });
    }
  } catch (error) {
    console.error('[WhatsApp] Error updating message status:', error);
  }
}

/**
 * Auto-respond to common queries
 */
async function handleAutoResponse(to, messageText, userData, contactName) {
  if (!messageText) return;

  const lowerText = messageText.toLowerCase();

  try {
    // Pricing inquiry
    if (lowerText.includes('price') || lowerText.includes('plan') || lowerText.includes('cost')) {
      await sendTextMessage(
        to,
        `Hi ${contactName}! 💰 Our pricing:\n\n` +
        `• Monthly: ₹199/month\n` +
        `• 6 Months: ₹599 (Save 50%)\n` +
        `• Lifetime: ₹999 (Best value!)\n\n` +
        `Get started: https://expertresume.us/pricing\n\n` +
        `Need help choosing? Just ask! 😊`
      );
    }
    // Support/Help
    else if (lowerText.includes('help') || lowerText.includes('support')) {
      await sendTextMessage(
        to,
        `I'm here to help! 🙋\n\n` +
        `I can assist with:\n` +
        `• Resume building tips\n` +
        `• ATS optimization\n` +
        `• Premium features\n` +
        `• Technical support\n\n` +
        `What would you like to know?`
      );
    }
    // Template inquiry
    else if (lowerText.includes('template') || lowerText.includes('design')) {
      await sendTextMessage(
        to,
        `We have 50+ professional templates! 📄\n\n` +
        `View all: https://expertresume.us/templates\n\n` +
        `Each template is ATS-optimized and customizable. ✨`
      );
    }
    // Generic response
    else {
      await sendTextMessage(
        to,
        `Thanks for your message! 😊\n\n` +
        `Our team will respond shortly. Meanwhile, you can:\n\n` +
        `• Check pricing: Reply "pricing"\n` +
        `• Browse templates: Reply "templates"\n` +
        `• Get help: Reply "help"`
      );
    }

    // Mark as processed
    const messageQuery = await adminDb
      .collection('whatsapp_messages')
      .where('from', '==', to)
      .where('processed', '==', false)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!messageQuery.empty) {
      await messageQuery.docs[0].ref.update({ processed: true });
    }

  } catch (error) {
    console.error('[WhatsApp] Auto-response error:', error);
  }
}

