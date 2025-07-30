const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require('../models/User');
const verifyToken = require("../middleware/verifyToken");
const { getVoiceDescriptorFromFile, cosineSimilarity } = require("../utils/voiceDescriptor");

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for voice uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `voice-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});


// --- Register ---
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Missing username or password' });

    if (await User.findOne({ username }))
      return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered', token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});


// --- Login ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid credentials' });

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
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor))
      return res.status(400).json({ error: "Descriptor missing or invalid" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.faceDescriptor = descriptor;
    await user.save();
    res.status(200).json({ message: "Face enrolled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during face enrollment" });
  }
});


// --- Face Verification ---
function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return Infinity;
  return Math.sqrt(desc1.reduce((sum, val, i) => sum + Math.pow(val - desc2[i], 2), 0));
}

router.post('/verify-face', verifyToken, async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor))
      return res.status(400).json({ message: 'Invalid or missing face descriptor' });

    const user = await User.findById(req.user.id);
    if (!user?.faceDescriptor?.length)
      return res.status(404).json({ message: 'User face data not found' });

    const distance = euclideanDistance(descriptor, user.faceDescriptor);
    const threshold = 0.6;
    const match = distance < threshold;

    res.json({ match, distance });
  } catch (err) {
    console.error('Face verification error:', err);
    res.status(500).json({ message: 'Server error during face verification' });
  }
});

router.get('/get-face', verifyToken, async (req, res) => {
  try {
    console.log("🔍 /get-face hit");
    console.log("User from token:", req.user); // make sure this logs something

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Found user:", user.username);
    console.log("faceDescriptor type:", typeof user.faceDescriptor);
    console.log("faceDescriptor content:", user.faceDescriptor);

    if (!Array.isArray(user.faceDescriptor) || user.faceDescriptor.length === 0) {
      console.log("❌ Invalid or missing face descriptor");
      return res.status(404).json({ error: "Face descriptor not found" });
    }

    console.log("✅ Returning face descriptor");
    res.status(200).json({ descriptor: user.faceDescriptor });
  } catch (err) {
    console.error("🔥 Error in /get-face:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Voice Enrollment ---
router.post("/enroll-voice", verifyToken, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No voice file uploaded" });

    const descriptor = await getVoiceDescriptorFromFile(req.file.path);
    fs.unlinkSync(req.file.path);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.voiceDescriptor = descriptor;
    await user.save();

    res.status(200).json({ message: "✅ Voice enrolled successfully" });
  } catch (err) {
    console.error("❌ Voice enrollment error:", err);
    res.status(500).json({ message: "Server error during voice enrollment" });
  }
});


// --- Voice Verification ---
router.post("/verify-voice", verifyToken, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No voice file uploaded" });

    const uploadedDescriptor = await getVoiceDescriptorFromFile(req.file.path);
    fs.unlinkSync(req.file.path);

    const user = await User.findById(req.user.id);
    if (!user || !user.voiceDescriptor?.length)
      return res.status(400).json({ message: "No saved voice descriptor for user" });

    const similarity = cosineSimilarity(uploadedDescriptor, user.voiceDescriptor);
    const threshold = 0.75;
    const match = similarity >= threshold;

    res.status(match ? 200 : 401).json({
      success: match,
      similarity,
      message: match ? "Voice verified successfully" : "Voice verification failed"
    });
  } catch (err) {
    console.error("❌ Voice verification error:", err);
    res.status(500).json({ message: "Server error during voice verification" });
  }
});

// --- Misc Routes ---
router.get("/ping", (req, res) => {
  res.send("pong");
});

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

module.exports = router;