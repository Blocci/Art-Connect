import React from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';

const VoiceRecorder = ({ token, onUploadComplete }) => {
  const handleStop = async (recordedBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', recordedBlob.blob, 'voice.webm');

      const res = await axios.post(
        'http://localhost:3000/api/auth/verify-voice',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success && onUploadComplete) {
        onUploadComplete();
      } else {
        alert('Voice verification failed, please try again.');
      }
    } catch (err) {
      console.error('Voice upload error:', err);
      alert('Error uploading voice.');
    }
  };

  return (
    <div className="p-4 border rounded shadow-md w-fit bg-white">
      <h2 className="text-lg font-bold mb-2">Voice Recorder</h2>
      <ReactMediaRecorder
        audio
        onStop={handleStop}
        render={({ status, startRecording, stopRecording }) => (
          <div>
            <p>Status: {status}</p>
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            >
              Start
            </button>
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Stop
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default VoiceRecorder;