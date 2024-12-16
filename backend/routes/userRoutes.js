const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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


// Verify OTP and Auto-Login

router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "User verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// Resend Otp

router.post("/resend-otp", async (req, res) => {
  const { userId } = req.body;

  try {
    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Update the user document
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Resend the OTP
    await sendOTP(user.email || user.phone, otp);

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});



// User Login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "User not verified. Please complete OTP verification." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
