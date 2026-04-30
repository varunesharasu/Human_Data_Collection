const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  t: Number
}, { _id: false });

const scrollSchema = new mongoose.Schema({
  y: Number,
  t: Number
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },

  user_id: {
    type: String,
    required: true
  },

  // Task-related
  target_sentence: String,
  typed_text: String,

  mouse: [pointSchema],
  clicks: [pointSchema],
  scroll: [scrollSchema],
  keyboard_timings: [Number],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate session documents
sessionSchema.index({ session_id: 1 }, { unique: true });

module.exports = mongoose.model("Session", sessionSchema);