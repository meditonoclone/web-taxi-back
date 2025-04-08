// services/snsService.js
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  const sendOTP = async (phoneNumber, otp) => {
    const params = {
      Message: `Ma OTP: ${otp}. Xac thuc truoc 5 phut de dat chuyen!`,
      PhoneNumber: phoneNumber
    };
  
    try {
      const result = await global.sns.publish(params).promise();
      console.log('OTP sent:', result);
      return { success: true, otp };
    } catch (err) {
      console.error('Send failed:', err);
      return { success: false, error: err };
    }
  };
  
  module.exports = {
    generateOTP,
    sendOTP
  };
  