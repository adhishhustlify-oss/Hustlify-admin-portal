const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataFile = path.join(__dirname, "../data/content.json");

// Watch route
router.get("/:token", (req, res) => {
  try {
    const { token } = req.params;

    // Check file exists
    if (!fs.existsSync(dataFile)) {
      return res.status(404).json({ error: "No content found" });
    }

    const data = JSON.parse(fs.readFileSync(dataFile));

    // Find item by token
    const item = data.find(c => c.token === token);

    if (!item) {
      return res.status(404).json({ error: "Invalid or expired link" });
    }

    // Build file URL
    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    const fileUrl = `${baseUrl}/${item.filePath.replace(/\\/g, "/")}`;

    // Send response
    res.json({
      content: {
        type: item.type,
        fileUrl
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load content" });
  }
});

module.exports = router;