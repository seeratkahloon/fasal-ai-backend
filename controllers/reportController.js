const Report     = require("../models/Report");
const axios      = require("axios");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a crop image." });
    }

    const { cropType, description } = req.body;
    console.log("📸 Image received, uploading to Cloudinary...");

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "fasal-ai/crops", resource_type: "image" },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(req.file.buffer);
    });

    const imageUrl = uploadResult.secure_url;
    console.log("✅ Cloudinary upload success:", imageUrl);

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    console.log(`🤖 Calling AI service at ${aiServiceUrl}...`);

    let aiResult;
    try {
      const aiResponse = await axios.post(
        `${aiServiceUrl}/detect`,
        { image_url: imageUrl, crop_type: cropType },
        { timeout: 30000 }
      );

      if (!aiResponse.data.success) {
        throw new Error(aiResponse.data.error || "AI service returned an error");
      }

      aiResult = aiResponse.data;
      console.log("✅ AI result:", aiResult);
    } catch (aiError) {
      console.error("❌ AI service call failed:", aiError.message);
      return res.status(502).json({
        success: false,
        message: "Could not analyze the image right now. Please try again in a moment.",
      });
    }

    // Save to MongoDB
    const report = await Report.create({
      user:        req.user._id,
      imageUrl,
      cropType,
      description: description || "",
      disease:     aiResult.disease,
      confidence:  aiResult.confidence,
      severity:    aiResult.severity,
      treatment:   aiResult.treatment,
      prevention:  aiResult.prevention,
    });

    console.log("✅ Report saved to MongoDB");
    res.status(201).json({ success: true, report });

  } catch (error) {
    console.error("❌ Detection error:", error.message);
    res.status(500).json({ success: false, message: "Detection failed. Please try again." });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch reports." });
  }
};

const getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch report." });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }
    res.json({ success: true, message: "Report deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not delete report." });
  }
};

module.exports = { detectDisease, getReports, getReport, deleteReport };