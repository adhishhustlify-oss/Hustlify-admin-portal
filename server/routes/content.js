const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataFile = path.join(__dirname, "../data/content.json");

// GET all content
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(dataFile)) {
      return res.json([]);
    }

    const data = fs.readFileSync(dataFile);
    const items = JSON.parse(data);

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load content" });
  }
});

module.exports = router;