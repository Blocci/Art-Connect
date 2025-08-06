const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid"); // for temp file names

async function convertToWav(inputPath) {
  const outputPath = path.join(__dirname, `temp-${uuidv4()}.wav`);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("pcm_s16le")
      .audioChannels(1)
      .audioFrequency(16000)
      .format("wav")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}

async function getVoiceDescriptorFromFile(filePath) {
  const convertedPath = await convertToWav(filePath);
  const form = new FormData();
  form.append("audio", fs.createReadStream(convertedPath));

  try {
    const response = await axios.post(
      "http://localhost:5000/extract-voice-descriptor",
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(convertedPath); // cleanup converted
    return response.data.descriptor;
  } catch (err) {
    fs.unlinkSync(convertedPath);
    console.error("Failed to extract voice descriptor:", err.response?.data || err.message);
    throw new Error("Voice descriptor extraction failed");
  }
}

module.exports = {
  getVoiceDescriptorFromFile,
  cosineSimilarity: (a, b) => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
    return dot / (magA * magB);
  }
};