const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const User = require('../models/User');
const verifyToken = require("../middleware/verifyToken");

// Multer setup for voice uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `voice-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// --- Registration ---
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (await User.findOne({ username })) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Face Enrollment ---
router.post("/enroll-face", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ error: "Descriptor missing or invalid" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.faceDescriptor = descriptor;
    await user.save();
    res.status(200).json({ message: "Face enrolled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during face enrollment" });
  }
});

// Helper: Euclidean distance for face verification
function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return Infinity;
  return Math.sqrt(desc1.reduce((sum, val, i) => sum + Math.pow(val - desc2[i], 2), 0));
}

// --- Face Verification ---
router.post('/verify-face', verifyToken, async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ message: 'Invalid or missing face descriptor' });
    }
    const user = await User.findById(req.user.id);
    if (!user || !user.faceDescriptor || user.faceDescriptor.length === 0) {
      return res.status(404).json({ message: 'User face data not found' });
    }
    const distance = euclideanDistance(faceDescriptor, user.faceDescriptor);
    const threshold = 0.6; // Adjust for strictness
    const match = distance < threshold;
    res.json({ match, distance });
  } catch (err) {
    console.error('Face verification error:', err);
    res.status(500).json({ message: 'Server error during face verification' });
  }
});

// --- Voice Upload & Save Hash ---
router.post("/upload-voice", verifyToken, upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const buffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    await User.findByIdAndUpdate(req.user.id, { voiceData: hash });
    res.status(200).json({ message: "Voice uploaded and hash saved", filePath: req.file.path, hash });
  } catch (err) {
    console.error("Error saving voice hash:", err);
    res.status(500).json({ error: "Failed to save voice data" });
  }
});

// --- Voice Verification ---
router.post("/verify-voice", verifyToken, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No audio file uploaded" });
    const user = await User.findById(req.user.id);
    if (!user || !user.voiceData) return res.status(400).json({ message: "No saved voice data for user" });

    const uploadedBuffer = fs.readFileSync(req.file.path);
    const uploadedHash = crypto.createHash("sha256").update(uploadedBuffer).digest("hex");

    if (uploadedHash === user.voiceData) {
      return res.status(200).json({ success: true, message: "Voice verified successfully" });
    } else {
      return res.status(401).json({ success: false, message: "Voice verification failed" });
    }
  } catch (err) {
    console.error("Voice verification error:", err);
    res.status(500).json({ message: "Server error during voice verification" });
  }
});

// Optional: test protected route
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route!", user: req.user });
});

module.exports = router;