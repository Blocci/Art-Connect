const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faceDescriptor: { type: [Number], default: [] },
  voiceDescriptor: { type: [Number], default: [] }
});

module.exports = mongoose.model('User', UserSchema);