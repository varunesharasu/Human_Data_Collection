const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const Session = require("./models/Session");

// ---------------- CONNECT DB ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected for feature extraction"))
  .catch(err => console.error(err));

// ---------------- UTILS ----------------

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr, avg) {
  if (!arr.length) return 0;
  return Math.sqrt(
    arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length
  );
}

// ---------------- FEATURE EXTRACTION ----------------

function extractFeatures(session) {
  const mouse = session.mouse || [];
  const typing = session.keyboard_timings || [];
  const scroll = session.scroll || [];

  // ---------- MOUSE ----------
  let velocities = [];
  let totalDistance = 0;

  for (let i = 1; i < mouse.length; i++) {
    const dx = mouse[i].x - mouse[i - 1].x;
    const dy = mouse[i].y - mouse[i - 1].y;
    const dt = mouse[i].t - mouse[i - 1].t;

    if (dt > 0) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      totalDistance += dist;

      const v = dist / dt;
      velocities.push(v);
    }
  }

  const avgVelocity = mean(velocities);
  const maxVelocity = velocities.length ? Math.max(...velocities) : 0;

  // ---------- KEYBOARD ----------
  const avgTyping = mean(typing);
  const typingStd = std(typing, avgTyping);

  const pauseCount = typing.filter(t => t > 500).length;

  // ---------- SCROLL ----------
  let scrollDistance = 0;
  let scrollChanges = 0;

  for (let i = 1; i < scroll.length; i++) {
    const diff = scroll[i].y - scroll[i - 1].y;
    scrollDistance += Math.abs(diff);

    if (i > 1) {
      const prevDiff = scroll[i - 1].y - scroll[i - 2].y;
      if (diff * prevDiff < 0) scrollChanges++; // direction change
    }
  }

  // ---------- CLICKS ----------
  const clickCount = session.clicks?.length || 0;

  // ---------- ACCURACY ----------
  const target = session.target_sentence || "";
  const typed = session.typed_text || "";

  const accuracy = target === typed ? 1 : 0;

  // ---------- OUTPUT ----------
  return {
    session_id: session.session_id,
    user_id: session.user_id,

    avgVelocity,
    maxVelocity,
    totalDistance,

    avgTyping,
    typingStd,
    pauseCount,

    scrollDistance,
    scrollChanges,

    clickCount,
    accuracy
  };
}

// ---------------- MAIN ----------------

async function run() {
  const sessions = await Session.find();

  if (!sessions.length) {
    console.log("No sessions found");
    process.exit();
  }

  const features = sessions.map(extractFeatures);

  console.log("Extracted features:");
  console.log(features);

  // -------- EXPORT CSV --------

  const headers = Object.keys(features[0]);

  const csvRows = [
    headers.join(","),
    ...features.map(row =>
      headers.map(h => row[h]).join(",")
    )
  ];

  fs.writeFileSync("features.csv", csvRows.join("\n"));

  console.log("\n✅ features.csv generated");

  process.exit();
}

run();