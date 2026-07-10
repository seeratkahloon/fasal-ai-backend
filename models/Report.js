const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  cropType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  // AI Detection Results
  disease: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  severity: {
    type: String,
    enum: ["None", "Low", "Moderate", "High"],
    default: "Moderate",
  },
  // AI Advisory
  treatment: [{
    type: String,
  }],
  prevention: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", ReportSchema);
