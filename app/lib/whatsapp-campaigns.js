/**
 * WhatsApp Campaign Manager
 * Pre-built campaigns for common use cases
 */

import { adminDb } from './firebase';

/**
 * Send welcome message to new user
 */
export async function sendWelcomeMessage(userId, userName, phone) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us'}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        phone,
        messageType: 'template',
        templateName: 'expertresume_welcome',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: userName || 'there' }
            ]
          }
        ],
        metadata: {
          campaign: 'welcome',
          source: 'signup'
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`[WhatsApp] Welcome message sent to ${userName}`);
      return { success: true, messageId: data.messageId };
    }
    
    return { success: false, error: data.error };
  } catch (error) {
    console.error('[WhatsApp] Welcome message failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send cart abandonment reminder
 */
export async function sendCartReminder(userId, userName, cartValue, checkoutUrl) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us'}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        messageType: 'template',
        templateName: 'expertresume_cart_reminder',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: userName || 'there' }
            ]
          }
        ],
        metadata: {
          campaign: 'cart_abandonment',
          cartValue,
          checkoutUrl
        }
      })
    });

    const data = await response.json();
    return { success: data.success, messageId: data.messageId };
  } catch (error) {
    console.error('[WhatsApp] Cart reminder failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send premium expiry reminder
 */
export async function sendExpiryReminder(userId, userName, daysRemaining) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us'}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        messageType: 'template',
        templateName: 'expertresume_expiry_reminder',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: userName || 'there' },
              { type: 'text', text: daysRemaining.toString() }
            ]
          }
        ],
        metadata: {
          campaign: 'expiry_reminder',
          daysRemaining
        }
      })
    });

    const data = await response.json();
    return { success: data.success, messageId: data.messageId };
  } catch (error) {
    console.error('[WhatsApp] Expiry reminder failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send referral earnings notification
 */
export async function sendReferralEarned(userId, userName, amount) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us'}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        messageType: 'template',
        templateName: 'expertresume_referral_earned',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: userName || 'there' },
              { type: 'text', text: amount.toString() }
            ]
          }
        ],
        metadata: {
          campaign: 'referral_reward',
          amount
        }
      })
    });

    const data = await response.json();
    return { success: data.success, messageId: data.messageId };
  } catch (error) {
    console.error('[WhatsApp] Referral notification failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send promotional offer
 */
export async function sendPromotionalOffer(userId, userName, offerDetails) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us'}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        messageType: 'template',
        templateName: 'expertresume_special_offer',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: userName || 'there' }
            ]
          }
        ],
        metadata: {
          campaign: 'promotional',
          ...offerDetails
        }
      })
    });

    const data = await response.json();
    return { success: data.success, messageId: data.messageId };
  } catch (error) {
    console.error('[WhatsApp] Promotional message failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch send campaign to multiple users
 */
export async function sendBatchCampaign(userIds, campaignType, templateData) {
  const results = {
    total: userIds.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  for (const userId of userIds) {
    try {
      // Get user data
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        results.failed++;
        results.errors.push({ userId, error: 'User not found' });
        continue;
      }

      const userData = userDoc.data();
      
      // Check if user has opted in for WhatsApp
      if (!userData.whatsAppOptIn || !userData.phone) {
        results.failed++;
        results.errors.push({ userId, error: 'User not opted in or no phone' });
        continue;
      }

      // Send message based on campaign type
      let sendResult;
      
      switch (campaignType) {
        case 'welcome':
          sendResult = await sendWelcomeMessage(userId, userData.displayName, userData.phone);
          break;
        case 'cart_reminder':
          sendResult = await sendCartReminder(userId, userData.displayName, templateData.cartValue, templateData.checkoutUrl);
          break;
        case 'expiry_reminder':
          sendResult = await sendExpiryReminder(userId, userData.displayName, templateData.daysRemaining);
          break;
        case 'referral_earned':
          sendResult = await sendReferralEarned(userId, userData.displayName, templateData.amount);
          break;
        case 'promotional':
          sendResult = await sendPromotionalOffer(userId, userData.displayName, templateData);
          break;
        default:
          results.failed++;
          results.errors.push({ userId, error: 'Invalid campaign type' });
          continue;
      }

      if (sendResult.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ userId, error: sendResult.error });
      }

      // Rate limiting: wait 100ms between messages
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      results.failed++;
      results.errors.push({ userId, error: error.message });
    }
  }

  // Log campaign results
  await adminDb.collection('whatsapp_campaigns').add({
    campaignType,
    results,
    templateData,
    createdAt: new Date().toISOString()
  });

  return results;
}

/**
 * Schedule cart abandonment reminders
 * Run this as a cron job every hour
 */
export async function scheduleCartReminders() {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Find abandoned carts
    const abandonedCarts = await adminDb
      .collection('checkout_sessions')
      .where('createdAt', '<', cutoffTime.toISOString())
      .where('status', '==', 'pending')
      .where('whatsappReminderSent', '==', false)
      .limit(100)
      .get();

    const userIds = abandonedCarts.docs.map(doc => doc.data().userId);

    if (userIds.length === 0) {
      console.log('[WhatsApp] No abandoned carts to remind');
      return { sent: 0 };
    }

    const results = await sendBatchCampaign(userIds, 'cart_reminder', {
      cartValue: 199, // You can customize per user
      checkoutUrl: 'https://expertresume.us/checkout'
    });

    // Mark as sent
    const batch = adminDb.batch();
    abandonedCarts.docs.forEach(doc => {
      batch.update(doc.ref, { whatsappReminderSent: true });
    });
    await batch.commit();

    console.log(`[WhatsApp] Cart reminders sent: ${results.sent} successful, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('[WhatsApp] Schedule cart reminders error:', error);
    return { sent: 0, failed: 0, error: error.message };
  }
}

/**
 * Schedule expiry reminders
 * Run this as a cron job daily
 */
export async function scheduleExpiryReminders() {
  try {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Find users expiring in 3 days
    const expiringUsers = await adminDb
      .collection('users')
      .where('plan', '==', 'premium')
      .where('premium_expiry', '<', threeDaysFromNow.toISOString())
      .where('premium_expiry', '>', new Date().toISOString())
      .where('expiryReminderSent', '==', false)
      .limit(100)
      .get();

    const userIds = expiringUsers.docs.map(doc => doc.id);

    if (userIds.length === 0) {
      console.log('[WhatsApp] No expiring subscriptions to remind');
      return { sent: 0 };
    }

    const results = await sendBatchCampaign(userIds, 'expiry_reminder', {
      daysRemaining: 3
    });

    // Mark as sent
    const batch = adminDb.batch();
    expiringUsers.docs.forEach(doc => {
      batch.update(doc.ref, { expiryReminderSent: true });
    });
    await batch.commit();

    console.log(`[WhatsApp] Expiry reminders sent: ${results.sent} successful, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('[WhatsApp] Schedule expiry reminders error:', error);
    return { sent: 0, failed: 0, error: error.message };
  }
}

