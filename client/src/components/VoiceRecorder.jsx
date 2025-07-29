import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";

const API_BASE = "https://localhost:3001";

const VoiceRecorder = ({ token, mode = "verify", onUploadComplete }) => {
  const [blob, setBlob] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const endpoint = `${API_BASE}/api/${mode === "register" ? "enroll-voice" : "verify-voice"}`;

  const handleStop = (recordedBlob) => {
    if (recordedBlob?.blob && recordedBlob.blob.size > 0) {
      setBlob(recordedBlob.blob);
      setStatusMsg("✅ Recording captured. Click 'Upload' to continue.");
    } else {
      setStatusMsg("❌ Recording failed or empty. Please try again.");
    }
  };

  const uploadVoice = async () => {
    if (!blob || uploading) return;

    setUploading(true);
    setStatusMsg("📤 Uploading voice...");

    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice.webm");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg(data.message || "✅ Voice uploaded.");
        if (onUploadComplete) onUploadComplete();
      } else {
        setStatusMsg("❌ Upload failed: " + (data.message || "Bad request"));
      }
    } catch (err) {
      console.error("❌ Fetch upload error:", err);
      setStatusMsg("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md w-fit bg-white">
      <h2 className="text-lg font-bold mb-2">Voice Recorder</h2>
      <ReactMediaRecorder
        audio
        onStop={(blobUrl, blob) => handleStop({ blob, blobUrl })}
        render={({ status, startRecording, stopRecording }) => (
          <div>
            <p className="text-sm mb-2">Recording Status: {status}</p>
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            >
              Start Recording
            </button>
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Stop Recording
            </button>

            {blob && (
              <div className="mt-4 space-y-2">
                <audio controls src={URL.createObjectURL(blob)} />
                <button
                  onClick={uploadVoice}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}

            {statusMsg && (
              <p className="mt-2 text-sm text-gray-700">{statusMsg}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default VoiceRecorder;