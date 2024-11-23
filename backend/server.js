const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", require("./routes/index"));
app.use("/api/webhook", bodyParser.raw({ type: "application/json" }));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));