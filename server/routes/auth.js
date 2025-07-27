const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registration Route
router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create user
      const newUser = new User({
        username,
        password: hashedPassword,
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

// Login Route
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Sign JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ token, message: 'Login successful' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;

const verifyToken = require("../middleware/verifyToken");

// Temporary: a fake login route for testing
router.post("/login", (req, res) => {
  // Normally you'd validate user credentials from DB
  const user = { id: "123", username: "testuser" };

  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// 🔐 Protected route: only accessible with valid JWT
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route!", user: req.user });
});

module.exports = router;

const multer = require("multer");
const path = require("path");

// Setup multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `voice-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// POST /upload-voice — Protected
router.post("/upload-voice", verifyToken, upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(200).json({
    message: "File uploaded successfully",
    filePath: req.file.path,
  });
});

module.exports = router;