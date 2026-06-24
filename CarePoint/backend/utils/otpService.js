const nodemailer = require("nodemailer");

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Setup email transporter (using Gmail - configure with your credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "your-email@gmail.com",
    pass: process.env.GMAIL_PASS || "your-app-password",
  },
});

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "CarePoint - Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #0066cc; text-align: center;">CarePoint Email Verification</h2>
            
            <p>Hello,</p>
            
            <p>Thank you for registering with <strong>CarePoint</strong>. To complete your registration, please verify your email using the OTP below:</p>
            
            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #0066cc; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            
            <p><strong>Note:</strong> This OTP will expire in <strong>10 minutes</strong>.</p>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              CarePoint Healthcare ERP<br>
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Generate OTP with expiry
const generateOTPWithExpiry = () => {
  const otp = generateOTP();
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  return { otp, expiryTime };
};

// Verify if OTP is expired
const isOTPExpired = (expiryTime) => {
  return new Date() > new Date(expiryTime);
};

// Send Password Reset OTP via email
const sendPasswordResetOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "CarePoint - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #0066cc; text-align: center;">CarePoint Password Reset</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your <strong>CarePoint</strong> account. Please use the OTP below to proceed:</p>
            
            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #0066cc; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            
            <p><strong>Note:</strong> This OTP will expire in <strong>10 minutes</strong>.</p>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              CarePoint Healthcare ERP<br>
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending Password Reset OTP email:", error);
    throw new Error("Failed to send Password Reset OTP email");
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  generateOTPWithExpiry,
  isOTPExpired,
  sendPasswordResetOTPEmail,
};
