import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import Spinner from "./Spinner";

const VOICE_SERVICE_URL = "https://artconnect-voiceservice.onrender.com";
const API_BASE = process.env.REACT_APP_API_BASE;
const VOICE_MATCH_THRESHOLD = 0.75;

const VoiceRecorder = ({ token, mode = "verify", onUploadComplete }) => {
  const [blob, setBlob] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [descriptor, setDescriptor] = useState(null);
  const [descriptorReady, setDescriptorReady] = useState(false);

  const descriptorEndpoint = `${VOICE_SERVICE_URL}/extract-voice-descriptor`;

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

      const res = await fetch(descriptorEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.descriptor) {
        console.error("❌ Voice descriptor extraction failed:", data);
        setStatusMsg("❌ Voice descriptor extraction failed.");
        setUploading(false);
        return;
      }

      setDescriptor(null);
      setDescriptorReady(false);
      const receivedDescriptor = data.descriptor;

      // Wait briefly and validate descriptor
      setTimeout(() => {
        if (
          Array.isArray(receivedDescriptor) &&
          receivedDescriptor.length >= 64
        ) {
          setDescriptor(receivedDescriptor);
          setDescriptorReady(true);
          setStatusMsg("✅ Voice descriptor ready. Finalizing...");
        } else {
          console.warn("❌ Invalid descriptor received:", receivedDescriptor);
          setStatusMsg("❌ Descriptor unstable. Please re-record.");
          setUploading(false);
        }
      }, 500);

      // Continue after descriptor is ready
      setTimeout(async () => {
        if (!descriptorReady || !descriptor) return;

        if (mode === "register") {
          const saveRes = await fetch(`${API_BASE}/enroll-voice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ descriptor }),
          });

          if (!saveRes.ok) {
            const msg = await saveRes.text();
            console.error("❌ Failed to save descriptor:", msg);
            setStatusMsg("❌ Failed to save descriptor: " + msg);
            return;
          }

          setStatusMsg("✅ Voice registered.");
          onUploadComplete?.();
        } else {
          const storedRes = await fetch(`${API_BASE}/get-voice`, {
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

          const distance = euclideanDistance(descriptor, storedDescriptor);

          if (distance < VOICE_MATCH_THRESHOLD) {
            setStatusMsg("✅ Voice matched. Access granted.");
            onUploadComplete?.();
          } else {
            setStatusMsg("❌ Voice did not match. Try again.");
          }
        }
      }, 750); // slight buffer for descriptorReady to update
    } catch (err) {
      console.error("❌ Voice upload error:", err);
      setStatusMsg("❌ Upload failed.");
    } finally {
      setTimeout(() => setUploading(false), 1000); // delay to allow response to show
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