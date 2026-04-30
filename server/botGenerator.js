const fs = require("fs");

// -------- CONFIG --------
const NUM_SAMPLES = 200; // 👈 change this to 150 / 300 / 500 anytime

// -------- UTILS --------
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max));
}

// -------- BOT SAMPLE --------
function generateBotSample(id) {
  return {
    session_id: `bot_${id}`,
    user_id: "bot",

    // Mouse: smooth + fast
    avgVelocity: randomBetween(1.8, 3.8),
    maxVelocity: randomBetween(3.5, 6.5),
    totalDistance: randomBetween(800, 1600),

    // Keyboard: consistent, low variance
    avgTyping: randomBetween(70, 160),
    typingStd: randomBetween(5, 25),
    pauseCount: randomInt(0, 2),

    // Scroll: linear, minimal direction change
    scrollDistance: randomBetween(400, 1600),
    scrollChanges: randomInt(0, 2),

    // Clicks
    clickCount: randomInt(1, 3),

    // Bots are always perfect
    accuracy: 1
  };
}

// -------- MAIN --------
function run() {
  const samples = [];

  for (let i = 0; i < NUM_SAMPLES; i++) {
    samples.push(generateBotSample(i));
  }

  const headers = Object.keys(samples[0]);

  const csv = [
    headers.join(","),
    ...samples.map(row =>
      headers.map(h => row[h]).join(",")
    )
  ].join("\n");

  fs.writeFileSync("bot_features.csv", csv);

  console.log(`✅ bot_features.csv generated with ${NUM_SAMPLES} samples`);
}

run();