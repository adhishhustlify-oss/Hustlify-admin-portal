const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 📦 Ensure folders exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create required folders
ensureDir("storage/videos");
ensureDir("storage/docs");

// 📦 Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("video")) {
      cb(null, "storage/videos/");
    } else {
      cb(null, "storage/docs/");
    }
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage });

// 📄 Path to JSON database
const dataFile = path.join(__dirname, "../data/content.json");

// 🚀 Upload route
router.post("/", upload.single("file"), (req, res) => {
  try {
    let data = [];

    // 📖 Read existing data
    if (fs.existsSync(dataFile)) {
      data = JSON.parse(fs.readFileSync(dataFile));
    }

    // 📌 New uploaded content
    const content = {
      id: Date.now(),
      filePath: req.file.path,
      type: req.file.mimetype.startsWith("video") ? "video" : "doc",
      originalName: req.file.originalname,
      createdAt: new Date(),
    };

    // ➕ Add to list
    data.push(content);

    // 💾 Save back
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    // ✅ Response
    res.json({
      message: "Uploaded successfully",
      content,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;