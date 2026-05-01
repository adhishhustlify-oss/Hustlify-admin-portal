const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataFile = path.join(__dirname, "../data/content.json");

router.get("/:token", (req, res) => {
  try {
    const { token } = req.params;

    if (!fs.existsSync(dataFile)) {
      return res.status(404).send("No content found");
    }

    const data = JSON.parse(fs.readFileSync(dataFile));

    const item = data.find(c => c.token === token);

    if (!item) {
      return res.status(404).send("Invalid or expired link");
    }

    // 🔥 ONE-TIME ACCESS → remove token
    delete item.token;
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    // 🎯 Redirect to file
    return res.redirect(`/${item.filePath}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error opening file");
  }
});

module.exports = router;