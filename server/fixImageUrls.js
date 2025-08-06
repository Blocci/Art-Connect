// fixImageUrls.js
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const Artwork = require("./models/Artwork");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/artconnect";

(async function runFix() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");

    const artworks = await Artwork.find();
    console.log(`Found ${artworks.length} artworks`);

    let updatedCount = 0;

    for (const artwork of artworks) {
      const original = artwork.imageUrl;

      if (!original) continue;

      const fixed = original.replace(/\\/g, "/").replace(/^uploads\//, "");

      if (original !== fixed) {
        console.log(`🔧 Fixing: ${original} → ${fixed}`);
        artwork.imageUrl = fixed;
        await artwork.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} artwork image paths.`);
    mongoose.disconnect();
  } catch (err) {
    console.error("Error fixing image URLs:", err);
    process.exit(1);
  }
})();