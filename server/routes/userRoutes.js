const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require('../models/User');
const Artwork = require('../models/Artwork');  // Artwork model for saving uploaded art
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

// Ensure 'uploads/artworks' folder exists, or create it
const artworkFolderPath = path.join(__dirname, '..', 'uploads', 'artworks');
if (!fs.existsSync(artworkFolderPath)) {
  fs.mkdirSync(artworkFolderPath, { recursive: true });
  console.log("Uploads/artworks folder created.");
} else {
  console.log("Uploads/artworks folder already exists.");
}

// Multer setup for artwork uploads
const artworkStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/artworks/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const uploadArtwork = multer({
  storage: artworkStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB for artwork image
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
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

    // ✅ Validation: descriptor must be an array with enough values (e.g. 128)
    if (!Array.isArray(descriptor) || descriptor.length < 10) {
      console.log("❌ Invalid face descriptor received:", descriptor);
      return res.status(400).json({ error: "Descriptor is missing or invalid" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    user.faceDescriptor = descriptor;
    await user.save();

    console.log(`✅ Face descriptor saved for ${user.username}. Length: ${descriptor.length}`);
    res.status(200).json({ message: "Face enrolled successfully" });
  } catch (err) {
    console.error("🔥 Error during face enrollment:", err);
    res.status(500).json({ error: "Server error during face enrollment" });
  }
});

// --- Artwork Upload ---
router.post("/upload-artwork", verifyToken, uploadArtwork.single("image"), async (req, res) => {
  try {
    console.log('File received:', req.file);  // Log file details
    const { title, description } = req.body;

    // Validate input
    if (!title || !description || !req.file) {
      console.log('Missing title, description, or image');  // Log missing fields
      return res.status(400).json({ error: 'Missing title, description, or image' });
    }

    // Save artwork details in the database
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: "User not found" });
    }

    const artwork = new Artwork({
      title,
      description,
      imageUrl: req.file.path,  // Save the path of the uploaded image
      userId: user._id,        // Link artwork to the user
    });

    await artwork.save();
    console.log('Artwork uploaded successfully:', artwork);
    res.status(201).json({ message: "Artwork uploaded successfully", artwork });
  } catch (err) {
    console.error('Error uploading artwork:', err);  // Log any errors
    res.status(500).json({ error: 'Server error during artwork upload' });
  }
});

// In your userRoutes.js
router.delete("/delete-artwork/:id", verifyToken, async (req, res) => {
  try {
    console.log("Attempting to delete artwork with ID:", req.params.id);
    console.log("Logged-in user ID:", req.user.id);

    // Find the artwork by ID
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      console.log("Artwork not found with ID:", req.params.id);
      return res.status(404).json({ error: "Artwork not found" });
    }

    // Log user and artwork comparison
    console.log("Artwork's userId:", artwork.userId);
    console.log("Comparing with logged-in userId:", req.user.id);

    // Check if the logged-in user is the owner of the artwork
    if (artwork.userId.toString() !== req.user.id) {
      console.log("User is not authorized to delete this artwork");
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Use deleteOne() instead of remove()
    await Artwork.deleteOne({ _id: req.params.id }); // Deletes the artwork by ID
    console.log("Artwork deleted successfully:", artwork._id);

    res.status(200).json({ message: "Artwork deleted successfully" });
  } catch (err) {
    console.error("Error deleting artwork:", err);
    res.status(500).json({ error: "Failed to delete artwork" });
  }
});

router.get("/artworks", verifyToken, async (req, res) => {
  try {
    // Fetch artworks associated with the logged-in user
    const artworks = await Artwork.find({ userId: req.user.id }); 
    res.status(200).json({ artworks });
  } catch (err) {
    console.error('Error fetching artworks:', err);
    res.status(500).json({ error: 'Failed to fetch artworks' });
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
router.post("/enroll-voice", verifyToken, async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!Array.isArray(descriptor) || descriptor.length < 10) {
      return res.status(400).json({ message: "Invalid voice descriptor" });
    }

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

router.get('/get-voice', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.voiceDescriptor || user.voiceDescriptor.length < 10) {
      return res.status(404).json({ error: "Voice descriptor not found" });
    }

    res.status(200).json({ descriptor: user.voiceDescriptor });
  } catch (err) {
    console.error("❌ Error in /get-voice:", err);
    res.status(500).json({ error: "Server error retrieving voice descriptor" });
  }
});

router.post("/save-voice-descriptor", verifyToken, async (req, res) => {
  const { descriptor } = req.body;

  if (!Array.isArray(descriptor) || descriptor.length < 10) {
    return res.status(400).json({ message: "Invalid voice descriptor" });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.voiceDescriptor = descriptor;
  await user.save();

  res.status(200).json({ message: "✅ Voice descriptor saved." });
});

// --- Misc Routes ---
router.get("/ping", (req, res) => {
  res.send("pong");
});

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

module.exports = router;