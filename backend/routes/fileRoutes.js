const express = require("express");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const authenticateUser = require("../middlewares/authenticateUser");
const upload = require("../middlewares/uploadMiddleware");
const File = require("../models/File");
const User = require("../models/User");
const OpenAI = require('openai');


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

const router = express.Router();

// Utility function for standardized error responses
const sendError = (res, message, status = 500) => {
  console.error(message);
  res.status(status).json({ message });
};

// Upload Route
router.post("/upload", authenticateUser, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded." });

    let fullContent = "";
    if (file.mimetype === "application/pdf") {
      const pdfBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(pdfBuffer);
      fullContent = pdfData.text;
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const docxBuffer = fs.readFileSync(file.path);
      const docxData = await mammoth.extractRawText({ buffer: docxBuffer });
      fullContent = docxData.value;
    }

    const metadata = {
      userId: req.user.id,
      fileName: file.filename,
      originalName: file.originalname,
      uploadTime: new Date(),
      fileType: file.mimetype,
      filePath: `/uploads/${file.filename}`,
      fullContent,
    };

    const newFile = new File(metadata);
    const savedFile = await newFile.save();

    res.status(200).json({
      message: "File uploaded successfully.",
      fileId: savedFile._id,
      metadata,
    });
  } catch (error) {
    console.error("File upload error:", error.message);
    res.status(500).json({ message: "Failed to upload file." });
  }
});


// Clear all uploaded files
router.delete("/clear-uploads", authenticateUser, async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, "../uploads");
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return sendError(res, "Failed to read upload directory.", 500);
      }

      files.forEach((file) => {
        fs.unlink(path.join(uploadDir, file), (err) => {
          if (err) {
            console.error("Failed to delete file:", file, err);
          } else {
            console.log("Deleted file:", file);
          }
        });
      });

      res.status(200).json({ message: "All uploaded files have been cleared." });
    });
  } catch (error) {
    sendError(res, `Error clearing uploads: ${error.message}`);
  }
});


// Get All Uploaded Files for a User
router.get("/", authenticateUser, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ uploadTime: -1 });
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No files found." });
    }
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ message: "Failed to fetch files." });
  }
});


// Get Specific File 
router.get("/metadata/:fileName", authenticateUser, async (req, res) => {
  const { fileName } = req.params;

  try {
    console.log("Fetching metadata for file:", fileName);

    // Sanitize and encode the file name to handle special characters
    const sanitizedFileName = decodeURIComponent(fileName.trim());

    // Log the sanitized file name for debugging
    console.log("Sanitized file name:", sanitizedFileName);

    // Use a case-insensitive query with a regex
    const file = await File.findOne({ fileName: { $regex: new RegExp(`^${sanitizedFileName}$`, "i") } });

    if (!file) {
      console.warn(`File not found for fileName: ${sanitizedFileName}`);
      return res.status(404).json({ message: "File not found." });
    }

    // Return the file metadata
    console.log("File metadata fetched successfully:", file);
    res.json({ message: "File metadata fetched successfully.", file });
  } catch (error) {
    console.error(`Error fetching file metadata for fileName: ${fileName}`, error);
    res.status(500).json({ message: "Failed to fetch file metadata.", error });
  }
});

module.exports = router;




//Delete file
router.delete("/:fileName", authenticateUser, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ userId: req.user.id, fileName: req.params.fileName });
    if (!file) return res.status(404).json({ message: "File not found." });

    const filePath = path.join(__dirname, "../uploads", file.fileName);

    // Delete file from filesystem
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file from filesystem:", err.message);
    });

    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res.status(500).json({ message: "Failed to delete file." });
  }
});


// Dashboard Route
router.get("/dashboard", authenticateUser, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ uploadTime: -1 });
    const user = await User.findById(req.user.id);

    if (!user) return sendError(res, "User not found.", 404);

    const subscription = {
      isActive: user.subscription?.isActive || false,
      expiresAt: user.subscription?.expiresAt || null,
    };

    res.status(200).json({ files, subscription });
  } catch (error) {
    sendError(res, `Error fetching dashboard data: ${error.message}`);
  }
});

// Summarize File Content
router.post("/summarize", authenticateUser, async (req, res) => {
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ message: "File name is required." });
  }

  try {
    const filePath = path.join(__dirname, "../uploads", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found in uploads folder." });
    }

    let content;
    if (fileName.endsWith(".pdf")) {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      content = pdfData.text;
    } else if (fileName.endsWith(".docx")) {
      const docxBuffer = fs.readFileSync(filePath);
      const docxData = await mammoth.extractRawText({ buffer: docxBuffer });
      content = docxData.value;
    } else {
      return res.status(400).json({ message: "Unsupported file type. Only PDF and DOCX are supported." });
    }
    const limitedContent = content.substring(0, 3000);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes documents." },
        { role: "user", content: `Summarize this text: ${limitedContent}` },
      ],
      max_tokens: 200,
    });

    const summary = response.choices[0]?.message?.content.trim();
    if (!summary) {
      return res.status(500).json({ message: "Failed to generate a summary." });
    }

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Summarization error:", error.message);
    res.status(500).json({ message: "Failed to summarize file content." });
  }
});


// Search Files
router.get("/search", authenticateUser, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return sendError(res, "Query parameter is required for search.", 400);
  }

  try {
    const files = await File.find({
      userId: req.user.id,
      originalName: { $regex: query, $options: "i" },
    });

    if (files.length === 0) {
      return res.status(404).json({ message: "No files matching the query were found." });
    }

    res.status(200).json({ files });
  } catch (error) {
    sendError(res, `File search error: ${error.message}`);
  }
});

// Q&A Based on File Content
router.post("/ask-question", authenticateUser, async (req, res) => {
  const { fileName, question } = req.body;

  if (!fileName || !question) {
    return res.status(400).json({ message: "File name and question are required." });
  }

  try {
    // Construct the file path
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found in uploads folder." });
    }

    let content;

    // Extract content based on file type
    if (fileName.endsWith(".pdf")) {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      content = pdfData.text;
    } else if (fileName.endsWith(".docx")) {
      const docxBuffer = fs.readFileSync(filePath);
      const docxData = await mammoth.extractRawText({ buffer: docxBuffer });
      content = docxData.value;
    } else {
      return res.status(400).json({ message: "Unsupported file type. Only PDF and DOCX are supported." });
    }

    // Limit content to 3000 characters (OpenAI's input token limit considerations)
    const limitedContent = content.substring(0, 3000);

    // Prepare the prompt and send it to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant for answering questions." },
        { role: "user", content: `Based on this text: ${limitedContent}, answer: ${question}` },
      ],
      max_tokens: 200, // Limit the response length
    });

    // Respond with the answer
    const answer = response.choices[0]?.message?.content.trim();
    if (!answer) {
      return res.status(500).json({ message: "Failed to generate an answer." });
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Q&A error:", error.message);
    res.status(500).json({ message: "Failed to answer the question." });
  }
});



module.exports = router;
