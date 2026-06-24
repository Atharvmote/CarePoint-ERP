const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "staff","patient","doctor"],
    default: "admin" // TEMPORARILY CHANGED TO ADMIN FOR EASY ACCESS
  },
  // OTP fields
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  
  // Reset Password OTP fields
  resetPasswordOtp: String,
  resetPasswordOtpExpiry: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
