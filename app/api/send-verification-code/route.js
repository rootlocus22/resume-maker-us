import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebase';
import { sendEmail } from '../../lib/sendEmail';
import { sendSMSVerification } from '../../lib/aws-sns';

// Generate a 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Phone number normalization function for consistent docId generation
function normalizePhoneForDocId(phone) {
  if (!phone) return phone;
  
  // Remove all non-digit characters first
  let normalized = phone.replace(/\D/g, '');
  
  // If it starts with 91 and is 12 digits, remove the 91 prefix
  if (normalized.startsWith('91') && normalized.length === 12) {
    normalized = normalized.substring(2);
  }
  
  // Should now be a 10-digit US mobile number
  return normalized;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format (US numbers)
function isValidPhoneNumber(phone) {
  // First normalize the phone number
  const normalized = phone.replace(/[^\d]/g, '');
  
  // Check if it's a valid US mobile number (10 digits starting with 6-9)
  if (normalized.length === 10 && /^[6-9]/.test(normalized)) {
    return true;
  }
  
  // Check if it's a valid US mobile number with country code (12 digits starting with 91)
  if (normalized.length === 12 && normalized.startsWith('91') && /^91[6-9]/.test(normalized)) {
    return true;
  }
  
  // Check if it's a valid US mobile number with +91 country code (13 characters)
  if (phone.startsWith('+91') && normalized.length === 12 && /^91[6-9]/.test(normalized)) {
    return true;
  }
  
  return false;
}

// Utility to normalize phone numbers (remove spaces, hyphens, etc.)
function normalizePhone(phone) {
  let normalized = phone.replace(/[^\d]/g, '');
  
  // If it starts with 91 and is 12 digits, remove the 91 prefix for consistency
  if (normalized.startsWith('91') && normalized.length === 12) {
    normalized = normalized.substring(2);
  }
  
  // Ensure it's exactly 10 digits
  if (normalized.length !== 10) {
    throw new Error('Phone number must be exactly 10 digits after normalization');
  }
  
  return normalized;
}

// Check rate limiting
async function checkRateLimit(value, type) {
  try {
    const docId = `${type}_${value.replace(/[@+\s]/g, '_')}`;
    const doc = await adminDb.collection('verificationCodes').doc(docId).get();
    
    if (doc.exists) {
      const data = doc.data();
      const now = Date.now();
      const createdAt = data.createdAt;
      
      // Check if last request was within 1 minute
      if (now - createdAt < 60000) {
        return { allowed: false, error: 'Please wait 1 minute before requesting another code' };
      }
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Allow if check fails
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error('[POST] /api/send-verification-code - Invalid JSON body', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let { type, value, purpose = 'verification' } = body;
  console.log('[POST] /api/send-verification-code - Request received', { type, value, purpose });

  // Validate input
  if (!type || !value) {
    console.error('[POST] /api/send-verification-code - Missing type or value', { type, value });
    return NextResponse.json({ error: 'Missing type or value' }, { status: 400 });
  }

  // Normalize type names (support both 'phone'/'sms' and 'email')
  const normalizedType = type === 'phone' ? 'sms' : type;
  
  if (!['email', 'sms'].includes(normalizedType)) {
    console.error('[POST] /api/send-verification-code - Invalid type', { type });
    return NextResponse.json({ error: 'Type must be either "email" or "phone/sms"' }, { status: 400 });
  }

  // Normalize phone value for validation and downstream use
  if (normalizedType === 'sms') {
    try {
      value = normalizePhone(value);
    } catch (error) {
      console.error('[POST] /api/send-verification-code - Phone normalization failed', { originalValue: body.value, error: error.message });
      return NextResponse.json({ error: 'Invalid phone number format. Please use a valid 10-digit US mobile number' }, { status: 400 });
    }
  }

  // Validate contact format
  if (normalizedType === 'email' && !isValidEmail(value)) {
    console.error('[POST] /api/send-verification-code - Invalid email format', { value });
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  if (normalizedType === 'sms' && !isValidPhoneNumber(value)) {
    console.error('[POST] /api/send-verification-code - Invalid phone format', { value });
    return NextResponse.json({ error: 'Invalid phone number format. Please use US mobile number format' }, { status: 400 });
  }

  // Rate limiting check
  const rateLimitCheck = await checkRateLimit(value, normalizedType);
  if (!rateLimitCheck.allowed) {
    console.error('[POST] /api/send-verification-code - Rate limited', { value, type });
    return NextResponse.json({ error: rateLimitCheck.error }, { status: 429 });
  }

  const code = generateVerificationCode();
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes from now

  try {
    // Normalize phone number for consistent docId generation
    let normalizedValue = value;
    if (normalizedType === 'sms') {
      normalizedValue = normalizePhoneForDocId(value);
    }
    
    // Store verification code in Firestore with enhanced data
    const docId = `${normalizedType}_${normalizedValue.replace(/[@+\s]/g, '_')}`;
    console.log('[POST] /api/send-verification-code - Creating verification code', { 
      originalValue: value, 
      normalizedValue, 
      docId,
      normalizedType 
    });
    const verificationData = {
      code,
      contact: value,
      type: normalizedType,
      purpose,
      createdAt: Date.now(),
      expiresAt,
      verified: false,
      attempts: 0,
      maxAttempts: 3
    };

    await adminDb.collection('verificationCodes').doc(docId).set(verificationData);

    // Send verification code
    if (normalizedType === 'sms') {
      console.log('[POST] /api/send-verification-code - Attempting to send SMS', { value, code });
      const smsResult = await sendSMSVerification(value, code);
      if (!smsResult.success) {
        // Clean up the stored code if SMS fails
        await adminDb.collection('verificationCodes').doc(docId).delete();
        console.error('[POST] /api/send-verification-code - SMS failed', { value, error: smsResult.error });
        return NextResponse.json({ error: smsResult.error || 'Failed to send SMS verification' }, { status: 500 });
      }
      console.log('[POST] /api/send-verification-code - SMS sent successfully', { value });
    } else if (normalizedType === 'email') {
      console.log('[POST] /api/send-verification-code - Attempting to send email', { value, code, templateId: 'verification' });
      const emailResult = await sendEmail({
        to: value,
        templateId: 'verification',
        data: { code, email: value, purpose }
      });

      if (!emailResult.success) {
        // Clean up the stored code if email fails
        await adminDb.collection('verificationCodes').doc(docId).delete();
        console.error('[POST] /api/send-verification-code - Email failed', { value, error: emailResult.error });
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
      }
      console.log('[POST] /api/send-verification-code - Email sent successfully', { value });
    }

    console.log('[POST] /api/send-verification-code - Success response', { value, type: normalizedType });
    return NextResponse.json({ 
      success: true, 
      message: `Verification code sent successfully via ${normalizedType}`,
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (e) {
    console.error('[POST] /api/send-verification-code - Failure', { error: e.message, value, type });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Utility function to get verification code (for compatibility)
// Note: Not exported as Next.js routes can only export HTTP method handlers
async function getCode(value) {
  try {
    // Try different document ID formats for backward compatibility
    let doc = await adminDb.collection('verificationCodes').doc(value).get();
    
    if (!doc.exists) {
      // Try with email format
      const emailDocId = `email_${value.replace(/[@+\s]/g, '_')}`;
      doc = await adminDb.collection('verificationCodes').doc(emailDocId).get();
    }
    
    if (!doc.exists) {
      // Try with SMS format
      const smsDocId = `sms_${value.replace(/[@+\s]/g, '_')}`;
      doc = await adminDb.collection('verificationCodes').doc(smsDocId).get();
    }
    
    if (doc.exists) {
      const data = doc.data();
      // Check if code is still valid
      if (data.expiresAt && Date.now() > data.expiresAt) {
        return null; // Code expired
      }
      return data.code;
    }
    return null;
  } catch (error) {
    console.error('Error fetching verification code:', error);
    return null;
  }
}

// GET method for API documentation
export async function GET() {
  return NextResponse.json({
    message: 'Verification code sending API',
    version: '2.0',
    endpoints: {
      POST: {
        description: 'Send verification code via email or SMS',
        parameters: {
          type: 'string (email|phone|sms) - Required',
          value: 'string (email address or phone number) - Required', 
          purpose: 'string (optional, default: verification)'
        },
        example: {
          email: {
            type: 'email',
            value: 'user@example.com',
            purpose: 'verification'
          },
          sms: {
            type: 'phone', // or 'sms'
            value: '+919876543210',
            purpose: 'verification'
          }
        }
      }
    },
    features: [
      'Rate limiting (1 minute between requests)',
      'Code expiration (10 minutes)',
      'Input validation',
      'Support for both email and SMS',
      'Comprehensive error handling'
    ]
  });
}
