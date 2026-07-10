const express = require("express");
const router  = express.Router();
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login",    login);

// Private routes (need JWT token)
router.get("/me",           protect, getMe);
router.put("/profile",      protect, updateProfile);

module.exports = router;
