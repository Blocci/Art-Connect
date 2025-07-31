// models/Artwork.js
const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link artwork to the user
}, { timestamps: true });

const Artwork = mongoose.model('Artwork', ArtworkSchema);

module.exports = Artwork;