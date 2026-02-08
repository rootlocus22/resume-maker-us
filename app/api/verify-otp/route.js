import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebase';

// Phone number normalization function
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

// Validate input parameters
function validateInput(type, value, code) {
  if (!type || !value || !code) {
    return { valid: false, error: 'Missing required fields: type, value, or code' };
  }

  // Normalize type names (support both 'phone'/'sms' and 'email')
  const normalizedType = type === 'phone' ? 'sms' : type;
  
  if (!['email', 'sms'].includes(normalizedType)) {
    return { valid: false, error: 'Type must be either "email" or "phone/sms"' };
  }

  // Validate code format (6 digits)
  if (!/^\d{6}$/.test(code)) {
    return { valid: false, error: 'Code must be a 6-digit number' };
  }

  return { valid: true, normalizedType };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error('[POST] /api/verify-otp - Invalid JSON body', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type, value, code } = body;
  console.log('[POST] /api/verify-otp - Request received', { type, value, code: code ? '***' : 'missing' });

  // Validate input
  const validation = validateInput(type, value, code);
  if (!validation.valid) {
    console.error('[POST] /api/verify-otp - Validation failed', { error: validation.error, type, value });
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { normalizedType } = validation;

  try {
    // Normalize phone number for consistent docId generation
    let normalizedValue = value;
    if (normalizedType === 'sms') {
      normalizedValue = normalizePhoneForDocId(value);
    }
    
    // Get verification code from Firestore
    const docId = `${normalizedType}_${normalizedValue.replace(/[@+\s]/g, '_')}`;
    console.log('[POST] /api/verify-otp - Looking for verification code', { 
      originalValue: value, 
      normalizedValue, 
      docId,
      normalizedType 
    });
    const doc = await adminDb.collection('verificationCodes').doc(docId).get();

    if (!doc.exists) {
      console.error('[POST] /api/verify-otp - No verification code found', { 
        docId, 
        originalValue: value,
        normalizedValue,
        normalizedType
      });
      return NextResponse.json({ 
        error: 'No verification code found. Please request a new code.',
        verified: false 
      }, { status: 404 });
    }

    const data = doc.data();
    const now = Date.now();

    // Check if code has expired
    if (data.expiresAt && now > data.expiresAt) {
      console.error('[POST] /api/verify-otp - Code expired', { docId, value });
      // Clean up expired code
      await adminDb.collection('verificationCodes').doc(docId).delete();
      return NextResponse.json({ 
        error: 'Verification code has expired. Please request a new code.',
        verified: false 
      }, { status: 410 });
    }

    // Check if already verified
    if (data.verified) {
      console.log('[POST] /api/verify-otp - Already verified', { docId, value });
      return NextResponse.json({ 
        success: true, 
        message: 'Already verified',
        verified: true 
      });
    }

    // Check attempt limits
    const currentAttempts = (data.attempts || 0) + 1;
    const maxAttempts = data.maxAttempts || 3;

    if (currentAttempts > maxAttempts) {
      console.error('[POST] /api/verify-otp - Too many attempts', { docId, value, attempts: currentAttempts });
      // Clean up after too many attempts
      await adminDb.collection('verificationCodes').doc(docId).delete();
      return NextResponse.json({ 
        error: 'Too many failed attempts. Please request a new code.',
        verified: false 
      }, { status: 429 });
    }

    // Update attempt count
    await adminDb.collection('verificationCodes').doc(docId).update({
      attempts: currentAttempts,
      lastAttempt: now
    });

    // Verify the code
    if (data.code !== code) {
      console.error('[POST] /api/verify-otp - Invalid code', { 
        docId, 
        value, 
        attempts: currentAttempts,
        maxAttempts 
      });
      
      const remainingAttempts = maxAttempts - currentAttempts;
      return NextResponse.json({ 
        error: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
        verified: false,
        remainingAttempts
      }, { status: 400 });
    }

    // Code is valid - mark as verified
    await adminDb.collection('verificationCodes').doc(docId).update({
      verified: true,
      verifiedAt: now
    });

    console.log('[POST] /api/verify-otp - Verification successful', { docId, value });
    return NextResponse.json({ 
      success: true, 
      message: 'Verification successful',
      verified: true,
      contact: value,
      type: normalizedType
    });

  } catch (error) {
    console.error('[POST] /api/verify-otp - Internal error', { error: error.message, value, type });
    return NextResponse.json({ 
      error: 'Internal server error',
      verified: false 
    }, { status: 500 });
  }
}

// GET method for API documentation
export async function GET() {
  return NextResponse.json({
    message: 'OTP verification API',
    version: '2.0',
    endpoints: {
      POST: {
        description: 'Verify OTP/verification code',
        parameters: {
          type: 'string (email|phone|sms) - Required',
          value: 'string (email address or phone number) - Required',
          code: 'string (6-digit verification code) - Required'
        },
        example: {
          email: {
            type: 'email',
            value: 'user@example.com',
            code: '123456'
          },
          sms: {
            type: 'phone', // or 'sms'
            value: '+919876543210',
            code: '123456'
          }
        }
      }
    },
    features: [
      'Code expiration handling (10 minutes)',
      'Attempt limiting (3 attempts max)',
      'Input validation',
      'Support for both email and SMS',
      'Comprehensive error handling',
      'Automatic cleanup of expired/invalid codes'
    ]
  });
}
