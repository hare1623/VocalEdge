const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const notifyRenewal = async () => {
  const users = await User.find({ "subscription.isActive": true });

  users.forEach((user) => {
    const daysLeft =
      (new Date(user.subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24);

    if (daysLeft <= 7) {
      sendEmail(
        user.email,
        "Subscription Renewal Reminder",
        `Your subscription expires in ${Math.ceil(daysLeft)} days. Please renew.`
      );
    }
  });
};

module.exports = notifyRenewal;
