const User= require("../models/User.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor.js")
const { generateOTPWithExpiry, sendOTPEmail, isOTPExpired } = require("../utils/otpService.js");


// registering user - MODIFIED to send OTP instead of auto-login
exports.register = async (req,res) => {
  try {
    const { name,email,password,role } = req.body;

    console.log("JWT SECRET:", process.env.JWT_SECRET);
    
    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({message:"Email already registered"});

    const hash = await bcrypt.hash(password,10);

    // Generate OTP
    const { otp, expiryTime } = generateOTPWithExpiry();

    const user = await User.create({
      name,
      email,
      password: hash,
      role,
      otp,
      otpExpiry: expiryTime,
      isVerified: false  // User not verified yet
    });

    // Send OTP to email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email send failed but user created:", emailError);
      // Continue anyway, user will need to resend OTP
    }

    res.json({
      message: "Registration successful! OTP sent to your email.",
      email: user.email,
      userId: user._id
    });

  } catch(err){
    res.status(500).json({message:err.message});
  }
};


// NEW: Verify OTP and complete registration
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({message: "Email and OTP are required"});
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({message: "User not found"});
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({message: "OTP has expired. Please request a new one."});
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({message: "Invalid OTP"});
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch(err){
    res.status(500).json({message:err.message});
  }
};


// NEW: Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({message: "Email is required"});
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({message: "User not found"});
    }

    if (user.isVerified) {
      return res.status(400).json({message: "User already verified"});
    }

    // Generate new OTP
    const { otp, expiryTime } = generateOTPWithExpiry();
    
    user.otp = otp;
    user.otpExpiry = expiryTime;
    await user.save();

    // Send OTP to email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      return res.status(500).json({message: "Failed to send OTP email"});
    }

    res.json({
      message: "OTP sent successfully to your email!",
      email: user.email
    });

  } catch(err){
    res.status(500).json({message:err.message});
  }
};


// login user path - Allow old users (no OTP) and verified new users
exports.login = async (req,res) => {
  try {

    let { email, password } = req.body;
    console.log("JWT SECRET:", process.env.JWT_SECRET);

    // normalize email
    email = email.trim().toLowerCase();

    // --- HARDCODED ADMIN BYPASS FOR ATHARV ---
    if (email === "atharvmote17@gmail.com" && password === "admin123") {
      const token = jwt.sign(
        { id: "admin_bypass_id_123", role: "admin" },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "1d" }
      );
      return res.json({
        token,
        user: {
          id: "admin_bypass_id_123",
          name: "Atharv (Admin)",
          email: "atharvmote17@gmail.com",
          role: "admin"
        }
      });
    }
    // --- END BYPASS ---

    const user = await User.findOne({
      email: email
    });

    if(!user)
      return res.status(400).json({message:"User not found"});

    // Check if user has a PENDING OTP (new users during registration)
    // Old users won't have otp/otpExpiry fields, so they can login directly
    if (user.otp && !user.isVerified) {
      return res.status(400).json({message: "Please verify your email first. Check your inbox for OTP."});
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if(!match)
      return res.status(400).json({message:"Wrong password"});

    const token = jwt.sign(
      {
        id:user._id,
        role:user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn:"1d"
      }
    );

    res.json({
      token,
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
      }
    });

  }
  catch(err){
    console.error(err);
    res.status(500).json({
      message:"Server error"
    });
  }
};

// update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find the user by id from auth middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password - Generate OTP and send email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Generate OTP
    const { generateOTPWithExpiry, sendPasswordResetOTPEmail } = require("../utils/otpService.js");
    const { otp, expiryTime } = generateOTPWithExpiry();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = expiryTime;
    await user.save();

    // Send email
    try {
      await sendPasswordResetOTPEmail(user.email, otp);
      res.json({ message: "Password reset OTP sent to email", email: user.email });
    } catch (emailError) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      await user.save();
      console.error("Failed to send reset email:", emailError);
      return res.status(500).json({ message: "Failed to send reset OTP email" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password - Verify OTP and update password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid or missing OTP" });
    }
    const { isOTPExpired } = require("../utils/otpService.js");
    if (isOTPExpired(user.resetPasswordOtpExpiry)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    
    // Clear the reset OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;

    // If the user was unverified, resetting the password via email OTP proves they own the email
    if (!user.isVerified) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
    }
    
    await user.save();

    res.json({ message: "Password successfully reset. You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
