const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

router.post("/", async (req, res) => {
  try {
    const {
      session_id,
      user_id,
      mouse,
      clicks,
      scroll,
      keyboard_timings,
      target_sentence,
      typed_text
    } = req.body;

    if (!session_id || !user_id) {
      return res.status(400).json({
        error: "Missing session_id or user_id"
      });
    }

    // Save full session (overwrite if exists)
    const session = await Session.findOneAndUpdate(
      { session_id },
      {
        session_id,
        user_id,
        target_sentence,
        typed_text,
        mouse: mouse || [],
        clicks: clicks || [],
        scroll: scroll || [],
        keyboard_timings: keyboard_timings || []
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log(`Saved session: ${session_id}`);

    res.status(200).json({
      success: true,
      session_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
  }
});

module.exports = router;