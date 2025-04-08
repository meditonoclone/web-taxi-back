// services/otpStore.js
const otpMap = new Map();

const saveOTP = (phoneNumber, otp) => {
  otpMap.set(phoneNumber, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 phút
  });
};

const verifyOTP = (phoneNumber, inputOtp) => {
  const data = otpMap.get(phoneNumber);
  if (!data) return { success: false, message: 'OTP not found' };

  if (Date.now() > data.expiresAt) {
    otpMap.delete(phoneNumber);
    return { success: false, message: 'OTP expired' };
  }

  if (data.otp !== inputOtp) {
    return { success: false, message: 'Invalid OTP' };
  }

  // OTP đúng
  otpMap.delete(phoneNumber);
  return { success: true };
};

module.exports = { saveOTP, verifyOTP };
