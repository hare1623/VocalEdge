const User = require("../models/User");

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.subscription.isActive || user.subscription.expiresAt < Date.now()) {
      return res.status(403).json({ message: "Subscription is inactive or expired." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error while checking subscription." });
  }
};

module.exports = checkSubscription;
