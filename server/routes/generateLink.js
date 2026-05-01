const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataFile = path.join(__dirname, "../data/content.json");

// Generate one-time link
router.post("/", (req, res) => {
  try {
    const { contentId } = req.body;

    if (!contentId) {
      return res.status(400).json({ error: "Content ID required" });
    }

    // Check if data file exists
    if (!fs.existsSync(dataFile)) {
      return res.status(404).json({ error: "No content found" });
    }

    // Read content list
    const data = JSON.parse(fs.readFileSync(dataFile));

    const item = data.find(c => c.id == contentId);

    if (!item) {
      return res.status(404).json({ error: "Content not found" });
    }

    // 🔐 Generate token
    const token = Date.now() + "-" + Math.random().toString(36).substring(2);

    // Save token to that content
    item.token = token;

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    // 🌍 FIX: Dynamic base URL (works locally + on Render)
    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    const link = `${baseUrl}/watch/${token}`;

    // ✅ Send response
    res.json({
      message: "Link generated",
      url: link
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate link" });
  }
});

module.exports = router;