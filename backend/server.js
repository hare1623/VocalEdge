const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const limiter = require("./middlewares/rateLimiter");
const cron = require("node-cron");
const notifyRenewal = require("./utils/subscriptionController");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", require("./routes/index"));
app.use("/api/webhook", bodyParser.raw({ type: "application/json" }));
app.use(limiter);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

// Run every day at midnight
cron.schedule("0 0 * * *", notifyRenewal);

app.use(errorHandler);
