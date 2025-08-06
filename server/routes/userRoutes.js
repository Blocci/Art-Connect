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
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'client', 'public', 'static', 'artworks'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});

// Ensure 'client/public/static/artworks' folder exists, or create it
const artworkFolderPath = path.join(__dirname, '..', '..', 'client', 'public', 'static', 'artworks');
if (!fs.existsSync(artworkFolderPath)) {
  fs.mkdirSync(artworkFolderPath, { recursive: true });
  console.log("Static artwork folder created at:", artworkFolderPath);
} else {
  console.log("Static artwork folder already exists.");
}

// Multer setup for saving into /client/public/static/artworks/
const artworkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, artworkFolderPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadArtwork = multer({
  storage: artworkStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB for artwork image
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});
// --- Register ---
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: 'Missing username, email, or password' });

    if (await User.findOne({ username }))
      return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashedPassword });
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

    // Validation: descriptor must be an array with enough values (e.g. 128)
    if (!Array.isArray(descriptor) || descriptor.length < 10) {
      console.log("Invalid face descriptor received:", descriptor);
      return res.status(400).json({ error: "Descriptor is missing or invalid" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    user.faceDescriptor = descriptor;
    await user.save();

    console.log(`Face descriptor saved for ${user.username}. Length: ${descriptor.length}`);
    res.status(200).json({ message: "Face enrolled successfully" });
  } catch (err) {
    console.error("Error during face enrollment:", err);
    res.status(500).json({ error: "Server error during face enrollment" });
  }
});

// --- Artwork Upload ---
router.post("/upload-artwork", verifyToken, uploadArtwork.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description || !req.file) {
      return res.status(400).json({ error: 'Missing title, description, or image' });
    }

    // Log the file path for debugging
    console.log('File received:', req.file);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Create the relative path for the image (excluding 'uploads' directory)
    const imageUrl = req.file.filename;

    console.log("Cleaned imageUrl:", imageUrl);  // Strip out 'uploads/' for the relative path

    const artwork = new Artwork({
      title,
      description,
      imageUrl, // Save the relative path in the database
      userId: user._id,        // Link artwork to the user
    });

    await artwork.save();
    res.status(201).json({ message: "Artwork uploaded successfully", artwork });
  } catch (err) {
    console.error('Error uploading artwork:', err);
    res.status(500).json({ error: 'Server error during artwork upload' });
  }
});

// In your userRoutes.js
router.delete("/delete-artwork/:id", verifyToken, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ error: "Artwork not found" });
    }

    if (artwork.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Construct full path to image
    const imagePath = path.join(__dirname, '..', '..', 'client', 'public', 'static', 'artworks', artwork.imageUrl);

    // Delete the artwork document first
    await Artwork.deleteOne({ _id: artwork._id });

    // Attempt to delete the image file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("Deleted image file:", imagePath);
    } else {
      console.log("Image file not found (already deleted?):", imagePath);
    }

    res.status(200).json({ message: "Artwork and image deleted successfully" });
  } catch (err) {
    console.error("Error deleting artwork:", err);
    res.status(500).json({ error: "Failed to delete artwork" });
  }
});

router.get("/artworks/public", async (req, res) => {
  try {
    const artworks = await Artwork.find().populate("userId", "username");
    res.status(200).json({ artworks });
  } catch (err) {
    console.error("Error fetching public artworks:", err);
    res.status(500).json({ error: "Failed to fetch public artworks" });
  }
});

router.get("/artworks", verifyToken, async (req, res) => {
  try {
    const artworks = await Artwork.find({ userId: req.user.id }).populate("userId", "username"); // get all, not just for a user
    res.status(200).json({ artworks });
  } catch (err) {
    console.error('Error fetching artworks:', err);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

router.get('/get-face', verifyToken, async (req, res) => {
  try {
    console.log("/get-face hit");
    console.log("User from token:", req.user); // make sure this logs something

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Found user:", user.username);
    console.log("faceDescriptor type:", typeof user.faceDescriptor);
    console.log("faceDescriptor content:", user.faceDescriptor);

    if (!Array.isArray(user.faceDescriptor) || user.faceDescriptor.length === 0) {
      console.log("Invalid or missing face descriptor");
      return res.status(404).json({ error: "Face descriptor not found" });
    }

    console.log("Returning face descriptor");
    res.status(200).json({ descriptor: user.faceDescriptor });
  } catch (err) {
    console.error("Error in /get-face:", err);
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

    res.status(200).json({ message: "Voice enrolled successfully" });
  } catch (err) {
    console.error("Voice enrollment error:", err);
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
    console.error("Voice verification error:", err);
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
    console.error("Error in /get-voice:", err);
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

  res.status(200).json({ message: "Voice descriptor saved." });
});

// --- Get current user's profile ---
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ message: "Server error retrieving user profile" });
  }
});

// --- Update Profile ---
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: "Missing username or email" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username;
    user.email = email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error during profile update" });
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