import React from 'react';
import { ReactMediaRecorder } from "react-media-recorder";
import axios from "axios";

const VoiceRecorder = () => (
  <div className="p-4 border rounded shadow-md w-fit bg-white">
    <h2 className="text-lg font-bold mb-2">Voice Recorder</h2>
    <ReactMediaRecorder
      audio
      render={({
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl
      }) => (
        <div>
          <p>Status: {status}</p>
          <button onClick={startRecording} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Start</button>
          <button onClick={stopRecording} className="px-4 py-2 bg-red-500 text-white rounded">Stop</button>
          <div className="mt-4">
            {mediaBlobUrl && (
              <audio src={mediaBlobUrl} controls />
            )}
          </div>
        </div>
      )}
    />
  </div>
);

export default VoiceRecorder;

// Add this inside the onStop callback
const onStop = (recordedBlob) => {
  console.log("Recording stopped", recordedBlob);

  const formData = new FormData();
  formData.append("audio", recordedBlob.blob, "voice.webm");

  axios.post("http://localhost:5000/api/auth/upload-voice", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token if you have login
    },
  })
  .then((res) => {
    console.log("Upload success:", res.data);
  })
  .catch((err) => {
    console.error("Upload error:", err.response?.data || err.message);
  });
};