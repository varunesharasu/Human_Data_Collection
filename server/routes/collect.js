const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.session_id) {
      return res.status(400).json({ error: "Invalid data" });
    }

    await Session.create(payload);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;