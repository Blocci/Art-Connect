import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import Spinner from "./Spinner";

const VOICE_SERVICE_URL = "https://artconnect-voiceservice.onrender.com";
const API_BASE = process.env.REACT_APP_API_BASE;
const VOICE_MATCH_THRESHOLD = 0.75;

const VoiceRecorder = ({ token, mode = "verify", onUploadComplete }) => {
  const [blob, setBlob] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [descriptorReady, setDescriptorReady] = useState(false);
  const [descriptor, setDescriptor] = useState(null);
  const [uploading, setUploading] = useState(false);

  const descriptorEndpoint = `${VOICE_SERVICE_URL}/extract-voice-descriptor`;

  const handleStop = (recordedBlob) => {
    if (recordedBlob?.blob && recordedBlob.blob.size > 0) {
      setBlob(recordedBlob.blob);
      setStatusMsg("✅ Recording captured. Validating...");
      setDescriptorReady(false);
      extractDescriptor(recordedBlob.blob);
    } else {
      setStatusMsg("❌ Recording failed or empty. Please try again.");
      setBlob(null);
      setDescriptor(null);
      setDescriptorReady(false);
    }
  };

  const extractDescriptor = async (audioBlob) => {
    try {
      const jwt = localStorage.getItem("token");
      if (!jwt) {
        setStatusMsg("❌ No authentication token. Please log in.");
        return;
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");

      const res = await fetch(descriptorEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.descriptor || data.descriptor.length < 10) {
        console.error("❌ Voice descriptor extraction failed:", data);
        setStatusMsg("❌ Descriptor extraction failed. Try recording again.");
        setDescriptor(null);
        setDescriptorReady(false);
        return;
      }

      setDescriptor(data.descriptor);
      setDescriptorReady(true);
      setStatusMsg("✅ Voice ready. Click Upload.");
    } catch (err) {
      console.error("❌ Voice descriptor fetch error:", err);
      setStatusMsg("❌ Network error. Try again.");
      setDescriptorReady(false);
    }
  };

  const euclideanDistance = (v1, v2) => {
    if (!v1 || !v2 || v1.length !== v2.length) return Infinity;
    return Math.sqrt(v1.reduce((sum, val, i) => sum + (val - v2[i]) ** 2, 0));
  };

  const uploadVoice = async () => {
    const jwt = localStorage.getItem("token");
    if (!jwt) {
      setStatusMsg("❌ No authentication token. Please log in.");
      return;
    }

    if (!descriptorReady || !Array.isArray(descriptor) || descriptor.length < 10 || uploading) {
      setStatusMsg("❌ Voice descriptor not ready. Record again.");
      return;
    }

    setUploading(true);
    setStatusMsg("📤 Uploading voice...");

    try {
      if (mode === "register") {
        const saveRes = await fetch(`${API_BASE}/enroll-voice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ descriptor }),
        });

        if (!saveRes.ok) {
          const msg = await saveRes.text();
          setStatusMsg("❌ Failed to save descriptor: " + msg);
          return;
        }

        setStatusMsg("✅ Voice registered.");
        onUploadComplete?.();
      } else {
        const storedRes = await fetch(`${API_BASE}/get-voice`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        const storedData = await storedRes.json();
        const storedDescriptor = storedData?.descriptor;

        if (!storedDescriptor) {
          setStatusMsg("❌ No enrolled voice found.");
          return;
        }

        const distance = euclideanDistance(descriptor, storedDescriptor);

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
                    disabled={!descriptorReady || uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
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