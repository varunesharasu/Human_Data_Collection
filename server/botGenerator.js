const fs = require("fs");

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function generateBotSample(id) {
  return {
    session_id: `bot_${id}`,
    user_id: "bot",

    // Mouse (bots are smooth + fast)
    avgVelocity: randomBetween(1.5, 3.5),
    maxVelocity: randomBetween(3, 6),
    totalDistance: randomBetween(800, 1500),

    // Keyboard (very consistent)
    avgTyping: randomBetween(80, 150),
    typingStd: randomBetween(5, 30),
    pauseCount: Math.floor(randomBetween(0, 2)),

    // Scroll (linear behavior)
    scrollDistance: randomBetween(500, 1500),
    scrollChanges: Math.floor(randomBetween(0, 1)),

    // Clicks
    clickCount: Math.floor(randomBetween(1, 3)),

    // Always perfect typing
    accuracy: 1
  };
}

function run() {
  const samples = [];

  for (let i = 0; i < 50; i++) {
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

  console.log("✅ bot_features.csv generated");
}

run();