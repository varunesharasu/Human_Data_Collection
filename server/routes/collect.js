const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

router.post("/", async (req, res) => {
  try {
    const {
      session_id,
      mouse,
      clicks,
      scroll,
      keyboard_timings
    } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    await Session.updateOne(
      { session_id },
      {
        $push: {
          mouse: { $each: mouse || [] },
          clicks: { $each: clicks || [] },
          scroll: { $each: scroll || [] },
          keyboard_timings: { $each: keyboard_timings || [] }
        }
      },
      { upsert: true }
    );

    console.log(
      `Session ${session_id} | mouse: ${mouse?.length || 0}`
    );

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;