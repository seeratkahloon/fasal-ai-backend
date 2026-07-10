const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const { detectDisease, getReports, getReport, deleteReport } = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

// Multer config — store in memory, send to Cloudinary
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."), false);
  },
});

// All routes are protected (login required)
router.post("/detect",  protect, upload.single("image"), detectDisease);
router.get("/",         protect, getReports);
router.get("/:id",      protect, getReport);
router.delete("/:id",   protect, deleteReport);

module.exports = router;
