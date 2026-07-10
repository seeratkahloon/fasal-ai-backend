require('dotenv').config();
const express    = require("express");
const dotenv = require("dotenv");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");
const connectDB  = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// ========================
// Middleware
// ========================

// CORS — allow React frontend
app.use(cors({
  origin: "*",
  credentials: false,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting — prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,
  message:  "Too many requests. Please try again later.",
});
app.use("/api/", limiter);

// ========================
// Routes
// ========================
app.use("/api/auth",    require("./routes/auth"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/chat",    require("./routes/chat"));
app.use("/api/weather", require("./routes/weather"));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌾 FasalAI Backend is running!",
    version: "1.0.0",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Server Error" });
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FasalAI Server running on http://localhost:${PORT}`);
});
