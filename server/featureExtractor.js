const mongoose = require("mongoose");
require("dotenv").config();

const Session = require("./models/Session");

mongoose.connect(process.env.MONGO_URI);

function extractFeatures(session) {
  const mouse = session.mouse;

  let velocities = [];

  for (let i = 1; i < mouse.length; i++) {
    const dx = mouse[i].x - mouse[i - 1].x;
    const dy = mouse[i].y - mouse[i - 1].y;
    const dt = mouse[i].t - mouse[i - 1].t;

    if (dt > 0) {
      const v = Math.sqrt(dx * dx + dy * dy) / dt;
      velocities.push(v);
    }
  }

  const avgVelocity =
    velocities.reduce((a, b) => a + b, 0) / velocities.length || 0;

  const typing = session.keyboard_timings;

  const avgTyping =
    typing.reduce((a, b) => a + b, 0) / typing.length || 0;

  const typingStd = Math.sqrt(
    typing.reduce((sum, val) => sum + Math.pow(val - avgTyping, 2), 0) /
      typing.length || 0
  );

  return {
    session_id: session.session_id,
    user_id: session.user_id,
    avgVelocity,
    avgTyping,
    typingStd,
    totalClicks: session.clicks.length
  };
}

async function run() {
  const sessions = await Session.find();

  const features = sessions.map(extractFeatures);

  console.log(features);
  process.exit();
}

run();