const express = require("express");
const userRoutes = require("./userRoutes");
const paymentRoutes = require("./paymentRoutes");
const fileRoutes = require("./fileRoutes");
const webhookRoutes = require("./webhook");

const router = express.Router();

const path = require("path");


router.use("/user", userRoutes);
router.use("/payment", paymentRoutes);
router.use("/files", fileRoutes);
router.use("/webhook", webhookRoutes);

module.exports = router;
