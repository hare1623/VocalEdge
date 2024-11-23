const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");

const router = express.Router(); // This was missing in your file

// Razorpay Webhook Handler
router.post("/", async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Secret from Razorpay Dashboard
  const signature = req.headers["x-razorpay-signature"]; // Signature sent by Razorpay
  const body = JSON.stringify(req.body); // Request payload

  try {
    // Verify webhook signature
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event; // Event type (e.g., "subscription.charged", "payment.failed")
    const payload = req.body.payload;

    switch (event) {
      case "subscription.charged":
        await handleSubscriptionCharged(payload);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload);
        break;
      case "payment.failed":
        await handlePaymentFailed(payload);
        break;
      default:
        console.log(`Unhandled event type: ${event}`);
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===================================
// Handlers for Specific Events
// ===================================

// Subscription Charged (Payment Success)
async function handleSubscriptionCharged(payload) {
  const subscriptionId = payload.subscription.entity.id; // Razorpay subscription ID
  const paymentStatus = payload.subscription.entity.status; // Status (e.g., "active")

  // Find user with the subscription ID
  const user = await User.findOne({ "subscription.id": subscriptionId });
  if (!user) {
    console.error(`No user found for subscription ID: ${subscriptionId}`);
    return;
  }

  // Update user's subscription status
  if (paymentStatus === "active") {
    user.subscription.isActive = true;
    user.subscription.expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // Extend by 30 days
    );
    await user.save();
    console.log(`Subscription activated for user: ${user.email}`);
  }
}

// Subscription Cancelled
async function handleSubscriptionCancelled(payload) {
  const subscriptionId = payload.subscription.entity.id;

  // Find user with the subscription ID
  const user = await User.findOne({ "subscription.id": subscriptionId });
  if (!user) {
    console.error(`No user found for subscription ID: ${subscriptionId}`);
    return;
  }

  // Set subscription as inactive
  user.subscription.isActive = false;
  user.subscription.expiresAt = null;
  await user.save();
  console.log(`Subscription cancelled for user: ${user.email}`);
}

// Payment Failed
async function handlePaymentFailed(payload) {
  const subscriptionId = payload.subscription.entity.id;

  // Find user with the subscription ID
  const user = await User.findOne({ "subscription.id": subscriptionId });
  if (!user) {
    console.error(`No user found for subscription ID: ${subscriptionId}`);
    return;
  }

  // Set subscription as inactive
  user.subscription.isActive = false;
  await user.save();
  console.error(`Payment failed for user: ${user.email}`);
}

module.exports = router;
