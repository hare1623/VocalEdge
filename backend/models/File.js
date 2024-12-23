const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadTime: { type: Date, default: Date.now },
  fileType: { type: String, required: true }, 
  content: { type: String },
});

module.exports = mongoose.model("File", fileSchema);
