const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faceData: { type: String },  // base64 or embedding
  voiceData: { type: String }, // base64 or embedding
});

module.exports = mongoose.model('User', UserSchema);