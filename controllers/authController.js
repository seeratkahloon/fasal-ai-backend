const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fasal_ai_secret_key_2024", {
    expiresIn: "90d",
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, cropType, location } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }
    const user = await User.create({ name, email, password, cropType, location });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        cropType: user.cropType,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        cropType: user.cropType,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id:        req.user._id,
      name:      req.user.name,
      email:     req.user.email,
      cropType:  req.user.cropType,
      location:  req.user.location,
      createdAt: req.user.createdAt,
    },
  });
};

const updateProfile = async (req, res) => {
  try {
    const { name, cropType, location, language } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, cropType, location, language },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: "Profile updated!", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not update profile." });
  }
};

module.exports = { register, login, getMe, updateProfile };
