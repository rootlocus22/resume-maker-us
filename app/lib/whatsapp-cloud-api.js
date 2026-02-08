/**
 * Meta WhatsApp Cloud API Integration
 * Official API for sending WhatsApp messages programmatically
 */

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

/**
 * Send a template message via WhatsApp
 * @param {string} to - Recipient phone number (with country code, no +)
 * @param {string} templateName - Approved template name
 * @param {string} languageCode - Language code (e.g., 'en', 'hi')
 * @param {Array} components - Template components (header, body, buttons)
 */
export async function sendTemplateMessage(to, templateName, languageCode = 'en', components = []) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env');
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      }
    }
  };

  // Add components if provided (for dynamic content)
  if (components && components.length > 0) {
    payload.template.components = components;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp API] Error:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    console.log('[WhatsApp API] Message sent successfully:', data);
    return {
      success: true,
      messageId: data.messages[0].id,
      data
    };

  } catch (error) {
    console.error('[WhatsApp API] Send error:', error);
    throw error;
  }
}

/**
 * Send a text message (only works if user has messaged you first within 24 hours)
 * @param {string} to - Recipient phone number
 * @param {string} text - Message text
 */
export async function sendTextMessage(to, text) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured');
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: text
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send text message');
    }

    return {
      success: true,
      messageId: data.messages[0].id,
      data
    };

  } catch (error) {
    console.error('[WhatsApp API] Text message error:', error);
    throw error;
  }
}

/**
 * Mark message as read
 * @param {string} messageId - Message ID to mark as read
 */
export async function markMessageAsRead(messageId) {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    console.error('[WhatsApp API] Mark read error:', error);
  }
}

/**
 * Get message template status
 * @param {string} templateName - Template name
 */
export async function getMessageTemplate(templateName) {
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp Business Account ID not configured');
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?name=${templateName}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[WhatsApp API] Get template error:', error);
    throw error;
  }
}

/**
 * Verify webhook signature (for security)
 * @param {string} payload - Request payload
 * @param {string} signature - X-Hub-Signature-256 header
 */
export function verifyWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

  if (!APP_SECRET) {
    console.error('[WhatsApp Webhook] APP_SECRET not configured');
    return false;
  }

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Pre-defined templates for ExpertResume
 * These need to be created and approved in Meta Business Manager
 */
export const WHATSAPP_TEMPLATES = {
  // Welcome message when user signs up
  WELCOME: {
    name: 'expertresume_welcome',
    languageCode: 'en',
    category: 'UTILITY',
    // Template: "Hi {{1}}! Welcome to ExpertResume 🎉..."
  },

  // Abandoned cart / checkout reminder
  CART_ABANDONED: {
    name: 'expertresume_cart_reminder',
    languageCode: 'en',
    category: 'MARKETING',
    // Template: "Hi {{1}}! You left your premium plan in cart..."
  },

  // Premium expiring soon
  EXPIRY_REMINDER: {
    name: 'expertresume_expiry_reminder',
    languageCode: 'en',
    category: 'UTILITY',
    // Template: "Hi {{1}}! Your premium plan expires in {{2}} days..."
  },

  // Resume review complete
  REVIEW_COMPLETE: {
    name: 'expertresume_review_complete',
    languageCode: 'en',
    category: 'UTILITY',
    // Template: "Hi {{1}}! Your resume review is complete..."
  },

  // Promotional offer
  PROMOTIONAL_OFFER: {
    name: 'expertresume_special_offer',
    languageCode: 'en',
    category: 'MARKETING',
    // Template: "Hi {{1}}! Special offer just for you..."
  },

  // Referral reward earned
  REFERRAL_EARNED: {
    name: 'expertresume_referral_earned',
    languageCode: 'en',
    category: 'UTILITY',
    // Template: "Hi {{1}}! You earned ₹{{2}} from referrals..."
  }
};

/**
 * Helper to format phone number for WhatsApp
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneForWhatsApp(phone) {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, remove it (US numbers)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If doesn't start with country code, add India code
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid
 */
export function isValidPhoneNumber(phone) {
  const formatted = formatPhoneForWhatsApp(phone);
  // Should be country code + 10 digits (for India)
  return /^91\d{10}$/.test(formatted);
}

