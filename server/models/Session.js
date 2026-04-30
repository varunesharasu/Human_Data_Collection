const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  session_id: String,

  mouse: [
    {
      x: Number,
      y: Number,
      t: Number
    }
  ],

  clicks: [
    {
      x: Number,
      y: Number,
      t: Number
    }
  ],

  scroll: [
    {
      y: Number,
      t: Number
    }
  ],

  keyboard_timings: [Number],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Session", sessionSchema);