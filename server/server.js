const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/collect", require("./routes/collect"));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch(err => console.log(err));