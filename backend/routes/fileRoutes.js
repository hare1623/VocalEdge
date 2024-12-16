const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const authenticateUser = require("../middlewares/authenticateUser");
const File = require("../models/File");
const User = require("../models/User");
const openai = require("openai");
const generateAudio = require("../utils/textToSpeech");

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
      content: text.substring(0, 1000),
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

// Dashboard Route
router.get("/dashboard", authenticateUser, async (req, res) => {
    try {
      // Fetch uploaded files for the logged-in user
      const files = await File.find({ userId: req.user.id }).sort({ uploadTime: -1 });
  
      // Fetch user subscription details
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      const subscription = {
        isActive: user.subscription.isActive,
        expiresAt: user.subscription.expiresAt,
      };
  
      res.status(200).json({ files, subscription });
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      res.status(500).json({ message: "Failed to fetch dashboard data." });
    }
  });



// Summarize File Content
router.post("/summarize", authenticateUser, async (req, res) => {
  const { fileId } = req.body;

  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found." });

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes documents." },
        { role: "user", content: `Summarize this text: ${file.content}` },
      ],
      max_tokens: 200,
    });

    const summary = response.data.choices[0].message.content.trim();
    res.status(200).json({ summary });
  } catch (error) {
    console.error("Summarization error:", error.message);
    res.status(500).json({ message: "Failed to summarize file content." });
  }
});


// Convert Text to Audio Script
router.post("/text-to-audio", authenticateUser, async (req, res) => {
  const { fileId, selectedText } = req.body;

  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found." });

    const text = selectedText || file.content;

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates audio scripts." },
        { role: "user", content: `Generate an audio script for this text: ${text}` },
      ],
      max_tokens: 500,
    });

    const audioScript = response.data.choices[0].message.content.trim();
    res.status(200).json({ message: "Audio script generated successfully.", audioScript });
  } catch (error) {
    console.error("Text-to-audio error:", error.message);
    res.status(500).json({ message: "Failed to generate audio script." });
  }
});


// Q&A Based on File Content
router.post("/ask-question", authenticateUser, async (req, res) => {
  const { fileId, question } = req.body;

  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found." });

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant for answering questions." },
        { role: "user", content: `Based on this text: ${file.content}, answer this question: ${question}` },
      ],
      max_tokens: 200,
    });

    const answer = response.data.choices[0].message.content.trim();
    res.status(200).json({ answer });
  } catch (error) {
    console.error("Q&A error:", error.message);
    res.status(500).json({ message: "Failed to answer the question." });
  }
});

//audio generation
router.post("/generate-audio", authenticateUser, async (req, res) => {
  const { audioScript } = req.body;

  try {
    const fileName = `audio-${Date.now()}`;
    const filePath = await generateAudio(audioScript, fileName);
    res.status(200).json({ message: "Audio generated successfully", filePath });
  } catch (error) {
    console.error("Audio generation error:", error.message);
    res.status(500).json({ message: "Failed to generate audio" });
  }
});

//file search
router.get("/search", authenticateUser, async (req, res) => {
  const { query } = req.query;

  try {
    const files = await File.find({
      userId: req.user.id,
      originalName: { $regex: query, $options: "i" },
    });

    res.status(200).json({ files });
  } catch (error) {
    console.error("File search error:", error.message);
    res.status(500).json({ message: "Failed to search files" });
  }
});



module.exports = router;
