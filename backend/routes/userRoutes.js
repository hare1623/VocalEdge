const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendOTP } = require("../utils/otpService");

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpiresAt,
    });

    await newUser.save();
    await sendOTP(email || phone, otp);

    res.status(200).json({ message: "OTP sent for verification.", userId: newUser._id });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: "User verified successfully." });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
