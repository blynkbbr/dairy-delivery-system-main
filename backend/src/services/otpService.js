const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
// Only initialize Twilio with valid credentials
if (accountSid && authToken && accountSid.startsWith('AC') && accountSid.length === 34) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.log('⚠️  Twilio initialization failed - using development mode');
    client = null;
  }
} else {
  console.log('📱 Running in development mode - OTPs will be logged to console');
  client = null;
}

// In-memory store for OTPs (in production, use Redis)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number
 * @returns {Promise<Object>} Result object
 */
const sendOTP = async (phone) => {
  try {
    const otp = generateOTP();
    const expiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    // Store OTP with expiry
    otpStore.set(phone, { otp, expiryTime, attempts: 0 });
    
    // In development, log OTP instead of sending SMS
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 OTP for ${phone}: ${otp}`);
      return {
        success: true,
        message: 'OTP sent successfully (check console in dev mode)',
        sid: 'dev-mode'
      };
    }
    
    // Send SMS using Twilio
    if (client && phoneNumber) {
      const message = await client.messages.create({
        body: `Your Dairy Delivery verification code is: ${otp}. Valid for 5 minutes.`,
        from: phoneNumber,
        to: phone
      });
      
      return {
        success: true,
        message: 'OTP sent successfully',
        sid: message.sid
      };
    } else {
      // Fallback if Twilio is not configured
      console.log(`📱 OTP for ${phone}: ${otp} (Twilio not configured)`);
      return {
        success: true,
        message: 'OTP sent successfully (check logs)',
        sid: 'no-twilio'
      };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
};

/**
 * Verify OTP
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to verify
 * @returns {Object} Verification result
 */
const verifyOTP = (phone, otp) => {
  const stored = otpStore.get(phone);
  
  if (!stored) {
    return {
      success: false,
      message: 'No OTP found for this phone number'
    };
  }
  
  // Check if OTP has expired
  if (Date.now() > stored.expiryTime) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'OTP has expired'
    };
  }
  
  // Check attempts
  if (stored.attempts >= 3) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'Maximum verification attempts exceeded'
    };
  }
  
  // Verify OTP
  if (stored.otp === otp) {
    otpStore.delete(phone); // Clear OTP after successful verification
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } else {
    // Increment attempts
    stored.attempts += 1;
    otpStore.set(phone, stored);
    
    return {
      success: false,
      message: 'Invalid OTP',
      attemptsLeft: 3 - stored.attempts
    };
  }
};

/**
 * Clear expired OTPs (should be called periodically)
 */
const clearExpiredOTPs = () => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiryTime) {
      otpStore.delete(phone);
    }
  }
};

// Clear expired OTPs every 10 minutes
setInterval(clearExpiredOTPs, 10 * 60 * 1000);

module.exports = {
  sendOTP,
  verifyOTP,
  clearExpiredOTPs
};