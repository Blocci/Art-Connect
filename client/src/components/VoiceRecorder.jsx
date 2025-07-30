import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import Spinner from "./Spinner";

const API_BASE = process.env.REACT_APP_API_BASE || "https://your-backend.onrender.com/api";
const VOICE_MATCH_THRESHOLD = 0.75; // adjust for strictness

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

  const euclideanDistance = (v1, v2) => {
    if (!v1 || !v2 || v1.length !== v2.length) return Infinity;
    return Math.sqrt(v1.reduce((sum, val, i) => sum + (val - v2[i]) ** 2, 0));
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

      if (!res.ok) {
        setStatusMsg("❌ Upload failed: " + (data.message || "Bad request"));
        return;
      }

      if (mode === "register") {
        setStatusMsg("✅ Voice registered.");
        onUploadComplete?.();
      } else {
        const recordedDescriptor = data.descriptor;

        if (!recordedDescriptor) {
          setStatusMsg("❌ Voice descriptor not returned.");
          return;
        }

        // Fetch stored descriptor
        const storedRes = await fetch(`${API_BASE}/api/get-voice`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const storedData = await storedRes.json();
        const storedDescriptor = storedData?.descriptor;

        if (!storedDescriptor) {
          setStatusMsg("❌ No enrolled voice found.");
          return;
        }

        const distance = euclideanDistance(recordedDescriptor, storedDescriptor);

        if (distance < VOICE_MATCH_THRESHOLD) {
          setStatusMsg("✅ Voice matched. Access granted.");
          onUploadComplete?.();
        } else {
          setStatusMsg("❌ Voice did not match. Try again.");
        }
      }
    } catch (err) {
      console.error("❌ Voice upload error:", err);
      setStatusMsg("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md w-fit bg-white">
      <h2 className="text-lg font-bold mb-2">Voice Recorder</h2>

      {uploading ? (
        <Spinner text="Processing voice..." />
      ) : (
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
                    Upload
                  </button>
                </div>
              )}

              {statusMsg && (
                <p className="mt-2 text-sm text-gray-700">{statusMsg}</p>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
};

export default VoiceRecorder;