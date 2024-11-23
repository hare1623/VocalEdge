const express = require("express");
const User = require("../models/User");
const { createSubscription } = require("../utils/paymentService");

const router = express.Router();

// Initiate Payment
router.post("/initiate", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not verified or not found" });
    }

    const subscription = await createSubscription(userId);

    user.subscription.isActive = true;
    user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.status(200).json({ message: "Subscription created successfully", subscription });
  } catch (error) {
    console.error("Payment initiation error:", error.message);
    res.status(500).json({ message: "Failed to create subscription" });
  }
});

// Check Payment Status
router.get("/status/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isActive = user.subscription.isActive && user.subscription.expiresAt > Date.now();
    res.status(200).json({ isActive, expiresAt: user.subscription.expiresAt });
  } catch (error) {
    console.error("Payment status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
