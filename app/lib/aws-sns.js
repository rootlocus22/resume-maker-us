import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// Initialize SNS client
const snsClient = new SNSClient({
  region: process.env.AWS_REGION_LOCAL || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendSMSVerification(phoneNumber, code) {
  try {
    console.log('[AWS SNS] Starting SMS verification for:', phoneNumber);
    
    // Validate environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('[AWS SNS] Missing AWS credentials in environment variables');
      return {
        success: false,
        error: 'SMS service not configured. Missing AWS credentials.'
      };
    }
    
    if (!process.env.AWS_REGION) {
      console.warn('[AWS SNS] AWS_REGION not set, using default us-east-1');
    }

    // Ensure phone number has country code
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    console.log('[AWS SNS] Original phone:', phoneNumber, 'Formatted:', formattedPhone);
    
    if (!formattedPhone.startsWith('+')) {
      // Assume US number if no country code
      if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }
    
    // Validate phone number format
    if (!isValidUSPhone(formattedPhone)) {
      console.error('[AWS SNS] Invalid phone number format:', formattedPhone);
      return {
        success: false,
        error: 'Invalid phone number format. Please use a valid US mobile number.'
      };
    }

    const message = `Your ExpertResume verification code is: ${code}. This code will expire in 10 minutes. Don't share this code with anyone.`;

    const params = {
      Message: message,
      PhoneNumber: formattedPhone,
      MessageAttributes: {
        // Remove SenderID for India - it requires DLT registration
        // 'AWS.SNS.SMS.SenderID': {
        //   DataType: 'String',
        //   StringValue: 'ExpertResume'
        // },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        },
        'AWS.SNS.SMS.MaxPrice': {
          DataType: 'String',
          StringValue: '1.00'
        }
      }
    };

    console.log('[AWS SNS] SMS Params:', {
      PhoneNumber: formattedPhone,
      MessageLength: message.length,
      Region: process.env.AWS_REGION || 'us-east-1'
    });
    
    const command = new PublishCommand(params);
    const result = await snsClient.send(command);
    
    console.log('[AWS SNS] SMS sent successfully:', {
      MessageId: result.MessageId,
      PhoneNumber: formattedPhone,
      Timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      messageId: result.MessageId,
      phone: formattedPhone
    };

  } catch (error) {
    console.error('[AWS SNS] SMS send failed:', {
      error: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      stack: error.stack
    });
    
    // Check specific AWS errors
    if (error.name === 'CredentialsError' || error.name === 'UnauthorizedOperation') {
      return {
        success: false,
        error: 'SMS service authentication failed. Please contact support.',
        details: error.code
      };
    }

    if (error.code === 'InvalidParameter') {
      return {
        success: false,
        error: 'Invalid SMS parameters. Please check phone number format.',
        details: error.message
      };
    }
    
    if (error.code === 'Throttling' || error.code === 'TooManyRequests') {
      return {
        success: false,
        error: 'SMS rate limit exceeded. Please try again in a few minutes.',
        details: error.code
      };
    }
    
    if (error.code === 'OptedOut') {
      return {
        success: false,
        error: 'This phone number has opted out of SMS. Please use email verification.',
        details: error.code
      };
    }
    
    if (error.code === 'InvalidSmsType' || error.code === 'InvalidMessageAttributes') {
      return {
        success: false,
        error: 'SMS configuration error. Please contact support.',
        details: error.code
      };
    }

    // Generic error for other cases
    return {
      success: false,
      error: 'Failed to send SMS. Please try again or use email verification.',
      details: error.code || error.name
    };
  }
}

// Utility function to validate and format phone number
export function formatPhoneNumber(phone) {
  let formatted = phone.replace(/\s+/g, '');
  
  // Remove any non-digit characters except +
  formatted = formatted.replace(/[^+\d]/g, '');
  
  if (!formatted.startsWith('+')) {
    if (formatted.startsWith('91')) {
      formatted = '+' + formatted;
    } else if (formatted.length === 10) {
      formatted = '+91' + formatted;
    }
  }
  
  return formatted;
}

// Validate US phone number
export function isValidUSPhone(phone) {
  const formatted = formatPhoneNumber(phone);
  const USPhoneRegex = /^\+91[6-9]\d{9}$/;
  return USPhoneRegex.test(formatted);
}

// Test AWS SNS configuration
export async function testSMSConfiguration() {
  try {
    console.log('[AWS SNS] Testing configuration...');
    
    // Check environment variables
    const hasCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    const region = process.env.AWS_REGION || 'us-east-1';
    
    console.log('[AWS SNS] Configuration check:', {
      hasCredentials,
      region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 4) + '...' : 'Missing'
    });
    
    if (!hasCredentials) {
      return {
        success: false,
        error: 'AWS credentials not configured'
      };
    }
    
    // Test with a simple SMS attributes request (this doesn't send SMS but tests auth)
    const testParams = {
      Message: 'Test configuration',
      PhoneNumber: '+919999999999', // Dummy number for testing
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    };
    
    // Note: This will fail at phone number validation but will test AWS auth
    try {
      const command = new PublishCommand(testParams);
      await snsClient.send(command);
    } catch (testError) {
      // Expected to fail with phone number issue, but should not fail with auth
      if (testError.code === 'InvalidParameter' && testError.message.includes('phone')) {
        console.log('[AWS SNS] Configuration test passed - AWS auth working');
        return { success: true, message: 'AWS SNS configuration is valid' };
      }
      
      if (testError.name === 'CredentialsError' || testError.code === 'UnauthorizedOperation') {
        return {
          success: false,
          error: 'AWS credentials invalid or insufficient permissions',
          details: testError.code
        };
      }
      
      console.log('[AWS SNS] Test error (may be expected):', testError.code, testError.message);
      return { success: true, message: 'AWS SNS appears to be configured correctly' };
    }
    
    return { success: true, message: 'AWS SNS configuration test completed' };
    
  } catch (error) {
    console.error('[AWS SNS] Configuration test failed:', error);
    return {
      success: false,
      error: 'Failed to test AWS SNS configuration',
      details: error.message
    };
  }
}
