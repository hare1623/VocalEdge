const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const File = require("../models/File");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const authenticateUser = require("../middlewares/authenticateUser");

const router = express.Router();

// File Upload
router.post("/upload", authenticateUser, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileType = file.mimetype;
    let text = "";

    if (fileType === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const parsed = await pdfParse(dataBuffer);
      text = parsed.text;
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const dataBuffer = fs.readFileSync(file.path);
      const parsed = await mammoth.extractRawText({ buffer: dataBuffer });
      text = parsed.value;
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    const metadata = {
      userId: req.user.id,
      fileName: file.filename,
      originalName: file.originalname,
      uploadTime: new Date(),
      fileType,
      content: text.substring(0, 100),
    };

    const newFile = new File(metadata);
    await newFile.save();

    res.status(200).json({ message: "File uploaded and parsed successfully", metadata });
  } catch (error) {
    console.error("File upload error:", error.message);
    res.status(500).json({ message: "Failed to upload and parse file" });
  }
});

// Get Uploaded Files
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await File.find({ userId }).sort({ uploadTime: -1 });
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

module.exports = router;
