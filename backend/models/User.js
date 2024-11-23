const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  otp: String,
  otpExpiresAt: Date,
  isVerified: { type: Boolean, default: false },
  subscription: {
    id: String,
    isActive: { type: Boolean, default: false },
    expiresAt: Date,
  },
});

module.exports = mongoose.model("User", userSchema);
